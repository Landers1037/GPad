import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { desktopApi } from "../services/desktop-api";
import type { AppSettings, ThemeAccent } from "../../shared/types";

interface SettingsStoreContextValue {
	settings: AppSettings | null;
	loading: boolean;
	saveSettings: (settings: AppSettings) => Promise<void>;
}

const SettingsStoreContext = createContext<SettingsStoreContextValue | null>(null);

/** 应用主题配色到文档根节点。 */
function applyThemeAccent(themeAccent: ThemeAccent) {
	document.documentElement.dataset.themeAccent = themeAccent;
}

/** 提供应用设置上下文。 */
export function SettingsStoreProvider({
	children,
}: {
	/** 子节点。 */
	children: ReactNode;
}) {
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		void (async () => {
			try {
				const nextSettings = await desktopApi.getAppSettings();
				setSettings(nextSettings);
				applyThemeAccent(nextSettings.themeAccent);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const saveSettings = useCallback(async (nextSettings: AppSettings) => {
		await desktopApi.saveAppSettings(nextSettings);
		setSettings(nextSettings);
		applyThemeAccent(nextSettings.themeAccent);
	}, []);

	const value = useMemo<SettingsStoreContextValue>(
		() => ({
			settings,
			loading,
			saveSettings,
		}),
		[loading, saveSettings, settings],
	);

	return (
		<SettingsStoreContext.Provider value={value}>
			{children}
		</SettingsStoreContext.Provider>
	);
}

/** 获取设置上下文。 */
export function useSettingsStore() {
	const context = useContext(SettingsStoreContext);
	if (!context) {
		throw new Error("useSettingsStore 必须在 SettingsStoreProvider 内部使用。");
	}
	return context;
}
