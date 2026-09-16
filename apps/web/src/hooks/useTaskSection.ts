import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { taskFromPath } from "../lib/navigation.js";

export function useTaskSection(basePath: string, fallback: string): string {
  const { pathname } = useLocation();
  const task = taskFromPath(pathname, basePath, fallback);

  useEffect(() => {
    const node = document.getElementById(`task-${task}`);
    if (!node || typeof node.scrollIntoView !== "function") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [task]);

  return task;
}
