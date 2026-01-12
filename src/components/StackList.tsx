import { Zap } from "lucide-react";
import AnimatedContent from "./AnimatedContent";
import SpotlightCard from "./SpotlightCard";

export interface AppCard {
	id: number;
	name: string;
	description: string;
	icon: string;
}

export function StackList({ apps }: { apps: AppCard[] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{apps.map((app) => {
				return (
					<AnimatedContent
						key={app.id}
						distance={30}
						duration={0.6}
						className="app-card"
					>
						<SpotlightCard>
							<article className="flex h-44 w-full flex-col gap-4 p-5">
								<div className="flex items-start gap-3">
									<div className="relative h-12 w-12 shrink-0">
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
										</div>
										<p className="text-sm text-white/60 mt-0.5 line-clamp-2">
											{app.description}
										</p>
									</div>
								</div>
							</article>
						</SpotlightCard>
					</AnimatedContent>
				);
			})}
		</div>
	);
}
