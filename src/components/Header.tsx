import { type StaggeredMenuItem } from "./StaggeredMenu";

interface HeaderProps {
	items: StaggeredMenuItem[];
	logoUrl: string;
	statusLabel: string;
	updatesAvailable: number;
}

export default function Header({
	items,
	logoUrl,
}: HeaderProps) {
	return (
		<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-full border border-white/10 bg-black/50 px-6 py-3 backdrop-blur-md shadow-lg shadow-black/20">
			<a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
				<img 
					src={logoUrl || "/logo192.png"} 
					alt="Logo" 
					className="h-6 w-auto object-contain"
				/>
				<span className="font-display font-medium text-white">React Bits</span>
			</a>
			
			<nav className="flex items-center gap-6">
				{items.map((item) => (
					<a
						key={item.label}
						href={item.link}
						className="text-sm font-medium text-white/70 transition-colors hover:text-white"
					>
						{item.label}
					</a>
				))}
			</nav>
		</div>
	);
}
