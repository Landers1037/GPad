import { createHashRouter } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { AboutPage } from "./pages/AboutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MoonlightPage } from "./pages/MoonlightPage";
import { SettingPage } from "./pages/SettingPage";
import { TraversalPage } from "./pages/TraversalPage";

/** 应用路由定义。 */
export const router = createHashRouter([
	{
		path: "/",
		element: <AppLayout />,
		children: [
			{
				index: true,
				element: <DashboardPage />,
			},
			{
				path: "moonlight",
				element: <MoonlightPage />,
			},
			{
				path: "traversal",
				element: <TraversalPage />,
			},
			{
				path: "setting",
				element: <SettingPage />,
			},
			{
				path: "about",
				element: <AboutPage />,
			},
		],
	},
]);
