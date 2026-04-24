import { useEffect, useMemo, useState } from "react";
import { ConfigEditor, type ConfigField } from "../components/ConfigEditor";
import { SectionTitle, SoftPanel } from "../components/ui";
import { desktopApi } from "../services/desktop-api";
import type { ConfigDocument, TraversalConfig } from "../../shared/types";
import { useAppStore } from "../store/app-store";

/** Traversal 配置页面。 */
export function TraversalPage() {
	const [document, setDocument] = useState<ConfigDocument<TraversalConfig> | null>(
		null,
	);
	const [message, setMessage] = useState<string>("");
	const { snapshot, startProcess, stopProcess } = useAppStore();

	useEffect(() => {
		void (async () => {
			const config = await desktopApi.getTraversalConfig();
			setDocument(config);
		})();
	}, []);

	const fields = useMemo<ConfigField[]>(() => {
		if (!document) {
			return [];
		}
		return [
			{
				key: "server_ip",
				label: "服务端 IP",
				value: document.config.server_ip,
				type: "text",
			},
			{
				key: "server_port",
				label: "服务端端口",
				value: document.config.server_port,
				type: "number",
			},
			{
				key: "server_protocol",
				label: "服务端协议",
				value: document.config.server_protocol,
				type: "text",
			},
			{
				key: "auth_key",
				label: "鉴权密钥",
				value: document.config.auth_key,
				type: "text",
			},
		];
	}, [document]);

	function patchConfig(values: Record<string, string | number | boolean>) {
		if (!document) {
			return null;
		}
		const nextConfig: TraversalConfig = JSON.parse(JSON.stringify(document.config));
		nextConfig.server_ip = String(values.server_ip);
		nextConfig.server_port = Number(values.server_port);
		nextConfig.server_protocol = String(values.server_protocol);
		nextConfig.auth_key = String(values.auth_key);
		return nextConfig;
	}

	async function refresh() {
		const config = await desktopApi.getTraversalConfig();
		setDocument(config);
	}

	const running =
		snapshot?.processes.find((item) => item.key === "traversalClient") ?? null;

	if (!document) {
		return <div className="soft-panel p-8 text-slate-500">正在加载 Traversal 配置...</div>;
	}

	return (
		<div className="space-y-6">
			<SectionTitle
				title="Traversal 内网穿透配置"
				subtitle="查看与编辑 traversalc.json，并控制穿透客户端启停。"
			/>

			<SoftPanel className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="text-sm text-slate-500">
						当前状态：{running?.isRunning ? "运行中" : "已停止"}
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							className="soft-button accent-button text-white"
							onClick={() => {
								void startProcess("traversalClient");
							}}
						>
							启动程序
						</button>
						<button
							type="button"
							className="soft-button bg-rose-500/90 text-white"
							onClick={() => {
								void stopProcess("traversalClient");
							}}
						>
							停止程序
						</button>
					</div>
				</div>

				<div className="grid gap-3 md:grid-cols-2">
					{document.config.proxy_server.map((item) => (
						<div
							key={`${item.name}-${item.remote_port}`}
							className="rounded-3xl bg-white/60 px-4 py-4 text-sm text-slate-600 shadow-soft-pressed"
						>
							<p className="font-semibold text-slate-700">{item.name}</p>
							<p className="mt-2">远端端口：{item.remote_port}</p>
							<p>本地地址：{item.local_host}</p>
							<p>本地端口：{item.local_port}</p>
						</div>
					))}
				</div>
			</SoftPanel>

			<ConfigEditor
				title="Traversal 配置编辑"
				fields={fields}
				rawText={document.rawText}
				filePath={document.filePath}
				onSaveJson={async (rawText) => {
					const result = await desktopApi.saveTraversalConfig(rawText);
					setMessage(result.message);
					await refresh();
				}}
				onSaveFields={async (values) => {
					const nextConfig = patchConfig(values);
					if (!nextConfig) {
						return;
					}
					const result = await desktopApi.saveTraversalConfig(
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
