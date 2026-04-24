import type { DashboardSnapshot, PortInfo } from "../../../shared/types";
import type { ConfigService } from "./config-service";

/** 生成系统时间与端口占位信息。 */
export class SystemInfoService {
	private readonly appStartedAt = Date.now();

	/** 构建总览基础信息。 */
	async buildBaseSnapshot(
		configService: ConfigService,
	): Promise<
		Pick<
		DashboardSnapshot,
		"appUptimeSeconds" | "currentTimeIso" | "moonlightPort" | "traversalPorts"
		>
	> {
		const [moonlightPort, traversalPorts] = await Promise.all([
			this.resolveMoonlightPort(configService),
			this.resolveTraversalPorts(configService),
		]);

		return {
			currentTimeIso: new Date().toISOString(),
			appUptimeSeconds: Math.max(
				0,
				Math.floor((Date.now() - this.appStartedAt) / 1000),
			),
			moonlightPort,
			traversalPorts,
		};
	}

	/** 解析 Moonlight 端口。 */
	private async resolveMoonlightPort(
		configService: ConfigService,
	): Promise<PortInfo> {
		try {
			const moonlight = await configService.getMoonlightConfig();
			const bindAddress = moonlight.config.web_server.bind_address;
			const port = this.extractPortFromBindAddress(bindAddress);
			if (!port) {
				return this.createPendingPort(
					"Moonlight 串流端口",
					"bind_address 未包含有效端口",
				);
			}
			return {
				status: "resolved",
				label: "Moonlight 串流端口",
				value: port,
				description: `来源：web_server.bind_address (${bindAddress})`,
			};
		} catch (error) {
			return this.createPendingPort(
				"Moonlight 串流端口",
				`读取配置失败：${this.getErrorMessage(error)}`,
			);
		}
	}

	/** 解析 Traversal 端口组。 */
	private async resolveTraversalPorts(
		configService: ConfigService,
	): Promise<PortInfo[]> {
		try {
			const traversal = await configService.getTraversalConfig();
			return [
				{
					status: "resolved",
					label: "Traversal 端口组",
					value: String(traversal.config.server_port),
					description: "来源：server_port",
				},
			];
		} catch (error) {
			return [
				this.createPendingPort(
					"Traversal 端口组",
					`读取配置失败：${this.getErrorMessage(error)}`,
				),
			];
		}
	}

	/** 从 bind_address 中提取端口。 */
	private extractPortFromBindAddress(bindAddress: string): string | null {
		const value = bindAddress.trim();
		if (!value) {
			return null;
		}
		const lastColon = value.lastIndexOf(":");
		if (lastColon < 0 || lastColon >= value.length - 1) {
			return null;
		}
		const port = value.slice(lastColon + 1).trim();
		return /^\d+$/.test(port) ? port : null;
	}

	/** 创建待接入的端口信息。 */
	private createPendingPort(label: string, description: string): PortInfo {
		return {
			status: "pending",
			label,
			value: "待接入",
			description,
		};
	}

	/** 获取错误信息文本。 */
	private getErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : "未知错误";
	}
}
