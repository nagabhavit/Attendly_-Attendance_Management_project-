import { httpApi, tokenStore } from './http';
import { demoApi, resetDemo } from './demo';

const DEMO_KEY = 'attendly_demo';

export const demoMode = {
  enabled: () =>
    import.meta.env.VITE_DEMO_MODE === 'true' || localStorage.getItem(DEMO_KEY) === '1',
  enable: () => localStorage.setItem(DEMO_KEY, '1'),
  disable: () => {
    localStorage.removeItem(DEMO_KEY);
    resetDemo();
  },
};

// Pick the adapter at call time so toggling demo mode needs no reload.
export const api = new Proxy(
  {},
  { get: (_, key) => (demoMode.enabled() ? demoApi : httpApi)[key] },
);

export { tokenStore };
