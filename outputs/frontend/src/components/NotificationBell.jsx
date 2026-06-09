import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, ChevronDown, ChevronUp, LoaderCircle } from 'lucide-react';
import api from '../services/api';
import { formatDateTime } from './Shared';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const unreadCount = useMemo(() => items.filter((item) => !item.is_read).length, [items]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications/');
      setItems(Array.isArray(data?.results) ? data.results : data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, []);

  const markRead = async (item) => {
    if (item.is_read) return;
    try {
      const { data } = await api.post(`/notifications/${item.id}/mark_read/`);
      setItems((prev) => prev.map((entry) => (entry.id === data.id ? data : entry)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        <span>Alerts</span>
        {unreadCount ? <span className="rounded-full bg-slate-950 px-2 py-0.5 text-xs font-semibold text-white">{unreadCount}</span> : null}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              </div>
              <button
                type="button"
                onClick={loadNotifications}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50"
              >
                {loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Refresh
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item)}
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    item.is_read ? 'bg-white' : 'bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${item.is_read ? 'bg-slate-300' : 'bg-slate-950'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.type || 'notice'}
                        {item.created_at ? ` • ${formatDateTime(item.created_at)}` : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
