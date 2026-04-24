import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { desktopApi } from "../services/desktop-api";
import type { DashboardSnapshot, ManagedProcessKey } from "../../shared/types";

const REFRESH_INTERVAL_MS = 2000;

interface AppStoreContextValue {
	snapshot: DashboardSnapshot | null;
	loading: boolean;
	error: string | null;
	refreshSnapshot: () => Promise<void>;
	startProcess: (key: ManagedProcessKey) => Promise<void>;
	stopProcess: (key: ManagedProcessKey) => Promise<void>;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

/** 提供应用运行态数据。 */
export function AppStoreProvider({
	children,
}: {
	/** 子节点。 */
	children: ReactNode;
}) {
	const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refreshSnapshot = useCallback(async () => {
		try {
			const nextSnapshot = await desktopApi.getDashboardSnapshot();
			setSnapshot(nextSnapshot);
			setError(null);
		} catch (reason) {
			const message =
				reason instanceof Error ? reason.message : "获取总览数据失败。";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refreshSnapshot();
		const timer = window.setInterval(() => {
			void refreshSnapshot();
		}, REFRESH_INTERVAL_MS);
		return () => {
			window.clearInterval(timer);
		};
	}, [refreshSnapshot]);

	const startProcess = useCallback(
		async (key: ManagedProcessKey) => {
			await desktopApi.startManagedProcess(key);
			await refreshSnapshot();
		},
		[refreshSnapshot],
	);

	const stopProcess = useCallback(
		async (key: ManagedProcessKey) => {
			await desktopApi.stopManagedProcess(key);
			await refreshSnapshot();
		},
		[refreshSnapshot],
	);

	const value = useMemo<AppStoreContextValue>(
		() => ({
			snapshot,
			loading,
			error,
			refreshSnapshot,
			startProcess,
			stopProcess,
		}),
		[error, loading, refreshSnapshot, snapshot, startProcess, stopProcess],
	);

	return (
		<AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
	);
}

/** 获取应用运行态上下文。 */
export function useAppStore() {
	const context = useContext(AppStoreContext);
	if (!context) {
		throw new Error("useAppStore 必须在 AppStoreProvider 内部使用。");
	}
	return context;
}
