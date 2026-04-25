import { Play, Square } from "lucide-react";
import type { ReactNode } from "react";
import type { ManagedProcessStatus } from "../../shared/types";
import { MetricItem, SoftButton, SoftPanel, StatusBadge } from "./ui";

/** 展示单个进程状态卡片。 */
export function ProcessCard({
	process,
	onStart,
	onStop,
	extraAction,
}: {
	/** 进程状态。 */
	process: ManagedProcessStatus;
	/** 启动事件。 */
	onStart: () => void;
	/** 停止事件。 */
	onStop: () => void;
	/** 额外操作按钮。 */
	extraAction?: {
		/** 按钮文字。 */
		label: string;
		/** 点击事件。 */
		onClick: () => void;
		/** 图标节点。 */
		icon?: ReactNode;
		/** 是否禁用。 */
		disabled?: boolean;
		/** 额外样式类。 */
		className?: string;
	};
}) {
	return (
		<SoftPanel className="flex h-full flex-col gap-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-lg font-semibold text-slate-700">{process.name}</h3>
					<p className="mt-1 text-sm text-slate-500">{process.executablePath}</p>
				</div>
				<StatusBadge
					active={process.isRunning}
					label={process.isRunning ? "运行中" : "已停止"}
				/>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				<MetricItem label="PID" value={process.pid ? String(process.pid) : "--"} />
				<MetricItem label="CPU" value={`${process.cpuPercent.toFixed(1)}%`} />
				<MetricItem label="内存" value={`${process.memoryMb.toFixed(1)} MB`} />
				<MetricItem label="运行时长" value={`${process.uptimeSeconds} 秒`} />
			</div>

			<div className="mt-auto flex gap-3">
				<SoftButton
					className="accent-button text-white"
					disabled={!process.allowControl || process.isRunning}
					onClick={onStart}
				>
					<Play className="h-4 w-4" />
					启动程序
				</SoftButton>
				<SoftButton
					className="bg-rose-500/90 text-white"
					disabled={!process.allowControl || !process.isRunning}
					onClick={onStop}
				>
					<Square className="h-4 w-4" />
					停止程序
				</SoftButton>
				{extraAction ? (
					<SoftButton
						className={extraAction.className ?? "bg-slate-600/85 text-white"}
						disabled={extraAction.disabled}
						onClick={extraAction.onClick}
					>
						{extraAction.icon}
						{extraAction.label}
					</SoftButton>
				) : null}
			</div>
		</SoftPanel>
	);
}
