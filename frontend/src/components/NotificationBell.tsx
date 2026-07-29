import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { connectSocket } from "../socket";

interface Notification {
  id: string;
  body: string;
  read: boolean;
  createdAt: string;
  task: { id: string; title: string; projectId: string };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getNotifications().then(setNotifications);

    const socket = connectSocket();
    socket.on("notification:new", (n: Notification) => {
      setNotifications((prev) => [n, ...prev]);
    });

    return () => {
      socket.off("notification:new");
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleClick(n: Notification) {
    if (!n.read) {
        await api.markNotificationRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    setOpen(false);
    navigate(`/project/${n.task.projectId}?task=${n.task.id}`);
    }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        className="relative flex min-h-10 min-w-10 items-center justify-center rounded-full border border-line bg-white text-muted transition hover:border-accent hover:text-ink sm:min-h-0 sm:min-w-0 sm:p-1.5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-28 z-50 max-h-[60dvh] overflow-y-auto rounded-lg border border-line bg-white shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-72 sm:max-h-96">
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted text-center">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-3 py-2.5 border-b border-line last:border-b-0 hover:bg-mist transition ${
                  n.read ? "opacity-60" : ""
                }`}
              >
                <p className="text-xs text-ink">{n.body}</p>
                <p className="text-[10px] text-muted mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
