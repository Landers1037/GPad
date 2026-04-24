import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { APP_NAME } from "../../shared/app-meta";
import { IPC_CHANNELS } from "../../shared/ipc";
import type {
	AppSettings,
	DashboardSnapshot,
	ManagedProcessKey,
} from "../../shared/types";
import { ConfigService } from "./services/config-service";
import { PathService } from "./services/path-service";
import { ProcessManager } from "./services/process-manager";
import { SettingsService } from "./services/settings-service";
import { SystemInfoService } from "./services/system-info";

let mainWindow: BrowserWindow | null = null;

const pathService = new PathService(app);
const configService = new ConfigService(pathService.getExeRoot());
const processManager = new ProcessManager(pathService.getExeRoot());
const settingsService = new SettingsService(pathService.getUserDataRoot());
const systemInfoService = new SystemInfoService();

/** 构建首页总览快照。 */
async function buildDashboardSnapshot(): Promise<DashboardSnapshot> {
	return {
		...systemInfoService.buildBaseSnapshot(),
		processes: await processManager.getStatuses(),
	};
}

/** 构建通用成功结果。 */
function buildSuccess(message: string) {
	return {
		success: true,
		message,
	};
}

/** 注册 IPC 处理器。 */
function registerIpcHandlers() {
	ipcMain.removeHandler(IPC_CHANNELS.dashboard.getSnapshot);
	ipcMain.handle(IPC_CHANNELS.dashboard.getSnapshot, async () => {
		return buildDashboardSnapshot();
	});

	ipcMain.removeHandler(IPC_CHANNELS.window.minimize);
	ipcMain.handle(IPC_CHANNELS.window.minimize, async () => {
		mainWindow?.minimize();
	});

	ipcMain.removeHandler(IPC_CHANNELS.window.toggleMaximize);
	ipcMain.handle(IPC_CHANNELS.window.toggleMaximize, async () => {
		if (!mainWindow) {
			return false;
		}
		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize();
			return false;
		}
		mainWindow.maximize();
		return true;
	});

	ipcMain.removeHandler(IPC_CHANNELS.window.close);
	ipcMain.handle(IPC_CHANNELS.window.close, async () => {
		mainWindow?.close();
	});

	ipcMain.removeHandler(IPC_CHANNELS.window.isMaximized);
	ipcMain.handle(IPC_CHANNELS.window.isMaximized, async () => {
		return mainWindow?.isMaximized() ?? false;
	});

	ipcMain.removeHandler(IPC_CHANNELS.config.getMoonlight);
	ipcMain.handle(IPC_CHANNELS.config.getMoonlight, async () => {
		return configService.getMoonlightConfig();
	});

	ipcMain.removeHandler(IPC_CHANNELS.config.saveMoonlight);
	ipcMain.handle(
		IPC_CHANNELS.config.saveMoonlight,
		async (_event, rawText: string) => {
			await configService.saveMoonlightConfig(rawText);
			return buildSuccess("Moonlight 配置已保存。");
		},
	);

	ipcMain.removeHandler(IPC_CHANNELS.config.getTraversal);
	ipcMain.handle(IPC_CHANNELS.config.getTraversal, async () => {
		return configService.getTraversalConfig();
	});

	ipcMain.removeHandler(IPC_CHANNELS.config.saveTraversal);
	ipcMain.handle(
		IPC_CHANNELS.config.saveTraversal,
		async (_event, rawText: string) => {
			await configService.saveTraversalConfig(rawText);
			return buildSuccess("Traversal 配置已保存。");
		},
	);

	ipcMain.removeHandler(IPC_CHANNELS.settings.get);
	ipcMain.handle(IPC_CHANNELS.settings.get, async () => {
		return settingsService.getSettings();
	});

	ipcMain.removeHandler(IPC_CHANNELS.settings.save);
	ipcMain.handle(
		IPC_CHANNELS.settings.save,
		async (_event, settings: AppSettings) => {
			await settingsService.saveSettings(settings);
			return buildSuccess("应用设置已保存。");
		},
	);

	ipcMain.removeHandler(IPC_CHANNELS.process.start);
	ipcMain.handle(
		IPC_CHANNELS.process.start,
		async (_event, key: ManagedProcessKey) => {
			await processManager.startProcess(key);
			return buildSuccess("进程已启动。");
		},
	);

	ipcMain.removeHandler(IPC_CHANNELS.process.stop);
	ipcMain.handle(
		IPC_CHANNELS.process.stop,
		async (_event, key: ManagedProcessKey) => {
			await processManager.stopProcess(key);
			return buildSuccess("进程已停止。");
		},
	);
}

/** 创建主窗口。 */
async function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 768,
		minWidth: 1200,
		minHeight: 768,
		title: APP_NAME,
		frame: false,
		titleBarStyle: "hidden",
		backgroundColor: "#dfe7f3",
		webPreferences: {
			preload: path.join(__dirname, "../preload/index.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	const rendererUrl = process.env.ELECTRON_RENDERER_URL;
	if (rendererUrl) {
		await mainWindow.loadURL(rendererUrl);
	} else {
		await mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(async () => {
	registerIpcHandlers();
	await createMainWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			void createMainWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
