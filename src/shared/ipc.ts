import type {
	AppSettings,
	ConfigDocument,
	DashboardSnapshot,
	FrpConfig,
	ManagedProcessKey,
	MoonlightConfig,
	OperationResult,
	TraversalConfig,
} from "./types";

/** Electron IPC 通道定义。 */
export const IPC_CHANNELS = {
	dashboard: {
		getSnapshot: "dashboard:getSnapshot",
	},
	window: {
		minimize: "window:minimize",
		toggleMaximize: "window:toggleMaximize",
		close: "window:close",
		isMaximized: "window:isMaximized",
	},
	config: {
		getMoonlight: "config:getMoonlight",
		saveMoonlight: "config:saveMoonlight",
		getTraversal: "config:getTraversal",
		saveTraversal: "config:saveTraversal",
		getFrp: "config:getFrp",
		saveFrp: "config:saveFrp",
	},
	settings: {
		get: "settings:get",
		save: "settings:save",
		openLogFolder: "settings:openLogFolder",
		openExternalUrl: "settings:openExternalUrl",
	},
	process: {
		start: "process:start",
		stop: "process:stop",
	},
} as const;

/** 渲染进程可调用的桌面 API。 */
export interface DesktopApi {
	/** 获取首页总览快照。 */
	getDashboardSnapshot: () => Promise<DashboardSnapshot>;
	/** 最小化窗口。 */
	minimizeWindow: () => Promise<void>;
	/** 切换窗口最大化状态。 */
	toggleWindowMaximize: () => Promise<boolean>;
	/** 关闭窗口。 */
	closeWindow: () => Promise<void>;
	/** 获取窗口是否已最大化。 */
	isWindowMaximized: () => Promise<boolean>;
	/** 获取 Moonlight 配置。 */
	getMoonlightConfig: () => Promise<ConfigDocument<MoonlightConfig>>;
	/** 保存 Moonlight 配置。 */
	saveMoonlightConfig: (rawText: string) => Promise<OperationResult>;
	/** 获取 Traversal 配置。 */
	getTraversalConfig: () => Promise<ConfigDocument<TraversalConfig>>;
	/** 保存 Traversal 配置。 */
	saveTraversalConfig: (rawText: string) => Promise<OperationResult>;
	/** 获取 Frp 配置。 */
	getFrpConfig: () => Promise<ConfigDocument<FrpConfig>>;
	/** 保存 Frp 配置。 */
	saveFrpConfig: (rawText: string) => Promise<OperationResult>;
	/** 获取应用设置。 */
	getAppSettings: () => Promise<AppSettings>;
	/** 保存应用设置。 */
	saveAppSettings: (settings: AppSettings) => Promise<OperationResult>;
	/** 打开日志所在文件夹。 */
	openLogFolder: (logPath: string) => Promise<OperationResult>;
	/** 打开外部网页。 */
	openExternalUrl: (url: string) => Promise<OperationResult>;
	/** 启动受管进程。 */
	startManagedProcess: (key: ManagedProcessKey) => Promise<OperationResult>;
	/** 停止受管进程。 */
	stopManagedProcess: (key: ManagedProcessKey) => Promise<OperationResult>;
}
