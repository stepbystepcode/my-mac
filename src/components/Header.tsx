import { Link } from "@tanstack/react-router";
import { type StaggeredMenuItem } from "./StaggeredMenu";

interface HeaderProps {
	items: StaggeredMenuItem[];
	logoUrl: string;
}

export default function Header({
	items,
	logoUrl,
}: HeaderProps) {
	return (
		<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-full border border-white/10 bg-black/20 px-6 py-3 backdrop-blur-md shadow-lg shadow-black/10">
			<Link
				to="/"
				className="flex items-center gap-2 transition-opacity hover:opacity-80"
			>
				<img
					src={logoUrl || "/mac.svg"}
					alt="Logo"
					className="h-6 w-auto object-contain brightness-0 invert"
				/>
				<span className="font-display font-medium text-white">Awesome Mac</span>
			</Link>
			
			<nav className="flex items-center gap-6">
				{items.map((item) => {
					const link = item.link;
					const isExternal =
						link.startsWith("http") ||
						link.startsWith("mailto:") ||
						link.startsWith("tel:");
					const isHashOnly = link.startsWith("#");
					const isRootHash = link.startsWith("/#");

					if (isExternal) {
						return (
							<a
								key={item.label}
								href={link}
								className="text-sm font-medium text-white/70 transition-colors hover:text-white"
							>
								{item.label}
							</a>
						);
					}

					if (isHashOnly) {
						return (
							<Link
								key={item.label}
								to="."
								hash={link.slice(1)}
								className="text-sm font-medium text-white/70 transition-colors hover:text-white"
							>
								{item.label}
							</Link>
						);
					}

					if (isRootHash) {
						return (
							<Link
								key={item.label}
								to="/"
								hash={link.slice(2)}
								className="text-sm font-medium text-white/70 transition-colors hover:text-white"
							>
								{item.label}
							</Link>
						);
					}

					return (
						<Link
							key={item.label}
							to={link}
							className="text-sm font-medium text-white/70 transition-colors hover:text-white"
						>
							{item.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
