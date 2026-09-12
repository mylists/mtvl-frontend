import React, { useEffect, useState } from 'react';
import {
  X,
  User as UserIcon,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Terminal,
  Clock,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { APIToken } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'tokens';

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile Form States
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tokens States
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [createdTokenResult, setCreatedTokenResult] = useState<APIToken | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [revokingTokenId, setRevokingTokenId] = useState<string | null>(null);
  const [tokenMessage, setTokenMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setMessage(null);
      setTokenMessage(null);
      loadTokens();
    }
  }, [isOpen, user]);

  const loadTokens = async () => {
    setIsLoadingTokens(true);
    try {
      const data = await authApi.listTokens();
      setTokens(data);
    } catch (err: any) {
      // Non-blocking error
      console.error('Failed to load API tokens:', err);
    } finally {
      setIsLoadingTokens(false);
    }
  };

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

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    setIsCreatingToken(true);
    setTokenMessage(null);
    setCopiedToken(false);
    try {
      const token = await authApi.createToken(newTokenName.trim());
      setCreatedTokenResult(token);
      setNewTokenName('');
      setTokenMessage({ type: 'success', text: 'API token generated successfully!' });
      await loadTokens();
    } catch (err: any) {
      setTokenMessage({
        type: 'error',
        text: err?.response?.data?.error || err.message || 'Failed to generate API token',
      });
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleRevokeToken = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to revoke the token "${name || 'API Token'}"? Any applications using this token will lose access immediately.`)) {
      return;
    }
    setRevokingTokenId(id);
    setTokenMessage(null);
    try {
      await authApi.revokeToken(id);
      setTokens((prev) => prev.filter((t) => t.id !== id));
      if (createdTokenResult?.id === id) {
        setCreatedTokenResult(null);
      }
      setTokenMessage({ type: 'success', text: 'API token revoked successfully.' });
    } catch (err: any) {
      setTokenMessage({
        type: 'error',
        text: err?.response?.data?.error || err.message || 'Failed to revoke token',
      });
    } finally {
      setRevokingTokenId(null);
    }
  };

  const copyToClipboard = (text: string, isCurl: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const maskToken = (tokenStr: string) => {
    if (!tokenStr || tokenStr.length < 16) return tokenStr;
    return `${tokenStr.slice(0, 8)}••••••••••••••••••••••••••••••••${tokenStr.slice(-8)}`;
  };

  const sampleCurl = `curl -X GET "http://localhost:8080/api/v1/movies" \
  -H "Authorization: Bearer ${createdTokenResult ? createdTokenResult.token : '<YOUR_API_TOKEN>'}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-500/20">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Account Settings</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 my-4 border-b border-slate-800/80 pb-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('tokens');
              if (tokens.length === 0) loadTokens();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'tokens'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>API Tokens</span>
            {tokens.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-900 border border-slate-700 text-indigo-300 font-mono">
                {tokens.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-2">
          {activeTab === 'profile' ? (
            <>
              {message && (
                <div
                  className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

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
            </>
          ) : (
            /* API Tokens Tab */
            <>
              {tokenMessage && (
                <div
                  className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
                    tokenMessage.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {tokenMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{tokenMessage.text}</span>
                </div>
              )}

              {/* Information Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start space-x-3 text-xs text-slate-300">
                <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Personal API Access Tokens</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    API tokens allow external scripts, automation workflows, CLI tools, and integrations to authenticate
                    using standard <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded font-mono">Bearer &lt;token&gt;</code> headers.
                  </p>
                </div>
              </div>

              {/* Newly Created Token Card (High Priority) */}
              {createdTokenResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/40 shadow-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        New Token Created: {createdTokenResult.name || 'API Token'}
                      </h4>
                    </div>
                    <button
                      onClick={() => setCreatedTokenResult(null)}
                      className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-slate-800/60"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-950/90 border border-emerald-500/30 rounded-xl p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={createdTokenResult.token}
                      className="flex-1 bg-transparent text-emerald-300 font-mono text-xs outline-none select-all overflow-x-auto truncate"
                    />
                    <button
                      onClick={() => copyToClipboard(createdTokenResult.token)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        copiedToken
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-300/90 flex items-center space-x-1.5 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <span>
                      <strong>Important:</strong> Copy and store your token securely now. For your security, the full token string will not be displayed again once you leave.
                    </span>
                  </p>
                </div>
              )}

              {/* Create Token Form */}
              <form
                onSubmit={handleCreateToken}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>Generate New API Token</span>
                </h3>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Token label (e.g. CLI Sync, Home Assistant, Python Script)"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isCreatingToken || !newTokenName.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    {isCreatingToken ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Key className="w-3.5 h-3.5" />
                    )}
                    <span>{isCreatingToken ? 'Generating...' : 'Generate Token'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Tokens List */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    <span>Active API Tokens</span>
                  </h3>
                  <button
                    onClick={loadTokens}
                    disabled={isLoadingTokens}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Refresh token list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTokens ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>

                {isLoadingTokens && tokens.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Loading active tokens...</span>
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No active API tokens found. Generate your first token above.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {tokens.map((tok) => (
                      <div
                        key={tok.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-700 transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white truncate">{tok.name || 'Unnamed Token'}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/20">
                              Active
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 truncate">
                            {tok.token ? maskToken(tok.token) : '••••••••••••••••••••••••'}
                          </div>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Created: {formatDate(tok.created_at)}</span>
                            </span>
                            <span>•</span>
                            <span>Last used: {tok.last_used_at ? formatDate(tok.last_used_at) : 'Never'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {tok.token && (
                            <button
                              onClick={() => copyToClipboard(tok.token)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                              title="Copy Token"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRevokeToken(tok.id, tok.name)}
                            disabled={revokingTokenId === tok.id}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center space-x-1 transition-all"
                            title="Revoke Token"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>{revokingTokenId === tok.id ? 'Revoking...' : 'Revoke'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Developer Quickstart / Usage Guide */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quickstart CLI Usage</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(sampleCurl, true)}
                    className="text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 flex items-center space-x-1"
                  >
                    {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied curl command!' : 'Copy curl'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800/80 leading-relaxed">
                  {sampleCurl}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
