/**
 * Brand glyphs for the social platforms we connect to. Sourced from
 * /public (the Next.js convention for static assets served at the site
 * root). No remote URLs.
 *
 * SVGs are loaded with `next/image` so the original internal fills
 * (Instagram gradient, Facebook brand blue) render exactly as designed.
 * "Both" composites the two via CSS background-image on a single element.
 */
import type { CSSProperties } from "react";
import Image from "next/image";

const INSTAGRAM_SRC = "/instagram_icon.svg";
const FACEBOOK_SRC = "/facebook_icon.svg";

function InstagramIcon({ className, width = 32, height = 32 }: { className?: string; width?: number; height?: number }) {
  return <Image src={INSTAGRAM_SRC} alt="Instagram" width={width} height={height} className={className} unoptimized />;
}

function FacebookIcon({ className, width = 32, height = 32 }: { className?: string; width?: number; height?: number }) {
  return <Image src={FACEBOOK_SRC} alt="Facebook" width={width} height={height} className={className} unoptimized />;
}

/**
 * "Both" platform glyph: Instagram icon stacked over Facebook icon using
 * two layered background images on a single element. Uses the same local
 * files as the standalone icons, with no extra HTTP requests.
 */
function BothIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  const layered: CSSProperties = {
    backgroundImage: `url('${FACEBOOK_SRC}'), url('${INSTAGRAM_SRC}')`,
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundSize: "60% 100%, 60% 100%",
    backgroundPosition: "left center, right center",
    ...style,
  };
  return (
    <div
      role="img"
      aria-label="Instagram and Facebook"
      className={className}
      style={layered}
    />
  );
}

export { InstagramIcon, FacebookIcon, BothIcon };
