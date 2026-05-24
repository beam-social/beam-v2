import { useSession } from '@/stores/session';

export const themes: Record<string, Record<string, string>> = {
	light: {
		name: "Clair",
		color: "#FFFFFF",
	},
	dark: {
		name: "Sombre",
		color: "#30324A",
	},
	verydark: {
		name: "Vraiment très sombre",
		color: "#00020A",
	},
	emerald: {
		name: "Émeraude",
		color: "#00C884",
	},
	royal: {
		name: "Royal",
		color: "#6B19FF",
	},
	sunset: {
		name: "Sunset",
		color: "#FF2900",
	},
	amethyst: {
		name: "Améthyste",
		color: "#9E00FF",
	},
	sky: {
		name: "Blue Sky",
		color: "#0076BB",
	},
	pro: {
		name: "Pro",
		color: "#131A4B",
	},
	gold: {
		name: "Couvrez-moi d'or",
		color: "#EBAA2E",
	},
};

export const useTheme = () => {
	const { me } = useSession();
	const theme = useState<string>("theme", () => "light");

	const setTheme = (newTheme?: string) => {
		if (typeof window === "undefined") return; // Skip on server

		if (!newTheme) {
			if (
				window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
			) {
				document.documentElement.classList.add("theme-dark");
				theme.value = "dark";
			} else {
				document.documentElement.classList.add("theme-light");
				theme.value = "light";
			}

			return;
		}

		document.documentElement.className = "";
		document.documentElement.classList.add(`theme-${newTheme}`);
		theme.value = newTheme;
	};

	const syncTheme = () => {
		const newTheme = me.value?.settings.appearance.global_theme;
		setTheme(newTheme);
	};

	const themeWatchInitialized = useState<boolean>(
		"themeWatchInitialized",
		() => false,
	);
	if (!themeWatchInitialized.value) {
		watch(
			me,
			(newMe) => {
				if (!newMe) {
					setTheme();
					return;
				}

				const newTheme =
					newMe?.settings.appearance.global_theme || "light";

				setTheme(newTheme);
			},
			{ immediate: true },
		);

		themeWatchInitialized.value = true;
	}

	return { theme, setTheme, syncTheme };
};
