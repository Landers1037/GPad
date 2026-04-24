import { type ReactNode } from "react";

/** 软拟态面板。 */
export function SoftPanel({
	children,
	className = "",
}: {
	/** 子节点。 */
	children: ReactNode;
	/** 额外样式类。 */
	className?: string;
}) {
	return <div className={`soft-panel ${className}`.trim()}>{children}</div>;
}

/** 段落标题。 */
export function SectionTitle({
	title,
	subtitle,
}: {
	/** 标题文本。 */
	title: string;
	/** 副标题文本。 */
	subtitle?: string;
}) {
	return (
		<div className="mb-5">
			<h2 className="text-lg font-semibold text-slate-700">{title}</h2>
			{subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
		</div>
	);
}

/** 状态徽标。 */
export function StatusBadge({
	active,
	label,
}: {
	/** 是否激活。 */
	active: boolean;
	/** 展示文本。 */
	label: string;
}) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
				active
					? "bg-emerald-100 text-emerald-700"
					: "bg-slate-200 text-slate-500"
			}`}
		>
			<span
				className={`mr-2 h-2 w-2 rounded-full ${
					active ? "bg-emerald-500" : "bg-slate-400"
				}`}
			/>
			{label}
		</span>
	);
}

/** 软拟态按钮。 */
export function SoftButton({
	children,
	className = "",
	disabled = false,
	type = "button",
	onClick,
}: {
	/** 按钮内容。 */
	children: ReactNode;
	/** 额外样式类。 */
	className?: string;
	/** 是否禁用。 */
	disabled?: boolean;
	/** 按钮类型。 */
	type?: "button" | "submit";
	/** 点击事件。 */
	onClick?: () => void;
}) {
	return (
		<button
			type={type}
			disabled={disabled}
			onClick={onClick}
			className={`soft-button ${disabled ? "opacity-50" : ""} ${className}`.trim()}
		>
			{children}
		</button>
	);
}

/** 统计项。 */
export function MetricItem({
	label,
	value,
}: {
	/** 指标名称。 */
	label: string;
	/** 指标值。 */
	value: string;
}) {
	return (
		<div className="rounded-3xl bg-white/50 px-4 py-3 shadow-[inset_3px_3px_6px_rgba(255,255,255,0.75),inset_-3px_-3px_6px_rgba(148,163,184,0.12)]">
			<p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
			<p className="mt-2 text-lg font-semibold text-slate-700">{value}</p>
		</div>
	);
}

/** 表单输入框。 */
export function TextInput(
	props: React.InputHTMLAttributes<HTMLInputElement>,
) {
	return <input {...props} className={`soft-input ${props.className ?? ""}`.trim()} />;
}

/** 文本域。 */
export function TextArea(
	props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
	return (
		<textarea
			{...props}
			className={`soft-textarea ${props.className ?? ""}`.trim()}
		/>
	);
}

/** 选择框。 */
export function SelectBox(
	props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
	return (
		<select
			{...props}
			className={`soft-input soft-select ${props.className ?? ""}`.trim()}
		/>
	);
}
