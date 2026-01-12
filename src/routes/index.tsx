import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "../db";
import { StackList } from "../components/StackList";

export const Route = createFileRoute("/")({
	loader: async () => {
		const apps = await prisma.app.findMany({
			orderBy: { name: "asc" },
		});
		return { apps };
	},
	component: App,
});

function App() {
	const { apps } = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-cyan-500/30">
			<header className="mb-12 text-center">
				<h1 className="text-5xl font-bold bg-gradient-to-br from-white via-gray-400 to-gray-600 bg-clip-text text-transparent mb-4 tracking-tighter">
					My Mac Apps
				</h1>
				<p className="text-gray-400 text-lg">
					System Status: <span className="text-green-400">Online</span>
				</p>
			</header>

			<StackList apps={apps} />
		</div>
	);
}
