import React, { useState } from 'react';
import { X, User as UserIcon, Key, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await updateProfile(username, email);
      setMessage({ type: 'success', text: 'Profile information updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error || err.message || 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      await updatePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error || err.message || 'Password update failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        onClose();
      } catch (err: any) {
        setMessage({ type: 'error', text: err?.response?.data?.error || err.message || 'Account deletion failed' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-white mb-1">Account Settings</h2>
        <p className="text-xs text-slate-400 mb-6">Manage your profile details and security options.</p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Form 1: Update Profile */}
          <form onSubmit={handleUpdateInfo} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>Personal Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Form 2: Change Password */}
          <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span>Change Password</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !oldPassword || !newPassword}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Update Password
            </button>
          </form>

          {/* Danger Zone: Delete Account */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-400 mb-0.5">Delete Account</h4>
              <p className="text-[11px] text-slate-400">Permanently delete your profile and all tracked items.</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 font-bold text-xs flex items-center space-x-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
