import { useEffect, useState } from 'react';
import { todayISO } from '../utils/stats';

const SENT_KEY = 'attendly_alerts_sent';
const supported = typeof window !== 'undefined' && 'Notification' in window;

function sentToday() {
  try {
    const data = JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
    return data.date === todayISO() ? data : { date: todayISO(), ids: [] };
  } catch {
    return { date: todayISO(), ids: [] };
  }
}

/**
 * Sends a browser notification (Notifications API) for every subject that
 * is below target — at most once per subject per day.
 */
export default function useLowAttendanceAlerts(subjects, target) {
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');

  useEffect(() => {
    if (permission !== 'granted') return;
    const sent = sentToday();
    subjects
      .filter((s) => s.isLow && !sent.ids.includes(s.id))
      .forEach((s) => {
        new Notification(`⚠️ Low attendance: ${s.name}`, {
          body: `You're at ${s.percentage}% (target ${target}%).` +
            (s.mustAttend ? ` Attend the next ${s.mustAttend} classes to recover.` : ''),
          icon: '/favicon.svg',
          tag: `attendly-${s.id}`,
        });
        sent.ids.push(s.id);
      });
    localStorage.setItem(SENT_KEY, JSON.stringify(sent));
  }, [subjects, target, permission]);

  const requestPermission = async () => {
    if (!supported) return;
    setPermission(await Notification.requestPermission());
  };

  return { permission, requestPermission };
}
