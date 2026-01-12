import { createFileRoute } from "@tanstack/react-router";

import BlurText from "../components/BlurText";
import CountUp from "../components/CountUp";
import DecryptedText from "../components/DecryptedText";
import AnimatedContent from "../components/AnimatedContent";
import Header from "../components/Header";

import LightRays from "../components/LightRays";
import Noise from "../components/Noise";
import { StackList } from "../components/StackList";

import TiltedCard from "../components/TiltedCard";
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
		stats,
		featuredApp,
		recentApps,

		menuItems,
		statusLabel,
		updatesAvailable,
		updateApps,
		installedCount,
		updatedCount,
		logoUrl,
	} = Route.useLoaderData();

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
				logoUrl={logoUrl}
				statusLabel={statusLabel}
				updatesAvailable={updatesAvailable}
			/>

			<main className="relative z-30 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-28">
				<section id="overview" className="flex flex-col items-center justify-center py-20 text-center">
					<AnimatedContent distance={40} duration={0.8} className="flex flex-col items-center">
						<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
							<DecryptedText
								text={`Synced from local database · ${apps.length} apps · ${updatesAvailable} updates`}
								animateOn="view"
								revealDirection="center"
								sequential
								speed={100}
								maxIterations={20}
								className="text-emerald-200 fontsize-xs font-semibold"
								encryptedClassName="text-white/20"
								parentClassName="text-[10px] uppercase tracking-[0.2em] text-white/60"
							/>
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
							Track installations, versions, and updates in a single live
							catalog pulled straight from your Prisma database.
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

						{recentApps.length > 0 && (
							<div className="mt-16 flex flex-col items-center gap-4">
								<span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Just Arrived</span>
								<div className="flex flex-wrap justify-center gap-3">
									{recentApps.map((app) => (
										<div
											key={app.id}
											className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-sm transition-colors hover:bg-white/10"
										>
											{app.icon && <img src={app.icon} alt="" className="h-4 w-4 object-contain opacity-70" />}
											<span className="text-xs text-white/60">{app.name}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</AnimatedContent>
				</section>

				<section id="insights" className="space-y-6">
					<AnimatedContent distance={30} duration={0.7}>
						<div className="flex flex-col gap-2">
							<p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
								Insights
							</p>
							<h2 className="font-display text-3xl text-white md:text-4xl">
								At-a-glance health
							</h2>
						</div>
					</AnimatedContent>
					<div className="grid gap-6 md:grid-cols-2">
						<div className="grid gap-6 sm:grid-cols-2">
							{stats.map((stat) => (
								<AnimatedContent
									key={stat.label}
									distance={20}
									duration={0.5}
								>
									<div className="rounded-[22px] border border-white/10 bg-white/5 p-6 backdrop-blur">
										<p className="text-xs uppercase tracking-[0.3em] text-white/50">
											{stat.label}
										</p>
										<div className="mt-4 flex items-end gap-2">
											<CountUp
												to={stat.value}
												className="font-display text-3xl text-white"
											/>
											<span className="text-sm text-white/40">
												{stat.helper}
											</span>
										</div>
									</div>
								</AnimatedContent>
							))}
						</div>

						<AnimatedContent distance={20} duration={0.6}>
							<div className="rounded-[22px] border border-white/10 bg-white/5 p-6 backdrop-blur">
								<p className="text-xs uppercase tracking-[0.3em] text-white/50">
									Update queue
								</p>
								<div className="mt-6 flex items-center justify-between">
									<div>
										<p className="font-display text-3xl text-white">
											{updatesAvailable}
										</p>
										<p className="text-sm text-white/50">
											Installed: {installedCount} · Updated: {updatedCount}
										</p>
									</div>
									<div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
										{statusLabel}
									</div>
								</div>
								<div className="mt-6 space-y-2">
									{updateApps.length === 0 ? (
										<p className="text-sm text-white/50">
											Everything is current. No pending updates.
										</p>
									) : (
										updateApps.slice(0, 4).map((app) => (
											<div
												key={app.id}
												className="flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white/70"
											>
												<span>{app.name}</span>
												<span className="text-amber-200">
													{app.version}
												</span>
											</div>
										))
									)}
								</div>
							</div>
						</AnimatedContent>
					</div>
				</section>

				<section id="featured" className="space-y-8">
					<AnimatedContent distance={30} duration={0.7}>
						<div className="flex flex-col gap-2">
							<p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
								Featured
							</p>
							<h2 className="font-display text-3xl text-white md:text-4xl">
								Most recent install
							</h2>
						</div>
					</AnimatedContent>

					{featuredApp ? (
						<AnimatedContent distance={20} duration={0.7}>
							<div className="grid items-center gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
								<TiltedCard
									imageSrc={featuredApp.icon || "/logo192.png"}
									altText={featuredApp.name}
									captionText={featuredApp.name}
									containerHeight="360px"
									imageHeight="320px"
									imageWidth="320px"
									scaleOnHover={1.05}
									showMobileWarning={false}
									showTooltip={false}
									displayOverlayContent
									overlayContent={
										<div className="h-full w-full rounded-[18px] bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5">
											<p className="text-xs uppercase tracking-[0.3em] text-white/60">
												Latest install
											</p>
											<h3 className="mt-2 font-display text-2xl text-white">
												{featuredApp.name}
											</h3>
										</div>
									}
								/>
								<div className="space-y-6">
									<p className="text-lg text-white/70">
										{featuredApp.description}
									</p>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
											<p className="text-xs uppercase tracking-[0.3em] text-white/50">
												Version
											</p>
											<p className="mt-2 font-display text-2xl text-white">
												v{featuredApp.version}
											</p>
										</div>
										<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
											<p className="text-xs uppercase tracking-[0.3em] text-white/50">
												Package size
											</p>
											<p className="mt-2 font-display text-2xl text-white">
												{featuredApp.size}
											</p>
										</div>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
										Status: {featuredApp.status}
									</div>
								</div>
							</div>
						</AnimatedContent>
					) : (
						<p className="text-white/60">No apps available yet.</p>
					)}
				</section>

				<section id="library" className="space-y-8">
					<AnimatedContent distance={30} duration={0.7}>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
									Library
								</p>
								<h2 className="font-display text-3xl text-white md:text-4xl">
									All synced apps
								</h2>
							</div>
						</div>
					</AnimatedContent>
					<StackList apps={apps} />
				</section>
			</main>
		</div>
	);
}
