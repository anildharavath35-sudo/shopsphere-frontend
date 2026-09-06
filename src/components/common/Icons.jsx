const base = 'shrink-0';
const mid = (props) => ({
  width: props.size || 20,
  height: props.size || 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: props.strokeWidth ?? 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: `${base} ${props.className || ''}`,
});

export const CartIcon = (p) => (
  <svg {...mid(p)}>
    <circle cx="9" cy="21" r="1.5" /><circle cx="19" cy="21" r="1.5" />
    <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21.5 7H6.1" />
  </svg>
);

export const HeartIcon = ({ filled, ...p }) => (
  <svg {...mid(p)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...mid(p)}>
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
  </svg>
);

export const UserIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

export const SunIcon = (p) => (
  <svg {...mid(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
  </svg>
);

export const MoonIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const MenuIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const XIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const HomeIcon = (p) => (
  <svg {...mid(p)}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

export const PackageIcon = (p) => (
  <svg {...mid(p)}>
    <path d="m21 8-9-5-9 5v8l9 5 9-5V8z" />
    <path d="M3 8l9 5 9-5M12 13v9" />
  </svg>
);

export const ChartIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M3 3v18h18" />
    <path d="M7 15v-5M12 15V7M17 15v-3" />
  </svg>
);

export const UsersIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const LogoutIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

export const TagIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M20.6 13.4 12 22l-10-10V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
  </svg>
);

export const TruckIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="1.5" /><circle cx="18.5" cy="18.5" r="1.5" />
  </svg>
);

export const ShieldIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const ChevronDown = (p) => (
  <svg {...mid(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronRight = (p) => (
  <svg {...mid(p)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const EditIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
  </svg>
);

export const ImageIcon = (p) => (
  <svg {...mid(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
  </svg>
);

export const BarcodeIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M4 4h3v16H4zM10 4h2v16h-2zM15 4h2v16h-2zM20 4h1v16h-1z" />
  </svg>
);

export const StarIcon = (p) => (
  <svg {...mid(p)} fill="currentColor">
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export const BankIcon = (p) => (
  <svg {...mid(p)}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M2 10h20M6 14h2M12 14h2M18 14h0" />
  </svg>
);

export const WalletIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);

export const MapPinIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ArrowRight = (p) => (
  <svg {...mid(p)}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const RefreshIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const BellIcon = (p) => (
  <svg {...mid(p)}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);