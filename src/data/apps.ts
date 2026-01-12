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
