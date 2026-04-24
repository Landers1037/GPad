import type { ManagedProcessStatus } from "../../shared/types";
import { MetricItem, SoftButton, SoftPanel, StatusBadge } from "./ui";

/** 展示单个进程状态卡片。 */
export function ProcessCard({
	process,
	onStart,
	onStop,
}: {
	/** 进程状态。 */
	process: ManagedProcessStatus;
	/** 启动事件。 */
	onStart: () => void;
	/** 停止事件。 */
	onStop: () => void;
}) {
	return (
		<SoftPanel className="flex h-full flex-col gap-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-lg font-semibold text-slate-700">{process.name}</h3>
					<p className="mt-1 text-sm text-slate-500">{process.executablePath}</p>
				</div>
				<StatusBadge
					active={process.isRunning}
					label={process.isRunning ? "运行中" : "已停止"}
				/>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				<MetricItem label="PID" value={process.pid ? String(process.pid) : "--"} />
				<MetricItem label="CPU" value={`${process.cpuPercent.toFixed(1)}%`} />
				<MetricItem label="内存" value={`${process.memoryMb.toFixed(1)} MB`} />
				<MetricItem label="运行时长" value={`${process.uptimeSeconds} 秒`} />
			</div>

			<div className="mt-auto flex gap-3">
				<SoftButton
					className="accent-button text-white"
					disabled={!process.allowControl || process.isRunning}
					onClick={onStart}
				>
					启动程序
				</SoftButton>
				<SoftButton
					className="bg-rose-500/90 text-white"
					disabled={!process.allowControl || !process.isRunning}
					onClick={onStop}
				>
					停止程序
				</SoftButton>
			</div>
		</SoftPanel>
	);
}
