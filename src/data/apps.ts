import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../db";

export const getAppsData = createServerFn({ method: "GET" }).handler(
	async () => {
		const apps = await prisma.app.findMany({
			orderBy: { name: "asc" },
		});

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
		];

		const logoUrl = apps.find((app) => app.icon)?.icon || "/logo192.png";

		return {
			apps,
			logoItems,
			menuItems,
			logoUrl,
		};
	},
);
