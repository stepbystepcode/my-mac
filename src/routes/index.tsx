import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import BlurText from "../components/BlurText";
import AnimatedContent from "../components/AnimatedContent";
import Header from "../components/Header";

import LightRays from "../components/LightRays";
import Noise from "../components/Noise";
import { StackList } from "../components/StackList";

import { getAppsData } from "../data/apps";

export const Route = createFileRoute("/")({
	loader: async () => {
		return getAppsData();
	},
	component: App,
});

function App() {
	const {
		apps,
		menuItems,
	} = Route.useLoaderData();
	const [activeTab, setActiveTab] = useState<"desktop" | "cli">("desktop");

	const normalizedApps = useMemo(() => {
		return apps.map((app) => {
			const rawKind =
				typeof app.kind === "string" ? app.kind.toUpperCase() : "";
			if (rawKind === "CLI" || rawKind === "GUI") {
				return { ...app, kind: rawKind };
			}

			const inferredCli =
				Boolean(app.command) ||
				(typeof app.category === "string" &&
					app.category.toLowerCase() === "homebrew") ||
				(typeof app.url === "string" && app.url.startsWith("http"));

			return { ...app, kind: inferredCli ? "CLI" : "GUI" };
		});
	}, [apps]);

	const desktopApps = useMemo(
		() => normalizedApps.filter((app) => app.kind !== "CLI"),
		[normalizedApps],
	);
	const cliApps = useMemo(
		() => normalizedApps.filter((app) => app.kind === "CLI"),
		[normalizedApps],
	);
	const visibleApps = activeTab === "cli" ? cliApps : desktopApps;

	useEffect(() => {
		if (activeTab === "desktop" && desktopApps.length === 0 && cliApps.length > 0) {
			setActiveTab("cli");
		}
	}, [activeTab, cliApps.length, desktopApps.length]);

	return (
		<div className="relative isolate min-h-screen overflow-hidden bg-[#040607] text-white selection:bg-emerald-300/30">
			<LightRays
				lightSpread={0.3}
				className="fixed inset-0 -z-10"
			/>
			<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/0 via-black/15 to-black/45" />
			<Noise patternAlpha={12} patternRefreshInterval={3} />

			<Header
				items={menuItems}
				logoUrl="/mac.svg"
			/>

			<main className="relative z-30 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-28">
				<section id="overview" className="flex flex-col items-center justify-center py-20 text-center">
					<AnimatedContent distance={40} duration={0.8} className="flex flex-col items-center">
						<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
							<motion.span
								className="text-[10px] uppercase tracking-[0.2em] text-white/60"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.6, ease: "easeOut" }}
							>
								<span className="text-emerald-200 font-semibold">
									Synced from local database
								</span>
								<span> · {apps.length} apps</span>
							</motion.span>
						</div>

						<div className="relative z-10">
							<div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />
							<div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-500/10 blur-[120px]" />
							
							<BlurText
								text="My Mac Apps"
								animateBy="letters"
								direction="bottom"
								delay={200}
								className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl"
							/>
						</div>

						<p className="mt-8 max-w-2xl text-lg text-white/60 md:text-xl leading-relaxed">
							Track your applications in a single live catalog pulled straight from your Prisma database.
						</p>

						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<button
								type="button"
								className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
							>
								Get Started
							</button>
							
							<button
								type="button"
								className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
							>
								Learn More
							</button>
						</div>
					</AnimatedContent>
				</section>

				<section id="library" className="relative space-y-8">
					<div className="pointer-events-none absolute -left-10 top-8 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />
					<div className="pointer-events-none absolute -right-10 top-28 h-64 w-64 rounded-full bg-sky-500/10 blur-[140px]" />
					<AnimatedContent distance={30} duration={0.7}>
						<div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
							<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
								<div>
									<p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
										Library
									</p>
									<h2 className="font-display text-3xl text-white md:text-4xl">
										{activeTab === "cli"
											? "Command line stack"
											: "Desktop apps"}
									</h2>
									<p className="mt-2 text-sm text-white/50">
										{activeTab === "cli"
											? "Curated CLI tools with quick install commands."
											: "Local macOS applications indexed from your machine."}
									</p>
								</div>

								<div className="relative flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1">
									{[
										{
											id: "desktop",
											label: "Desktop",
											count: desktopApps.length,
										},
										{
											id: "cli",
											label: "Command Line",
											count: cliApps.length,
										},
									].map((tab) => (
										<button
											key={tab.id}
											type="button"
											onClick={() =>
												setActiveTab(tab.id as "desktop" | "cli")
											}
											className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
												activeTab === tab.id
													? "text-white"
													: "text-white/50 hover:text-white"
											}`}
										>
											{activeTab === tab.id ? (
												<motion.span
													layoutId="library-tab-indicator"
													className="absolute inset-0 rounded-full bg-white/10 shadow-[0_18px_40px_-30px_rgba(255,255,255,0.8)]"
													transition={{
														type: "spring",
														stiffness: 260,
														damping: 22,
													}}
												/>
											) : null}
											<span className="relative z-10">{tab.label}</span>
											<span
												className={`relative z-10 rounded-full px-2 py-0.5 text-[10px] transition-colors ${
													activeTab === tab.id
														? "bg-white/20 text-white/80"
														: "bg-white/10 text-white/50 group-hover:text-white/70"
												}`}
											>
												{tab.count}
											</span>
										</button>
									))}
								</div>
							</div>

							<div className="mt-6">
								<StackList apps={visibleApps} />
							</div>
						</div>
					</AnimatedContent>
				</section>
			</main>
		</div>
	);
}
