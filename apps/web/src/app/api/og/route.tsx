import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Anuj Yadav — Portfolio';
    const description =
      searchParams.get('description') ||
      'Full-Stack Developer, Systems Architect & Open Source Contributor';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || 'ARTICLE';
    const date = searchParams.get('date') || '';
    const readTime = searchParams.get('readTime') || '';

    const typeLabel = (category || type).toUpperCase();

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
            'radial-gradient(circle at 85% 15%, rgba(255, 140, 66, 0.18) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(255, 140, 66, 0.08) 0%, transparent 40%)',
          padding: '64px',
          fontFamily: 'sans-serif',
          color: '#fafafa',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Bar: Brand Watermark & Category Tag */}
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
              ANUJ.V // PORTFOLIO
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 140, 66, 0.12)',
              border: '1px solid rgba(255, 140, 66, 0.35)',
              color: '#ff8c42',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            {typeLabel}
          </div>
        </div>

        {/* Center Content: Title & Excerpt */}
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
              fontSize: title.length > 50 ? '48px' : '56px',
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

        {/* Bottom Bar: Author info & meta */}
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
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                Anuj Yadav
              </span>
              <span style={{ fontSize: '13px', color: '#71717a' }}>
                Full-Stack Engineer & Architect
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {readTime && (
              <span style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 500 }}>
                ⏱ {readTime}
              </span>
            )}
            {date && (
              <span style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 500 }}>📅 {date}</span>
            )}
            <span
              style={{
                fontSize: '14px',
                color: '#ff8c42',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              anujyadav.dev
            </span>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('[api/og] Error rendering OpenGraph image:', error);
    return new Response('Failed to generate OpenGraph image', { status: 500 });
  }
}
