import { useEffect, useState, type ComponentType } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
	House,
	Minus,
	Expand,
	Monitor,
	Settings,
	Info,
	X,
} from "lucide-react";
import { APP_NAME, APP_VERSION } from "../theme/version";
import { desktopApi } from "../services/desktop-api";
import { useSettingsStore } from "../store/settings-store";

const navItems = [
	{ to: "/", label: "概览", icon: House },
	{ to: "/moonlight", label: "Moonlight", icon: Monitor },
	{ to: "/traversal", label: "Traversal", icon: Monitor },
	{ to: "/setting", label: "配置", icon: Settings },
	{ to: "/about", label: "关于", icon: Info },
];

function WindowControlButton({
	icon: Icon,
	title,
	danger = false,
	onClick,
}: {
	icon: ComponentType<{ className?: string }>;
	title: string;
	danger?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			title={title}
			onClick={onClick}
			className={[
				"window-control-button no-drag",
				danger
					? "text-rose-500 hover:bg-rose-500 hover:text-white"
					: "text-slate-500 hover:bg-[var(--accent-solid)] hover:text-white",
			].join(" ")}
		>
			<Icon className="h-3.5 w-3.5" />
		</button>
	);
}

/** 应用整体布局。 */
export function AppLayout() {
	const [isMaximized, setIsMaximized] = useState(false);
	const { settings } = useSettingsStore();
	const animationEnabled = settings?.animationEnabled ?? false;

	useEffect(() => {
		void (async () => {
			setIsMaximized(await desktopApi.isWindowMaximized());
		})();
	}, []);

	return (
		<div className="min-h-screen bg-app-bg text-slate-700">
			<div className="glass-window-bar mb-4 flex h-11 items-stretch overflow-hidden">
				<div className="drag-region flex min-w-0 flex-1 items-center px-4">
					<p className="truncate text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
						{APP_NAME}
					</p>
				</div>
				<div className="no-drag ml-auto flex items-stretch">
					<WindowControlButton
						icon={Minus}
						title="最小化"
						onClick={() => {
							void desktopApi.minimizeWindow();
						}}
					/>
					<WindowControlButton
						icon={Expand}
						title={isMaximized ? "还原" : "最大化"}
						onClick={() => {
							void (async () => {
								const next = await desktopApi.toggleWindowMaximize();
								setIsMaximized(next);
							})();
						}}
					/>
					<WindowControlButton
						icon={X}
						title="关闭"
						danger
						onClick={() => {
							void desktopApi.closeWindow();
						}}
					/>
				</div>
			</div>

			<div className="mx-auto flex min-h-screen max-w-[1560px] flex-col px-6 pb-6 pt-0 lg:px-10">

				<header className="soft-panel mb-6 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
					<div className="min-w-[220px] flex-1">
						<p className="text-sm uppercase tracking-[0.32em] text-slate-400">
							Desktop Control Center
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-slate-700">
							{APP_NAME}
						</h1>
					</div>
					<nav className="no-drag flex flex-wrap gap-3">
						{navItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								viewTransition={animationEnabled}
								className={({ isActive }) =>
									[
										"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
										isActive
											? "nav-pill-active shadow-soft-pressed"
											: "bg-transparent text-slate-500 hover:bg-white/60",
									].join(" ")
								}
								end={item.to === "/"}
							>
								<item.icon className="h-4 w-4" />
								{item.label}
							</NavLink>
						))}
					</nav>
					<div className="text-right text-sm text-slate-400">
						<p>Neumorphism Console</p>
						<p className="mt-1">{APP_VERSION}</p>
					</div>
				</header>

				<main className="flex-1">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
