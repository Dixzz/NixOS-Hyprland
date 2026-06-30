//#region ../../apis/accessibility.ts
/**
* Public.
*/
var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var prefersReducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
//#endregion
//#region ../../apis/debug.ts
/**
* Public.
*/
function isDebugEnabled() {
	const debug = document.body?.dataset?.debug;
	return debug === "" || debug === "true";
}
//#endregion
//#region ../../apis/log.ts
/**
* Private.
*/
var debugEnabled = null;
/**
* Public.
*/
function debugLog(...args) {
	if (debugEnabled === null) debugEnabled = isDebugEnabled();
	if (debugEnabled) console.debug(...args);
}
//#endregion
//#region ../../apis/data-attr.ts
function parseNumberDataAttr(dataAttr, fallback = null) {
	if (dataAttr === void 0 || dataAttr.trim() === "") return fallback;
	const parsed = Number(dataAttr);
	if (!Number.isFinite(parsed)) {
		debugLog(`Invalid number attribute value "${dataAttr}", using fallback ${String(fallback)}.`);
		return fallback;
	}
	return parsed;
}
//#endregion
//#region ../../apis/event-binder.ts
/**
* Private.
*/
function bindClickToSelectors(selectors, onElement) {
	[selectors].flat().forEach((selector) => {
		const elements = document.querySelectorAll(selector);
		if (elements.length === 0) {
			console.warn(`No elements found for selector ${selector}.`);
			return;
		}
		elements.forEach(onElement);
	});
}
/**
* Public.
*/
function bindClickHandler(selectors, onClick) {
	bindClickToSelectors(selectors, (element) => element.addEventListener("click", onClick));
}
//#endregion
//#region ../../apis/os.ts
/**
* Public.
*/
var OperatingSystemType = /* @__PURE__ */ function(OperatingSystemType) {
	OperatingSystemType["Android"] = "Android";
	OperatingSystemType["iOS"] = "iOS";
	OperatingSystemType["Windows"] = "Windows";
	OperatingSystemType["Mac"] = "Mac";
	OperatingSystemType["Linux"] = "Linux";
	OperatingSystemType["Unknown"] = "Unknown";
	return OperatingSystemType;
}({});
var operatingSystemType = (() => {
	const userAgentData = navigator.userAgentData;
	if (userAgentData?.platform) switch (userAgentData.platform) {
		case "Android": return "Android";
		case "iOS": return "iOS";
		case "Windows": return "Windows";
		case "macOS": return "Mac";
		case "Linux": return "Linux";
		default: return "Unknown";
	}
	const userAgent = navigator.userAgent;
	if (/android/i.test(userAgent)) return "Android";
	if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS";
	if (/Win/.test(userAgent)) return "Windows";
	if (/Mac/.test(userAgent)) return "Mac";
	if (/Linux/.test(userAgent)) return "Linux";
	return "Unknown";
})();
//#endregion
//#region ../../apis/bridge.ts
/**
* Private.
*/
var RICH_MEDIA_EVENT = "richMediaEvent";
function trustedOrigin() {
	return operatingSystemType === OperatingSystemType.Android ? "chrome://new-tab-takeover" : "chrome://newtab";
}
/**
* Public.
*/
function isTrustedOrigin(origin) {
	return origin === trustedOrigin();
}
function postMessage(payload) {
	window.parent.postMessage(payload, trustedOrigin());
}
function postRichMediaEvent(eventType) {
	postMessage({
		type: RICH_MEDIA_EVENT,
		value: eventType
	});
}
//#endregion
//#region ../../apis/event-dispatcher.ts
/**
* Private.
*/
var dispatchedEvents = /* @__PURE__ */ new Set();
/**
* Public.
*/
var richMediaEventTypes = {
	CLICK: "click",
	INTERACTION: "interaction",
	MEDIA_PLAY: "mediaPlay",
	MEDIA_25: "media25",
	MEDIA_100: "media100"
};
function dispatchRichMediaEvent(eventType) {
	if (dispatchedEvents.has(eventType)) {
		debugLog(`${eventType} event already dispatched, skipping.`);
		return;
	}
	dispatchedEvents.add(eventType);
	debugLog(`Dispatching ${eventType} event.`);
	postRichMediaEvent(eventType);
}
function bindAndDispatchClickEvent(selectors) {
	bindClickToSelectors(selectors, (element) => element.addEventListener("click", () => dispatchRichMediaEvent(richMediaEventTypes.CLICK)));
}
//#endregion
//#region ../../apis/gpu.ts
function isNavigatorWithGPU(navigator) {
	return "gpu" in navigator;
}
function isSoftwareRenderer(rendererName) {
	return /swiftshader|llvmpipe|softpipe|software/i.test(rendererName);
}
async function hasWebGPUAcceleration() {
	if (!isNavigatorWithGPU(navigator)) return false;
	try {
		const gpuAdapter = await navigator.gpu.requestAdapter();
		if (!gpuAdapter) return false;
		return !isSoftwareRenderer(gpuAdapter.name);
	} catch {
		return false;
	}
}
function hasWebGLAcceleration() {
	for (const type of ["webgl2", "webgl"]) {
		const canvasElement = document.createElement("canvas");
		const webGLContext = canvasElement.getContext(type);
		if (!webGLContext) continue;
		const debugRendererInfo = webGLContext.getExtension("WEBGL_debug_renderer_info");
		const loseContext = webGLContext.getExtension("WEBGL_lose_context");
		if (!debugRendererInfo) {
			if (loseContext) loseContext.loseContext();
			else canvasElement.width = 0;
			continue;
		}
		const isHardwareRenderer = !isSoftwareRenderer(webGLContext.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL) ?? "");
		if (loseContext) loseContext.loseContext();
		else canvasElement.width = 0;
		if (isHardwareRenderer) return true;
	}
	return false;
}
/**
* Public.
*/
async function supportsGpuAcceleration() {
	const webGPUAccelerated = await hasWebGPUAcceleration();
	const webGLAccelerated = !webGPUAccelerated && hasWebGLAcceleration();
	const gpuAccelerated = webGPUAccelerated || webGLAccelerated;
	debugLog(`WebGPU supported ${webGPUAccelerated}, WebGL supported ${webGLAccelerated}.`);
	return gpuAccelerated;
}
//#endregion
//#region ../../apis/geometry.ts
function clampRect(rect, containerRect) {
	const clampedX = Math.max(containerRect.x, Math.min(rect.x, containerRect.x + containerRect.width));
	const clampedY = Math.max(containerRect.y, Math.min(rect.y, containerRect.y + containerRect.height));
	return {
		x: clampedX,
		y: clampedY,
		width: Math.max(0, Math.min(rect.width, containerRect.x + containerRect.width - clampedX)),
		height: Math.max(0, Math.min(rect.height, containerRect.y + containerRect.height - clampedY))
	};
}
function deflateRect(rect, insets) {
	return {
		x: rect.x + insets.left,
		y: rect.y + insets.top,
		width: rect.width - insets.left - insets.right,
		height: rect.height - insets.top - insets.bottom
	};
}
function boundsFromRect(rect) {
	return {
		left: rect.x,
		top: rect.y,
		right: rect.x + rect.width,
		bottom: rect.y + rect.height
	};
}
function inflateBounds(bounds, padding) {
	return {
		left: bounds.left - padding,
		top: bounds.top - padding,
		right: bounds.right + padding,
		bottom: bounds.bottom + padding
	};
}
function boundsOverlap(first, second) {
	return !(first.right <= second.left || first.left >= second.right || first.bottom <= second.top || first.top >= second.bottom);
}
//#endregion
//#region ../../apis/random.ts
/**
* Public.
*/
function intInRange(min, max, { inclusive = true } = {}) {
	if (!Number.isFinite(min) || !Number.isFinite(max)) throw new Error("min and max must be finite.");
	if (inclusive ? min > max : min >= max) throw new Error(inclusive ? "min must be less than or equal to max." : "min must be less than max.");
	const range = max - min + (inclusive ? 1 : 0);
	return Math.floor(Math.random() * range) + min;
}
function floatInRange(min, max) {
	if (!Number.isFinite(min) || !Number.isFinite(max)) throw new Error("min and max must be finite.");
	if (min >= max) throw new Error("min must be less than max.");
	return Math.random() * (max - min) + min;
}
function shuffle(array) {
	const shuffled = [...array];
	for (let i = shuffled.length; i > 1; i--) {
		const j = Math.floor(Math.random() * i);
		[shuffled[i - 1], shuffled[j]] = [shuffled[j], shuffled[i - 1]];
	}
	return shuffled;
}
function findRandomNonOverlappingRect(size, containerRect, existingBounds) {
	const MAX_ATTEMPTS = 180;
	const minX = containerRect.x;
	const minY = containerRect.y;
	const maxX = containerRect.x + containerRect.width - size.width;
	const maxY = containerRect.y + containerRect.height - size.height;
	if (size.width <= 0 || size.height <= 0 || maxX < minX || maxY < minY) return null;
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const x = minX < maxX ? floatInRange(minX, maxX) : minX;
		const y = minY < maxY ? floatInRange(minY, maxY) : minY;
		const candidateBounds = {
			left: x,
			top: y,
			right: x + size.width,
			bottom: y + size.height
		};
		if (!existingBounds.some((existingBound) => boundsOverlap(candidateBounds, existingBound))) return {
			x,
			y,
			width: size.width,
			height: size.height
		};
	}
	return null;
}
//#endregion
//#region ../../apis/platform.ts
/**
* Public.
*/
var isMobile = (() => {
	const userAgentData = navigator.userAgentData;
	if (userAgentData?.mobile !== void 0) return userAgentData.mobile;
	return operatingSystemType === OperatingSystemType.Android || operatingSystemType === OperatingSystemType.iOS;
})();
//#endregion
//#region ../../apis/safe-area-debug.ts
/**
* Private.
*/
function drawSafeAreaDebugOverlay(rect) {
	const id = "debug-safe-area";
	let debugOverlayElement = document.getElementById(id);
	if (!debugOverlayElement) {
		debugOverlayElement = document.createElement("div");
		debugOverlayElement.id = id;
		debugOverlayElement.style.position = "fixed";
		debugOverlayElement.style.boxSizing = "border-box";
		debugOverlayElement.style.background = "transparent";
		debugOverlayElement.style.border = "4px solid rgba(0, 255, 0, 0.7)";
		debugOverlayElement.style.pointerEvents = "none";
		debugOverlayElement.style.zIndex = "2147483647";
		document.body.appendChild(debugOverlayElement);
	}
	debugOverlayElement.style.left = `${rect.x}px`;
	debugOverlayElement.style.top = `${rect.y}px`;
	debugOverlayElement.style.width = `${rect.width}px`;
	debugOverlayElement.style.height = `${rect.height}px`;
}
/**
* Public.
*/
function maybeDrawSafeAreaDebugOverlay(rect) {
	if (!document.body) {
		document.addEventListener("DOMContentLoaded", () => maybeDrawSafeAreaDebugOverlay(rect), { once: true });
		return;
	}
	if (isDebugEnabled()) drawSafeAreaDebugOverlay(rect);
}
//#endregion
//#region ../../apis/safe-area.ts
/**
* Private.
*/
var currentSafeAreaRect = null;
var isSafeAreaInitialized = false;
var pendingSafeAreaLayoutUpdate = false;
var resolveSafeAreaReady = null;
var safeAreaReadyPromise = new Promise((resolve) => {
	resolveSafeAreaReady = resolve;
});
var LEGACY_WIDE_DESKTOP_INSET = {
	top: 128,
	right: 24,
	bottom: 200,
	left: 24
};
var LEGACY_NARROW_DESKTOP_INSET = {
	top: 224,
	right: 24,
	bottom: 200,
	left: 24
};
var LEGACY_MOBILE_INSET = {
	top: 156,
	right: 12,
	bottom: 58,
	left: 12
};
var NARROW_DESKTOP_MAX_WIDTH = 643;
function legacySafeAreaInsets() {
	if (isMobile) return LEGACY_MOBILE_INSET;
	if (window.innerWidth <= NARROW_DESKTOP_MAX_WIDTH) return LEGACY_NARROW_DESKTOP_INSET;
	return LEGACY_WIDE_DESKTOP_INSET;
}
function legacySafeAreaRect() {
	const inset = legacySafeAreaInsets();
	return new DOMRectReadOnly(inset.left, inset.top, window.innerWidth - (inset.left + inset.right), window.innerHeight - (inset.top + inset.bottom));
}
function getSafeAreaRect() {
	return currentSafeAreaRect ?? legacySafeAreaRect();
}
function setSafeAreaCSSVariables(rect) {
	const style = document.documentElement.style;
	const top = rect.y;
	const right = window.innerWidth - rect.right;
	const bottom = window.innerHeight - rect.bottom;
	const left = rect.x;
	style.setProperty("--safe-area-x", `${rect.x}px`);
	style.setProperty("--safe-area-y", `${rect.y}px`);
	style.setProperty("--safe-area-width", `${rect.width}px`);
	style.setProperty("--safe-area-height", `${rect.height}px`);
	style.setProperty("--safe-area-top", `${top}px`);
	style.setProperty("--safe-area-bottom", `${bottom}px`);
	style.setProperty("--safe-area-left", `${left}px`);
	style.setProperty("--safe-area-right", `${right}px`);
	style.setProperty("--safe-area", `${top}px ${right}px ${bottom}px ${left}px`);
	maybeDrawSafeAreaDebugOverlay(rect);
}
function scheduleAfterDom(onReady) {
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(onReady), { once: true });
	else requestAnimationFrame(onReady);
}
function notifySafeAreaLayoutChange() {
	debugLog("Dispatching layoutSafeArea event.");
	window.dispatchEvent(new CustomEvent("layoutSafeArea"));
}
function updateSafeAreaLayout() {
	if (pendingSafeAreaLayoutUpdate) {
		debugLog("Safe area layout update already pending, skipping.");
		return;
	}
	pendingSafeAreaLayoutUpdate = true;
	debugLog("Safe area layout update scheduled. isMobile:", isMobile, "innerWidth:", window.innerWidth, "innerHeight:", window.innerHeight);
	scheduleAfterDom(() => {
		pendingSafeAreaLayoutUpdate = false;
		const usingBridgeRect = currentSafeAreaRect !== null;
		const safeAreaRect = getSafeAreaRect();
		debugLog("Safe area applying. source:", usingBridgeRect ? "bridge" : "legacy", "rect:", safeAreaRect);
		setSafeAreaCSSVariables(safeAreaRect);
		notifySafeAreaLayoutChange();
		resolveSafeAreaReady?.();
	});
}
function subscribeToSafeAreaLayoutChanges() {
	window.addEventListener("message", (messageEvent) => {
		if (!isTrustedOrigin(messageEvent.origin)) return;
		const { type, value } = messageEvent.data ?? {};
		debugLog("Safe area bridge message. type:", type, "origin:", messageEvent.origin);
		if (type === "richMediaSafeRect" && value && typeof value.x === "number" && typeof value.y === "number" && typeof value.width === "number" && typeof value.height === "number") {
			debugLog("Safe area bridge rect received. raw:", value);
			const clamped = clampRect({
				x: value.x,
				y: value.y,
				width: value.width,
				height: value.height
			}, {
				x: 0,
				y: 0,
				width: window.innerWidth,
				height: window.innerHeight
			});
			debugLog("Safe area bridge rect clamped:", clamped);
			currentSafeAreaRect = new DOMRectReadOnly(clamped.x, clamped.y, clamped.width, clamped.height);
			debugLog("Safe area rect", currentSafeAreaRect);
			updateSafeAreaLayout();
		} else if (type !== void 0) debugLog("Safe area bridge message ignored. type:", type, "value:", value);
	});
	window.addEventListener("resize", updateSafeAreaLayout);
}
function initSafeArea() {
	if (isSafeAreaInitialized) return;
	isSafeAreaInitialized = true;
	updateSafeAreaLayout();
	subscribeToSafeAreaLayoutChanges();
}
/**
* Public.
*/
function onSafeAreaReady(onReady) {
	safeAreaReadyPromise.then(() => requestAnimationFrame(onReady));
}
function getSafeAreaInsets() {
	const style = getComputedStyle(document.documentElement);
	const getCssPixels = (name) => {
		const value = parseFloat(style.getPropertyValue(name));
		return Number.isFinite(value) ? value : 0;
	};
	return {
		top: getCssPixels("--safe-area-top"),
		right: getCssPixels("--safe-area-right"),
		bottom: getCssPixels("--safe-area-bottom"),
		left: getCssPixels("--safe-area-left")
	};
}
//#endregion
//#region ../../apis/carousel/script.ts
async function initCarousel() {
	initSafeArea();
	const isScrollEndEventSupported = "onscrollend" in document.createElement("div");
	const maybeCarousel = document.querySelector(".carousel");
	if (!maybeCarousel) return;
	const carousel = maybeCarousel;
	if (document.body.hasAttribute("data-hide-navigation")) {
		const navigationContainer = document.querySelector(".carousel-navigation-container");
		if (navigationContainer) navigationContainer.style.display = "none";
	}
	carousel.dataset.animationStyle ??= "fade";
	const animationStyle = carousel.dataset.animationStyle;
	const slides = document.querySelectorAll(".carousel-slide");
	if (!slides) return;
	let currentSlide = 0;
	const shouldLoop = carousel.hasAttribute("data-loop");
	const slideDisplayOrder = shuffleSlideDisplayOrder(carousel, slides);
	if (prefersReducedMotion) console.warn("User prefers reduced motion. Skipping animations.");
	const gpuAccelerated = await supportsGpuAcceleration();
	if (!gpuAccelerated) console.warn("GPU does not support acceleration. Skipping animations.");
	const DEFAULT_AUTOPLAY_INTERVAL_IN_SECONDS = 3;
	const DEFAULT_FADE_DURATION_IN_SECONDS = 1;
	let autoplayTimeout = null;
	let isFirstRun = true;
	let userInteracted = false;
	setSlideFocalPoints();
	displaySlide(currentSlide);
	addEventListeners();
	maybeCreatePaginationDots();
	maybeUpdatePaginationDots(currentSlide);
	maybeStartAutoplay();
	function shuffleSlideDisplayOrder(carousel, slides) {
		let slideDisplayOrder = Array.from(slides, (_, i) => i);
		if ((carousel.dataset.displayOrder || "shuffle") === "shuffle") {
			slideDisplayOrder = shuffle(slideDisplayOrder);
			const slidesArray = Array.from(slides);
			slideDisplayOrder.forEach((index) => {
				carousel.appendChild(slidesArray[index]);
			});
		}
		return slideDisplayOrder;
	}
	function setSlideFocalPoints() {
		document.querySelectorAll(".carousel-slide img").forEach((img) => {
			img.style.objectPosition = img.dataset.focalPoint || "center";
		});
	}
	function displaySlide(index) {
		if (index < 0 || index >= slides.length) return;
		const slideIndex = slideDisplayOrder[index];
		if (prefersReducedMotion || !gpuAccelerated) {
			scrollToSlide(index, "auto");
			return;
		}
		if (animationStyle === "scroll") scrollToSlide(index, "smooth");
		else {
			fadeToSlide(slideIndex);
			isFirstRun = false;
		}
	}
	function scrollToSlide(index, behavior) {
		carousel.scrollTo({
			left: index * carousel.clientWidth,
			behavior
		});
	}
	function fadeToSlide(slideIndex) {
		const duration = fadeDuration();
		slides.forEach((slide, i) => {
			if (!isFirstRun && duration > 0) slide.style.transition = `opacity ${duration}s ease`;
			slide.classList.toggle("active", i === slideIndex);
		});
	}
	function nextSlideDelayInSeconds(intervalInSeconds) {
		return intervalInSeconds + (animationStyle !== "scroll" ? fadeDuration() : 0);
	}
	function nextSlide() {
		if (shouldLoop) currentSlide = (currentSlide + 1) % slides.length;
		else if (currentSlide < slides.length - 1) currentSlide++;
		else stopAutoplay();
		maybeUpdatePaginationDots(currentSlide);
		displaySlide(currentSlide);
	}
	function nextSlideWithUserInteraction() {
		userInteracted = true;
		resetAutoplay();
		nextSlide();
		dispatchRichMediaEvent(richMediaEventTypes.INTERACTION);
	}
	function prevSlide() {
		if (shouldLoop) currentSlide = (currentSlide - 1 + slides.length) % slides.length;
		else if (currentSlide > 0) currentSlide--;
		maybeUpdatePaginationDots(currentSlide);
		displaySlide(currentSlide);
	}
	function prevSlideWithUserInteraction() {
		userInteracted = true;
		resetAutoplay();
		prevSlide();
		dispatchRichMediaEvent(richMediaEventTypes.INTERACTION);
	}
	function maybeCreatePaginationDots() {
		const paginationDots = document.querySelector(".carousel-pagination-dots");
		if (!paginationDots) return;
		slides.forEach((_, i) => {
			const pagination_dot = document.createElement("span");
			pagination_dot.classList.add("carousel-pagination-dot");
			pagination_dot.addEventListener("click", () => {
				userInteracted = true;
				resetAutoplay();
				currentSlide = i;
				maybeUpdatePaginationDots(currentSlide);
				displaySlide(currentSlide);
				dispatchRichMediaEvent(richMediaEventTypes.INTERACTION);
			});
			paginationDots.appendChild(pagination_dot);
		});
	}
	function maybeUpdatePaginationDots(index) {
		if (index < 0 || index >= slides.length) return;
		document.querySelectorAll(".carousel-pagination-dot").forEach((paginationDot, i) => {
			paginationDot.classList.toggle("active", i === index);
		});
	}
	function addEventListeners() {
		document.addEventListener("contextmenu", (event) => event.preventDefault());
		document.addEventListener("visibilitychange", handleVisibilityChange);
		carousel.addEventListener("scroll", handleScroll);
		carousel.addEventListener("scrollend", handleScrollEnd);
		bindAndDispatchClickEvent(".carousel-slide img");
		bindClickHandler(".carousel-navigation.next", nextSlideWithUserInteraction);
		bindClickHandler(".carousel-navigation.prev", prevSlideWithUserInteraction);
	}
	function fadeDuration() {
		return parseNumberDataAttr(carousel.dataset.fadeDuration, DEFAULT_FADE_DURATION_IN_SECONDS) ?? DEFAULT_FADE_DURATION_IN_SECONDS;
	}
	function autoplayIntervalInSeconds() {
		if (!carousel.dataset.autoplay) return document.querySelector(".carousel-navigation-container") ? null : DEFAULT_AUTOPLAY_INTERVAL_IN_SECONDS;
		return parseNumberDataAttr(carousel.dataset.autoplay, null);
	}
	function maybeStartAutoplay() {
		if (userInteracted) return;
		const intervalInSeconds = autoplayIntervalInSeconds();
		if (intervalInSeconds !== null) startAutoplay(intervalInSeconds);
	}
	function startAutoplay(intervalInSeconds) {
		stopAutoplay();
		autoplayTimeout = window.setTimeout(() => onAutoplayTick(intervalInSeconds), intervalInSeconds * 1e3);
	}
	function onAutoplayTick(intervalInSeconds) {
		nextSlide();
		if (autoplayTimeout === null) return;
		autoplayTimeout = window.setTimeout(() => onAutoplayTick(intervalInSeconds), nextSlideDelayInSeconds(intervalInSeconds) * 1e3);
	}
	function stopAutoplay() {
		if (autoplayTimeout !== null) {
			clearTimeout(autoplayTimeout);
			autoplayTimeout = null;
		}
	}
	function resetAutoplay() {
		stopAutoplay();
		maybeStartAutoplay();
	}
	function handleVisibilityChange() {
		document.visibilityState === "visible" ? maybeStartAutoplay() : stopAutoplay();
	}
	function handleScroll() {
		if (animationStyle !== "scroll") return;
		resetAutoplay();
		currentSlide = Math.round(carousel.scrollLeft / carousel.clientWidth);
		if (!isScrollEndEventSupported) handleScrollEnd();
	}
	function handleScrollEnd() {
		if (animationStyle !== "scroll") return;
		maybeUpdatePaginationDots(currentSlide);
	}
}
//#endregion
//#region src/brand.ts
var SLIDE_CONTENT = [
	{
		prompts: [
			{
				title: "Learn new things",
				description: "Confidentially"
			},
			{
				title: "Generate images",
				description: "Privately"
			},
			{
				title: "Ask personal questions",
				description: "Confidentially"
			}
		],
		exclusionZones: [{
			x: 1280,
			y: 150,
			width: 395,
			height: 490
		}]
	},
	{
		prompts: [
			{
				title: "Ask for parenting technique",
				description: "Confidentially"
			},
			{
				title: "Plan family holidays",
				description: "Securely"
			},
			{
				title: "Navigate family decisions",
				description: "Privately"
			}
		],
		exclusionZones: [{
			x: 0,
			y: 88,
			width: 670,
			height: 750
		}, {
			x: 1106,
			y: 0,
			width: 788,
			height: 738
		}]
	},
	{
		prompts: [
			{
				title: "Plan yearly budget",
				description: "Securely"
			},
			{
				title: "Brainstorm business ideas",
				description: "Confidentially"
			},
			{
				title: "Prepare for job interviews",
				description: "Privately"
			}
		],
		exclusionZones: [
			{
				x: 0,
				y: 138,
				width: 450,
				height: 538
			},
			{
				x: 919,
				y: 119,
				width: 563,
				height: 644
			},
			{
				x: 1794,
				y: 238,
				width: 600,
				height: 613
			}
		]
	}
];
var SHOWN_PROMPT_INITIAL_DELAY_FACTOR = .5;
var SHOWN_PROMPT_POP_IN_DURATION_MS = 800;
var SHOWN_PROMPT_MIN_STAGGER_FACTOR = .5;
var SHOWN_PROMPT_MAX_STAGGER_FACTOR = .75;
var SHOWN_PROMPT_MIN_WIDTH_PX = 280;
var SHOWN_PROMPT_MAX_WIDTH_PX = 420;
var PROMPT_PLACEMENT_GAP_PX = 48;
var SHOWN_PROMPT_MIN_DURATION_MS = 2e3;
var SHOWN_PROMPT_MAX_DURATION_MS = 5e3;
var HIDDEN_PROMPT_DURATION_MS = 500;
var HIDDEN_PROMPT_ON_SLIDE_CHANGE_MIN_DURATION_MS = 1e3;
var HIDDEN_PROMPT_ON_SLIDE_CHANGE_MAX_DURATION_MS = 1500;
var HIDDEN_PROMPT_SCALE = 1.08;
var showPromptTimers = /* @__PURE__ */ new Map();
var hidePromptTimers = /* @__PURE__ */ new Map();
var carouselSlidePromptElements = /* @__PURE__ */ new Map();
var shownCarouselSlideElements = /* @__PURE__ */ new Set();
var promptLayerElement = null;
var carouselSlideFadeDurationMs = 0;
var resizeTimeoutId = null;
function pickPromptWidth(index, total) {
	const bandSize = (SHOWN_PROMPT_MAX_WIDTH_PX - SHOWN_PROMPT_MIN_WIDTH_PX) / total;
	const bandMin = SHOWN_PROMPT_MIN_WIDTH_PX + index * bandSize;
	return intInRange(bandMin, bandMin + bandSize);
}
function makePromptElement(data) {
	const promptElement = document.createElement("div");
	promptElement.className = "prompt";
	promptElement.style.opacity = "0";
	const iconElement = document.createElement("div");
	iconElement.className = "prompt-icon";
	const iconImageElement = document.createElement("img");
	iconImageElement.className = "prompt-icon-image";
	iconImageElement.alt = "";
	iconImageElement.src = "prompt-icon.webp";
	iconElement.appendChild(iconImageElement);
	const textElement = document.createElement("div");
	textElement.className = "prompt-text";
	const titleElement = document.createElement("span");
	titleElement.className = "prompt-title";
	titleElement.textContent = data.title;
	const descriptionElement = document.createElement("span");
	descriptionElement.className = "prompt-description";
	descriptionElement.textContent = data.description;
	textElement.appendChild(titleElement);
	textElement.appendChild(descriptionElement);
	promptElement.appendChild(iconElement);
	promptElement.appendChild(textElement);
	return promptElement;
}
var PROMPT_MIN_FALLBACK_WIDTH_PX = 220;
var PROMPT_FALLBACK_STEP_PX = 20;
function placePrompt(element, widthPx, existingBounds, safeAreaInsets) {
	const containerRect = deflateRect({
		x: 0,
		y: 0,
		width: window.innerWidth,
		height: window.innerHeight
	}, safeAreaInsets);
	for (let promptWidthPx = widthPx; promptWidthPx >= PROMPT_MIN_FALLBACK_WIDTH_PX; promptWidthPx -= PROMPT_FALLBACK_STEP_PX) {
		const promptHeight = Math.round(promptWidthPx / 3.54);
		const iconSize = Math.round(promptHeight * .5);
		const padding = Math.round((promptHeight - iconSize) / 2);
		element.style.width = `${promptWidthPx}px`;
		element.style.height = `${promptHeight}px`;
		element.style.padding = `${padding}px`;
		element.style.gap = `${Math.round(promptWidthPx * .05)}px`;
		element.style.fontSize = `${Math.round(promptWidthPx * .05)}px`;
		const iconElement = element.querySelector(".prompt-icon");
		if (iconElement) {
			iconElement.style.width = `${iconSize}px`;
			iconElement.style.height = `${iconSize}px`;
		}
		element.offsetWidth;
		const { width, height } = element.getBoundingClientRect();
		const promptRect = findRandomNonOverlappingRect({
			width,
			height
		}, containerRect, existingBounds);
		if (promptRect) {
			element.style.left = `${promptRect.x}px`;
			element.style.top = `${promptRect.y}px`;
			return inflateBounds(boundsFromRect(promptRect), PROMPT_PLACEMENT_GAP_PX);
		}
	}
	return null;
}
function showPrompt(element) {
	element.style.transform = "";
	element.style.transition = "none";
	element.style.opacity = "";
	element.style.animation = "none";
	element.offsetWidth;
	element.style.animation = `prompt-pop-in ${SHOWN_PROMPT_POP_IN_DURATION_MS}ms linear forwards`;
	element.style.pointerEvents = "auto";
}
function hidePrompt(element, durationMs = HIDDEN_PROMPT_DURATION_MS) {
	if (prefersReducedTransparency) {
		element.style.transition = "none";
		element.style.opacity = "0";
		element.style.pointerEvents = "none";
		setTimeout(() => element.remove(), 0);
		return;
	}
	element.style.animation = "none";
	element.offsetWidth;
	element.style.transition = `opacity ${durationMs}ms ease, transform ${durationMs}ms ease`;
	element.style.opacity = "0";
	element.style.transform = `scale(${HIDDEN_PROMPT_SCALE})`;
	element.style.pointerEvents = "none";
	setTimeout(() => element.remove(), durationMs);
}
function hidePromptAfter(slideElement, element) {
	let timers = hidePromptTimers.get(slideElement);
	if (!timers) {
		timers = [];
		hidePromptTimers.set(slideElement, timers);
	}
	timers.push(setTimeout(() => {
		hidePrompt(element);
		const elements = carouselSlidePromptElements.get(slideElement);
		const index = elements?.indexOf(element) ?? -1;
		if (index !== -1) elements?.splice(index, 1);
	}, floatInRange(SHOWN_PROMPT_MIN_DURATION_MS, SHOWN_PROMPT_MAX_DURATION_MS)));
}
function clearShowPromptTimers(slideElement) {
	(showPromptTimers.get(slideElement) ?? []).forEach(clearTimeout);
	showPromptTimers.delete(slideElement);
}
function clearHidePromptTimers(slideElement) {
	(hidePromptTimers.get(slideElement) ?? []).forEach(clearTimeout);
	hidePromptTimers.delete(slideElement);
}
function clearPromptTimers(slideElement) {
	clearShowPromptTimers(slideElement);
	clearHidePromptTimers(slideElement);
}
function appendToPromptLayer(slideElement, element) {
	promptLayerElement?.appendChild(element);
	const elements = carouselSlidePromptElements.get(slideElement);
	if (elements) elements.push(element);
	else carouselSlidePromptElements.set(slideElement, [element]);
}
function spawnPrompt(slideElement, data, widthPx, existingBounds) {
	const element = makePromptElement(data);
	appendToPromptLayer(slideElement, element);
	const placedBounds = placePrompt(element, widthPx, existingBounds, getSafeAreaInsets());
	if (!placedBounds) {
		element.remove();
		const elements = carouselSlidePromptElements.get(slideElement);
		elements?.splice(elements.indexOf(element), 1);
		return null;
	}
	showPrompt(element);
	hidePromptAfter(slideElement, element);
	return placedBounds;
}
function showAllPrompts(slideElement, prompts, existingBounds) {
	prompts.forEach((data, index) => {
		const element = makePromptElement(data);
		appendToPromptLayer(slideElement, element);
		const placedBounds = placePrompt(element, pickPromptWidth(index, prompts.length), existingBounds, getSafeAreaInsets());
		if (placedBounds) {
			existingBounds.push(placedBounds);
			element.style.opacity = "1";
			element.style.pointerEvents = "auto";
		} else {
			element.remove();
			const elements = carouselSlidePromptElements.get(slideElement);
			elements?.splice(elements.indexOf(element), 1);
		}
	});
}
function showNextPrompt(slideElement, prompts, index, existingBounds) {
	const placedBounds = spawnPrompt(slideElement, prompts[index], pickPromptWidth(index, prompts.length), existingBounds);
	if (placedBounds) existingBounds.push(placedBounds);
}
function showNextPromptAfter(slideElement, prompts, index, existingBounds) {
	if (index >= prompts.length) return;
	const timers = showPromptTimers.get(slideElement);
	if (!timers) return;
	timers.push(setTimeout(() => {
		showNextPrompt(slideElement, prompts, index, existingBounds);
		showNextPromptAfter(slideElement, prompts, index + 1, existingBounds);
	}, floatInRange(SHOWN_PROMPT_MIN_STAGGER_FACTOR, SHOWN_PROMPT_MAX_STAGGER_FACTOR) * SHOWN_PROMPT_POP_IN_DURATION_MS));
}
function hideAllPrompts(slideElement) {
	const elements = carouselSlidePromptElements.get(slideElement) ?? [];
	carouselSlidePromptElements.delete(slideElement);
	for (const element of elements) hidePrompt(element, floatInRange(HIDDEN_PROMPT_ON_SLIDE_CHANGE_MIN_DURATION_MS, HIDDEN_PROMPT_ON_SLIDE_CHANGE_MAX_DURATION_MS));
}
function resetPrompts(slideElement) {
	clearPromptTimers(slideElement);
	hideAllPrompts(slideElement);
}
function scheduleSlidePrompts(slideElement, prompts, existingBounds) {
	const isFirstPrompt = !shownCarouselSlideElements.has(slideElement);
	shownCarouselSlideElements.add(slideElement);
	showPromptTimers.set(slideElement, [setTimeout(() => {
		showNextPrompt(slideElement, prompts, 0, existingBounds);
		showNextPromptAfter(slideElement, prompts, 1, existingBounds);
	}, isFirstPrompt ? carouselSlideFadeDurationMs * SHOWN_PROMPT_INITIAL_DELAY_FACTOR : 0)]);
}
var ACTIVE_SLIDE_CSS_SCALE = 1.09;
function exclusionZonesForSlide(slideIndex, slideElement) {
	const zones = SLIDE_CONTENT[slideIndex]?.exclusionZones ?? [];
	const imgElement = slideElement.querySelector("img");
	const imageWidth = imgElement?.naturalWidth || 2560;
	const imageHeight = imgElement?.naturalHeight || 1440;
	const coverScale = Math.max(window.innerWidth / imageWidth, window.innerHeight / imageHeight);
	const displayWidth = imageWidth * coverScale;
	const displayHeight = imageHeight * coverScale;
	const [xPart, yPart] = (imgElement?.dataset.focalPoint ?? "50% 50%").trim().split(/\s+/);
	const focalX = parseFloat(xPart ?? "50") / 100;
	const focalY = parseFloat(yPart ?? "50") / 100;
	const offsetX = -focalX * (displayWidth - window.innerWidth);
	const offsetY = -focalY * (displayHeight - window.innerHeight);
	const vCx = window.innerWidth / 2;
	const vCy = window.innerHeight / 2;
	return zones.map((zone) => {
		const x = zone.x * coverScale + offsetX;
		const y = zone.y * coverScale + offsetY;
		const width = zone.width * coverScale;
		const height = zone.height * coverScale;
		return boundsFromRect({
			x: vCx + (x - vCx) * ACTIVE_SLIDE_CSS_SCALE,
			y: vCy + (y - vCy) * ACTIVE_SLIDE_CSS_SCALE,
			width: width * ACTIVE_SLIDE_CSS_SCALE,
			height: height * ACTIVE_SLIDE_CSS_SCALE
		});
	});
}
function onCarouselSlideShown(slideElement, slideIndex, slidePrompts) {
	const prompts = slidePrompts.get(slideElement) ?? [];
	const buttonClientRect = document.querySelector(".button")?.getBoundingClientRect() ?? null;
	const buttonBounds = buttonClientRect ? inflateBounds(boundsFromRect(buttonClientRect), PROMPT_PLACEMENT_GAP_PX) : null;
	const existingBounds = buttonBounds ? [buttonBounds] : [];
	const safeInsets = getSafeAreaInsets();
	const safeLeft = safeInsets.left;
	const safeTop = safeInsets.top;
	const safeRight = window.innerWidth - safeInsets.right;
	const safeBottom = window.innerHeight - safeInsets.bottom;
	for (const bounds of exclusionZonesForSlide(slideIndex, slideElement)) {
		const left = Math.max(bounds.left, safeLeft);
		const top = Math.max(bounds.top, safeTop);
		const right = Math.min(bounds.right, safeRight);
		const bottom = Math.min(bounds.bottom, safeBottom);
		if (left < right && top < bottom) existingBounds.push({
			left,
			top,
			right,
			bottom
		});
	}
	if (prefersReducedMotion) {
		showAllPrompts(slideElement, prompts, existingBounds);
		return;
	}
	scheduleSlidePrompts(slideElement, prompts, existingBounds);
}
function onCarouselSlideHidden(slideElement) {
	resetPrompts(slideElement);
}
function onCarouselSlideActiveChange(slideElement, slideIndices, slidePrompts) {
	if (slideElement.classList.contains("active")) onCarouselSlideShown(slideElement, slideIndices.get(slideElement) ?? 0, slidePrompts);
	else onCarouselSlideHidden(slideElement);
}
function observeCarouselSlideClass(slideElements, slideIndices, slidePrompts) {
	const carouselSlideClassObserver = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.attributeName !== "class") continue;
			const slideElement = mutation.target;
			onCarouselSlideActiveChange(slideElement, slideIndices, slidePrompts);
		}
	});
	slideElements.forEach((slideElement) => {
		carouselSlideClassObserver.observe(slideElement, {
			attributes: true,
			attributeFilter: ["class"]
		});
	});
}
function initPrompts(slideElements) {
	const slideIndices = /* @__PURE__ */ new WeakMap();
	const slidePrompts = /* @__PURE__ */ new WeakMap();
	slideElements.forEach((slideElement, index) => {
		slideIndices.set(slideElement, index);
		slidePrompts.set(slideElement, SLIDE_CONTENT[index]?.prompts ?? []);
	});
	observeCarouselSlideClass(slideElements, slideIndices, slidePrompts);
	window.addEventListener("resize", () => {
		slideElements.forEach((slideElement) => {
			resetPrompts(slideElement);
		});
		if (resizeTimeoutId !== null) clearTimeout(resizeTimeoutId);
		resizeTimeoutId = setTimeout(() => {
			resizeTimeoutId = null;
			slideElements.forEach((slideElement) => {
				if (slideElement.classList.contains("active")) onCarouselSlideShown(slideElement, slideIndices.get(slideElement) ?? 0, slidePrompts);
			});
		}, 200);
	});
}
function init() {
	const carouselElement = document.querySelector("#carousel");
	if (!carouselElement) throw new Error("Carousel element not found.");
	initPrompts(carouselElement.querySelectorAll(".carousel-slide"));
	carouselSlideFadeDurationMs = parseFloat(carouselElement.dataset.fadeDuration ?? "1") * 1e3;
	initCarousel();
	bindAndDispatchClickEvent(".button");
	initPromptLayer(carouselElement);
}
function initPromptLayer(carouselElement) {
	promptLayerElement = document.createElement("div");
	promptLayerElement.className = "prompt-layer";
	carouselElement.appendChild(promptLayerElement);
}
document.addEventListener("DOMContentLoaded", () => {
	initSafeArea();
	onSafeAreaReady(init);
});
//#endregion
