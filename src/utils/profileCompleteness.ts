export type ProfileField = 'college' | 'major' | 'grade';

const UNSET_SENTINELS = new Set([
  '',
  '未设置',
  '未設置',
  '未设定',
  '未設定',
  '未填写',
  '未填寫',
  '暂无',
  '暂无信息',
  'null',
  'undefined',
]);

function normalize(v: unknown): string {
  if (v == null) return '';
  return String(v).trim();
}

export function isProfileFieldUnset(v: unknown): boolean {
  const s = normalize(v);
  if (!s) return true;
  return UNSET_SENTINELS.has(s);
}

export function getMissingProfileFields(profile: Partial<Record<ProfileField, unknown>>): ProfileField[] {
  const missing: ProfileField[] = [];
  if (isProfileFieldUnset(profile.college)) missing.push('college');
  if (isProfileFieldUnset(profile.grade)) missing.push('grade');
  if (isProfileFieldUnset(profile.major)) missing.push('major');
  return missing;
}

export function formatMissingProfileFieldsCN(fields: ProfileField[]): string {
  const label: Record<ProfileField, string> = {
    college: '学院',
    major: '专业',
    grade: '年级',
  };
  return fields.map((f) => label[f]).join('、');
}
