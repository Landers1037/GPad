import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
	ConfigDocument,
	FrpConfig,
	MoonlightConfig,
	TraversalConfig,
} from "../../../shared/types";

const DEFAULT_MOONLIGHT_CONFIG: MoonlightConfig = {
	data_storage: {
		type: "json",
		path: "server/data.json",
	},
	web_server: {
		bind_address: "0.0.0.0:8080",
		url_path_prefix: "",
		first_login_create_admin: true,
		first_login_assign_global_hosts: true,
	},
	moonlight: {
		default_http_port: 47989,
		pair_device_name: "roth",
	},
	streamer_path: "./streamer",
	log: {
		level_filter: "INFO",
		file_path: null,
	},
};

const DEFAULT_TRAVERSAL_CONFIG: TraversalConfig = {
	server_ip: "",
	server_port: 19090,
	server_protocol: "tcp",
	auth_key: "",
	proxy_server: [],
};

const DEFAULT_FRP_CONFIG: FrpConfig = {
	serverAddr: "127.0.0.1",
	serverPort: 7000,
	authToken: "",
	proxy: {
		name: "test-tcp",
		type: "tcp",
		localIP: "127.0.0.1",
		localPort: 8080,
		remotePort: 6666,
	},
};

/** 解析并管理业务配置文件。 */
export class ConfigService {
	private readonly moonlightConfigPath: string;
	private readonly traversalConfigPath: string;
	private readonly frpConfigPath: string;

	/** 创建配置服务。 */
	constructor(exeRoot: string) {
		this.moonlightConfigPath = path.join(exeRoot, "moonlight", "server", "config.json");
		this.traversalConfigPath = path.join(
			exeRoot,
			"hamburger_traversalc",
			"traversalc.json",
		);
		this.frpConfigPath = path.join(exeRoot, "frp", "frpc.toml");
	}

	/** 获取 Moonlight 配置文档。 */
	async getMoonlightConfig(): Promise<ConfigDocument<MoonlightConfig>> {
		return this.readConfigFile(this.moonlightConfigPath, DEFAULT_MOONLIGHT_CONFIG);
	}

	/** 保存 Moonlight 配置文档。 */
	async saveMoonlightConfig(rawText: string): Promise<void> {
		await this.writeValidatedJson(this.moonlightConfigPath, rawText);
	}

	/** 获取 Traversal 配置文档。 */
	async getTraversalConfig(): Promise<ConfigDocument<TraversalConfig>> {
		return this.readConfigFile(this.traversalConfigPath, DEFAULT_TRAVERSAL_CONFIG);
	}

	/** 保存 Traversal 配置文档。 */
	async saveTraversalConfig(rawText: string): Promise<void> {
		await this.writeValidatedJson(this.traversalConfigPath, rawText);
	}

	/** 获取 Frp 配置文档。 */
	async getFrpConfig(): Promise<ConfigDocument<FrpConfig>> {
		const rawText = await this.readTomlConfigFile(this.frpConfigPath, this.buildFrpToml(DEFAULT_FRP_CONFIG));
		return {
			filePath: this.frpConfigPath,
			rawText,
			config: this.parseFrpToml(rawText),
		};
	}

	/** 保存 Frp 配置文档。 */
	async saveFrpConfig(rawText: string): Promise<void> {
		try {
			const parsed = this.parseFrpToml(rawText);
			const normalized = this.buildFrpToml(parsed);
			await mkdir(path.dirname(this.frpConfigPath), { recursive: true });
			await writeFile(this.frpConfigPath, `${normalized}\n`, "utf-8");
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`保存配置失败：${error.message}`);
			}
			throw error;
		}
	}

	/** 读取并解析 JSON 配置文件。 */
	private async readConfigFile<TConfig>(
		filePath: string,
		fallback: TConfig,
	): Promise<ConfigDocument<TConfig>> {
		try {
			const rawText = await readFile(filePath, "utf-8");
			const config = JSON.parse(rawText) as TConfig;
			return {
				filePath,
				rawText,
				config,
			};
		} catch (error) {
			if (!(error instanceof Error)) {
				throw error;
			}

			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw new Error(`读取配置失败：${error.message}`);
			}

			const rawText = JSON.stringify(fallback, null, 2);
			return {
				filePath,
				rawText,
				config: fallback,
			};
		}
	}

	/** 校验并写入 JSON 文本。 */
	private async writeValidatedJson(filePath: string, rawText: string): Promise<void> {
		try {
			const parsed = JSON.parse(rawText);
			const normalized = JSON.stringify(parsed, null, 2);
			await mkdir(path.dirname(filePath), { recursive: true });
			await writeFile(filePath, `${normalized}\n`, "utf-8");
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error(`JSON 格式无效：${error.message}`);
			}

			if (error instanceof Error) {
				throw new Error(`保存配置失败：${error.message}`);
			}

			throw error;
		}
	}

	/** 读取 TOML 配置文件。 */
	private async readTomlConfigFile(filePath: string, fallbackRawText: string): Promise<string> {
		try {
			return await readFile(filePath, "utf-8");
		} catch (error) {
			if (!(error instanceof Error)) {
				throw error;
			}
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw new Error(`读取配置失败：${error.message}`);
			}
			return fallbackRawText;
		}
	}

	/** 解析 Frp TOML。 */
	private parseFrpToml(rawText: string): FrpConfig {
		const valueOf = (key: string): string | null => {
			const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const match = rawText.match(
				new RegExp(`^\\s*${escapedKey}\\s*=\\s*(.+)\\s*$`, "m"),
			);
			return match ? match[1].trim() : null;
		};
		const stringOf = (key: string): string => {
			const value = valueOf(key);
			if (!value) {
				throw new Error(`缺少字段：${key}`);
			}
			const quoted = value.match(/^"(.*)"$/);
			if (!quoted) {
				throw new Error(`字段格式无效（需要字符串）：${key}`);
			}
			return quoted[1];
		};
		const numberOf = (key: string): number => {
			const value = valueOf(key);
			if (!value) {
				throw new Error(`缺少字段：${key}`);
			}
			const parsed = Number(value);
			if (!Number.isFinite(parsed)) {
				throw new Error(`字段格式无效（需要数字）：${key}`);
			}
			return parsed;
		};

		return {
			serverAddr: stringOf("serverAddr"),
			serverPort: numberOf("serverPort"),
			authToken: stringOf("auth.token"),
			proxy: {
				name: stringOf("name"),
				type: stringOf("type"),
				localIP: stringOf("localIP"),
				localPort: numberOf("localPort"),
				remotePort: numberOf("remotePort"),
			},
		};
	}

	/** 生成 Frp TOML。 */
	private buildFrpToml(config: FrpConfig): string {
		return [
			`serverAddr = "${config.serverAddr}"`,
			`serverPort = ${config.serverPort}`,
			`auth.token = "${config.authToken}"`,
			"",
			"[[proxies]]",
			`name = "${config.proxy.name}"`,
			`type = "${config.proxy.type}"`,
			`localIP = "${config.proxy.localIP}"`,
			`localPort = ${config.proxy.localPort}`,
			`remotePort = ${config.proxy.remotePort}`,
		].join("\n");
	}
}
