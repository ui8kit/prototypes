
import { printGlobalUsage } from './usage.ts';
import { runInit } from '../commands/init.ts';
import { runLint } from '../commands/lint.ts';
import { runPolicyReview } from '../commands/policy-review.ts';
import { runValidateAria } from '../commands/validate-aria.ts';
import { runValidateGrid } from '../commands/validate-grid.ts';
import { runValidatePatterns } from '../commands/validate-patterns.ts';
export function runCommand(args: CliArgs): Promise<number> {
  switch (args.command) {
    case 'help':
      console.log(printGlobalUsage());
      return Promise.resolve(0);
    case 'init':
      return runInit(args);
    case 'lint':
      return runLint(args);
    case 'validate-grid':
      return runValidateGrid(args);
    case 'validate-patterns':
      return runValidatePatterns(args);
    case 'validate-aria':
      return runValidateAria(args);
    case 'policy-review':
      return runPolicyReview(args);
    default:
      return Promise.resolve(2);
  }
}
