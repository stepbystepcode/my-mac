import { gsap } from "gsap";
import { CheckCircle2, Download, RefreshCw, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import type { App } from "@prisma/client";
import { SpotlightCard } from "./SpotlightCard";

export function StackList({ apps }: { apps: App[] }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.from(".app-card", {
				y: 50,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: "power3.out",
			});
		}, containerRef);
		return () => ctx.revert();
	}, []);

	return (
		<div
			ref={containerRef}
			className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pb-20"
		>
			{apps.map((app) => (
				<SpotlightCard
					key={app.id}
					className="app-card group p-6 backdrop-blur-xl hover:scale-[1.02] transition-transform duration-300"
				>
					<div className="flex items-center gap-5">
						<div className="relative w-16 h-16 shrink-0">
							<div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-inner border border-white/5" />
							<div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
								{app.icon ? (
									<img
										src={app.icon}
										alt={app.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<Zap className="w-8 h-8 text-gray-400" />
								)}
							</div>
						</div>

						<div className="flex-1 min-w-0 flex flex-col justify-center h-full">
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
									{app.name}
								</h3>
								<div className="flex items-center gap-2">
									<StatusBadge status={app.status} />
								</div>
							</div>

							<p className="text-sm text-gray-400 truncate mt-1 font-medium">
								{app.description}
							</p>

							<div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-mono">
								<span className="bg-white/5 px-2 py-0.5 rounded text-gray-300">
									v{app.version}
								</span>
								<span>{app.size}</span>
							</div>
						</div>

						<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-4 bottom-4 md:static md:opacity-100">
							<button
								type="button"
								className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
							>
								<Download className="w-4 h-4" />
							</button>
						</div>
					</div>
				</SpotlightCard>
			))}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	if (status === "Installed") {
		return (
			<span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
				<CheckCircle2 className="w-3 h-3" />
				Installed
			</span>
		);
	}
	if (status === "Update Available" || status === "Updated") {
		return (
			<span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
				<RefreshCw className="w-3 h-3" />
				Update
			</span>
		);
	}
	return null;
}
