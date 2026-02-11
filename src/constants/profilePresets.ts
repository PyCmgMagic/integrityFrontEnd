export type CollegeMajorPresets = Record<string, string[]>;

export const PROFILE_PRESETS_URL =
  (import.meta.env.VITE_PROFILE_PRESETS_URL as string | undefined) ||
  '';

export async function fetchCollegeMajorPresets(
  signal?: AbortSignal
): Promise<CollegeMajorPresets> {
  const response = await fetch(PROFILE_PRESETS_URL, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load profile presets: ${response.status}`);
  }

  const data = (await response.json()) as unknown;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  return data as CollegeMajorPresets;
}
