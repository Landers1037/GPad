import { ProcessCard } from "../components/ProcessCard";
import { MetricItem, SectionTitle, SoftPanel } from "../components/ui";
import { useAppStore } from "../store/app-store";

/** 首页总览页面。 */
export function DashboardPage() {
	const { snapshot, loading, error, refreshSnapshot, startProcess, stopProcess } =
		useAppStore();

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
						subtitle="统一查看 Moonlight Web Server 与 Traversal 客户端运行状态。"
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
					/>
				))}
			</div>
		</div>
	);
}
