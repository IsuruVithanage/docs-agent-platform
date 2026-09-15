import { Redirect } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function QuickStartRedirect(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const latestVersion = siteConfig.customFields?.latestVersion as string;
  return <Redirect to={`/docs-agent-platform/docs/${latestVersion}/get-started/quick-start/`} />;
}
