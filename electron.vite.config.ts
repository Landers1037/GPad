import path from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

/** Electron Vite 统一构建配置。 */
export default defineConfig({
	main: {
		build: {
			lib: {
				entry: path.resolve(__dirname, "src/electron/main/index.ts"),
			},
		},
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				"@shared": path.resolve(__dirname, "src/shared"),
			},
		},
	},
	preload: {
		build: {
			lib: {
				entry: path.resolve(__dirname, "src/electron/preload/index.ts"),
			},
		},
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				"@shared": path.resolve(__dirname, "src/shared"),
			},
		},
	},
	renderer: {
		root: path.resolve(__dirname, "src/mainview"),
		build: {
			rollupOptions: {
				input: path.resolve(__dirname, "src/mainview/index.html"),
			},
		},
		plugins: [react()],
		resolve: {
			alias: {
				"@renderer": path.resolve(__dirname, "src/mainview"),
				"@shared": path.resolve(__dirname, "src/shared"),
			},
		},
		server: {
			port: 5173,
			strictPort: true,
		},
	},
});
