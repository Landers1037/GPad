import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, type DesktopApi } from "../../shared/ipc";

/** 暴露给渲染进程的安全 API。 */
const gpadApi: DesktopApi = {
	async getDashboardSnapshot() {
		return ipcRenderer.invoke(IPC_CHANNELS.dashboard.getSnapshot);
	},
	async minimizeWindow() {
		await ipcRenderer.invoke(IPC_CHANNELS.window.minimize);
	},
	async toggleWindowMaximize() {
		return ipcRenderer.invoke(IPC_CHANNELS.window.toggleMaximize);
	},
	async closeWindow() {
		await ipcRenderer.invoke(IPC_CHANNELS.window.close);
	},
	async isWindowMaximized() {
		return ipcRenderer.invoke(IPC_CHANNELS.window.isMaximized);
	},
	async getMoonlightConfig() {
		return ipcRenderer.invoke(IPC_CHANNELS.config.getMoonlight);
	},
	async saveMoonlightConfig(rawText) {
		return ipcRenderer.invoke(IPC_CHANNELS.config.saveMoonlight, rawText);
	},
	async getTraversalConfig() {
		return ipcRenderer.invoke(IPC_CHANNELS.config.getTraversal);
	},
	async saveTraversalConfig(rawText) {
		return ipcRenderer.invoke(IPC_CHANNELS.config.saveTraversal, rawText);
	},
	async getFrpConfig() {
		return ipcRenderer.invoke(IPC_CHANNELS.config.getFrp);
	},
	async saveFrpConfig(rawText) {
		return ipcRenderer.invoke(IPC_CHANNELS.config.saveFrp, rawText);
	},
	async getAppSettings() {
		return ipcRenderer.invoke(IPC_CHANNELS.settings.get);
	},
	async saveAppSettings(settings) {
		return ipcRenderer.invoke(IPC_CHANNELS.settings.save, settings);
	},
	async openLogFolder(logPath) {
		return ipcRenderer.invoke(IPC_CHANNELS.settings.openLogFolder, logPath);
	},
	async startManagedProcess(key) {
		return ipcRenderer.invoke(IPC_CHANNELS.process.start, key);
	},
	async stopManagedProcess(key) {
		return ipcRenderer.invoke(IPC_CHANNELS.process.stop, key);
	},
};

contextBridge.exposeInMainWorld("gpadApi", gpadApi);
