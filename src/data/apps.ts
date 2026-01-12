import { promises as fs } from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";

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

const appsJsonPath = path.join(process.cwd(), "public", "apps.json");

const loadApps = async (): Promise<AppRecord[]> => {
	try {
		const raw = await fs.readFile(appsJsonPath, "utf8");
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed as AppRecord[];
	} catch {
		return [];
	}
};

export const getAppsData = createServerFn({ method: "GET" }).handler(
	async () => {
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
	},
);
