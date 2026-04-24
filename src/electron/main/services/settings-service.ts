import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppSettings } from "../../../shared/types";

const DEFAULT_SETTINGS: AppSettings = {
	locale: "zh-CN",
	themeAccent: "sky",
	logPath: "logs/gpad.log",
	logLevel: "INFO",
};

/** 管理 GPad 本地设置。 */
export class SettingsService {
	private readonly settingsFilePath: string;

	/** 创建设置服务。 */
	constructor(userDataRoot: string) {
		this.settingsFilePath = path.join(userDataRoot, "gpad-settings.json");
	}

	/** 获取应用设置。 */
	async getSettings(): Promise<AppSettings> {
		try {
			const rawText = await readFile(this.settingsFilePath, "utf-8");
			const parsed = JSON.parse(rawText) as Partial<AppSettings>;
			return {
				...DEFAULT_SETTINGS,
				...parsed,
			};
		} catch (error) {
			if (
				error instanceof Error &&
				(error as NodeJS.ErrnoException).code !== "ENOENT"
			) {
				throw new Error(`读取设置失败：${error.message}`);
			}

			return { ...DEFAULT_SETTINGS };
		}
	}

	/** 保存应用设置。 */
	async saveSettings(settings: AppSettings): Promise<AppSettings> {
		await mkdir(path.dirname(this.settingsFilePath), { recursive: true });
		await writeFile(
			this.settingsFilePath,
			`${JSON.stringify(settings, null, 2)}\n`,
			"utf-8",
		);
		return settings;
	}
}
