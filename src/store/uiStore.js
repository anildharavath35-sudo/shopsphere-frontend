import { create } from 'zustand';

const THEME_KEY = 'ss_theme';

const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') return 'dark';
  if (saved === 'light') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const THEME_COLORS = {
  success: 'border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  error: 'border-rose-500/40 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  info: 'border-brand-500/40 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200',
};

export const useUIStore = create((set, get) => ({
  theme: getInitialTheme(),
  toasts: [],

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    set({ theme: next });
  },

  initTheme: () => {
    document.documentElement.classList.toggle('dark', get().theme === 'dark');
  },

  toast: (message, type = 'info') => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3800);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const colors = THEME_COLORS;
export const toastColor = (type) => colors[type] || colors.info;