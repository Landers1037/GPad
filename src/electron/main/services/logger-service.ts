import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { LogLevel } from "../../../shared/types";

const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
	TRACE: 10,
	DEBUG: 20,
	INFO: 30,
	WARN: 40,
	ERROR: 50,
};

/** 日志服务配置。 */
interface LoggerConfig {
	/** 日志级别。 */
	level: LogLevel;
	/** 日志文件路径。 */
	filePath: string;
}

/** 统一管理主进程日志输出。 */
export class LoggerService {
	private level: LogLevel;
	private filePath: string;

	/** 创建日志服务。 */
	constructor(config: LoggerConfig) {
		this.level = config.level;
		this.filePath = config.filePath;
	}

	/** 更新日志配置。 */
	setConfig(config: LoggerConfig) {
		this.level = config.level;
		this.filePath = config.filePath;
	}

	/** 输出 TRACE 日志。 */
	async trace(message: string, meta?: unknown) {
		await this.write("TRACE", message, meta);
	}

	/** 输出 DEBUG 日志。 */
	async debug(message: string, meta?: unknown) {
		await this.write("DEBUG", message, meta);
	}

	/** 输出 INFO 日志。 */
	async info(message: string, meta?: unknown) {
		await this.write("INFO", message, meta);
	}

	/** 输出 WARN 日志。 */
	async warn(message: string, meta?: unknown) {
		await this.write("WARN", message, meta);
	}

	/** 输出 ERROR 日志。 */
	async error(message: string, meta?: unknown) {
		await this.write("ERROR", message, meta);
	}

	/** 按级别写入日志。 */
	private async write(level: LogLevel, message: string, meta?: unknown) {
		if (!this.shouldWrite(level)) {
			return;
		}

		const isoTime = new Date().toISOString();
		const text = this.stringifyMeta(meta);
		const line = `${isoTime} [${level}] ${message}${text}\n`;

		try {
			await mkdir(path.dirname(this.filePath), { recursive: true });
			await appendFile(this.filePath, line, "utf-8");
		} catch (error) {
			console.error("日志写入失败：", error);
		}
	}

	/** 判断是否满足最小输出级别。 */
	private shouldWrite(level: LogLevel): boolean {
		return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[this.level];
	}

	/** 序列化附加信息。 */
	private stringifyMeta(meta?: unknown): string {
		if (meta == null) {
			return "";
		}
		if (meta instanceof Error) {
			return ` ${JSON.stringify({
				name: meta.name,
				message: meta.message,
				stack: meta.stack,
			})}`;
		}
		try {
			return ` ${JSON.stringify(meta)}`;
		} catch {
			return ` ${String(meta)}`;
		}
	}
}
