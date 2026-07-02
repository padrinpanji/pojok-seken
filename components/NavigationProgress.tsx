"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const minimumVisibleTime = 450;
const hideDelay = 260;

export default function NavigationProgress() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isRunning = useRef(false);
  const startedAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUrl = useRef("");

  useEffect(() => {
    function clearTimers() {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }

      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
        advanceTimer.current = null;
      }

      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
    }

    function startProgress() {
      clearTimers();
      isRunning.current = true;
      startedAt.current = Date.now();
      setIsVisible(true);
      setProgress(0.08);

      requestAnimationFrame(() => {
        setProgress(0.42);
      });

      advanceTimer.current = setTimeout(() => {
        setProgress(0.82);
      }, 180);

      fallbackTimer.current = setTimeout(finishProgress, 5000);
    }

    function finishProgress() {
      if (!isRunning.current) {
        return;
      }

      clearTimers();

      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, minimumVisibleTime - elapsed);

      hideTimer.current = setTimeout(() => {
        setProgress(1);

        hideTimer.current = setTimeout(() => {
          isRunning.current = false;
          setIsVisible(false);
          setProgress(0);
        }, hideDelay);
      }, remaining);
    }

    function startProgressForUrl(url: string | URL | null | undefined) {
      if (shouldStartProgressForUrl(url)) {
        startProgress();
      }
    }

    function shouldStartProgressForUrl(url: string | URL | null | undefined) {
      if (!url) {
        return false;
      }

      const nextUrl = new URL(url, window.location.href);
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (nextUrl.origin !== window.location.origin || nextPath === currentPath) {
        return false;
      }

      return true;
    }

    function scheduleHistoryProgress() {
      window.requestAnimationFrame(() => {
        startProgress();
        window.requestAnimationFrame(finishProgress);
      });
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as HTMLElement).closest("a[href]");

      if (!link) {
        return;
      }

      const href = link.getAttribute("href");
      const target = link.getAttribute("target");

      if (!href || href.startsWith("#") || target === "_blank") {
        return;
      }

      startProgressForUrl(href);
    }

    function handleSubmit(event: SubmitEvent) {
      if (!event.defaultPrevented) {
        startProgress();
      }
    }

    function handlePopState() {
      startProgress();
      window.requestAnimationFrame(finishProgress);
    }

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(
      this: History,
      data: unknown,
      unused: string,
      url?: string | URL | null
    ) {
      const shouldStart = shouldStartProgressForUrl(url);

      originalPushState.call(this, data, unused, url);

      if (shouldStart) {
        scheduleHistoryProgress();
      }
    };

    window.history.replaceState = function replaceState(
      this: History,
      data: unknown,
      unused: string,
      url?: string | URL | null
    ) {
      const shouldStart = shouldStartProgressForUrl(url);

      originalReplaceState.call(this, data, unused, url);

      if (shouldStart) {
        scheduleHistoryProgress();
      }
    };

    currentUrl.current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTimers();
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const nextUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl === currentUrl.current || !isRunning.current) {
      currentUrl.current = nextUrl;
      return;
    }

    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(0, minimumVisibleTime - elapsed);

    hideTimer.current = setTimeout(() => {
      setProgress(1);

      hideTimer.current = setTimeout(() => {
        isRunning.current = false;
        setIsVisible(false);
        setProgress(0);
      }, hideDelay);
    }, remaining);

    currentUrl.current = nextUrl;
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      data-test-id="navigation-progress"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] origin-left bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 shadow-[0_0_18px_rgba(16,185,129,0.7)] transition-[transform,opacity] duration-300 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `scaleX(${progress})`,
        width: "100%"
      }}
    />
  );
}
