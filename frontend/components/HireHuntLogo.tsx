// HireHunt SVG Logo — adapted for dark bg (white strokes/fills)
// Pass variant="dark" for use on light backgrounds (uses black fills)

interface HireHuntLogoProps {
  showText?: boolean;
  size?: number; // icon height in px
  variant?: 'light' | 'dark'; // light = white fills (dark bg), dark = black fills (light bg)
}

export default function HireHuntLogo({ showText = true, size = 36, variant = 'light' }: HireHuntLogoProps) {
  const color = variant === 'light' ? '#FFFFFF' : '#000000';
  const iconSize = size;
  const textSize = Math.round(iconSize * 0.55);
  const totalWidth = showText ? iconSize + 8 + Math.round(iconSize * 2.6) : iconSize;

  return (
    <svg
      width={totalWidth}
      height={iconSize}
      viewBox={`0 0 ${totalWidth} ${iconSize}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="HireHunt logo"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <title>HireHunt</title>

      {/* Icon box */}
      <rect
        x="1.5"
        y="1.5"
        width={iconSize - 3}
        height={iconSize - 3}
        rx={Math.round(iconSize * 0.18)}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      {/* H letter */}
      <text
        x={iconSize / 2}
        y={iconSize * 0.66}
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize={Math.round(iconSize * 0.52)}
        fontWeight="600"
        fill={color}
      >
        H
      </text>
      {/* Small accent dot */}
      <rect
        x={iconSize - Math.round(iconSize * 0.26)}
        y={iconSize - Math.round(iconSize * 0.26)}
        width={Math.round(iconSize * 0.16)}
        height={Math.round(iconSize * 0.16)}
        fill={color}
      />

      {/* Brand text */}
      {showText && (
        <text
          x={iconSize + 8}
          y={iconSize * 0.72}
          fontFamily="Helvetica, Arial, sans-serif"
          fontSize={textSize}
          fontWeight="600"
          fill={color}
        >
          HireHunt
        </text>
      )}
    </svg>
  );
}
