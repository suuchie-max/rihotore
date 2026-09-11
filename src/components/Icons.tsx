const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const IconHome = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>);
export const IconCalendar = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
export const IconBook = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" /></svg>);
export const IconCoin = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 10.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" /></svg>);
export const IconCheck = (p: { size?: number; strokeWidth?: number }) => (<svg {...base} strokeWidth={p.strokeWidth ?? 2.5} width={p.size ?? 24} height={p.size ?? 24}><path d="M5 13l4 4L19 7" /></svg>);
export const IconChevron = (p: { size?: number }) => (<svg {...base} strokeWidth={2.5} width={p.size ?? 24} height={p.size ?? 24}><path d="M9 6l6 6-6 6" /></svg>);
export const IconBack = (p: { size?: number }) => (<svg {...base} strokeWidth={2.5} width={p.size ?? 24} height={p.size ?? 24}><path d="M15 6l-6 6 6 6" /></svg>);
export const IconFlame = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .4-2 1-3 0 2 1 3 2 3 0-3-1-5 1-8z" /></svg>);
export const IconSun = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><circle cx="12" cy="13" r="5" /><path d="M12 2v3M4.9 5.6l2.1 2.1M19.1 5.6 17 7.7M2 13h3M19 13h3M5 21h14" /></svg>);
export const IconBolt = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>);
export const IconClock = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>);
export const IconSpeaker = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>);
export const IconBall = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><circle cx="12" cy="12" r="9" /><path d="M12 3c-3 4-3 14 0 18M3.5 9c5 1 12 1 17 0M5 17c4-2 10-2 14 0" /></svg>);
export const IconStretch = (p: { size?: number }) => (<svg {...base} width={p.size ?? 24} height={p.size ?? 24}><circle cx="12" cy="5" r="2" /><path d="M6 21l4-8 2-3 2 3 4 8M8 10l4-2 4 2" /></svg>);
