import React, { useState } from 'react';
import type { AuthConfig, AuthType } from '../../types/request.types';
import { Lock, Key, User, Shield, Eye, EyeOff, Info } from 'lucide-react';

interface AuthEditorProps {
  auth: AuthConfig;
  onUpdateAuth: (auth: Partial<AuthConfig>) => void;
}

export const AuthEditor: React.FC<AuthEditorProps> = ({ auth, onUpdateAuth }) => {
  const [showSecret, setShowSecret] = useState(false);

  const authTypes: { id: AuthType; label: string; desc: string }[] = [
    { id: 'none', label: 'No Auth', desc: 'Default. No authentication headers attached.' },
    { id: 'bearer', label: 'Bearer Token', desc: 'Bearer token passed in Authorization header.' },
    { id: 'basic', label: 'Basic Auth', desc: 'Username and password encoded in Base64.' },
    { id: 'apiKey', label: 'API Key', desc: 'Key-value pair added to request header or query parameters.' },
  ];

  return (
    <div className="p-4 space-y-5 max-w-2xl">
      <div className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-indigo-500" />
          Request Authentication
        </h4>
        <p className="text-xs text-[var(--text-secondary)]">
          The selected authentication mode automatically injects appropriate headers or query parameters into requests.
        </p>
      </div>

      {/* Auth Type Radio Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {authTypes.map((t) => {
          const isSelected = auth.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onUpdateAuth({ type: t.id })}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 text-[var(--text-primary)] ring-1 ring-indigo-500'
                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-indigo-500/40 hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="font-semibold text-xs text-[var(--text-primary)]">{t.label}</div>
            </button>
          );
        })}
      </div>

      {/* Auth Specific Inputs */}
      {auth.type === 'none' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] italic">
          <Info className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          This request does not use any authentication headers.
        </div>
      )}

      {auth.type === 'bearer' && (
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3">
          <label className="block text-xs font-semibold text-[var(--text-primary)]">
            Bearer Token
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
              <Key className="h-4 w-4" />
            </div>
            <input
              type={showSecret ? 'text' : 'password'}
              value={auth.bearerToken}
              onChange={(e) => onUpdateAuth({ bearerToken: e.target.value })}
              placeholder="e.g. eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md py-2 pl-9 pr-10 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Header generated: <code className="text-indigo-600 dark:text-indigo-300 font-mono">Authorization: Bearer &lt;token&gt;</code>
          </p>
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={auth.basicUser}
                  onChange={(e) => onUpdateAuth({ basicUser: e.target.value })}
                  placeholder="admin"
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={auth.basicPass}
                  onChange={(e) => onUpdateAuth({ basicPass: e.target.value })}
                  placeholder="password123"
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md py-2 pl-9 pr-10 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Header generated: <code className="text-indigo-600 dark:text-indigo-300 font-mono">Authorization: Basic &lt;base64(user:pass)&gt;</code>
          </p>
        </div>
      )}

      {auth.type === 'apiKey' && (
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Key Name
              </label>
              <input
                type="text"
                value={auth.apiKeyKey}
                onChange={(e) => onUpdateAuth({ apiKeyKey: e.target.value })}
                placeholder="x-api-key"
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md py-2 px-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Key Value
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={auth.apiKeyValue}
                  onChange={(e) => onUpdateAuth({ apiKeyValue: e.target.value })}
                  placeholder="secret_key_123"
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md py-2 pl-3 pr-9 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Add To
              </label>
              <select
                value={auth.apiKeyAddTo}
                onChange={(e) => onUpdateAuth({ apiKeyAddTo: e.target.value as any })}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md py-2 px-3 text-xs text-[var(--text-primary)] font-mono focus:border-indigo-500 focus:outline-none"
              >
                <option value="header">Header</option>
                <option value="query">Query Parameters</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
