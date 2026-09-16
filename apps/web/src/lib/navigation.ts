/**
 * Internal workspace navigation. Public landing stays outside this tree.
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

function isDefaultTask(pathname: string, base: string, task: string): boolean {
  return pathname === `${base}/${task}` || pathname === base || pathname === `${base}/`;
}

export const WORKSPACE_NAV: NavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", to: "/app", end: true },
      { id: "readiness", label: "Readiness", to: "/app/setup" },
      { id: "preview", label: "Public Preview", to: "/app/preview", end: true },
    ],
  },
  {
    id: "authorization",
    label: "Authorization",
    items: [
      { id: "new-request", label: "New request", to: "/app/authorize/new" },
      { id: "activity", label: "Activity", to: "/app/actions" },
    ],
  },
  {
    id: "organization",
    label: "Organization",
    items: [
      {
        id: "overview",
        label: "Overview",
        to: "/app/org",
        match: (pathname) => pathname === "/app/org" || isContractOverview(pathname),
      },
      {
        id: "agents",
        label: "Agents",
        to: "/app/org/agents",
        match: isAgentPath,
      },
      { id: "privacy", label: "Privacy", to: "/app/privacy" },
    ],
  },
  {
    id: "credentials",
    label: "Credentials",
    items: [
      {
        id: "issue",
        label: "Issue",
        to: "/app/credentials/issue",
        match: (pathname) => isDefaultTask(pathname, "/app/credentials", "issue"),
      },
      { id: "registry", label: "Registry / Revoke", to: "/app/credentials/registry" },
    ],
  },
  {
    id: "treasury",
    label: "Treasury",
    items: [
      {
        id: "deposit",
        label: "Deposit",
        to: "/app/treasury/deposit",
        match: (pathname) => isDefaultTask(pathname, "/app/treasury", "deposit"),
      },
      { id: "authorize", label: "Authorize", to: "/app/treasury/authorize" },
      { id: "settle", label: "Settle", to: "/app/treasury/settle" },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    items: [
      {
        id: "voters",
        label: "Voters",
        to: "/app/governance/voters",
        match: (pathname) => isDefaultTask(pathname, "/app/governance", "voters"),
      },
      { id: "proposals", label: "Proposals", to: "/app/governance/proposals" },
      { id: "ballots", label: "Ballots / Finalize", to: "/app/governance/ballots" },
    ],
  },
  {
    id: "procurement",
    label: "Procurement",
    items: [
      {
        id: "bidders",
        label: "Bidders",
        to: "/app/procurement/bidders",
        match: (pathname) => isDefaultTask(pathname, "/app/procurement", "bidders"),
      },
      { id: "lots", label: "Lots", to: "/app/procurement/lots" },
      { id: "bids", label: "Bids / Awards", to: "/app/procurement/bids" },
    ],
  },
  {
    id: "auditor",
    label: "Auditor",
    items: [
      {
        id: "grants",
        label: "Grants",
        to: "/app/auditor/grants",
        match: (pathname) => isDefaultTask(pathname, "/app/auditor", "grants"),
      },
      { id: "anchors", label: "Public anchors", to: "/app/auditor/anchors" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [{ id: "docs", label: "Docs", to: "/docs", end: true }],
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
