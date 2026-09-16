/**
 * Internal workspace navigation. Public landing stays outside this tree.
 * Start is first so a new user can pay without hunting modules.
 */

export type NavItem = {
  id: string;
  label: string;
  to: string;
  end?: boolean;
  match?: (pathname: string) => boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

function isContractOverview(pathname: string): boolean {
  return /^\/app\/org\/[0-9a-fA-F]{64}\/?$/.test(pathname);
}

function isAgentPath(pathname: string): boolean {
  return pathname === "/app/org/agents" || pathname.includes("/agent");
}

function isModuleHome(pathname: string, base: string): boolean {
  return pathname === base || pathname === `${base}/` || pathname.startsWith(`${base}/`);
}

export const WORKSPACE_NAV: NavGroup[] = [
  {
    id: "start",
    label: "Start",
    items: [
      { id: "home", label: "Home", to: "/app", end: true },
      { id: "pay", label: "Request a payment", to: "/app/authorize/new" },
      { id: "activity", label: "Activity", to: "/app/actions" },
    ],
  },
  {
    id: "money",
    label: "Money",
    items: [
      {
        id: "treasury",
        label: "Treasury",
        to: "/app/treasury",
        match: (pathname) => isModuleHome(pathname, "/app/treasury"),
      },
      {
        id: "credentials",
        label: "Credentials",
        to: "/app/credentials",
        match: (pathname) => isModuleHome(pathname, "/app/credentials"),
      },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      {
        id: "members",
        label: "Members",
        to: "/app/org",
        match: (pathname) => pathname === "/app/org" || isContractOverview(pathname),
      },
      {
        id: "agents",
        label: "Agents",
        to: "/app/org/agents",
        match: isAgentPath,
      },
      {
        id: "votes",
        label: "Votes",
        to: "/app/governance",
        match: (pathname) => isModuleHome(pathname, "/app/governance"),
      },
      {
        id: "bids",
        label: "Bids",
        to: "/app/procurement",
        match: (pathname) => isModuleHome(pathname, "/app/procurement"),
      },
      {
        id: "auditor",
        label: "Auditor",
        to: "/app/auditor",
        match: (pathname) => isModuleHome(pathname, "/app/auditor"),
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy",
    items: [{ id: "public", label: "What's public", to: "/app/privacy" }],
  },
];

export function pathMatches(item: NavItem, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function activeNavItem(pathname: string): NavItem | undefined {
  for (const group of WORKSPACE_NAV) {
    for (const item of group.items) {
      if (pathMatches(item, pathname)) return item;
    }
  }
  return undefined;
}

export function taskFromPath(pathname: string, base: string, fallback: string): string {
  if (pathname === base || pathname === `${base}/`) return fallback;
  const rest = pathname.slice(base.length).replace(/^\//, "");
  return rest.split("/")[0] || fallback;
}
