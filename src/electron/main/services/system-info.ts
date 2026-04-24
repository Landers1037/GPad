import type { DashboardSnapshot, PortInfo } from "../../../shared/types";

/** 生成系统时间与端口占位信息。 */
export class SystemInfoService {
	private readonly appStartedAt = Date.now();

	/** 构建总览基础信息。 */
	buildBaseSnapshot(): Pick<
		DashboardSnapshot,
		"appUptimeSeconds" | "currentTimeIso" | "moonlightPort" | "traversalPorts"
	> {
		return {
			currentTimeIso: new Date().toISOString(),
			appUptimeSeconds: Math.max(
				0,
				Math.floor((Date.now() - this.appStartedAt) / 1000),
			),
			moonlightPort: this.createPendingPort(
				"Moonlight 串流端口",
				"端口来源待接入",
			),
			traversalPorts: [
				this.createPendingPort("Traversal 端口组", "端口组来源待接入"),
			],
		};
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
}
