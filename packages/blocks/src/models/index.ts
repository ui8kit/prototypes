import type { ContentModel } from "../model/types";
import { heroModel } from "./hero";
import { teamModel } from "./team";

export { heroModel, type HeroContent } from "./hero";
export { teamModel, type TeamContent, type TeamMember } from "./team";

/** Every content model, keyed `id@version`. Blocks reference these; the count grows with content models, not variants. */
export const MODELS: readonly ContentModel[] = [heroModel, teamModel];
export const modelKey = (m: Pick<ContentModel, "id" | "version">): string => `${m.id}@${m.version}`;
export const MODEL_BY_KEY: Readonly<Record<string, ContentModel>> = Object.fromEntries(MODELS.map((m) => [modelKey(m), m]));
