const SUIT = "#eef1f6";
const SUIT_SHADE = "#c9d0dd";
const HELMET = "#121a38";
const VISOR = "#1db8f2";
const ACCENT = "#0058ab";

function HelmetAndBody({
  visorContent,
  hideLegs = false,
}: {
  visorContent?: React.ReactNode;
  hideLegs?: boolean;
}) {
  return (
    <>
      {/* backpack */}
      <rect x="38" y="52" width="24" height="30" rx="6" fill={ACCENT} />
      {/* body */}
      <rect x="32" y="48" width="36" height="38" rx="16" fill={SUIT} />
      <rect x="32" y="70" width="36" height="16" rx="8" fill={SUIT_SHADE} />
      {/* legs */}
      {!hideLegs && (
        <>
          <rect x="36" y="82" width="12" height="18" rx="6" fill={SUIT} />
          <rect x="52" y="82" width="12" height="18" rx="6" fill={SUIT} />
        </>
      )}
      {/* helmet */}
      <circle cx="50" cy="34" r="24" fill={HELMET} />
      <circle cx="50" cy="34" r="19" fill={VISOR} opacity={0.9} />
      <circle cx="43" cy="27" r="5" fill="white" opacity={0.5} />
      {visorContent}
    </>
  );
}

export function AstronautProud({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-astronaut-bob ${className}`}>
      <svg viewBox="0 0 100 110" className="h-full w-full" aria-hidden>
        <HelmetAndBody />
        {/* raised fist arm */}
        <rect x="66" y="42" width="11" height="24" rx="5.5" fill={SUIT} transform="rotate(-25 66 42)" />
        <circle cx="76" cy="34" r="7" fill={SUIT} />
        {/* other arm on hip */}
        <rect x="24" y="56" width="11" height="20" rx="5.5" fill={SUIT} transform="rotate(15 24 56)" />
      </svg>
    </div>
  );
}

export function AstronautWaving({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-astronaut-bob ${className}`}>
      <svg viewBox="0 0 100 110" className="h-full w-full" aria-hidden>
        <HelmetAndBody />
        <rect x="24" y="56" width="11" height="20" rx="5.5" fill={SUIT} transform="rotate(20 24 56)" />
        <g className="animate-astronaut-wave">
          <rect x="63" y="30" width="11" height="26" rx="5.5" fill={SUIT} />
          <circle cx="68" cy="28" r="7" fill={SUIT} />
        </g>
      </svg>
    </div>
  );
}

export function AstronautDancing({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-astronaut-jump ${className}`}>
      <svg viewBox="0 0 100 110" className="h-full w-full" aria-hidden>
        <HelmetAndBody
          hideLegs
          visorContent={
            <rect x="37" y="30" width="26" height="7" rx="3.5" fill="#0b1130" />
          }
        />
        {/* both arms straight up */}
        <rect x="60" y="14" width="11" height="30" rx="5.5" fill={SUIT} />
        <circle cx="65.5" cy="12" r="7" fill={SUIT} />
        <rect x="29" y="14" width="11" height="30" rx="5.5" fill={SUIT} />
        <circle cx="34.5" cy="12" r="7" fill={SUIT} />
        {/* legs together, mid-jump */}
        <rect x="38" y="82" width="12" height="18" rx="6" fill={SUIT} />
        <rect x="50" y="82" width="12" height="18" rx="6" fill={SUIT} />
      </svg>
    </div>
  );
}
