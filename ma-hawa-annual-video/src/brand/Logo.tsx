// The real Ma Hawa logo (config/video.json → brand.logo, an SVG in /assets).
// It is read once at render start (delayRender) and drawn as live SVG shapes, so it can be shown in its
// original colours or recoloured (white on the team tees, hologram blue in the war room, …).
// The file stays out of git (public repo); without it every logo falls back to a MA HAWA wordmark.
import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import videoJson from "../../config/video.json";
import { ACCENT, FONT, INK } from "../theme";

type Shape = { tag: string; attrs: Record<string, string> };
type Part = { x: number; y: number; w: number; h: number; viewBox: string; shapes: Shape[] };
type LogoData = { box: [number, number, number, number]; parts: Part[] };
export type LogoVariant = "full" | "mark" | "word";

const LOGO_FILE: string | null = (videoJson as { brand?: { logo?: string | null } }).brand?.logo ?? null;
let LOGO: LogoData | null = null;

const num = (v: string | null, d = 0) => (v == null || v === "" ? d : parseFloat(v));
const toCamel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

const parseLogo = (txt: string): LogoData => {
  const doc = new DOMParser().parseFromString(txt, "image/svg+xml");
  const root = doc.documentElement;
  const vb = (root.getAttribute("viewBox") ?? `0 0 ${num(root.getAttribute("width"), 1000)} ${num(root.getAttribute("height"), 300)}`).split(/[\s,]+/).map(Number) as [number, number, number, number];
  const grab = (el: Element): Shape[] =>
    Array.from(el.querySelectorAll("path,polygon,rect,circle,ellipse")).map((n) => ({
      tag: n.tagName.toLowerCase(),
      attrs: Object.fromEntries(Array.from(n.attributes).map((a) => [toCamel(a.name), a.value])),
    }));
  const subs = Array.from(root.children).filter((e) => e.tagName.toLowerCase() === "svg");
  const parts: Part[] = subs.length
    ? subs.map((el) => ({ x: num(el.getAttribute("x")), y: num(el.getAttribute("y")), w: num(el.getAttribute("width"), vb[2]), h: num(el.getAttribute("height"), vb[3]), viewBox: el.getAttribute("viewBox") ?? vb.join(" "), shapes: grab(el) }))
    : [{ x: vb[0], y: vb[1], w: vb[2], h: vb[3], viewBox: vb.join(" "), shapes: grab(root) }];
  return { box: vb, parts };
};

/** call once at the top of a composition: holds the render until the logo is parsed */
export const useBrandLogo = () => {
  const [, setTick] = useState(0);
  const [handle] = useState(() => (LOGO || !LOGO_FILE ? null : delayRender("Loading the Ma Hawa logo")));
  useEffect(() => {
    if (!handle || !LOGO_FILE) return;
    fetch(staticFile(LOGO_FILE))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`logo ${r.status}`))))
      .then((t) => {
        LOGO = parseLogo(t);
        setTick((x) => x + 1);
      })
      .catch((e) => console.warn("Ma Hawa logo not loaded — using the wordmark", e))
      .finally(() => continueRender(handle));
  }, [handle]);
};

const boxOf = (l: LogoData, v: LogoVariant): [number, number, number, number] => {
  if (v === "full" || l.parts.length < 2) return l.box;
  const p = v === "mark" ? l.parts[0] : l.parts[1];
  return [p.x, p.y, p.w, p.h];
};

/** aspect ratio (w/h) of a logo variant */
export const logoAspect = (v: LogoVariant = "full") => {
  if (!LOGO) return v === "mark" ? 1 : 3.4;
  const b = boxOf(LOGO, v);
  return b[2] / b[3];
};

/**
 * The logo as an SVG element (use inside an <svg>). `width` sets the size; height follows the aspect.
 * color: recolour everything; markColor / wordColor: recolour one half.
 */
export const LogoSvg: React.FC<{ x?: number; y?: number; width: number; variant?: LogoVariant; color?: string; markColor?: string; wordColor?: string; opacity?: number; anchor?: "start" | "middle" }> = ({
  x = 0,
  y = 0,
  width,
  variant = "full",
  color,
  markColor,
  wordColor,
  opacity = 1,
  anchor = "start",
}) => {
  const h = width / logoAspect(variant);
  const left = anchor === "middle" ? x - width / 2 : x;
  const top = anchor === "middle" ? y - h / 2 : y;
  if (!LOGO) {
    // fallback wordmark (no logo file configured)
    return (
      <g opacity={opacity}>
        <text x={left + width / 2} y={top + h * 0.72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.62} fill={color ?? INK}>
          MA <tspan fill={color ?? ACCENT}>HAWA</tspan>
        </text>
      </g>
    );
  }
  const b = boxOf(LOGO, variant);
  const parts = LOGO.parts.length < 2 || variant === "full" ? LOGO.parts.map((p, i) => ({ p, i })) : [{ p: LOGO.parts[variant === "mark" ? 0 : 1], i: variant === "mark" ? 0 : 1 }];
  return (
    <svg x={left} y={top} width={width} height={h} viewBox={b.join(" ")} overflow="visible" opacity={opacity}>
      {parts.map(({ p, i }) => (
        <svg key={i} x={p.x} y={p.y} width={p.w} height={p.h} viewBox={p.viewBox} overflow="visible">
          {p.shapes.map((s, k) => {
            const fill = color ?? (i === 0 && LOGO!.parts.length > 1 ? markColor : wordColor) ?? s.attrs.fill;
            return React.createElement(s.tag, { key: k, ...s.attrs, fill });
          })}
        </svg>
      ))}
    </svg>
  );
};

/** the logo in an HTML layout (centred in its own svg box) */
export const LogoBlock: React.FC<{ width: number; variant?: LogoVariant; color?: string; markColor?: string; wordColor?: string; style?: React.CSSProperties }> = ({ width, variant = "full", style, ...rest }) => {
  const h = width / logoAspect(variant);
  return (
    <svg width={width} height={h} style={{ overflow: "visible", display: "block", ...style }}>
      <LogoSvg width={width} variant={variant} {...rest} />
    </svg>
  );
};
