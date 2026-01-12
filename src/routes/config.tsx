import { createFileRoute } from "@tanstack/react-router";

import AnimatedContent from "../components/AnimatedContent";
import Header from "../components/Header";
import LightRays from "../components/LightRays";
import Noise from "../components/Noise";
import SpotlightCard from "../components/SpotlightCard";

const navItems = [
	{ label: "Overview", ariaLabel: "Overview", link: "/#overview" },
	{ label: "Library", ariaLabel: "Library", link: "/#library" },
	{ label: "Config", ariaLabel: "Config", link: "/config" },
	{ label: "Fresh Start", ariaLabel: "Fresh Start", link: "/fresh-start" },
];

const configItems = [
	{
		name: ".zshrc",
		path: "~/.zshrc",
		description: "Aliases, PATH, prompt, and shell init.",
		preview: `export PATH="/opt/homebrew/bin:$PATH"
alias gs="git status"
eval "$(starship init zsh)"`,
	},
	{
		name: ".config",
		path: "~/.config",
		description: "Application configs and tool presets.",
		preview: `nvim/
starship.toml
wezterm/
zed/`,
	},
	{
		name: ".gitconfig",
		path: "~/.gitconfig",
		description: "Identity, signing, and default behaviors.",
		preview: `[user]
  name = Your Name
  email = you@example.com`,
	},
	{
		name: ".ssh/config",
		path: "~/.ssh/config",
		description: "Host aliases and identity files.",
		preview: `Host github.com
  User git
  IdentityFile ~/.ssh/id_ed25519`,
	},
];

export const Route = createFileRoute("/config")({
	component: ConfigPage,
});

function ConfigPage() {
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
							<p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
								Configuration
							</p>
							<h1 className="mt-3 font-display text-4xl text-white md:text-5xl">
								Config Vault
							</h1>
							<p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
								A tidy overview of the dotfiles and folders that shape your
								machine. Review the essentials, then refine your stack.
							</p>
						</div>
					</AnimatedContent>
				</section>

				<section className="space-y-6">
					<AnimatedContent distance={24} duration={0.7}>
						<div className="flex items-end justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.35em] text-white/50">
									Dotfiles
								</p>
								<h2 className="font-display text-2xl text-white md:text-3xl">
									Core config files
								</h2>
							</div>
						</div>
					</AnimatedContent>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{configItems.map((item) => (
							<SpotlightCard
								key={item.name}
								className="border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)]"
							>
								<div className="flex h-full flex-col gap-4 p-5">
									<div>
										<p className="text-[11px] uppercase tracking-[0.35em] text-emerald-200/70">
											{item.name}
										</p>
										<h3 className="mt-2 text-lg font-semibold text-white">
											{item.path}
										</h3>
										<p className="mt-2 text-sm text-white/60">
											{item.description}
										</p>
									</div>
									<pre className="rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-emerald-100/90">
										{item.preview}
									</pre>
								</div>
							</SpotlightCard>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
