import { CheckCircle2, Download, RefreshCw, Zap } from "lucide-react";
import AnimatedContent from "./AnimatedContent";
import SpotlightCard from "./SpotlightCard";

export interface AppCard {
	id: number;
	name: string;
	description: string;
	icon: string;
	version: string;
	size: string;
	status: string;
}

export function StackList({ apps }: { apps: AppCard[] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{apps.map((app) => {
				const isUpdateAvailable = app.status === "Update Available";
				const actionLabel = isUpdateAvailable ? "Update" : "Open";
				const ActionIcon = isUpdateAvailable ? RefreshCw : Download;
				const actionClasses = isUpdateAvailable
					? "border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
					: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20";

				return (
					<AnimatedContent
						key={app.id}
						distance={30}
						duration={0.6}
						className="app-card"
					>
						<SpotlightCard
						>
							<article className="flex h-full w-full flex-col justify-between gap-6 p-6">
								<div className="flex items-start gap-4">
									<div className="relative h-14 w-14 shrink-0">
										<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
										<div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
											{app.icon ? (
												<img
													src={app.icon}
													alt={app.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<Zap className="h-7 w-7 text-white/60" />
											)}
										</div>
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between gap-3">
											<h3 className="text-xl font-semibold text-white tracking-tight group-hover:text-emerald-200 transition-colors font-display">
												{app.name}
											</h3>
											<StatusBadge status={app.status} />
										</div>
										<p className="text-sm text-white/60 mt-1 line-clamp-2">
											{app.description}
										</p>
									</div>
								</div>

								<div className="flex items-center justify-between gap-4 text-xs text-white/60">
									<div className="flex items-center gap-3">
										<span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-white/70">
											v{app.version}
										</span>
										<span className="text-[11px] uppercase tracking-[0.2em]">
											{app.size}
										</span>
									</div>
									<button
										type="button"
										className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 ${actionClasses}`}
									>
										<ActionIcon className="h-3.5 w-3.5" />
										{actionLabel}
									</button>
								</div>
							</article>
						</SpotlightCard>
					</AnimatedContent>
				);
			})}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	if (status === "Installed") {
		return (
			<span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
				<CheckCircle2 className="h-3 w-3" />
				Installed
			</span>
		);
	}
	if (status === "Update Available" || status === "Updated") {
		return (
			<span className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
				<RefreshCw className="h-3 w-3" />
				{status === "Updated" ? "Updated" : "Update"}
			</span>
		);
	}
	return null;
}
