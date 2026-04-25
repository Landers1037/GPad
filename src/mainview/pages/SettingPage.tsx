import { useEffect, useMemo, useState } from "react";
import { FolderOpen, Sparkles } from "lucide-react";
import { SectionTitle, SelectBox, SoftButton, SoftPanel, TextInput } from "../components/ui";
import { desktopApi } from "../services/desktop-api";
import { useSettingsStore } from "../store/settings-store";
import type { AppLocale, AppSettings, LogLevel, ThemeAccent } from "../../shared/types";

/** 设置页面。 */
export function SettingPage() {
	const { settings, loading, saveSettings } = useSettingsStore();
	const [draft, setDraft] = useState<AppSettings | null>(settings);
	const [message, setMessage] = useState("");

	useEffect(() => {
		setDraft(settings);
	}, [settings]);

	const themeOptions = useMemo<{ value: ThemeAccent; label: string }[]>(
		() => [
			{ value: "sky", label: "天空蓝" },
			{ value: "violet", label: "柔雾紫" },
			{ value: "emerald", label: "翡翠绿" },
		],
		[],
	);

	const themePresetMap: Record<ThemeAccent, string> = useMemo(
		() => ({
			sky: "#0f91cf",
			violet: "#7c63e6",
			emerald: "#1f9d7a",
		}),
		[],
	);

	const localeOptions = useMemo<{ value: AppLocale; label: string }[]>(
		() => [
			{ value: "zh-CN", label: "中文" },
			{ value: "en-US", label: "English" },
		],
		[],
	);

	const logLevelOptions = useMemo<{ value: LogLevel; label: string }[]>(
		() => [
			{ value: "TRACE", label: "TRACE" },
			{ value: "DEBUG", label: "DEBUG" },
			{ value: "INFO", label: "INFO" },
			{ value: "WARN", label: "WARN" },
			{ value: "ERROR", label: "ERROR" },
		],
		[],
	);

	if (loading || !draft) {
		return <div className="soft-panel p-8 text-slate-500">正在加载设置...</div>;
	}

	return (
		<div className="space-y-6">
			<SectionTitle
				title="应用设置"
				subtitle="管理主题配色、语言、日志路径与日志级别。"
			/>

			<SoftPanel className="grid gap-4 md:grid-cols-2">
				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-slate-600">主题配色</span>
					<SelectBox
						value={draft.themeAccent}
						onChange={(event) => {
							const nextAccent = event.target.value as ThemeAccent;
							setDraft((current) =>
								current
									? {
											...current,
											themeAccent: nextAccent,
											themeCustomColor: themePresetMap[nextAccent],
										}
									: current,
							);
						}}
					>
						{themeOptions.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</SelectBox>
				</label>

				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-slate-600">调色盘</span>
					<div className="flex items-center gap-3">
						<input
							type="color"
							value={draft.themeCustomColor}
							onChange={(event) => {
								setDraft((current) =>
									current
										? {
												...current,
												themeCustomColor: event.target.value,
											}
										: current,
								);
							}}
							className="soft-color-picker h-11 w-16 rounded-2xl border border-white/60 bg-white/70 p-1 shadow-soft-pressed"
						/>
						<TextInput
							className="flex-1"
							value={draft.themeCustomColor}
							onChange={(event) => {
								setDraft((current) =>
									current
										? {
												...current,
												themeCustomColor: event.target.value,
											}
										: current,
								);
							}}
						/>
					</div>
				</label>

				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-slate-600">主题透明度</span>
					<div className="flex items-center gap-3">
						<input
							type="range"
							min={0}
							max={100}
							value={draft.themeCustomOpacity}
							onChange={(event) => {
								setDraft((current) =>
									current
										? {
												...current,
												themeCustomOpacity: Number(event.target.value),
											}
										: current,
								);
							}}
							className="accent-range h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/70 shadow-soft-pressed"
						/>
						<span className="min-w-14 text-right text-sm text-slate-500">
							{draft.themeCustomOpacity}%
						</span>
					</div>
				</label>

				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-slate-600">语言</span>
					<SelectBox
						value={draft.locale}
						onChange={(event) => {
							setDraft((current) =>
								current
									? {
											...current,
											locale: event.target.value as AppLocale,
										}
									: current,
							);
						}}
					>
						{localeOptions.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</SelectBox>
				</label>

				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-slate-600">开启动画效果</span>
					<SelectBox
						value={draft.animationEnabled ? "true" : "false"}
						onChange={(event) => {
							setDraft((current) =>
								current
									? {
											...current,
											animationEnabled: event.target.value === "true",
										}
									: current,
							);
						}}
					>
						<option value="false">关闭</option>
						<option value="true">开启</option>
					</SelectBox>
				</label>

				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-slate-600">日志路径</span>
					<div className="flex items-center gap-2">
						<TextInput
							className="flex-1"
							value={draft.logPath}
							onChange={(event) => {
								setDraft((current) =>
									current
										? {
												...current,
												logPath: event.target.value,
											}
										: current,
								);
							}}
						/>
						<SoftButton
							className="h-10 shrink-0 px-3 text-slate-600"
							onClick={() => {
								void (async () => {
									const result = await desktopApi.openLogFolder(draft.logPath);
									setMessage(result.message);
								})();
							}}
						>
							<FolderOpen className="h-4 w-4" />
							打开
						</SoftButton>
					</div>
				</label>

				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-slate-600">日志级别</span>
					<SelectBox
						value={draft.logLevel}
						onChange={(event) => {
							setDraft((current) =>
								current
									? {
											...current,
											logLevel: event.target.value as LogLevel,
										}
									: current,
							);
						}}
					>
						{logLevelOptions.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</SelectBox>
				</label>
			</SoftPanel>

			<div className="flex justify-end">
				<SoftButton
					className="accent-button text-white"
					onClick={() => {
						void (async () => {
							await saveSettings(draft);
							setMessage("应用设置已保存。");
						})();
					}}
				>
					<Sparkles className="h-4 w-4" />
					保存设置
				</SoftButton>
			</div>

			{message ? <div className="text-sm text-emerald-600">{message}</div> : null}
		</div>
	);
}
