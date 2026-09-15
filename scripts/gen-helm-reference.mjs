#!/usr/bin/env node
/**
 * Generate docs/reference/helm-charts/*.mdx from each chart's values.schema.json.
 *
 * The schema is the single source of truth: `deployments/helm-charts/tools/`
 * generates it from values.yaml, and this script renders it as documentation.
 *
 *   node scripts/gen-helm-reference.mjs           # write pages
 *   node scripts/gen-helm-reference.mjs --check   # non-zero exit if stale
 */
import fs from "node:fs";
import path from "node:path";

// The Helm charts live in wso2/agent-manager, not in this repository. That repo
// is public, so the schemas are fetched over HTTPS at the release tag being
// documented. Pinning to the tag is deliberate: it documents the charts as they
// stood for that release rather than whatever happens to be on main today.
const TAG = (() => {
  const i = process.argv.indexOf("--tag");
  if (i === -1 || !process.argv[i + 1]) {
    console.error("Usage: node scripts/gen-helm-reference.mjs --tag <amp/vX.Y.Z> [--check]");
    console.error("Example: node scripts/gen-helm-reference.mjs --tag amp/v1.0.0");
    process.exit(2);
  }
  return process.argv[i + 1];
})();

const CHARTS_BASE =
  process.env.HELM_CHARTS_BASE_URL ||
  `https://raw.githubusercontent.com/wso2/agent-manager/${TAG}/deployments/helm-charts`;

// --out is explicit because this writes into a *versioned snapshot* during a
// release cut, not into the Next docs. Generating into Next from a release tag
// would rewrite Next backwards to that release's charts, losing everything
// merged since. Next tracks main and is refreshed separately.
const OUT = (() => {
  const i = process.argv.indexOf("--out");
  if (i === -1 || !process.argv[i + 1]) {
    console.error("Usage: node scripts/gen-helm-reference.mjs --tag <amp/vX.Y.Z> --out <dir> [--check]");
    process.exit(2);
  }
  return path.resolve(process.argv[i + 1]);
})();
fs.mkdirSync(OUT, {recursive: true});

async function fetchChartFile(chart, file) {
  const url = `${CHARTS_BASE}/${chart}/${file}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    // A transient network failure must not quietly produce pages with charts
    // missing - that would ship a reference that silently lost a chart.
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  return res.text();
}
// Charts are published flat at oci://<registry>/<chart> (see
// .github/scripts/package-helm-chart.sh), so the install command must carry no
// extra path segment. Overridable so a private-registry build documents its own.
const CHART_REGISTRY = process.env.HELM_CHART_REGISTRY || "ghcr.io/wso2";
const CHECK = process.argv.includes("--check");

const TITLES = {
  "wso2-agent-manager": "Agent Manager",
  "wso2-amp-api-platform-gateway-extension": "API Platform Gateway Extension",
  "wso2-amp-thunder-extension": "Thunder Extension",
  "wso2-amp-evaluation-extension": "Evaluation Extension",
  "wso2-amp-observability-extension": "Observability Extension",
  "wso2-amp-platform-resources-extension": "Platform Resources Extension",
};

// MDX parses <foo> as JSX and {foo} as an expression, and | breaks table cells.
const cell = (s = "") =>
  String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;")
           .replace(/\{/g, "&#123;").replace(/\}/g, "&#125;")
           .replace(/\|/g, "\\|");

const fmtDefault = (node) => {
  if (node.type === "object" && !("default" in node)) return "";
  if (!("default" in node)) return "";
  const d = node.default;
  if (Array.isArray(d)) return d.length ? "see `values.yaml`" : "`[]`";
  if (d && typeof d === "object") return "`{}`";
  return "`" + JSON.stringify(d) + "`";
};

function flatten(node, prefix = "", out = []) {
  for (const [key, value] of Object.entries(node.properties ?? {})) {
    const dotted = prefix ? `${prefix}.${key}` : key;
    out.push({ dotted, type: value.type, description: value.description ?? "", def: fmtDefault(value) });
    flatten(value, dotted, out);
  }
  return out;
}

const chartDescription = (txt) =>
  (txt.match(/^description:\s*(.+)$/m)?.[1] ?? "").trim();

let stale = [];
const index = [];

for (const name of Object.keys(TITLES)) {
  const schemaText = await fetchChartFile(name, "values.schema.json");
  if (schemaText === null) continue;
  const chartYaml = (await fetchChartFile(name, "Chart.yaml")) ?? "";
  const schema = JSON.parse(schemaText);
  const rows = flatten(schema);

  // Group by top-level key, or by second level when the chart has a single root.
  const roots = new Set(rows.map((r) => r.dotted.split(".")[0]));
  const depth = roots.size === 1 ? 2 : 1;
  const groups = new Map();
  for (const r of rows) {
    const parts = r.dotted.split(".");
    const key = parts.slice(0, depth).join(".");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  const body = [
    "---", `title: ${TITLES[name]}`, "---", "",
    `# ${TITLES[name]}`, "",
    chartDescription(chartYaml), "",
    "```bash",
    `helm install ${name.replace("wso2-", "")} oci://${CHART_REGISTRY}/${name} \\`,
    "  --namespace <namespace> --create-namespace \\",
    "  --values my-values.yaml",
    "```", "",
  ];
  for (const key of [...groups.keys()].sort()) {
    body.push(`## ${key}`, "");
    body.push("| Parameter | Description | Type | Default |", "|---|---|---|---|");
    for (const r of groups.get(key)) {
      body.push(`| \`${r.dotted}\` | ${cell(r.description)} | ${r.type ?? ""} | ${r.def} |`);
    }
    body.push("");
  }
  const text = body.join("\n") + "\n";
  const target = path.join(OUT, `${name}.mdx`);
  if (CHECK) {
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== text) stale.push(name);
  } else {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(target, text);
  }
  index.push({ name, title: TITLES[name], desc: chartDescription(chartYaml), count: rows.length });
  console.log(`${name.padEnd(46)} ${String(rows.length).padStart(4)} parameters, ${groups.size} groups`);
}

const idx = [
  "---", "title: Helm Charts", "---", "",
  "# Helm Charts", "",
  "WSO2 Agent Manager is installed as a set of Helm charts: one core chart plus five",
  "extension charts that add gateway, identity, evaluation, observability, and platform",
  "resources on top of OpenChoreo. Each page below is the values reference for one chart,",
  "generated from that chart's `values.schema.json`.", "",
  "| Chart | Purpose | Parameters |", "|---|---|---|",
  ...index.map((c) => `| [${c.title}](./${c.name}.mdx) | ${cell(c.desc)} | ${c.count} |`),
  "",
  "Because the pages are generated from the schema, `helm lint` and this reference cannot",
  "disagree: a value the schema rejects is a value documented here as the wrong type.", "",
  "For installation walkthroughs rather than value tables, see the",
  "[Installation guides](../../guides/on-k3d.mdx).", "",
].join("\n");
const idxPath = path.join(OUT, "index.mdx");
if (CHECK) {
  if (!fs.existsSync(idxPath) || fs.readFileSync(idxPath, "utf8") !== idx) stale.push("index");
} else {
  fs.writeFileSync(idxPath, idx);
}

if (CHECK && stale.length) {
  console.error(`\nOut of date: ${stale.join(", ")}\nRun: node scripts/gen-helm-reference.mjs`);
  process.exit(1);
}
console.log(CHECK ? "\nAll helm reference pages are up to date." : "\nWrote helm chart reference pages.");
