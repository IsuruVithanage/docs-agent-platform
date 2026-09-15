import { useState, type FormEvent, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import { useHistory, useLocation } from '@docusaurus/router';
import { useDocsVersion } from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

/*
 * This renders as a doc (docs/index.mdx with `slug: /`), so it exists once per
 * version and is always mounted at that version's root — /docs/v1.0.0/,
 * /docs/next/, /docs/cloud/. Links therefore have to follow whichever version
 * the reader is in; hardcoding the latest would send a Cloud or Next reader to
 * v1.0.0 pages.
 *
 * The current pathname IS the version root, so it is the base. Note this is
 * deliberately not `useDocsVersion()` — PropVersionMetadata carries label,
 * version, docsSidebars and docs, but no URL path, so reading `.path` off it
 * yields undefined and every link silently becomes ".../undefined/...".
 */
function useDocPath(): (path: string) => string {
  const { pathname } = useLocation();
  const base = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return (path: string) => `${base}/${path}`;
}

/* ------------------------------- Icons -------------------------------- */

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const iconRocket = svg(
  <>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </>,
);

const iconBook = svg(
  <>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>,
);

const iconTools = svg(
  <>
    <path d="M6 3v12" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M18 9v1a3 3 0 0 1-3 3H9" />
  </>,
);

const iconBulb = svg(
  <>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </>,
);

/* -------------------------------- Cards -------------------------------- */

type CardLink = { label: string; to: string; external?: boolean };

type Card = {
  title: string;
  icon: ReactNode;
  accent: 'blue' | 'orange' | 'teal' | 'pink';
  tall?: boolean;
  links: CardLink[];
};

const CARDS: Card[] = [
  {
    title: 'Get Started',
    icon: iconRocket,
    accent: 'blue',
    tall: true,
    links: [
      { label: 'What is Agent Manager', to: 'get-started/what-is-amp' },
      { label: 'Quick Start Guide', to: 'get-started/quick-start' },
      { label: 'Install on k3d (Locally)', to: 'guides/on-k3d' },
      { label: 'Install on Your Environment', to: 'guides/on-your-environment' },
      { label: 'Install on a VM', to: 'guides/on-a-vm' },
      { label: 'Install the CLI', to: 'guides/cli-installation' },
      { label: 'Create Your First Agent', to: 'tutorials/create-your-first-agent' },
      { label: 'Monitor an Agent', to: 'tutorials/observe-first-agent' },
    ],
  },
  {
    title: 'Guides',
    icon: iconBook,
    accent: 'orange',
    tall: true,
    links: [
      { label: 'LLM service providers', to: 'guides/register-llm-service-provider' },
      { label: 'Agent LLM configuration', to: 'guides/configure-agent-llm-configuration' },
      { label: 'MCP proxies', to: 'guides/register-mcp-proxy' },
      { label: 'Authorize agent tool access', to: 'guides/authorize-agent-access-to-mcp-tools' },
      { label: 'Secure endpoints with API keys', to: 'guides/secure-agent-endpoints-with-api-keys' },
      { label: 'JWT authentication', to: 'guides/secure-agents-with-jwt-authentication' },
      { label: 'Custom evaluators', to: 'guides/custom-evaluators' },
      { label: 'Environment management', to: 'guides/environment-management' },
    ],
  },
  {
    title: 'Developer Resources',
    icon: iconTools,
    accent: 'teal',
    links: [
      { label: 'CLI reference', to: 'reference/cli/overview' },
      { label: 'Helm charts', to: 'reference/helm-charts' },
      { label: 'MCP server', to: 'reference/mcp-server' },
      { label: 'Authorization', to: 'reference/authorization' },
    ],
  },
  {
    title: 'Community and Support',
    icon: iconBulb,
    accent: 'pink',
    links: [
      { label: 'Contributing', to: 'contributing' },
      { label: 'GitHub Discussions', to: 'https://github.com/wso2/agent-manager/discussions', external: true },
      { label: 'Report an Issue', to: 'https://github.com/wso2/agent-manager/issues', external: true },
    ],
  },
];

/*
 * Cloud is hosted, so it ships no installation guides, no quick start, no
 * reference section and no contributing page. Pointing the shared card set at
 * those paths fails the build under onBrokenLinks: 'throw' — which is exactly
 * how this was caught. Cloud therefore gets its own set: no Developer Resources
 * card at all, and a Get Started card built from what it actually has.
 */
const CLOUD_CARDS: Card[] = [
  {
    title: 'Get Started',
    icon: iconRocket,
    accent: 'blue',
    tall: true,
    links: [
      { label: 'What is Agent Manager', to: 'get-started/what-is-amp' },
      { label: 'Install the CLI', to: 'guides/cli-installation' },
      { label: 'Create Your First Agent', to: 'tutorials/create-your-first-agent' },
      { label: 'Monitor an Agent', to: 'tutorials/observe-first-agent' },
      { label: 'Environment management', to: 'guides/environment-management' },
    ],
  },
  {
    title: 'Guides',
    icon: iconBook,
    accent: 'orange',
    tall: true,
    links: [
      { label: 'LLM service providers', to: 'guides/register-llm-service-provider' },
      { label: 'Agent LLM configuration', to: 'guides/configure-agent-llm-configuration' },
      { label: 'MCP proxies', to: 'guides/register-mcp-proxy' },
      { label: 'Authorize agent tool access', to: 'guides/authorize-agent-access-to-mcp-tools' },
      { label: 'Secure endpoints with API keys', to: 'guides/secure-agent-endpoints-with-api-keys' },
      { label: 'JWT authentication', to: 'guides/secure-agents-with-jwt-authentication' },
      { label: 'Custom evaluators', to: 'guides/custom-evaluators' },
      { label: 'Trace sampling', to: 'guides/configure-trace-sampling' },
    ],
  },
  {
    title: 'Community and Support',
    icon: iconBulb,
    accent: 'pink',
    links: [
      { label: 'GitHub Discussions', to: 'https://github.com/wso2/agent-manager/discussions', external: true },
      { label: 'Report an Issue', to: 'https://github.com/wso2/agent-manager/issues', external: true },
    ],
  },
];

/* ------------------------------- Search -------------------------------- */

function SearchBar(): ReactNode {
  const [query, setQuery] = useState('');
  const history = useHistory();
  const searchPath = useBaseUrl('/search');

  /*
   * docusaurus-lunr-search ships a /search page that reads the `q` parameter,
   * so this is a real search rather than a decorative box: submitting hands the
   * query to the same index the navbar search uses.
   */
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    history.push(`${searchPath}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form className={styles.search} role="search" onSubmit={onSubmit}>
      <span className={styles.searchIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        className={styles.searchInput}
        placeholder="Search"
        aria-label="Search the documentation"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}

/* ------------------------------ Component ------------------------------ */

function DocsCard({ card }: { card: Card }): ReactNode {
  const docPath = useDocPath();
  return (
    <section className={card.tall ? `${styles.card} ${styles.cardTall}` : styles.card}>
      <div className={styles.cardHead}>
        <Heading as="h2" className={styles.cardTitle}>
          {card.title}
        </Heading>
        <span className={`${styles.cardIcon} ${styles[card.accent]}`}>{card.icon}</span>
      </div>
      <ul className={styles.cardList}>
        {card.links.map((link) => (
          <li key={link.label}>
            <Link to={link.external ? link.to : docPath(link.to)} className={styles.cardLink}>
              <span className={styles.arrow} aria-hidden="true">→</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DocsLanding(): ReactNode {
  // useDocsVersion() carries the version identity but no URL path; useLocation()
  // supplies the path. Each is used for what it actually provides.
  const { version } = useDocsVersion();
  const cards = version === 'cloud' ? CLOUD_CARDS : CARDS;

  return (
    <div className={styles.page}>
      <SearchBar />

      <p className={styles.welcome}>
        Welcome to WSO2 Agent Manager documentation! Within these pages, you will learn how
        to run, govern, observe, evaluate and secure AI agents at scale using WSO2 Agent
        Manager.
      </p>

      <div className={styles.grid}>
        {cards.map((card) => (
          <DocsCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}
