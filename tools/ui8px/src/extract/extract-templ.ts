import { extractHtmlClasses } from './extract-html.ts';

export function extractTemplClasses(file: string, content: string): ClassOccurrence[] {
  return extractHtmlClasses(file, content);
}
