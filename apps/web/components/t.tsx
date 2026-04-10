"use client";

import { useLang } from "../lib/i18n/context";
import type { Translations } from "../lib/i18n/translations";

type DotPath<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: DotPath<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

type TranslationKey = DotPath<Translations>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

/** Inline translated text. Use: <T k="nav.radar" /> */
export function T({ k }: { k: TranslationKey }) {
  const { t } = useLang();
  return <>{getNestedValue(t as unknown as Record<string, unknown>, k)}</>;
}

/** Hook to get a translated string by key path. */
export function useT(k: TranslationKey): string {
  const { t } = useLang();
  return getNestedValue(t as unknown as Record<string, unknown>, k);
}
