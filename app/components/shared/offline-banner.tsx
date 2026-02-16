import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
	const [isOffline, setIsOffline] = useState(false);

	useEffect(() => {
		function handleOnline() {
			setIsOffline(false);
		}
		function handleOffline() {
			setIsOffline(true);
		}

		setIsOffline(!navigator.onLine);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	if (!isOffline) return null;

	return (
		<div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
			<WifiOff className="h-4 w-4" />
			You're offline — some features may be unavailable
		</div>
	);
}
