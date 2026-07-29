import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";

export default function ProfileSettings({ onClose }: { onClose: () => void }) {
  const { user, login, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage("");
    setSavingProfile(true);
    try {
      const result = await api.updateProfile(name);
      login(result.token, result.user);
      setProfileMessage("Name updated.");
    } catch (error: any) {
      setProfileMessage(error.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password updated.");
    } catch (error: any) {
      setPasswordMessage(error.message);
    } finally {
      setSavingPassword(false);
    }
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteMessage("");
    if (!confirm("Permanently delete your account? Rooms you own and all their content will also be deleted.")) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteAccount(deletePassword);
      logout();
    } catch (error: any) {
      setDeleteMessage(error.message);
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/30 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-title"
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-line bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 id="profile-settings-title" className="font-serif text-xl text-ink">Profile settings</h2>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile settings"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-line text-muted hover:border-accent hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form onSubmit={updateProfile} className="border-b border-line pb-6">
          <h3 className="mb-3 text-sm font-medium text-ink">Display name</h3>
          <label htmlFor="profile-name" className="mb-1 block text-xs font-medium text-muted">Name</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <button
              disabled={savingProfile || name.trim() === user?.name}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {savingProfile ? "Saving…" : "Save name"}
            </button>
          </div>
          {profileMessage && <p className="mt-2 text-xs text-muted">{profileMessage}</p>}
        </form>

        <form onSubmit={changePassword} className="border-b border-line py-6">
          <h3 className="mb-3 text-sm font-medium text-ink">Change password</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="current-password" className="mb-1 block text-xs font-medium text-muted">Current password</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-muted">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-xs font-medium text-muted">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <button
            disabled={savingPassword}
            className="mt-3 w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 sm:w-auto"
          >
            {savingPassword ? "Updating…" : "Update password"}
          </button>
          {passwordMessage && <p className="mt-2 text-xs text-muted">{passwordMessage}</p>}
        </form>

        <form onSubmit={deleteAccount} className="pt-6">
          <h3 className="text-sm font-medium text-red-700">Delete account</h3>
          <p className="mb-3 mt-1 text-xs text-muted">
            This permanently deletes your account and every room you own. Enter your password to continue.
          </p>
          <label htmlFor="delete-password" className="mb-1 block text-xs font-medium text-muted">Password</label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
            className="w-full rounded-lg border border-red-200 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <button
            disabled={deleting}
            className="mt-3 w-full rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:w-auto"
          >
            {deleting ? "Deleting…" : "Delete account"}
          </button>
          {deleteMessage && <p className="mt-2 text-xs text-red-600">{deleteMessage}</p>}
        </form>
      </div>
    </div>
  );
}
