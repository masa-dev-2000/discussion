import { useEffect, useState } from "react";

// 依存なしの最小ハッシュルーター(#/ , #/setup , #/d/:id)
export type Route =
  | { name: "list" }
  | { name: "setup" }
  | { name: "arena"; id: string };

export function parseHash(): Route {
  const h = location.hash.replace(/^#/, "");
  if (h === "/setup" || h === "/new") return { name: "setup" };
  const m = h.match(/^\/d\/(.+)$/);
  if (m) return { name: "arena", id: decodeURIComponent(m[1]) };
  return { name: "list" };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export function navigate(path: string) {
  location.hash = path;
}
