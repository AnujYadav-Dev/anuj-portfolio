'use client';

import * as React from 'react';
import type { AdminGeoMapItem } from '@portfolio/shared';
import worldPixelData from '@/data/worldPixelData.json';
import { Globe, Sparkles, Plus, Minus, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface GeoWorldMapProps {
  data: AdminGeoMapItem[];
  isLoading?: boolean;
}

// Convert lon/lat to canvas coordinate [0..1000, 0..500]
function projectCoordinates(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return [x, y];
}

// Pre-project all dot coordinates once for sub-millisecond 60fps renders
const PRE_PROJECTED_DOTS = (worldPixelData as Array<[number, number, string]>).map(
  ([lon, lat, name]) => {
    const [x, y] = projectCoordinates(lon, lat);
    return { x, y, name };
  },
);

const ISO_TO_FULL_NAME: Record<string, string> = {
  US: 'United States',
  USA: 'United States',
  IN: 'India',
  IND: 'India',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  CA: 'Canada',
  CAN: 'Canada',
  DE: 'Germany',
  DEU: 'Germany',
  FR: 'France',
  FRA: 'France',
  AU: 'Australia',
  AUS: 'Australia',
  BR: 'Brazil',
  BRA: 'Brazil',
  JP: 'Japan',
  JPN: 'Japan',
  NL: 'Netherlands',
  NLD: 'Netherlands',
  SG: 'Singapore',
  SGP: 'Singapore',
  SE: 'Sweden',
  SWE: 'Sweden',
  CH: 'Switzerland',
  CHE: 'Switzerland',
  ES: 'Spain',
  ESP: 'Spain',
  IT: 'Italy',
  ITA: 'Italy',
  AE: 'United Arab Emirates',
  ARE: 'United Arab Emirates',
  CN: 'China',
  CHN: 'China',
  RU: 'Russia',
  RUS: 'Russia',
  PL: 'Poland',
  POL: 'Poland',
  IE: 'Ireland',
  IRL: 'Ireland',
  KR: 'South Korea',
  KOR: 'South Korea',
  NZ: 'New Zealand',
  NZL: 'New Zealand',
  ZA: 'South Africa',
  ZAF: 'South Africa',
};

interface PixelCanvasProps {
  activeCountryMap: Map<string, AdminGeoMapItem>;
  activeCountryCenters: Map<string, { x: number; y: number; count: number }>;
  hoveredCountry: string | null;
  setHoveredCountry: (c: string | null) => void;
  onOpenFullscreen?: () => void;
  heightClass?: string;
}

function PixelCanvas({
  activeCountryMap,
  activeCountryCenters,
  hoveredCountry,
  setHoveredCountry,
  onOpenFullscreen,
  heightClass = 'h-72 sm:h-96 md:h-[420px]',
}: PixelCanvasProps) {
  const { resolvedTheme } = useTheme();
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Pan & Zoom state
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);

  // Render Canvas with Dynamic Theme Palette
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;

      const currentIsLight =
        document.documentElement.classList.contains('light') || resolvedTheme === 'light';

      const themeColors = currentIsLight
        ? {
            grid: 'rgba(0, 0, 0, 0.06)',
            inactiveDot: '#9c9285',
            activeDot: '#ea580c',
            activeShadow: '#ea580c',
            hoverDot: '#1c1917',
            hoverShadow: '#ea580c',
            pulseBase: '234, 88, 12',
            pulseCore: '#ea580c',
          }
        : {
            grid: '#18181f',
            inactiveDot: '#24242d',
            activeDot: '#ff8c42',
            activeShadow: '#ff8c42',
            hoverDot: '#ffffff',
            hoverShadow: '#ff8c42',
            pulseBase: '255, 140, 66',
            pulseCore: '#ff8c42',
          };

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      // Sync canvas pixel density
      if (canvas.width !== Math.round(displayWidth * dpr) || canvas.height !== Math.round(displayHeight * dpr)) {
        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Center and scale map to fill canvas nicely
      const cx = displayWidth / 2;
      const cy = displayHeight / 2;
      const baseScale = Math.min(displayWidth / 1000, displayHeight / 500) * 1.08;

      ctx.translate(cx + offset.x, cy + offset.y);
      ctx.scale(scale * baseScale, scale * baseScale);
      ctx.translate(-500, -250);

      // 1. Coordinate grid lines
      ctx.strokeStyle = themeColors.grid;
      ctx.lineWidth = 0.5 / (scale * baseScale);
      ctx.setLineDash([3, 5]);

      ctx.beginPath();
      ctx.moveTo(0, 250);
      ctx.lineTo(1000, 250);
      ctx.moveTo(500, 0);
      ctx.lineTo(500, 500);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw pixel map dots
      const dotRadius = Math.max(1.1, 1.8 / Math.sqrt(scale * baseScale));

      for (let i = 0; i < PRE_PROJECTED_DOTS.length; i++) {
        const dot = PRE_PROJECTED_DOTS[i];
        if (!dot) continue;
        const lowerName = dot.name.toLowerCase();
        const isActive = activeCountryMap.has(lowerName);
        const isHovered = hoveredCountry && hoveredCountry.toLowerCase() === lowerName;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, isHovered ? dotRadius * 1.5 : dotRadius, 0, Math.PI * 2);

        if (isHovered) {
          ctx.fillStyle = themeColors.hoverDot;
          ctx.shadowColor = themeColors.hoverShadow;
          ctx.shadowBlur = 8;
        } else if (isActive) {
          ctx.fillStyle = themeColors.activeDot;
          ctx.shadowColor = themeColors.activeShadow;
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = themeColors.inactiveDot;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      ctx.shadowBlur = 0;

      // 3. Draw active country glowing pulse radar rings
      activeCountryCenters.forEach((center) => {
        const pulseRadius = 8 + (Math.sin(pulseTime) + 1) * 8;
        const pulseOpacity = Math.max(0, 0.45 - (Math.sin(pulseTime) + 1) * 0.18);

        ctx.beginPath();
        ctx.arc(center.x, center.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${themeColors.pulseBase}, ${pulseOpacity})`;
        ctx.lineWidth = 1.6 / (scale * baseScale);
        ctx.stroke();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(center.x, center.y, 4 / Math.sqrt(scale * baseScale), 0, Math.PI * 2);
        ctx.fillStyle = themeColors.pulseCore;
        ctx.fill();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scale, offset, activeCountryMap, hoveredCountry, activeCountryCenters, resolvedTheme]);

  // Zoom helpers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.35, 8));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev / 1.35, 0.9);
      if (next <= 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Mouse wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setScale((prevScale) => {
      const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.9), 8);
      if (newScale <= 1) {
        setOffset({ x: 0, y: 0 });
        return 1;
      }
      const ratio = newScale / prevScale;
      setOffset((prevOffset) => ({
        x: (mouseX - cx) - ((mouseX - cx) - prevOffset.x) * ratio,
        y: (mouseY - cy) - ((mouseY - cy) - prevOffset.y) * ratio,
      }));
      return newScale;
    });
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
      return;
    }

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const baseScale = Math.min(rect.width / 1000, rect.height / 500) * 1.08;
    const currentScale = scale * baseScale;

    // Convert screen coordinate to 1000x500 map space
    const normX = (mouseX - (cx + offset.x)) / currentScale + 500;
    const normY = (mouseY - (cy + offset.y)) / currentScale + 250;

    let closestCountry: string | null = null;
    let minDistance = 16 / scale;

    for (let i = 0; i < PRE_PROJECTED_DOTS.length; i += 3) {
      const dot = PRE_PROJECTED_DOTS[i];
      if (!dot) continue;
      const dx = dot.x - normX;
      const dy = dot.y - normY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance) {
        minDistance = dist;
        closestCountry = dot.name;
      }
    }

    if (closestCountry) {
      setHoveredCountry(closestCountry);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setHoveredCountry(null);
      setTooltipPos(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const hoveredData = hoveredCountry
    ? activeCountryMap.get(hoveredCountry.toLowerCase()) || {
        countryName: hoveredCountry,
        countryCode: '',
        visitorCount: 0,
        percentage: 0,
      }
    : null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full ${heightClass} bg-surface-muted/60 rounded-md border border-border/80 overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors duration-300`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Floating Zoom & Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-surface/90 backdrop-blur-xs p-1 rounded-md border border-border shadow-md z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted hover:text-foreground"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted hover:text-foreground"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted hover:text-foreground"
          onClick={handleReset}
          title="Reset View"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        {onOpenFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted hover:text-accent ml-0.5"
            onClick={onOpenFullscreen}
            title="Expand to Fullscreen Popout"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Floating Cursor Tooltip */}
      {tooltipPos && hoveredData && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full mb-2 bg-surface/95 backdrop-blur-md px-3 py-1.5 rounded-md border border-accent/40 shadow-xl text-xs font-mono whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{hoveredData.countryName}</span>
            {hoveredData.visitorCount > 0 ? (
              <>
                <span className="text-accent font-semibold">• {hoveredData.visitorCount} visits</span>
                <span className="text-muted">({hoveredData.percentage}%)</span>
              </>
            ) : (
              <span className="text-muted">• 0 visits</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GeoWorldMap({ data, isLoading }: GeoWorldMapProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hoveredCountry, setHoveredCountry] = React.useState<string | null>(null);

  // Fast country lookup map (lowercase name/code -> AdminGeoMapItem)
  const activeCountryMap = React.useMemo(() => {
    const map = new Map<string, AdminGeoMapItem>();
    for (const item of data) {
      if (item.countryName) {
        map.set(item.countryName.toLowerCase(), item);
      }
      if (item.countryCode) {
        const upper = item.countryCode.toUpperCase();
        map.set(item.countryCode.toLowerCase(), item);
        const resolved = ISO_TO_FULL_NAME[upper];
        if (resolved) {
          map.set(resolved.toLowerCase(), item);
        }
      }
    }
    return map;
  }, [data]);

  const maxCount = React.useMemo(() => {
    return Math.max(...data.map((d) => d.visitorCount), 1);
  }, [data]);

  // Center coordinates of active countries for radar pulse animations
  const activeCountryCenters = React.useMemo(() => {
    const centers = new Map<string, { x: number; y: number; count: number }>();
    const countryDots = new Map<string, Array<{ x: number; y: number }>>();

    for (const dot of PRE_PROJECTED_DOTS) {
      const lower = dot.name.toLowerCase();
      if (activeCountryMap.has(lower)) {
        if (!countryDots.has(lower)) countryDots.set(lower, []);
        countryDots.get(lower)!.push({ x: dot.x, y: dot.y });
      }
    }

    countryDots.forEach((dots, lowerName) => {
      const avgX = dots.reduce((sum, d) => sum + d.x, 0) / dots.length;
      const avgY = dots.reduce((sum, d) => sum + d.y, 0) / dots.length;
      const item = activeCountryMap.get(lowerName);
      centers.set(lowerName, { x: avgX, y: avgY, count: item?.visitorCount || 1 });
    });

    return centers;
  }, [activeCountryMap]);

  return (
    <div className="relative rounded-md border border-border bg-surface p-5 text-foreground flex flex-col gap-4 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
            Global Geographic Distribution & Ultra-Pixel Telemetry
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-accent" />
            {data.length} {data.length === 1 ? 'country' : 'countries'} active
          </span>
          {/* <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs font-mono text-muted hover:text-accent hover:border-accent flex items-center gap-1.5 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
            title="Open in full popup screen"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Expand Map</span>
          </Button> */}
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 w-full flex items-center justify-center text-xs font-mono text-muted animate-pulse">
          Aggregating global visitor telemetry dots...
        </div>
      ) : (
        <>
          {/* Main Card Canvas */}
          <PixelCanvas
            activeCountryMap={activeCountryMap}
            activeCountryCenters={activeCountryCenters}
            hoveredCountry={hoveredCountry}
            setHoveredCountry={setHoveredCountry}
            onOpenFullscreen={() => setIsModalOpen(true)}
            heightClass="h-72 sm:h-96 md:h-[420px]"
          />

          {/* Country Distribution Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {data.slice(0, 12).map((item) => {
              const code = (item.countryCode || '').toUpperCase();
              const intensity = Math.min(100, Math.max(10, Math.round((item.visitorCount / maxCount) * 100)));
              const isSelected =
                hoveredCountry &&
                (hoveredCountry.toLowerCase() === item.countryName.toLowerCase() ||
                  hoveredCountry.toLowerCase() === code.toLowerCase());

              return (
                <div
                  key={code}
                  onMouseEnter={() => setHoveredCountry(item.countryName)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  className={`group relative flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-surface-muted border-accent shadow-md'
                      : 'border-border/60 bg-surface-muted/40 hover:bg-surface-muted hover:border-accent/40'
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                        {item.countryName}
                      </span>
                    </div>
                    <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${intensity}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-foreground block">{item.visitorCount}</span>
                    <span className="block font-mono text-[10px] text-muted">{item.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Dynamic, Resizable & Expandable Fullscreen Popout Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          size="5xl"
          resizable={true}
          expandable={true}
          className="max-h-[92vh] flex flex-col p-3 sm:p-4 overflow-hidden [&>div.overflow-y-auto]:pr-0 [&>div.overflow-y-auto]:mr-0 [&>div.overflow-y-auto]:overflow-hidden"
        >
          <DialogTitle className="sr-only">
            Global Geographic Distribution & Ultra-Pixel Telemetry
          </DialogTitle>

          {/* Full-Bleed Expanded Canvas in Modal — Pure Map Only */}
          <div className="w-full h-[75vh] sm:h-[82vh] flex-1">
            <PixelCanvas
              activeCountryMap={activeCountryMap}
              activeCountryCenters={activeCountryCenters}
              hoveredCountry={hoveredCountry}
              setHoveredCountry={setHoveredCountry}
              heightClass="h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
