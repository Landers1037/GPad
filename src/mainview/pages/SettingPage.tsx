import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { SectionTitle, SelectBox, SoftButton, SoftPanel, TextInput } from "../components/ui";
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
							setDraft((current) =>
								current
									? {
											...current,
											themeAccent: event.target.value as ThemeAccent,
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
					<TextInput
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
