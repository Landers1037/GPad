import type {
	AppSettings,
	ConfigDocument,
	DashboardSnapshot,
	ManagedProcessKey,
	MoonlightConfig,
	OperationResult,
	TraversalConfig,
} from "../../shared/types";
import type { DesktopApi } from "../../shared/ipc";

/** 获取预加载层暴露的桌面 API。 */
function getDesktopApi(): DesktopApi {
	if (!window.gpadApi) {
		throw new Error("桌面桥接尚未初始化。");
	}
	return window.gpadApi;
}

/** 封装前端调用桌面端 RPC。 */
export const desktopApi = {
	/** 获取首页总览快照。 */
	async getDashboardSnapshot(): Promise<DashboardSnapshot> {
		return getDesktopApi().getDashboardSnapshot();
	},

	/** 最小化窗口。 */
	async minimizeWindow(): Promise<void> {
		await getDesktopApi().minimizeWindow();
	},

	/** 切换窗口最大化状态。 */
	async toggleWindowMaximize(): Promise<boolean> {
		return getDesktopApi().toggleWindowMaximize();
	},

	/** 关闭窗口。 */
	async closeWindow(): Promise<void> {
		await getDesktopApi().closeWindow();
	},

	/** 获取窗口是否已最大化。 */
	async isWindowMaximized(): Promise<boolean> {
		return getDesktopApi().isWindowMaximized();
	},

	/** 获取 Moonlight 配置。 */
	async getMoonlightConfig(): Promise<ConfigDocument<MoonlightConfig>> {
		return getDesktopApi().getMoonlightConfig();
	},

	/** 保存 Moonlight 配置。 */
	async saveMoonlightConfig(rawText: string): Promise<OperationResult> {
		return getDesktopApi().saveMoonlightConfig(rawText);
	},

	/** 获取 Traversal 配置。 */
	async getTraversalConfig(): Promise<ConfigDocument<TraversalConfig>> {
		return getDesktopApi().getTraversalConfig();
	},

	/** 保存 Traversal 配置。 */
	async saveTraversalConfig(rawText: string): Promise<OperationResult> {
		return getDesktopApi().saveTraversalConfig(rawText);
	},

	/** 获取应用设置。 */
	async getAppSettings(): Promise<AppSettings> {
		return getDesktopApi().getAppSettings();
	},

	/** 保存应用设置。 */
	async saveAppSettings(settings: AppSettings): Promise<OperationResult> {
		return getDesktopApi().saveAppSettings(settings);
	},

	/** 打开日志所在目录。 */
	async openLogFolder(logPath: string): Promise<OperationResult> {
		return getDesktopApi().openLogFolder(logPath);
	},

	/** 启动受管进程。 */
	async startManagedProcess(key: ManagedProcessKey): Promise<OperationResult> {
		return getDesktopApi().startManagedProcess(key);
	},

	/** 停止受管进程。 */
	async stopManagedProcess(key: ManagedProcessKey): Promise<OperationResult> {
		return getDesktopApi().stopManagedProcess(key);
	},
};
