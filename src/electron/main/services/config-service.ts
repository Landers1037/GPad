import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
	ConfigDocument,
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

/** 解析并管理业务配置文件。 */
export class ConfigService {
	private readonly moonlightConfigPath: string;
	private readonly traversalConfigPath: string;

	/** 创建配置服务。 */
	constructor(exeRoot: string) {
		this.moonlightConfigPath = path.join(exeRoot, "moonlight", "server", "config.json");
		this.traversalConfigPath = path.join(
			exeRoot,
			"hamburger_traversalc",
			"traversalc.json",
		);
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
}
