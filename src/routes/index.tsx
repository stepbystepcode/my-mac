import { createFileRoute } from "@tanstack/react-router";

import BlurText from "../components/BlurText";
import DecryptedText from "../components/DecryptedText";
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
			/>

			<main className="relative z-30 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-28">
				<section id="overview" className="flex flex-col items-center justify-center py-20 text-center">
					<AnimatedContent distance={40} duration={0.8} className="flex flex-col items-center">
						<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
							<DecryptedText
								text={`Synced from local database · ${apps.length} apps`}
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
