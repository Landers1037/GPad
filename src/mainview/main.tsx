import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { AppStoreProvider } from "./store/app-store";
import { SettingsStoreProvider } from "./store/settings-store";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SettingsStoreProvider>
			<AppStoreProvider>
				<RouterProvider router={router} />
			</AppStoreProvider>
		</SettingsStoreProvider>
	</StrictMode>,
);
