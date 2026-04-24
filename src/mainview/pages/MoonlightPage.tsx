import { useEffect, useMemo, useState } from "react";
import { Play, Square } from "lucide-react";
import { ConfigEditor, type ConfigField } from "../components/ConfigEditor";
import { SectionTitle } from "../components/ui";
import { desktopApi } from "../services/desktop-api";
import type { ConfigDocument, MoonlightConfig } from "../../shared/types";
import { useAppStore } from "../store/app-store";

/** Moonlight 配置页面。 */
export function MoonlightPage() {
	const [document, setDocument] = useState<ConfigDocument<MoonlightConfig> | null>(
		null,
	);
	const [message, setMessage] = useState<string>("");
	const { snapshot, startProcess, stopProcess } = useAppStore();

	useEffect(() => {
		void (async () => {
			const config = await desktopApi.getMoonlightConfig();
			setDocument(config);
		})();
	}, []);

	const fields = useMemo<ConfigField[]>(() => {
		if (!document) {
			return [];
		}
		return [
			{
				key: "web_server.bind_address",
				label: "Web 服务绑定地址",
				value: document.config.web_server.bind_address,
				type: "text",
			},
			{
				key: "web_server.url_path_prefix",
				label: "URL 路径前缀",
				value: document.config.web_server.url_path_prefix,
				type: "text",
			},
			{
				key: "moonlight.default_http_port",
				label: "默认 HTTP 端口",
				value: document.config.moonlight.default_http_port,
				type: "number",
			},
			{
				key: "moonlight.pair_device_name",
				label: "配对设备名称",
				value: document.config.moonlight.pair_device_name,
				type: "text",
			},
			{
				key: "streamer_path",
				label: "Streamer 路径",
				value: document.config.streamer_path,
				type: "text",
			},
			{
				key: "log.level_filter",
				label: "日志级别",
				value: document.config.log.level_filter,
				type: "text",
			},
		];
	}, [document]);

	function patchConfig(values: Record<string, string | number | boolean>) {
		if (!document) {
			return null;
		}
		const nextConfig: MoonlightConfig = JSON.parse(JSON.stringify(document.config));
		nextConfig.web_server.bind_address = String(values["web_server.bind_address"]);
		nextConfig.web_server.url_path_prefix = String(
			values["web_server.url_path_prefix"],
		);
		nextConfig.moonlight.default_http_port = Number(
			values["moonlight.default_http_port"],
		);
		nextConfig.moonlight.pair_device_name = String(
			values["moonlight.pair_device_name"],
		);
		nextConfig.streamer_path = String(values["streamer_path"]);
		nextConfig.log.level_filter = String(values["log.level_filter"]) as MoonlightConfig["log"]["level_filter"];
		return nextConfig;
	}

	async function refresh() {
		const config = await desktopApi.getMoonlightConfig();
		setDocument(config);
	}

	const running =
		snapshot?.processes.find((item) => item.key === "moonlightWebServer") ?? null;

	if (!document) {
		return <div className="soft-panel p-8 text-slate-500">正在加载 Moonlight 配置...</div>;
	}

	return (
		<div className="space-y-6">
			<SectionTitle
				title="Moonlight 串流配置"
				subtitle="查看与编辑 server/config.json，并控制 Moonlight Web Server 启停。"
			/>

			<div className="soft-panel flex flex-wrap items-center justify-between gap-3">
				<div className="text-sm text-slate-500">
					当前状态：{running?.isRunning ? "运行中" : "已停止"}
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						className="soft-button accent-button text-white"
						onClick={() => {
							void startProcess("moonlightWebServer");
						}}
					>
						<Play className="h-4 w-4" />
						启动程序
					</button>
					<button
						type="button"
						className="soft-button bg-rose-500/90 text-white"
						onClick={() => {
							void stopProcess("moonlightWebServer");
						}}
					>
						<Square className="h-4 w-4" />
						停止程序
					</button>
				</div>
			</div>

			<ConfigEditor
				title="Moonlight 配置编辑"
				fields={fields}
				rawText={document.rawText}
				filePath={document.filePath}
				onSaveJson={async (rawText) => {
					const result = await desktopApi.saveMoonlightConfig(rawText);
					setMessage(result.message);
					await refresh();
				}}
				onSaveFields={async (values) => {
					const nextConfig = patchConfig(values);
					if (!nextConfig) {
						return;
					}
					const result = await desktopApi.saveMoonlightConfig(
						JSON.stringify(nextConfig, null, 2),
					);
					setMessage(result.message);
					await refresh();
				}}
			/>

			{message ? <div className="text-sm text-emerald-600">{message}</div> : null}
		</div>
	);
}
