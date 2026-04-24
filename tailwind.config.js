/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/mainview/**/*.{html,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				"app-bg": "#e8eef5",
				soft: {
					50: "#f7fbff",
					100: "#eef4fa",
					200: "#dae4ef",
					300: "#bdd0e1",
					700: "#425466",
				},
			},
			boxShadow: {
				soft: "12px 12px 24px rgba(148, 163, 184, 0.18), -12px -12px 24px rgba(255, 255, 255, 0.92)",
				"soft-pressed":
					"inset 8px 8px 18px rgba(148, 163, 184, 0.18), inset -8px -8px 18px rgba(255, 255, 255, 0.92)",
			},
			borderRadius: {
				"4xl": "2rem",
			},
		},
	},
	plugins: [],
};
