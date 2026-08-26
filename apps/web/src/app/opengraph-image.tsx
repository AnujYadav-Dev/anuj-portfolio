import { ImageResponse } from 'next/og';

export const alt = 'Anuj Yadav — Full-Stack Engineer & Architect';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';


export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(255, 140, 66, 0.2) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(255, 140, 66, 0.1) 0%, transparent 40%)',
          padding: '64px',
          fontFamily: 'sans-serif',
          color: '#fafafa',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Header */}
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
                width: '14px',
                height: '14px',
                borderRadius: '7px',
                backgroundColor: '#ff8c42',
                boxShadow: '0 0 14px #ff8c42',
              }}
            />
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '0.15em',
                color: '#ffffff',
              }}
            >
              ANUJ.Y // PORTFOLIO
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 140, 66, 0.12)',
              border: '1px solid rgba(255, 140, 66, 0.35)',
              color: '#ff8c42',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            AVAILABLE FOR OPPORTUNITIES
          </div>
        </div>

        {/* Center Main Headline */}
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
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Full-Stack Developer &amp; Systems Architect
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Crafting high-performance web applications, scalable distributed systems, and elegant user experiences.
          </p>
        </div>

        {/* Footer */}
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
                width: '44px',
                height: '44px',
                borderRadius: '22px',
                backgroundColor: '#18181b',
                border: '1px solid #ff8c42',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                color: '#ff8c42',
              }}
            >
              AY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                Anuj Yadav
              </span>
              <span style={{ fontSize: '13px', color: '#71717a' }}>
                Next.js • TypeScript • Node.js • PostgreSQL
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                fontSize: '16px',
                color: '#ff8c42',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              anujyadav.dev
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
