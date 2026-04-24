import os from "node:os";
import path from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import type { ChildProcess } from "node:child_process";
import type {
	ManagedProcessKey,
	ManagedProcessStatus,
} from "../../../shared/types";

const execFileAsync = promisify(execFile);
const STOP_TIMEOUT_MS = 1_500;

/** 受管进程定义。 */
interface ManagedProcessDefinition {
	/** 进程键名。 */
	key: ManagedProcessKey;
	/** 展示名称。 */
	name: string;
	/** 可执行文件路径。 */
	executablePath: string;
	/** 工作目录。 */
	workingDirectory: string;
	/** 启动参数。 */
	args: string[];
	/** 是否允许运行控制。 */
	allowControl: boolean;
}

/** Windows 进程采样结果。 */
interface WindowsProcessMetric {
	/** 可执行文件路径。 */
	executablePath: string;
	/** 进程 ID。 */
	processId: number;
	/** 累积 CPU 秒数。 */
	cpuSeconds: number;
	/** 工作集内存字节数。 */
	workingSetBytes: number;
	/** 进程启动时间。 */
	startTimeIso: string;
}

/** CPU 上次采样。 */
interface CpuSample {
	/** 累积 CPU 秒数。 */
	cpuSeconds: number;
	/** 采样时间戳。 */
	timestampMs: number;
}

/** 管理 Moonlight 与 Traversal 相关进程。 */
export class ProcessManager {
	private readonly definitions: Record<ManagedProcessKey, ManagedProcessDefinition>;
	private readonly childProcesses = new Map<ManagedProcessKey, ChildProcess>();
	private readonly cpuSamples = new Map<number, CpuSample>();
	private readonly cpuCoreCount = Math.max(os.cpus().length, 1);

	/** 创建进程管理器。 */
	constructor(exeRoot: string) {
		const moonlightDir = path.join(exeRoot, "moonlight");
		const traversalDir = path.join(exeRoot, "hamburger_traversalc");
		this.definitions = {
			moonlightWebServer: {
				key: "moonlightWebServer",
				name: "Moonlight Web Server",
				executablePath: path.join(moonlightDir, "web-server.exe"),
				workingDirectory: moonlightDir,
				args: [],
				allowControl: true,
			},
			traversalClient: {
				key: "traversalClient",
				name: "Traversal Client",
				executablePath: path.join(traversalDir, "hamburger_traversalc.exe"),
				workingDirectory: traversalDir,
				args: [],
				allowControl: true,
			},
		};
	}

	/** 获取所有受管进程状态。 */
	async getStatuses(): Promise<ManagedProcessStatus[]> {
		const metrics = await this.queryTrackedProcesses();
		const metricsMap = new Map(
			metrics.map((metric) => [this.normalizePath(metric.executablePath), metric]),
		);

		return Object.values(this.definitions).map((definition) => {
			const metric = metricsMap.get(this.normalizePath(definition.executablePath));
			return this.buildStatus(definition, metric);
		});
	}

	/** 启动指定进程。 */
	async startProcess(key: ManagedProcessKey): Promise<void> {
		const definition = this.definitions[key];
		if (!definition) {
			throw new Error("未知的受管进程。");
		}

		const statuses = await this.getStatuses();
		const current = statuses.find((item) => item.key === key);
		if (current?.isRunning) {
			return;
		}

		const child = spawn(definition.executablePath, definition.args, {
			cwd: definition.workingDirectory,
			stdio: "ignore",
			windowsHide: true,
		});
		this.childProcesses.set(key, child);
		child.on("exit", () => {
			this.childProcesses.delete(key);
		});
	}

	/** 停止指定进程。 */
	async stopProcess(key: ManagedProcessKey): Promise<void> {
		const definition = this.definitions[key];
		if (!definition) {
			throw new Error("未知的受管进程。");
		}

		const statuses = await this.getStatuses();
		const current = statuses.find((item) => item.key === key);
		if (!current?.isRunning || current.pid == null) {
			return;
		}

		try {
			await this.runCommand("taskkill", ["/PID", String(current.pid), "/T"]);
		} catch {
			// 优雅停止失败时继续回退到强制终止，避免因为 /F 要求导致流程中断。
		}
		await this.delay(STOP_TIMEOUT_MS);

		if (await this.isPidRunning(current.pid)) {
			await this.runCommand("taskkill", [
				"/PID",
				String(current.pid),
				"/T",
				"/F",
			]);
		}
	}

	/** 构建单个进程状态。 */
	private buildStatus(
		definition: ManagedProcessDefinition,
		metric?: WindowsProcessMetric,
	): ManagedProcessStatus {
		const isRunning = Boolean(metric);
		const cpuPercent =
			metric == null
				? 0
				: this.calculateCpuPercent(metric.processId, metric.cpuSeconds);
		const uptimeSeconds =
			metric == null
				? 0
				: Math.max(
						0,
						Math.floor(
							(Date.now() - new Date(metric.startTimeIso).getTime()) / 1000,
						),
					);

		return {
			key: definition.key,
			name: definition.name,
			executablePath: definition.executablePath,
			allowControl: definition.allowControl,
			isRunning,
			pid: metric?.processId ?? null,
			cpuPercent,
			memoryMb:
				metric == null ? 0 : Number((metric.workingSetBytes / 1024 / 1024).toFixed(1)),
			uptimeSeconds,
			workingDirectory: definition.workingDirectory,
		};
	}

	/** 计算 CPU 百分比。 */
	private calculateCpuPercent(processId: number, cpuSeconds: number): number {
		const now = Date.now();
		const previous = this.cpuSamples.get(processId);
		this.cpuSamples.set(processId, {
			cpuSeconds,
			timestampMs: now,
		});
		if (!previous) {
			return 0;
		}

		const deltaCpuSeconds = cpuSeconds - previous.cpuSeconds;
		const deltaMs = now - previous.timestampMs;
		if (deltaCpuSeconds <= 0 || deltaMs <= 0) {
			return 0;
		}

		const percent =
			(deltaCpuSeconds * 1000 * 100) / (deltaMs * this.cpuCoreCount);
		return Number(Math.min(Math.max(percent, 0), 100).toFixed(1));
	}

	/** 查询所有受管进程采样。 */
	private async queryTrackedProcesses(): Promise<WindowsProcessMetric[]> {
		const paths = Object.values(this.definitions)
			.map((definition) => this.escapeForPowerShell(definition.executablePath))
			.join(", ");
		const script = `
$targets = @(${paths})
$processes = Get-CimInstance Win32_Process |
  Where-Object { $_.ExecutablePath -and $targets -contains $_.ExecutablePath.ToLower() } |
  ForEach-Object {
    $stats = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
    if ($stats) {
      [PSCustomObject]@{
        executablePath = $_.ExecutablePath
        processId = [int]$_.ProcessId
        cpuSeconds = [double]$stats.CPU
        workingSetBytes = [int64]$stats.WorkingSet64
        startTimeIso = $stats.StartTime.ToUniversalTime().ToString("o")
      }
    }
  }
$processes | ConvertTo-Json -Depth 4 -Compress
`.trim();

		const { stdout } = await execFileAsync(
			"powershell",
			["-NoProfile", "-Command", script],
			{
				windowsHide: true,
				maxBuffer: 1024 * 1024,
			},
		);

		const text = stdout.trim();
		if (!text) {
			return [];
		}

		const parsed = JSON.parse(text) as
			| WindowsProcessMetric
			| WindowsProcessMetric[];
		const list = Array.isArray(parsed) ? parsed : [parsed];
		const runningPids = new Set(list.map((item) => item.processId));
		for (const pid of Array.from(this.cpuSamples.keys())) {
			if (!runningPids.has(pid)) {
				this.cpuSamples.delete(pid);
			}
		}
		return list;
	}

	/** 检查指定 PID 是否仍在运行。 */
	private async isPidRunning(pid: number): Promise<boolean> {
		const script = `
$process = Get-Process -Id ${pid} -ErrorAction SilentlyContinue
if ($null -eq $process) { "false" } else { "true" }
`.trim();
		const { stdout } = await execFileAsync(
			"powershell",
			["-NoProfile", "-Command", script],
			{
				windowsHide: true,
			},
		);
		return stdout.trim() === "true";
	}

	/** 执行系统命令。 */
	private async runCommand(command: string, args: string[]): Promise<void> {
		try {
			await execFileAsync(command, args, {
				windowsHide: true,
			});
		} catch (error) {
			if (error instanceof Error) {
				const message = error.message.toLowerCase();
				if (message.includes("not found") || message.includes("没有运行的实例")) {
					return;
				}
				throw new Error(`执行命令失败：${error.message}`);
			}
			throw error;
		}
	}

	/** 转义 PowerShell 字符串。 */
	private escapeForPowerShell(value: string): string {
		return `'${this.normalizePath(value).replace(/'/g, "''")}'`;
	}

	/** 规范化路径大小写。 */
	private normalizePath(value: string): string {
		return path.resolve(value).toLowerCase();
	}

	/** 延迟一段时间。 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
}
