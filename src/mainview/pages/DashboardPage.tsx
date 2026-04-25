import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { ProcessCard } from "../components/ProcessCard";
import { MetricItem, SectionTitle, SoftPanel } from "../components/ui";
import { desktopApi } from "../services/desktop-api";
import { useAppStore } from "../store/app-store";

/** 首页总览页面。 */
export function DashboardPage() {
	const { snapshot, loading, error, refreshSnapshot, startProcess, stopProcess } =
		useAppStore();
	const [openingMoonlightPage, setOpeningMoonlightPage] = useState(false);

	/** 打开 Moonlight 页面。 */
	const openMoonlightPage = async () => {
		setOpeningMoonlightPage(true);
		try {
			const document = await desktopApi.getMoonlightConfig();
			const bindAddress = document.config.web_server.bind_address.trim();
			const certificate = document.config.web_server.certificate;
			const scheme = certificate ? "https" : "http";
			const target = buildMoonlightUrl(
				scheme,
				bindAddress,
				document.config.web_server.url_path_prefix,
			);
			const result = await desktopApi.openExternalUrl(target);
			if (!result.success) {
				throw new Error(result.message);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "打开页面失败。";
			window.alert(message);
		} finally {
			setOpeningMoonlightPage(false);
		}
	};

	if (loading && !snapshot) {
		return <SoftPanel className="p-8 text-slate-500">正在加载总览数据...</SoftPanel>;
	}

	if (error && !snapshot) {
		return <SoftPanel className="p-8 text-rose-500">{error}</SoftPanel>;
	}

	if (!snapshot) {
		return <SoftPanel className="p-8 text-slate-500">暂无可用数据。</SoftPanel>;
	}

	return (
		<div className="space-y-6">
			<SoftPanel className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<SectionTitle
						title="程序运行概览"
						subtitle="统一查看 Moonlight、Traversal 与 Frp 客户端运行状态。"
					/>
				</div>
				<button
					type="button"
					onClick={() => {
						void refreshSnapshot();
					}}
					className="soft-button"
				>
					刷新状态
				</button>
			</SoftPanel>

			<div className="grid gap-4 lg:grid-cols-4">
				<SoftPanel>
					<MetricItem label="当前时间" value={new Date(snapshot.currentTimeIso).toLocaleString()} />
				</SoftPanel>
				<SoftPanel>
					<MetricItem label="运行时长" value={`${snapshot.appUptimeSeconds} 秒`} />
				</SoftPanel>
				<SoftPanel>
					<MetricItem label="Moonlight 端口" value={snapshot.moonlightPort.value} />
				</SoftPanel>
				<SoftPanel>
					<MetricItem
						label="Traversal 端口组"
						value={snapshot.traversalPorts.map((item) => item.value).join(" / ")}
					/>
				</SoftPanel>
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				{snapshot.processes.map((process) => (
					<ProcessCard
						key={process.key}
						process={process}
						onStart={() => {
							void startProcess(process.key);
						}}
						onStop={() => {
							void stopProcess(process.key);
						}}
						extraAction={
							process.key === "moonlightWebServer"
								? {
										label: "打开页面",
										onClick: () => {
											void openMoonlightPage();
										},
										icon: <ExternalLink className="h-4 w-4" />,
										disabled: openingMoonlightPage,
										className: "bg-slate-600/85 text-white",
									}
								: undefined
						}
					/>
				))}
			</div>
		</div>
	);
}

/** 构建 Moonlight 页面地址。 */
function buildMoonlightUrl(
	scheme: "http" | "https",
	bindAddress: string,
	urlPathPrefix: string,
): string {
	const value = bindAddress.trim();
	const pathPrefix = normalizePathPrefix(urlPathPrefix);
	if (!value) {
		return `${scheme}://127.0.0.1${pathPrefix}`;
	}

	if (/^https?:\/\//i.test(value)) {
		return `${value}${pathPrefix}`;
	}

	const lastColonIndex = value.lastIndexOf(":");
	if (lastColonIndex === -1) {
		const host = normalizeMoonlightHost(value);
		return `${scheme}://${host}${pathPrefix}`;
	}

	const host = normalizeMoonlightHost(value.slice(0, lastColonIndex));
	const port = value.slice(lastColonIndex + 1).trim();
	if (!port) {
		return `${scheme}://${host}${pathPrefix}`;
	}
	return `${scheme}://${host}:${port}${pathPrefix}`;
}

/** 归一化 Moonlight 主机地址。 */
function normalizeMoonlightHost(host: string): string {
	const value = host.trim();
	if (!value || value === "0.0.0.0" || value === "::") {
		return "127.0.0.1";
	}
	return value;
}

/** 归一化 URL 路径前缀。 */
function normalizePathPrefix(pathPrefix: string): string {
	const value = pathPrefix.trim();
	if (!value) {
		return "";
	}
	return value.startsWith("/") ? value : `/${value}`;
}
