import { Redirect } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/*
 * The landing page itself now lives in the docs plugin (docs/index.mdx, slug
 * "/"), so that it renders with the docs sidebar like any other page. That puts
 * it at /docs/<version>/ rather than /docs/, so this route stays a redirect —
 * it just points at the versioned landing instead of deep-linking into
 * what-is-amp.
 */
export default function DocsRedirect(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const latestVersion = siteConfig.customFields?.latestVersion as string;
  return <Redirect to={`/docs-agent-platform/docs/${latestVersion}/`} />;
}
