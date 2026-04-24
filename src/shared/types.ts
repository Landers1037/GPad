/** 受管进程键名。 */
export type ManagedProcessKey = "moonlightWebServer" | "traversalClient";

/** 程序语言类型。 */
export type AppLocale = "zh-CN" | "en-US";

/** 日志级别类型。 */
export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";

/** 主题配色键名。 */
export type ThemeAccent = "sky" | "violet" | "emerald";

/** 端口来源状态。 */
export type PortStatus = "pending" | "resolved";

/** 受管进程状态。 */
export interface ManagedProcessStatus {
	/** 进程键名。 */
	key: ManagedProcessKey;
	/** 展示名称。 */
	name: string;
	/** 可执行文件路径。 */
	executablePath: string;
	/** 是否允许运行控制。 */
	allowControl: boolean;
	/** 是否正在运行。 */
	isRunning: boolean;
	/** 进程 ID。 */
	pid: number | null;
	/** CPU 占用百分比。 */
	cpuPercent: number;
	/** 内存占用，单位 MB。 */
	memoryMb: number;
	/** 运行时长，单位秒。 */
	uptimeSeconds: number;
	/** 工作目录。 */
	workingDirectory: string;
}

/** 端口展示信息。 */
export interface PortInfo {
	/** 端口来源状态。 */
	status: PortStatus;
	/** 展示标签。 */
	label: string;
	/** 端口值。 */
	value: string;
	/** 补充说明。 */
	description: string;
}

/** 首页总览快照。 */
export interface DashboardSnapshot {
	/** 当前时间 ISO 字符串。 */
	currentTimeIso: string;
	/** 应用运行时长，单位秒。 */
	appUptimeSeconds: number;
	/** 进程状态集合。 */
	processes: ManagedProcessStatus[];
	/** Moonlight 端口信息。 */
	moonlightPort: PortInfo;
	/** 穿透端口组。 */
	traversalPorts: PortInfo[];
}

/** 配置文档包装。 */
export interface ConfigDocument<TConfig> {
	/** 配置文件路径。 */
	filePath: string;
	/** 原始 JSON 文本。 */
	rawText: string;
	/** 结构化配置。 */
	config: TConfig;
}

/** Moonlight 存储配置。 */
export interface MoonlightDataStorageConfig {
	/** 存储类型。 */
	type: string;
	/** 数据文件路径。 */
	path: string;
}

/** Moonlight Web 服务配置。 */
export interface MoonlightWebServerConfig {
	/** 绑定地址。 */
	bind_address: string;
	/** 路径前缀。 */
	url_path_prefix: string;
	/** 是否允许首次登录创建管理员。 */
	first_login_create_admin: boolean;
	/** 是否允许首次登录分配全局主机。 */
	first_login_assign_global_hosts: boolean;
}

/** Moonlight 应用配置。 */
export interface MoonlightAppConfig {
	/** 默认 HTTP 端口。 */
	default_http_port: number;
	/** 配对设备名称。 */
	pair_device_name: string;
}

/** Moonlight 日志配置。 */
export interface MoonlightLogConfig {
	/** 日志级别。 */
	level_filter: LogLevel;
	/** 日志文件路径。 */
	file_path: string | null;
}

/** Moonlight 总配置。 */
export interface MoonlightConfig {
	/** 数据存储配置。 */
	data_storage: MoonlightDataStorageConfig;
	/** Web 服务配置。 */
	web_server: MoonlightWebServerConfig;
	/** Moonlight 客户端配置。 */
	moonlight: MoonlightAppConfig;
	/** 串流核心程序路径。 */
	streamer_path: string;
	/** 日志配置。 */
	log: MoonlightLogConfig;
}

/** 穿透端口映射配置。 */
export interface TraversalProxyServerConfig {
	/** 映射名称。 */
	name: string;
	/** 远端端口。 */
	remote_port: number;
	/** 本地地址。 */
	local_host: string;
	/** 本地端口。 */
	local_port: number;
}

/** Traversal 总配置。 */
export interface TraversalConfig {
	/** 服务端 IP。 */
	server_ip: string;
	/** 服务端端口。 */
	server_port: number;
	/** 服务端协议。 */
	server_protocol: string;
	/** 鉴权密钥。 */
	auth_key: string;
	/** 端口映射列表。 */
	proxy_server: TraversalProxyServerConfig[];
}

/** 应用设置。 */
export interface AppSettings {
	/** 当前语言。 */
	locale: AppLocale;
	/** 当前主题配色。 */
	themeAccent: ThemeAccent;
	/** 是否开启界面动画效果。 */
	animationEnabled: boolean;
	/** 日志目录。 */
	logPath: string;
	/** 日志级别。 */
	logLevel: LogLevel;
}

/** 进程控制请求参数。 */
export interface ManageProcessParams {
	/** 目标进程键名。 */
	key: ManagedProcessKey;
}

/** 保存配置请求参数。 */
export interface SaveConfigParams {
	/** 原始 JSON 文本。 */
	rawText: string;
}

/** 保存设置请求参数。 */
export interface SaveSettingsParams {
	/** 目标设置。 */
	settings: AppSettings;
}

/** 通用操作结果。 */
export interface OperationResult {
	/** 是否执行成功。 */
	success: boolean;
	/** 提示消息。 */
	message: string;
}
