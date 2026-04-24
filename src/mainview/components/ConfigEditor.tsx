import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { SelectBox, SoftButton, SoftPanel, TextArea, TextInput } from "./ui";

/** 基础表单项定义。 */
export interface ConfigField {
	/** 字段键名。 */
	key: string;
	/** 字段标签。 */
	label: string;
	/** 字段值。 */
	value: string | number | boolean;
	/** 输入类型。 */
	type: "text" | "number" | "boolean";
}

/** 结构化配置编辑器。 */
export function ConfigEditor({
	title,
	fields,
	rawText,
	filePath,
	onSaveJson,
	onSaveFields,
}: {
	/** 标题。 */
	title: string;
	/** 表单字段。 */
	fields: ConfigField[];
	/** 原始 JSON。 */
	rawText: string;
	/** 文件路径。 */
	filePath: string;
	/** 保存 JSON 事件。 */
	onSaveJson: (value: string) => Promise<void>;
	/** 保存字段事件。 */
	onSaveFields: (values: Record<string, string | number | boolean>) => Promise<void>;
}) {
	const [mode, setMode] = useState<"form" | "json">("form");
	const [jsonValue, setJsonValue] = useState(rawText);
	const [fieldValues, setFieldValues] = useState<Record<string, string | number | boolean>>(
		() =>
			Object.fromEntries(fields.map((field) => [field.key, field.value])) as Record<
				string,
				string | number | boolean
			>,
	);
	const [saving, setSaving] = useState(false);

	const fieldList = useMemo(() => fields, [fields]);

	async function handleSave() {
		setSaving(true);
		try {
			if (mode === "json") {
				await onSaveJson(jsonValue);
				return;
			}
			await onSaveFields(fieldValues);
		} finally {
			setSaving(false);
		}
	}

	return (
		<SoftPanel className="space-y-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-slate-700">{title}</h3>
					<p className="mt-1 text-sm text-slate-500">配置文件：{filePath}</p>
				</div>
				<div className="flex gap-2 rounded-full bg-slate-100/70 p-1">
					<button
						type="button"
						onClick={() => setMode("form")}
						className={`rounded-full px-4 py-2 text-sm ${
							mode === "form" ? "nav-pill-active shadow-sm" : "text-slate-500"
						}`}
					>
						表单模式
					</button>
					<button
						type="button"
						onClick={() => setMode("json")}
						className={`rounded-full px-4 py-2 text-sm ${
							mode === "json" ? "nav-pill-active shadow-sm" : "text-slate-500"
						}`}
					>
						JSON 模式
					</button>
				</div>
			</div>

			{mode === "form" ? (
				<div className="grid gap-4 md:grid-cols-2">
					{fieldList.map((field) => (
						<label key={field.key} className="flex flex-col gap-2">
							<span className="text-sm font-medium text-slate-600">{field.label}</span>
							{field.type === "boolean" ? (
								<SelectBox
									value={String(fieldValues[field.key])}
									onChange={(event) => {
										setFieldValues((current) => ({
											...current,
											[field.key]: event.target.value === "true",
										}));
									}}
								>
									<option value="true">是</option>
									<option value="false">否</option>
								</SelectBox>
							) : (
								<TextInput
									type={field.type}
									value={String(fieldValues[field.key])}
									onChange={(event) => {
										const nextValue =
											field.type === "number"
												? Number(event.target.value)
												: event.target.value;
										setFieldValues((current) => ({
											...current,
											[field.key]: nextValue,
										}));
									}}
								/>
							)}
						</label>
					))}
				</div>
			) : (
				<TextArea
					value={jsonValue}
					onChange={(event) => setJsonValue(event.target.value)}
					rows={18}
				/>
			)}

			<div className="flex justify-end">
				<SoftButton
					className="accent-button text-white"
					disabled={saving}
					onClick={() => {
						void handleSave();
					}}
				>
					<Save className="h-4 w-4" />
					{saving ? "保存中..." : "保存配置"}
				</SoftButton>
			</div>
		</SoftPanel>
	);
}
