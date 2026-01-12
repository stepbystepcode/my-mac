import { ArrowUpRight, Link2, Terminal, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AnimatedContent from "./AnimatedContent";
import SpotlightCard from "./SpotlightCard";

export interface AppCard {
	id: number;
	name: string;
	description: string;
	icon: string;
	url: string;
	kind: "GUI" | "CLI";
	category: string;
	summary: string;
	details: string;
	command?: string | null;
}

export function StackList({ apps }: { apps: AppCard[] }) {
	const [activeApp, setActiveApp] = useState<AppCard | null>(null);
	const canUseDOM = typeof document !== "undefined";

	useEffect(() => {
		if (!activeApp) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setActiveApp(null);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = originalOverflow;
		};
	}, [activeApp]);

	const modalCopy = useMemo(() => {
		if (!activeApp) return null;
		const summary = activeApp.summary || activeApp.description;
		const details = activeApp.details || activeApp.description;
		const isWebLink = activeApp.url.startsWith("http");

		return { summary, details, isWebLink };
	}, [activeApp]);

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{apps.map((app) => {
					const isCli = app.kind === "CLI";
					return (
						<AnimatedContent
							key={app.id}
							distance={30}
							duration={0.6}
							className="app-card"
						>
							<SpotlightCard
								role="button"
								tabIndex={0}
								aria-label={`View details for ${app.name}`}
								onClick={() => setActiveApp(app)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										setActiveApp(app);
									}
								}}
								className="group cursor-pointer border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)] transition-all duration-300 hover:border-emerald-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
							>
								<article className="flex h-44 w-full flex-col justify-between gap-4 p-5">
									<div className="flex items-start gap-3">
										<div className="relative h-12 w-12 shrink-0">
											<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
											<div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
												{app.icon ? (
													<img
														src={app.icon}
														alt={app.name}
														className="h-full w-full object-cover"
													/>
												) : isCli ? (
													<Terminal className="h-6 w-6 text-sky-200/80" />
												) : (
													<Zap className="h-7 w-7 text-white/60" />
												)}
											</div>
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between gap-3">
												<h3 className="text-xl font-semibold text-white tracking-tight transition-colors font-display group-hover:text-emerald-200">
													{app.name}
												</h3>
											</div>
											<p className="text-sm text-white/60 mt-0.5 line-clamp-2">
												{app.description}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/50">
											<span
												className={`rounded-full border px-2 py-1 ${
													isCli
														? "border-sky-400/30 text-sky-200/80"
														: "border-emerald-400/30 text-emerald-200/80"
												}`}
											>
												{isCli ? "CLI" : "Desktop"}
											</span>
											<span className="rounded-full border border-white/10 px-2 py-1 text-white/50">
												{app.category}
											</span>
										</div>
										<div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-white/40 transition-colors group-hover:text-white/70">
											<span>Details</span>
											<ArrowUpRight className="h-3 w-3" />
										</div>
									</div>
								</article>
							</SpotlightCard>
						</AnimatedContent>
					);
				})}
			</div>

			{canUseDOM
				? createPortal(
						<AnimatePresence>
							{activeApp && modalCopy ? (
								<motion.div
									className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									<button
										type="button"
										aria-label="Close app details"
										className="absolute inset-0 bg-black/70 backdrop-blur-md"
										onClick={() => setActiveApp(null)}
									/>
									<motion.div
										role="dialog"
										aria-modal="true"
										aria-labelledby="app-details-title"
										className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-black/40 to-black/90 p-6 shadow-2xl"
										initial={{ y: 24, opacity: 0, scale: 0.97 }}
										animate={{ y: 0, opacity: 1, scale: 1 }}
										exit={{ y: 20, opacity: 0, scale: 0.98 }}
										transition={{ type: "spring", stiffness: 220, damping: 24 }}
										onClick={(event) => event.stopPropagation()}
									>
										<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-70" />

										<div className="flex items-start gap-4">
											<div className="relative h-16 w-16 shrink-0">
												<div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
												<div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl">
													{activeApp.icon ? (
														<img
															src={activeApp.icon}
															alt={activeApp.name}
															className="h-full w-full object-cover"
														/>
													) : activeApp.kind === "CLI" ? (
														<Terminal className="h-7 w-7 text-sky-200/80" />
													) : (
														<Zap className="h-8 w-8 text-white/70" />
													)}
												</div>
											</div>

											<div className="flex-1">
												<p className="text-[11px] uppercase tracking-[0.35em] text-emerald-200/70">
													{activeApp.kind === "CLI"
														? "Command Line"
														: "Desktop App"}{" "}
													/ {activeApp.category}
												</p>
												<h3
													id="app-details-title"
													className="mt-2 font-display text-3xl text-white"
												>
													{activeApp.name}
												</h3>
												<p className="mt-2 text-sm text-white/60">
													{modalCopy.summary}
												</p>
											</div>

											<button
												type="button"
												aria-label="Close"
												className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:text-white"
												onClick={() => setActiveApp(null)}
											>
												<X className="h-4 w-4" />
											</button>
										</div>

										<div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
											<div className="space-y-3">
												<p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
													Overview
												</p>
												<p className="text-sm leading-relaxed text-white/70">
													{modalCopy.details}
												</p>
											</div>

											<div className="space-y-4">
												<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
													<p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
														Location
													</p>
													{modalCopy.isWebLink ? (
														<a
															href={activeApp.url}
															target="_blank"
															rel="noreferrer"
															className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-200/90 hover:text-emerald-100"
														>
															<Link2 className="h-4 w-4" />
															Open link
														</a>
													) : (
														<p className="mt-2 text-xs text-white/60 break-all">
															{activeApp.url.replace("file://", "")}
														</p>
													)}
												</div>

												{activeApp.command ? (
													<div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
														<p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
															Install Command
														</p>
														<code className="mt-2 block rounded-xl bg-black/60 px-3 py-2 text-xs text-emerald-100 font-mono">
															{activeApp.command}
														</code>
													</div>
												) : null}
											</div>
										</div>
									</motion.div>
								</motion.div>
							) : null}
						</AnimatePresence>,
						document.body,
					)
				: null}
		</>
	);
}
