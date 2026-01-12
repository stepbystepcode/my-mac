import { createServerFn } from "@tanstack/react-start";
import type { App } from "@prisma/client";
import { prisma } from "../db";

export type AppRecord = Omit<App, "installedAt"> & { installedAt: string };

export interface StatCard {
	label: string;
	value: number;
	helper: string;
}

export const getAppsData = createServerFn({ method: "GET" }).handler(
	async () => {
		const apps = await prisma.app.findMany({
			orderBy: { name: "asc" },
		});

		const installedCount = apps.filter((app) => app.status === "Installed")
			.length;
		const updateAvailableCount = apps.filter(
			(app) => app.status === "Update Available",
		).length;
		const updatedCount = apps.filter((app) => app.status === "Updated").length;

		const sortedByInstall = [...apps].sort(
			(a, b) => b.installedAt.getTime() - a.installedAt.getTime(),
		);
		const featuredApp = sortedByInstall[0] ?? null;
		const recentApps = sortedByInstall.slice(0, 3);

		const lastInstallAt = featuredApp?.installedAt;
		const daysSinceLastInstall = lastInstallAt
			? Math.max(
					0,
					Math.floor(
						(Date.now() - lastInstallAt.getTime()) / (1000 * 60 * 60 * 24),
					),
				)
			: 0;

		const toDto = (app: App): AppRecord => ({
			...app,
			installedAt: app.installedAt.toISOString(),
		});

		const appDtos = apps.map(toDto);
		const featuredDto = featuredApp ? toDto(featuredApp) : null;
		const recentDtos = recentApps.map(toDto);

		const stats: StatCard[] = [
			{
				label: "Apps synced",
				value: apps.length,
				helper: "Local catalog",
			},
			{
				label: "Installed",
				value: installedCount,
				helper: "Ready to launch",
			},
			{
				label: "Updates pending",
				value: updateAvailableCount,
				helper: "Need attention",
			},
			{
				label: "Days since last install",
				value: daysSinceLastInstall,
				helper: "Freshness check",
			},
		];

		const logoItems = appDtos
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
				label: `Insights (${apps.length})`,
				ariaLabel: "Insights",
				link: "#insights",
			},
			{ label: "Featured", ariaLabel: "Featured", link: "#featured" },
			{
				label: `Library (${apps.length})`,
				ariaLabel: "Library",
				link: "#library",
			},
		];

		const statusLabel =
			updateAvailableCount > 0 ? "Needs Attention" : "All Clear";
		const logoUrl = appDtos.find((app) => app.icon)?.icon || "/logo192.png";
		const updateApps = appDtos.filter(
			(app) => app.status === "Update Available",
		);

		return {
			apps: appDtos,
			stats,
			featuredApp: featuredDto,
			recentApps: recentDtos,
			logoItems,
			menuItems,
			statusLabel,
			updatesAvailable: updateAvailableCount,
			updateApps,
			installedCount,
			updatedCount,
			logoUrl,
		};
	},
);
