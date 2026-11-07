import { unstable_cache } from 'next/cache';
import rawData from '@data';
import { getSupabaseServerClient } from './supabase-server';

const defaultSiteData = ((rawData as { default?: unknown }).default || rawData) as typeof rawData;
export type SiteContent = typeof defaultSiteData;

function isPlainObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep fills keys from defaultVal into overrideVal.
 * Arrays from overrideVal are taken as-is per PRD §6.1.
 * Recursive for objects.
 */
export function deepFill<T>(defaultVal: T, overrideVal: unknown): T {
  if (overrideVal === undefined || overrideVal === null) {
    return defaultVal;
  }

  if (Array.isArray(defaultVal)) {
    return Array.isArray(overrideVal) ? (overrideVal as unknown as T) : defaultVal;
  }

  if (isPlainObject(defaultVal)) {
    if (!isPlainObject(overrideVal)) {
      return defaultVal;
    }

    const result: Record<string, unknown> = { ...overrideVal };

    for (const key of Object.keys(defaultVal)) {
      if (!(key in overrideVal) || overrideVal[key] === undefined) {
        result[key] = (defaultVal as Record<string, unknown>)[key];
      } else {
        result[key] = deepFill(
          (defaultVal as Record<string, unknown>)[key],
          overrideVal[key]
        );
      }
    }

    return result as unknown as T;
  }

  return overrideVal as unknown as T;
}

async function fetchMergedContent(): Promise<SiteContent> {
  // Always start with a shallow copy of sections from data.js
  const defaultSections = defaultSiteData as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...defaultSections };

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return defaultSiteData as SiteContent;
    }

    const { data: rows, error } = await supabase
      .from('site_content')
      .select('section, value');

    if (error || !rows) {
      return defaultSiteData as SiteContent;
    }

    for (const row of rows) {
      const section = row.section;
      if (section in defaultSections) {
        merged[section] = deepFill(defaultSections[section], row.value);
      } else {
        merged[section] = row.value;
      }
    }

    return merged as unknown as SiteContent;
  } catch {
    // If Supabase is missing, unreachable, or throws, silently fall back to data.js
    return defaultSiteData as SiteContent;
  }
}

export const getContent = unstable_cache(
  async (): Promise<SiteContent> => {
    return fetchMergedContent();
  },
  ['site-content'],
  { tags: ['site-content'] }
);

export default getContent;
