import { useEffect, useState } from "react";
import { Play, Save, Square } from "lucide-react";
import { SectionTitle, SoftButton, SoftPanel, TextArea, TextInput } from "../components/ui";
import { desktopApi } from "../services/desktop-api";
import { useAppStore } from "../store/app-store";
import type { ConfigDocument, FrpConfig } from "../../shared/types";

/** Frp 配置页面。 */
export function FrpPage() {
	const [document, setDocument] = useState<ConfigDocument<FrpConfig> | null>(null);
	const [rawText, setRawText] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const { snapshot, startProcess, stopProcess } = useAppStore();

	useEffect(() => {
		void refresh();
	}, []);

	/** 刷新 Frp 配置。 */
	async function refresh() {
		const config = await desktopApi.getFrpConfig();
		setDocument(config);
		setRawText(config.rawText);
	}

	/** 更新草稿配置。 */
	function updateDraft<K extends keyof FrpConfig>(
		key: K,
		value: FrpConfig[K],
	) {
		setDocument((current) => {
			if (!current) {
				return current;
			}
			return {
				...current,
				config: {
					...current.config,
					[key]: value,
				},
			};
		});
	}

	/** 更新代理配置草稿。 */
	function updateProxy<K extends keyof FrpConfig["proxy"]>(
		key: K,
		value: FrpConfig["proxy"][K],
	) {
		setDocument((current) => {
			if (!current) {
				return current;
			}
			return {
				...current,
				config: {
					...current.config,
					proxy: {
						...current.config.proxy,
						[key]: value,
					},
				},
			};
		});
	}

	/** 保存表单模式配置。 */
	async function saveForm() {
		if (!document) {
			return;
		}
		setSaving(true);
		try {
			const result = await desktopApi.saveFrpConfig(buildFrpToml(document.config));
			setMessage(result.message);
			await refresh();
		} finally {
			setSaving(false);
		}
	}

	/** 保存 TOML 原文。 */
	async function saveRaw() {
		setSaving(true);
		try {
			const result = await desktopApi.saveFrpConfig(rawText);
			setMessage(result.message);
			await refresh();
		} finally {
			setSaving(false);
		}
	}

	const running = snapshot?.processes.find((item) => item.key === "frpClient") ?? null;

	if (!document) {
		return <div className="soft-panel p-8 text-slate-500">正在加载 Frp 配置...</div>;
	}

	return (
		<div className="space-y-6">
			<SectionTitle
				title="Frp 内网穿透配置"
				subtitle="管理 frpc.toml 并控制 Frp 客户端启停。"
			/>

			<SoftPanel className="flex flex-wrap items-center justify-between gap-3">
				<div className="text-sm text-slate-500">
					当前状态：{running?.isRunning ? "运行中" : "已停止"}
				</div>
				<div className="flex gap-3">
					<SoftButton
						className="accent-button text-white"
						onClick={() => {
							void startProcess("frpClient");
						}}
					>
						<Play className="h-4 w-4" />
						启动程序
					</SoftButton>
					<SoftButton
						className="bg-rose-500/90 text-white"
						onClick={() => {
							void stopProcess("frpClient");
						}}
					>
						<Square className="h-4 w-4" />
						停止程序
					</SoftButton>
				</div>
			</SoftPanel>

			<SoftPanel className="space-y-4">
				<h3 className="text-lg font-semibold text-slate-700">表单模式</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">服务端地址</span>
						<TextInput
							value={document.config.serverAddr}
							onChange={(event) => {
								updateDraft("serverAddr", event.target.value);
							}}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">服务端端口</span>
						<TextInput
							type="number"
							value={String(document.config.serverPort)}
							onChange={(event) => {
								updateDraft("serverPort", Number(event.target.value));
							}}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">认证 Token</span>
						<TextInput
							value={document.config.authToken}
							onChange={(event) => {
								updateDraft("authToken", event.target.value);
							}}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">内网穿透名称</span>
						<TextInput
							value={document.config.proxy.name}
							onChange={(event) => {
								updateProxy("name", event.target.value);
							}}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">类型</span>
						<TextInput
							value={document.config.proxy.type}
							onChange={(event) => {
								updateProxy("type", event.target.value);
							}}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">本机 IP</span>
						<TextInput
							value={document.config.proxy.localIP}
							onChange={(event) => {
								updateProxy("localIP", event.target.value);
							}}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">本机端口</span>
						<TextInput
							type="number"
							value={String(document.config.proxy.localPort)}
							onChange={(event) => {
								updateProxy("localPort", Number(event.target.value));
							}}
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm font-medium text-slate-600">远程端口</span>
						<TextInput
							type="number"
							value={String(document.config.proxy.remotePort)}
							onChange={(event) => {
								updateProxy("remotePort", Number(event.target.value));
							}}
						/>
					</label>
				</div>
				<div className="flex justify-end">
					<SoftButton
						className="accent-button text-white"
						disabled={saving}
						onClick={() => {
							void saveForm();
						}}
					>
						<Save className="h-4 w-4" />
						{saving ? "保存中..." : "保存表单配置"}
					</SoftButton>
				</div>
			</SoftPanel>

			<SoftPanel className="space-y-4">
				<h3 className="text-lg font-semibold text-slate-700">TOML 原文模式</h3>
				<TextArea
					rows={14}
					value={rawText}
					onChange={(event) => {
						setRawText(event.target.value);
					}}
				/>
				<div className="flex justify-end">
					<SoftButton
						className="accent-button text-white"
						disabled={saving}
						onClick={() => {
							void saveRaw();
						}}
					>
						<Save className="h-4 w-4" />
						{saving ? "保存中..." : "保存 TOML 配置"}
					</SoftButton>
				</div>
			</SoftPanel>

			{message ? <div className="text-sm text-emerald-600">{message}</div> : null}
		</div>
	);
}

/** 生成 Frp TOML 文本。 */
function buildFrpToml(config: FrpConfig): string {
	return [
		`serverAddr = "${config.serverAddr}"`,
		`serverPort = ${config.serverPort}`,
		`auth.token = "${config.authToken}"`,
		"",
		"[[proxies]]",
		`name = "${config.proxy.name}"`,
		`type = "${config.proxy.type}"`,
		`localIP = "${config.proxy.localIP}"`,
		`localPort = ${config.proxy.localPort}`,
		`remotePort = ${config.proxy.remotePort}`,
	].join("\n");
}
