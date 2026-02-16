import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		function handleBeforeInstallPrompt(e: Event) {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		}

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	if (!deferredPrompt || dismissed) return null;

	async function handleInstall() {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
	}

	return (
		<div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 rounded-lg border border-border bg-card p-4 shadow-lg">
			<div className="flex items-start gap-3">
				<Download className="h-5 w-5 text-primary mt-0.5 shrink-0" />
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium">Install PrepPair</p>
					<p className="text-xs text-muted-foreground mt-1">
						Add to your home screen for quick access and offline use.
					</p>
					<div className="flex gap-2 mt-3">
						<Button size="sm" onClick={handleInstall}>
							Install
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setDismissed(true)}
						>
							Not now
						</Button>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setDismissed(true)}
					className="text-muted-foreground hover:text-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
