import type { App } from "electron";
import { existsSync } from "node:fs";
import path from "node:path";

/** 统一解析开发态与生产态资源路径。 */
export class PathService {
	/** 创建路径服务。 */
	constructor(private readonly electronApp: App) {}

	/** 获取运行时根目录。 */
	getRuntimeRoot(): string {
		if (this.electronApp.isPackaged) {
			return process.resourcesPath;
		}

		const candidates = [
			process.cwd(),
			this.electronApp.getAppPath(),
			path.resolve(this.electronApp.getAppPath(), ".."),
		];

		for (const candidate of candidates) {
			if (
				existsSync(path.join(candidate, "package.json")) &&
				existsSync(path.join(candidate, "exe"))
			) {
				return candidate;
			}
		}

		return process.cwd();
	}

	/** 获取受管资源根目录。 */
	getExeRoot(): string {
		return path.join(this.getRuntimeRoot(), "exe");
	}

	/** 获取应用设置目录。 */
	getUserDataRoot(): string {
		return this.electronApp.getPath("userData");
	}

	/** 获取系统 AppData 目录。 */
	getAppDataRoot(): string {
		return this.electronApp.getPath("appData");
	}
}
