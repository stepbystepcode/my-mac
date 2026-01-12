import { createFileRoute } from "@tanstack/react-router";
import MarkdownIt from "markdown-it";
import { useEffect, useMemo, useState } from "react";

import AnimatedContent from "../components/AnimatedContent";
import Header from "../components/Header";
import LightRays from "../components/LightRays";
import Noise from "../components/Noise";

const navItems = [
	{ label: "Overview", ariaLabel: "Overview", link: "/#overview" },
	{ label: "Library", ariaLabel: "Library", link: "/#library" },
	{ label: "Config", ariaLabel: "Config", link: "/config" },
	{ label: "Fresh Start", ariaLabel: "Fresh Start", link: "/fresh-start" },
];

const markdownUrl = "/fresh-start.md";

export const Route = createFileRoute("/fresh-start")({
	component: FreshStartPage,
});

function FreshStartPage() {
	const markdown = useMemo(
		() =>
			new MarkdownIt({
				html: false,
				linkify: true,
				typographer: true,
			}),
		[],
	);
	const [markdownHtml, setMarkdownHtml] = useState<string>("");
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const loadMarkdown = async () => {
			try {
				const response = await fetch(markdownUrl, {
					signal: controller.signal,
				});
				if (!response.ok) {
					throw new Error("Failed to load markdown.");
				}
				const text = await response.text();
				setMarkdownHtml(markdown.render(text));
				setLoadError(null);
			} catch (error) {
				if ((error as Error).name === "AbortError") return;
				setLoadError("Unable to load the onboarding guide right now.");
			}
		};

		loadMarkdown();

		return () => controller.abort();
	}, [markdown]);

	return (
		<div className="relative isolate min-h-screen overflow-hidden bg-[#040607] text-white selection:bg-emerald-300/30">
			<LightRays
				lightSpread={0.3}
				className="fixed inset-0 -z-10"
			/>
			<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/0 via-black/15 to-black/45" />
			<Noise patternAlpha={12} patternRefreshInterval={3} />

			<Header items={navItems} logoUrl="/mac.svg" />

			<main className="relative z-30 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-28">
				<section className="flex flex-col gap-6">
					<AnimatedContent distance={30} duration={0.8}>
						<div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
							{loadError ? (
								<p className="text-sm text-white/60">{loadError}</p>
							) : markdownHtml ? (
								<div
									className="markdown-body text-white/70"
									dangerouslySetInnerHTML={{ __html: markdownHtml }}
								/>
							) : (
								<p className="text-sm text-white/60">Loading guide...</p>
							)}
						</div>
					</AnimatedContent>
				</section>
			</main>
		</div>
	);
}
