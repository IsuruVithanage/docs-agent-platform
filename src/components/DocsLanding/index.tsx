import { useState, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import { useLocation } from '@docusaurus/router';

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const iconPlatform = svg(
  <>
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </>,
);

const iconAgent = svg(
  <>
    <rect width="18" height="10" x="3" y="11" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" x2="8" y1="16" y2="16" />
    <line x1="16" x2="16" y1="16" y2="16" />
  </>,
);

const iconMcp = svg(
  <>
    <path d="M12 3 2 8l10 5 10-5-10-5Z" />
    <path d="m2 16 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
  </>,
);

const iconCheck = svg(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

const iconDownload = svg(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </>,
);

const iconObserve = svg(
  <>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

const iconShield = svg(
  <>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </>,
);

const iconGovern = svg(
  <>
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
  </>,
);

/* --------------------------- Quickstart paths -------------------------- */

type PathKey = 'platform' | 'agent' | 'mcp';

type PathOption = {
  key: PathKey;
  label: string;
  blurb: string;
  icon: ReactNode;
  quickstarts: { label: string; href: string }[];
  sidebarHint: string;
};

const PATHS: PathOption[] = [
  {
    key: 'platform',
    label: 'Platform',
    blurb: 'Install and run Agent Manager itself.',
    icon: iconPlatform,
    quickstarts: [
      { label: 'Local (k3d)', href: 'guides/on-k3d' },
      { label: 'Your cluster', href: 'guides/on-your-environment' },
      { label: 'On a VM', href: 'guides/on-a-vm' },
      { label: 'CLI', href: 'guides/cli-installation' },
    ],
    sidebarHint: 'All installation guides are available in the sidebar.',
  },
  {
    key: 'agent',
    label: 'AI Agent',
    blurb: 'Build, deploy and govern agents.',
    icon: iconAgent,
    quickstarts: [
      { label: 'First agent', href: 'tutorials/create-your-first-agent' },
      { label: 'Internal vs external', href: 'concepts/internal-and-external-agent' },
      { label: 'Agent lifecycle', href: 'concepts/agent-lifecycle' },
      { label: 'LLM providers', href: 'guides/register-llm-service-provider' },
    ],
    sidebarHint: 'All agent tutorials and guides are available in the sidebar.',
  },
  {
    key: 'mcp',
    label: 'MCP',
    blurb: 'Connect tools through a governed proxy.',
    icon: iconMcp,
    quickstarts: [
      { label: 'Register a proxy', href: 'guides/register-mcp-proxy' },
      { label: 'Authorize tools', href: 'guides/authorize-agent-access-to-mcp-tools' },
      { label: 'Attach to an agent', href: 'guides/configure-agent-mcp-proxies' },
      { label: 'MCP server', href: 'reference/mcp-server' },
    ],
    sidebarHint: 'All MCP guides and references are available in the sidebar.',
  },
];

/* ------------------------------ Use cases ------------------------------ */

type UseCase = {
  eyebrow: string;
  title: string;
  description: string;
  chooseWhen: string[];
  href: string;
  icon: ReactNode;
};

const USE_CASES: UseCase[] = [
  {
    eyebrow: 'Run & govern',
    title: 'Agents in production',
    description:
      'Deploy agents across environments with a promotion pipeline, sandboxing and per-environment configuration.',
    chooseWhen: [
      'You need dev, staging and production environments',
      'Agents must be promoted under review, not redeployed by hand',
      'Workloads need isolation between tenants',
    ],
    href: 'concepts/deployment-pipeline',
    icon: iconGovern,
  },
  {
    eyebrow: 'Observe & evaluate',
    title: 'Know what your agents did',
    description:
      'Capture traces across every agent call, then score behaviour with built-in and custom evaluators.',
    chooseWhen: [
      'You need to debug why an agent produced an answer',
      'Quality has to be measured, not eyeballed',
      'Regressions should surface before users find them',
    ],
    href: 'concepts/observability',
    icon: iconObserve,
  },
  {
    eyebrow: 'Secure',
    title: 'Identity for agents',
    description:
      'Give every agent a verifiable identity, then control what it can reach with gateway policy and scoped access.',
    chooseWhen: [
      'Agents call APIs on their own or on behalf of users',
      'Endpoints need API keys or JWT authentication',
      'Tool access must be authorized per agent',
    ],
    href: 'concepts/agentid',
    icon: iconShield,
  },
];

/* ------------------------------ Component ------------------------------ */

function QuickstartPanel({ cloud }: { cloud: boolean }): ReactNode {
  /*
   * The Cloud version is hosted, so it ships no installation guides and no
   * quick-start page — the Platform path would link to four pages that do not
   * exist there, which `onBrokenLinks: 'throw'` correctly fails the build over.
   * Drop that path on Cloud and start the reader on the first one that remains.
   */
  const paths = cloud ? PATHS.filter((p) => p.key !== 'platform') : PATHS;
  const [active, setActive] = useState<PathKey>(paths[0].key);
  const docPath = useDocPath();
  const current = paths.find((p) => p.key === active) ?? paths[0];

  return (
    <section className={styles.panel}>
      <div className={styles.panelBody}>
        <Heading as="h2" className={styles.panelTitle}>
          Choose a quickstart path.
        </Heading>
        <p className={styles.panelSubtitle}>
          Select what you&apos;re working on, then start with a quickstart for it.
        </p>

        <p className={styles.fieldLabel}>What are you setting up?</p>
        <div className={styles.optionRow} role="tablist" aria-label="What are you setting up?">
          {paths.map((path) => {
            const selected = path.key === active;
            return (
              <button
                key={path.key}
                type="button"
                role="tab"
                aria-selected={selected}
                className={selected ? `${styles.option} ${styles.optionActive}` : styles.option}
                onClick={() => setActive(path.key)}>
                <span className={styles.optionHead}>
                  <span className={styles.optionIcon}>{path.icon}</span>
                  <span className={styles.optionLabel}>{path.label}</span>
                  {selected && <span className={styles.optionCheck}>{iconCheck}</span>}
                </span>
                <span className={styles.optionBlurb}>{path.blurb}</span>
              </button>
            );
          })}
        </div>

        <p className={styles.fieldLabel}>Popular quickstarts</p>
        <div className={styles.chipRow}>
          {current.quickstarts.map((q) => (
            <Link key={q.href} to={docPath(q.href)} className={styles.chip}>
              {q.label} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <p className={styles.sidebarHint}>{current.sidebarHint}</p>
      </div>

      <div className={styles.panelFooter}>
        <span className={styles.panelFooterIcon}>{iconDownload}</span>
        <span>{cloud ? 'New to Agent Manager?' : 'Just want Agent Manager running?'}</span>
        <Link
          to={docPath(cloud ? 'get-started/what-is-amp' : 'get-started/quick-start')}
          className={styles.panelFooterLink}>
          {cloud ? 'Start here →' : 'Quick start →'}
        </Link>
      </div>
    </section>
  );
}

function UseCaseCard({ useCase }: { useCase: UseCase }): ReactNode {
  const docPath = useDocPath();
  return (
    <article className={styles.useCase}>
      <span className={styles.useCaseIcon}>{useCase.icon}</span>
      <p className={styles.useCaseEyebrow}>{useCase.eyebrow}</p>
      <Heading as="h3" className={styles.useCaseTitle}>
        {useCase.title}
      </Heading>
      <p className={styles.useCaseDescription}>{useCase.description}</p>

      <p className={styles.chooseWhenLabel}>Choose when</p>
      <ul className={styles.chooseWhenList}>
        {useCase.chooseWhen.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <Link to={docPath(useCase.href)} className={styles.useCaseLink}>
        View pattern →
      </Link>
    </article>
  );
}

export default function DocsLanding({ cloud = false }: { cloud?: boolean }): ReactNode {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <Heading as="h1" className={styles.heroTitle}>
          Agent Manager Docs
        </Heading>
        <p className={styles.heroSubtitle}>
          Learn how to run, govern, observe, evaluate and secure AI agents at scale with WSO2
          Agent Manager.
        </p>
      </header>

      <QuickstartPanel cloud={cloud} />

      <section className={styles.useCaseSection}>
        <Heading as="h2" className={styles.useCaseHeading}>
          Know your use case?
        </Heading>
        <div className={styles.useCaseGrid}>
          {USE_CASES.map((useCase) => (
            <UseCaseCard key={useCase.title} useCase={useCase} />
          ))}
        </div>
      </section>
    </div>
  );
}
