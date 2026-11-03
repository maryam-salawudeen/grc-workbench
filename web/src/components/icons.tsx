// Outline icons (24px grid, 1.75 stroke).
const paths: Record<string, string> = {
  dashboard: 'M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z',
  risk: 'M12 3 2 20h20L12 3zM12 10v4M12 17.5v.01',
  asset: 'M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4',
  control: 'M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3zM9 12l2 2 4-4',
  framework: 'M4 5h16M4 12h16M4 19h16M8 3v4M14 10v4M10 17v4',
  assessment: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M8.5 13l2 2 4.5-4.5',
  finding: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4M11 8v4M11 14.5v.01',
  policy: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  vendor: 'M3 21V9l6-4v4l6-4v4l6-4v16zM7 17h2M11 17h2M15 17h2',
  people: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6',
  learn: 'M2 9l10-5 10 5-10 5-10-5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6',
  plus: 'M12 5v14M5 12h14',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  activity: 'M3 12h4l3 8 4-16 3 8h4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z',
  case: 'M4 7h16v12H4zM9 7V4h6v3M4 12h16',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M8 7h7'
};

export function Icon({ name, size }: { name: keyof typeof paths | string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
