import { ImageResponse } from 'next/og';
import { serverApi } from '@/lib/server-api';

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await serverApi.getPageBySlug(slug);

  const title = page?.title || `/${slug}`;
  const description = page?.seoDescription || `View ${title} on Anuj Yadav's platform.`;

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#09090b',
        backgroundImage:
          'radial-gradient(circle at 85% 15%, rgba(255, 140, 66, 0.22) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(255, 140, 66, 0.08) 0%, transparent 40%)',
        padding: '64px',
        fontFamily: 'sans-serif',
        color: '#fafafa',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '6px',
              backgroundColor: '#ff8c42',
              boxShadow: '0 0 12px #ff8c42',
            }}
          />
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.15em',
              color: '#ffffff',
            }}
          >
            ANUJ.Y // PLATFORM
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 140, 66, 0.12)',
            border: '1px solid rgba(255, 140, 66, 0.35)',
            color: '#ff8c42',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          PAGE
        </div>
      </div>

      {/* Center Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '1000px',
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
      >
        <h1
          style={{
            fontSize: title.length > 40 ? '48px' : '56px',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              fontSize: '22px',
              color: '#a1a1aa',
              lineHeight: 1.4,
              margin: 0,
              maxHeight: '66px',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              backgroundColor: '#18181b',
              border: '1px solid #ff8c42',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px',
              color: '#ff8c42',
            }}
          >
            AY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Anuj Yadav</span>
            <span style={{ fontSize: '13px', color: '#71717a' }}>
              Full-Stack Engineer &amp; Architect
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span
            style={{
              fontSize: '14px',
              color: '#ff8c42',
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            anujyadav.dev/{slug}
          </span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
