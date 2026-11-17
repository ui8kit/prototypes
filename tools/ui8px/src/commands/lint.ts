
import { printLintUsage } from '../cli/usage.ts';
import { extractClassesFromProject } from '../extract/scan-files.ts';
import { formatLintSummary } from '../lint/format-output.ts';
import { lintOccurrences } from '../lint/lint-classes.ts';
import { loadPolicy } from '../policy/load-policy.ts';
import { appendObserved, diagnosticsToObserved } from '../telemetry/observed.ts';
import { updateProposals } from '../telemetry/proposals.ts';
export function runLint(args: LintCliArgs): Promise<number> {
  if (args.help) {
    console.log(printLintUsage());
    return Promise.resolve(0);
  }

  const rootDir = process.cwd();
  const policy = loadPolicy(rootDir);
  const { files, occurrences } = extractClassesFromProject(args.paths, rootDir, { ignore: args.ignore });
  const result = lintOccurrences(policy, occurrences, files.length);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatLintSummary(result, args.verbose));
  }

  if (args.learn && result.diagnostics.length) {
    const events = diagnosticsToObserved(result.diagnostics);
    const observedPath = appendObserved(rootDir, events);
    const proposalsPath = updateProposals(rootDir, events);
    if (!args.json) {
      if (observedPath) {
        console.log(`Observed events saved to: ${observedPath}`);
      }
      if (proposalsPath) {
        console.log(`Proposals updated at: ${proposalsPath}`);
      }
    }
  }

  return Promise.resolve(result.diagnostics.length > 0 ? 1 : 0);
}
