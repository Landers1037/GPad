import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from "../theme/version";
import { MetricItem, SectionTitle, SoftPanel } from "../components/ui";

/** 关于页面。 */
export function AboutPage() {
	return (
		<div className="space-y-6">
			<SectionTitle
				title="关于 GPad"
				subtitle="查看应用用途、技术栈与版本信息。"
			/>

			<SoftPanel className="space-y-5">
				<div>
					<h3 className="text-2xl font-semibold text-slate-700">{APP_NAME}</h3>
					<p className="mt-3 text-sm leading-7 text-slate-500">{APP_DESCRIPTION}</p>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<MetricItem label="版本号" value={APP_VERSION} />
					<MetricItem label="界面技术" value="React + Tailwind" />
					<MetricItem label="桌面框架" value="Electron + electron-vite" />
				</div>

				<div className="rounded-3xl bg-white/60 px-5 py-5 text-sm leading-7 text-slate-500 shadow-soft-pressed">
					<p>用途：</p>
					<p>统一管理 Moonlight 串流服务、内网穿透客户端以及应用自身设置。</p>
					<p className="mt-3">设计风格：</p>
					<p>采用浅色软拟态界面，强调柔和阴影、高光与低对比视觉层次。</p>
				</div>
			</SoftPanel>
		</div>
	);
}
