import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppSettings } from "../../../shared/types";

/** 管理 GPad 本地设置。 */
export class SettingsService {
	private readonly settingsFilePath: string;
	private readonly defaultSettings: AppSettings;

	/** 创建设置服务。 */
	constructor(userDataRoot: string, defaultLogPath: string) {
		this.settingsFilePath = path.join(userDataRoot, "gpad-settings.json");
		this.defaultSettings = {
			locale: "zh-CN",
			themeAccent: "sky",
			animationEnabled: false,
			logPath: defaultLogPath,
			logLevel: "INFO",
		};
	}

	/** 获取应用设置。 */
	async getSettings(): Promise<AppSettings> {
		try {
			const rawText = await readFile(this.settingsFilePath, "utf-8");
			const parsed = JSON.parse(rawText) as Partial<AppSettings>;
			const safeLogPath =
				typeof parsed.logPath === "string" && path.isAbsolute(parsed.logPath)
					? parsed.logPath
					: this.defaultSettings.logPath;
			return {
				...this.defaultSettings,
				...parsed,
				logPath: safeLogPath,
			};
		} catch (error) {
			if (
				error instanceof Error &&
				(error as NodeJS.ErrnoException).code !== "ENOENT"
			) {
				throw new Error(`读取设置失败：${error.message}`);
			}

			return { ...this.defaultSettings };
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
