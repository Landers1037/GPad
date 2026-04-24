import type { DesktopApi } from "../shared/ipc";

declare global {
	interface Window {
		/** 预加载层注入的桌面 API。 */
		gpadApi: DesktopApi;
	}
}

export {};
