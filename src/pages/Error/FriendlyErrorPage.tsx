import React, { useMemo, useState } from 'react';
import { Alert, Button, Collapse, Space, Typography } from 'antd';
import type { ResultStatusType } from 'antd/es/result';
import { AlertTriangle, Bug, CloudOff, SearchX } from 'lucide-react';
import './errorPage.css';

type FriendlyErrorPageProps = {
  status?: ResultStatusType;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  errorMessage?: string;
  errorStack?: string;
  onBack?: () => void;
  onHome?: () => void;
  onReload?: () => void;
};

const { Paragraph, Text } = Typography;

function clipText(value: string, max = 240) {
  const v = value.trim();
  if (v.length <= max) return v;
  return `${v.slice(0, max)}...`;
}

function SketchIllustration({
  variant,
}: {
  variant: 'notfound' | 'offline' | 'bug' | 'alert';
}) {
  const palette =
    variant === 'notfound'
      ? { ink: '#334155', accent: '#0ea5e9' }
      : variant === 'offline'
        ? { ink: '#334155', accent: '#6366f1' }
        : variant === 'bug'
          ? { ink: '#334155', accent: '#f472b6' }
          : { ink: '#334155', accent: '#ef4444' };

  const Icon =
    variant === 'notfound' ? SearchX : variant === 'offline' ? CloudOff : variant === 'bug' ? Bug : AlertTriangle;

  return (
    <div className="error-illus" aria-hidden="true">
      <svg viewBox="0 0 520 360" width="100%" height="auto">
        <defs>
          {/* Roughen the strokes slightly for a hand-drawn feel */}
          <filter id="roughen">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" />
            <feDisplacementMap in="SourceGraphic" scale="0.8" />
          </filter>
          <linearGradient id="blob" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor={`${palette.accent}`} stopOpacity="0.22" />
            <stop offset="1" stopColor={`${palette.accent}`} stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* soft blob background */}
        <path
          d="M94 204 C70 164 82 108 124 84 C164 62 224 78 250 110 C282 150 280 210 246 244 C208 282 128 274 94 204 Z"
          fill="url(#blob)"
        />
        <path
          d="M310 84 C352 52 412 64 438 100 C468 144 452 210 408 238 C362 268 296 258 274 214 C250 170 270 114 310 84 Z"
          fill="url(#blob)"
          opacity="0.7"
        />

        {/* scribble ring */}
        <path
          className="scribble-path"
          filter="url(#roughen)"
          d="M260 78 C318 78 368 116 384 168 C400 222 364 280 304 296 C242 314 170 290 146 230 C120 168 156 96 226 82 C238 80 248 78 260 78 Z"
          fill="none"
          stroke={palette.ink}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="scribble-path"
          filter="url(#roughen)"
          d="M260 92 C312 92 354 126 368 170 C382 214 352 264 298 278 C244 294 184 272 164 220 C142 166 174 110 234 98 C242 96 250 92 260 92 Z"
          fill="none"
          stroke={palette.accent}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* tiny doodles */}
        <g filter="url(#roughen)" opacity="0.9">
          <path
            className="scribble-path"
            d="M96 112 C118 106 136 92 144 72 C152 94 170 108 196 112 C170 118 152 132 144 156 C136 132 118 118 96 112 Z"
            fill="rgba(255,255,255,0.8)"
            stroke={palette.accent}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            className="scribble-path"
            d="M406 258 C420 254 430 246 434 234 C440 246 450 254 466 258 C450 262 440 270 434 286 C430 270 420 262 406 258 Z"
            fill="rgba(255,255,255,0.75)"
            stroke={palette.accent}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="spark"
          style={{
            width: 92,
            height: 92,
            borderRadius: 26,
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 12px 22px rgba(2, 6, 23, 0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: palette.ink,
          }}
        >
          <Icon size={46} strokeWidth={2.3} />
        </div>
      </div>
    </div>
  );
}

export default function FriendlyErrorPage({
  status = 'error',
  title = '页面出了点问题',
  subtitle = '别担心，试试刷新或返回继续使用。',
  errorMessage,
  errorStack,
  onBack,
  onHome,
  onReload,
}: FriendlyErrorPageProps) {
  const [copied, setCopied] = useState(false);

  const details = useMemo(() => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const pieces = [
      `time: ${new Date().toISOString()}`,
      url ? `url: ${url}` : '',
      errorMessage ? `message: ${errorMessage}` : '',
      ua ? `ua: ${ua}` : '',
    ].filter(Boolean);
    return pieces.join('\n');
  }, [errorMessage]);

  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore copy failures (e.g. Safari permission / HTTP).
    }
  };

  const illustrationVariant =
    status === '404'
      ? 'notfound'
      : (errorMessage || '').toLowerCase().includes('importing a module script failed')
        ? 'offline'
        : status === 'error'
          ? 'alert'
          : 'bug';

  return (
    <div className="error-page-bg">
      <div className="error-card">
        <div className="error-hero">
          <div className="doodle-wrap">
            <SketchIllustration variant={illustrationVariant} />
          </div>

          <div>
            <h1 className="error-title">{title}</h1>
            <p className="error-subtitle">{subtitle}</p>

            {errorMessage ? (
              <Paragraph className="mt-3 mb-0" type="secondary">
                {clipText(errorMessage)}
              </Paragraph>
            ) : null}

            <div className="mt-4 error-actions">
              <Space wrap>
                <Button type="primary" onClick={onReload}>
                  刷新页面
                </Button>
                <Button onClick={onBack}>返回上一页</Button>
                <Button onClick={onHome}>回到首页</Button>
              </Space>
            </div>

            <div className="error-meta">
              <Text type="secondary">提示：多数情况下刷新即可恢复；若频繁出现请联系管理员。</Text>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Alert
            type="info"
            showIcon
            message="如果反复出现，请截图或复制诊断信息发给管理员。"
          />
        </div>

        <div className="mt-4">
          <Collapse
            size="small"
            items={[
              {
                key: 'details',
                label: '诊断信息',
                children: (
                  <div>
                    <Paragraph className="mb-2" type="secondary">
                      <Text code style={{ whiteSpace: 'pre-wrap' }}>
                        {details}
                      </Text>
                    </Paragraph>
                    <Space wrap>
                      <Button disabled={!canCopy} onClick={handleCopy}>
                        复制诊断信息
                      </Button>
                      {copied ? <Text type="success">已复制</Text> : null}
                    </Space>
                  </div>
                ),
              },
              ...(import.meta.env.DEV && errorStack
                ? [
                    {
                      key: 'stack',
                      label: '开发调试（Stack）',
                      children: (
                        <Paragraph className="mb-0">
                          <Text code style={{ whiteSpace: 'pre-wrap' }}>
                            {errorStack}
                          </Text>
                        </Paragraph>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>
    </div>
  );
}
