interface Props { stage: number; size?: number; happy?: boolean }

// 仮キャラ「たまご」。stage が上がるとひび→羽→リボンなどが足されていく(本デザインは後で差し替え)
export default function Character({ stage, size = 112, happy = false }: Props) {
  const h = size * 120 / 112;
  return (
    <svg width={size} height={h} viewBox="0 0 112 120" aria-hidden="true">
      <ellipse cx="56" cy="112" rx="34" ry="6" fill="#efd9d3" />
      <path d="M56 8 C 30 8, 16 40, 16 66 C 16 92, 34 108, 56 108 C 78 108, 96 92, 96 66 C 96 40, 82 8, 56 8 Z" fill="#fff6f3" stroke="#e9c9c1" strokeWidth="3" />
      {stage >= 1 && (
        <path d="M30 70 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 l8 10" fill="none" stroke="#f3b6c2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {stage >= 2 && (<>
        <path d="M18 62 q-14 -4 -12 -18 q10 6 14 14" fill="#fde2e7" stroke="#e9c9c1" strokeWidth="2" />
        <path d="M94 62 q14 -4 12 -18 q-10 6 -14 14" fill="#fde2e7" stroke="#e9c9c1" strokeWidth="2" />
      </>)}
      {stage >= 3 && (
        <path d="M46 14 l-8 -8 l10 3 l6 -8 l6 8 l10 -3 l-8 8 z" fill="#f5c542" stroke="#d9a51e" strokeWidth="2" strokeLinejoin="round" />
      )}
      {stage >= 4 && (
        <path d="M34 86 h44 v12 q-22 8 -44 0 z" fill="#f08aa0" />
      )}
      {happy ? (<>
        <path d="M40 50 q4 -5 8 0" fill="none" stroke="#4a3b3e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 50 q4 -5 8 0" fill="none" stroke="#4a3b3e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M48 60 q8 8 16 0" fill="none" stroke="#4a3b3e" strokeWidth="2.5" strokeLinecap="round" />
      </>) : (<>
        <circle cx="44" cy="52" r="3.5" fill="#4a3b3e" />
        <circle cx="68" cy="52" r="3.5" fill="#4a3b3e" />
        <path d="M50 62 q6 5 12 0" fill="none" stroke="#4a3b3e" strokeWidth="2.5" strokeLinecap="round" />
      </>)}
      <circle cx="36" cy="60" r="5" fill="#f9c4c9" opacity="0.8" />
      <circle cx="76" cy="60" r="5" fill="#f9c4c9" opacity="0.8" />
    </svg>
  );
}
