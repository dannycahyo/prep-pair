const CACHE_VERSION = "v1";
const SHELL_CACHE = `preppair-shell-${CACHE_VERSION}`;
const DATA_CACHE = `preppair-data-${CACHE_VERSION}`;
const IMAGE_CACHE = `preppair-images-${CACHE_VERSION}`;

const SHELL_URLS = ["/planner", "/recipes", "/grocery", "/budget", "/settings"];

// Install: pre-cache shell
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)),
	);
	self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter(
							(key) =>
								key !== SHELL_CACHE &&
								key !== DATA_CACHE &&
								key !== IMAGE_CACHE,
						)
						.map((key) => caches.delete(key)),
				),
			),
	);
	self.clients.claim();
});

// Fetch: apply caching strategies
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Only handle GET requests
	if (request.method !== "GET") return;

	// Skip non-http(s) requests
	if (!url.protocol.startsWith("http")) return;

	// Images: cache-first with 30-day TTL
	if (
		request.destination === "image" ||
		/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)
	) {
		event.respondWith(cacheFirst(request, IMAGE_CACHE));
		return;
	}

	// Grocery routes: network-first (needs latest state)
	if (url.pathname.startsWith("/grocery")) {
		event.respondWith(networkFirst(request, DATA_CACHE));
		return;
	}

	// API data routes (recipes, planner, budget): stale-while-revalidate
	if (
		url.pathname.startsWith("/recipes") ||
		url.pathname.startsWith("/planner") ||
		url.pathname.startsWith("/budget")
	) {
		// For document requests (HTML navigation), use stale-while-revalidate
		if (request.headers.get("Accept")?.includes("text/html")) {
			event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
			return;
		}
	}

	// App shell (JS, CSS, fonts): cache-first
	if (
		request.destination === "script" ||
		request.destination === "style" ||
		request.destination === "font" ||
		url.pathname.startsWith("/assets/")
	) {
		event.respondWith(cacheFirst(request, SHELL_CACHE));
		return;
	}

	// Default: stale-while-revalidate for navigation, network-first for others
	if (request.mode === "navigate") {
		event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
		return;
	}

	event.respondWith(networkFirst(request, DATA_CACHE));
});

// --- Caching strategies ---

async function cacheFirst(request, cacheName) {
	const cached = await caches.match(request);
	if (cached) return cached;

	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(cacheName);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		return new Response("Offline", { status: 503 });
	}
}

async function networkFirst(request, cacheName) {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(cacheName);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;
		return new Response("Offline", { status: 503 });
	}
}

async function staleWhileRevalidate(request, cacheName) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);

	const fetchPromise = fetch(request)
		.then((response) => {
			if (response.ok) {
				cache.put(request, response.clone());
			}
			return response;
		})
		.catch(() => cached);

	return cached || fetchPromise;
}
