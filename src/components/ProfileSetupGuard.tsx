import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, Tag } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { API } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { formatMissingProfileFieldsCN, getMissingProfileFields } from '../utils/profileCompleteness';

type Props = {
  /**
   * Where to send the user to complete profile fields.
   * Typically `/user/profile` or `/admin/profile`.
   */
  profilePath: string;
};

const sessionKey = (userId: string) => `profile-setup-prompted:${userId}`;

export default function ProfileSetupGuard({ profilePath }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasHydrated, token, user, setUserProfile } = useAuthStore();

  const fetchedForUserIdRef = useRef<string | null>(null);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || !token || !user) return;
    if (user.role !== 'user') return;
    if (location.pathname === profilePath) return;

    // Avoid spamming on every route change within a session.
    try {
      if (sessionStorage.getItem(sessionKey(user.id)) === '1') return;
    } catch {
      // Ignore storage failures (private mode, etc.)
    }

    if (checkingRef.current) return;
    checkingRef.current = true;

    let cancelled = false;

    (async () => {
      let profile: any | null = null;

      // Ensure we have up-to-date profile fields (college/major/grade).
      if (fetchedForUserIdRef.current !== user.id) {
        try {
          profile = await API.User.getCurrentUser();
          if (cancelled) return;
          setUserProfile(profile);
        } catch {
          // If we can't load the profile, don't show a possibly-wrong prompt.
          profile = null;
        } finally {
          fetchedForUserIdRef.current = user.id;
        }
      }

      const missing = getMissingProfileFields(profile ?? (user as any));
      if (missing.length === 0) return;
      if (cancelled) return;

      try {
        sessionStorage.setItem(sessionKey(user.id), '1');
      } catch {
        // Ignore
      }

      const missingText = formatMissingProfileFieldsCN(missing);
      const label: Record<string, string> = {
        college: '学院',
        grade: '年级',
        major: '专业',
      };

      Modal.confirm({
        centered: true,
        width: 460,
        icon: null,
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ExclamationCircleFilled style={{ color: '#FA8C16' }} />
            <span style={{ color: '#AD4E00' }}>完善个人信息</span>
          </div>
        ),
        content: (
          <div className="mt-2 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center">
            <div className="text-[15px] font-medium text-orange-800">为方便统计与录入，请先补全以下信息</div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {missing.map((f) => (
                <Tag key={f} color="orange" style={{ marginInlineEnd: 0 }}>
                  {label[f] ?? f}
                </Tag>
              ))}
            </div>
            <div className="mt-3 text-sm text-orange-700">
              当前缺少：{missingText}。填写完成后，相关统计与信息录入会更准确。
            </div>
            <div className="mt-1 text-xs text-orange-600/80">
              你也可以稍后在“个人信息”里完善。
            </div>
          </div>
        ),
        okText: '去完善',
        cancelText: '稍后再说',
        okButtonProps: { style: { background: '#FA8C16', borderColor: '#FA8C16' } },
        onOk: () => navigate(`${profilePath}?edit=1`),
      });
    })()
      .catch(() => {})
      .finally(() => {
        checkingRef.current = false;
      });

    return () => {
      cancelled = true;
      checkingRef.current = false;
    };
  }, [hasHydrated, token, user, location.pathname, profilePath, navigate, setUserProfile]);

  return null;
}
