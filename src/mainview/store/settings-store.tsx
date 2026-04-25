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
function applyThemeAccent(
	themeAccent: ThemeAccent,
	themeCustomColor: string,
	themeCustomOpacity: number,
) {
	document.documentElement.dataset.themeAccent = themeAccent;
	const rgb = hexToRgb(themeCustomColor);
	const opacity = Math.min(1, Math.max(0, themeCustomOpacity / 100));
	const gradientStartOpacity = 0.12 + opacity * 0.78;
	const gradientEndOpacity = 0.08 + opacity * 0.66;
	const gradientHoverStartOpacity = Math.min(1, gradientStartOpacity + 0.08);
	const gradientHoverEndOpacity = Math.min(1, gradientEndOpacity + 0.08);
	const focusBorderOpacity = 0.14 + opacity * 0.52;
	document.documentElement.style.setProperty("--accent-solid", themeCustomColor);
	document.documentElement.style.setProperty(
		"--accent-rgb",
		`${rgb.r}, ${rgb.g}, ${rgb.b}`,
	);
	document.documentElement.style.setProperty(
		"--accent-soft",
		`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(2)})`,
	);
	document.documentElement.style.setProperty(
		"--accent-focus-border-opacity",
		focusBorderOpacity.toFixed(2),
	);
	document.documentElement.style.setProperty(
		"--accent-gradient-start-opacity",
		gradientStartOpacity.toFixed(2),
	);
	document.documentElement.style.setProperty(
		"--accent-gradient-end-opacity",
		gradientEndOpacity.toFixed(2),
	);
	document.documentElement.style.setProperty(
		"--accent-gradient-hover-start-opacity",
		gradientHoverStartOpacity.toFixed(2),
	);
	document.documentElement.style.setProperty(
		"--accent-gradient-hover-end-opacity",
		gradientHoverEndOpacity.toFixed(2),
	);
	document.documentElement.style.setProperty("--accent-text", themeCustomColor);
}

/** 应用动画开关到文档根节点。 */
function applyAnimationEnabled(animationEnabled: boolean) {
	document.documentElement.dataset.motionEnabled = animationEnabled
		? "true"
		: "false";
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
				applyThemeAccent(
					nextSettings.themeAccent,
					nextSettings.themeCustomColor,
					nextSettings.themeCustomOpacity,
				);
				applyAnimationEnabled(nextSettings.animationEnabled);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const saveSettings = useCallback(async (nextSettings: AppSettings) => {
		await desktopApi.saveAppSettings(nextSettings);
		setSettings(nextSettings);
		applyThemeAccent(
			nextSettings.themeAccent,
			nextSettings.themeCustomColor,
			nextSettings.themeCustomOpacity,
		);
		applyAnimationEnabled(nextSettings.animationEnabled);
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

/** HEX 颜色转 RGB。 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const text = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.slice(1) : "0f91cf";
	return {
		r: Number.parseInt(text.slice(0, 2), 16),
		g: Number.parseInt(text.slice(2, 4), 16),
		b: Number.parseInt(text.slice(4, 6), 16),
	};
}
