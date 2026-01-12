type AppRecord = {
	id: number;
	name: string;
	description: string;
	icon: string;
	url: string;
	kind: "GUI" | "CLI" | string;
	category: string;
	summary: string;
	details: string;
	command?: string | null;
};

const appsJsonUrl = "/apps.json";

const loadApps = async (): Promise<AppRecord[]> => {
	try {
		const response = await fetch(appsJsonUrl, {
			cache: "no-store",
		});
		if (!response.ok) {
			return [];
		}
		const parsed = (await response.json()) as unknown;
		return Array.isArray(parsed) ? (parsed as AppRecord[]) : [];
	} catch {
		return [];
	}
};

export const getAppsData = async () => {
	const apps = await loadApps();
	apps.sort((a, b) => a.name.localeCompare(b.name));

	const logoItems = apps
		.filter((app) => app.icon)
		.slice(0, 12)
		.map((app) => ({
			src: app.icon,
			alt: app.name,
			title: app.name,
		}));

	const menuItems = [
		{ label: "Overview", ariaLabel: "Overview", link: "#overview" },
		{
			label: `Library (${apps.length})`,
			ariaLabel: "Library",
			link: "#library",
		},
		{ label: "Config", ariaLabel: "Config", link: "/config" },
		{
			label: "Fresh Start",
			ariaLabel: "Fresh Start",
			link: "/fresh-start",
		},
	];

	return {
		apps,
		logoItems,
		menuItems,
	};
};
