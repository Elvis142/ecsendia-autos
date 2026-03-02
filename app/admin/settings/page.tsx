'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  User,
  Lock,
  Building2,
  Database,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  Info,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 transition bg-white';

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="p-2 bg-maroon-700/10 rounded-lg">
          <Icon className="w-4 h-4 text-maroon-700" />
        </div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  // Account
  const [accountForm, setAccountForm] = useState({ name: '', email: '' });
  const [savingAccount, setSavingAccount] = useState(false);

  // Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name && !accountForm.email) {
      toast.error('Please enter a name or email to update');
      return;
    }
    setSavingAccount(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }
      toast.success('Account updated successfully');
      setAccountForm({ name: '', email: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/admin/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Password change failed');
      }
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your admin account and site configuration
        </p>
      </div>

      {/* Account Section */}
      <SectionCard title="Account" icon={User}>
        <form onSubmit={handleSaveAccount} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                value={accountForm.name}
                onChange={(e) =>
                  setAccountForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={accountForm.email}
                onChange={(e) =>
                  setAccountForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="admin@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingAccount}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
            >
              {savingAccount ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingAccount ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Change Password */}
      <SectionCard title="Change Password" icon={Lock}>
        <form onSubmit={handleChangePassword} className="space-y-5">
          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Info className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
                placeholder="Enter current password"
                className={cn(inputClass, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                }
                placeholder="At least 8 characters"
                className={cn(inputClass, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowNewPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordForm.newPassword && (
              <div className="flex items-center gap-1.5 mt-1">
                <div
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    passwordForm.newPassword.length >= 8
                      ? 'bg-emerald-500'
                      : 'bg-red-400'
                  )}
                />
                <span
                  className={cn(
                    'text-xs',
                    passwordForm.newPassword.length >= 8
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  )}
                >
                  {passwordForm.newPassword.length >= 8 ? 'Strong enough' : 'Too short'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                placeholder="Repeat new password"
                className={cn(inputClass, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordForm.confirmPassword &&
              passwordForm.newPassword &&
              passwordForm.newPassword === passwordForm.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs text-emerald-600">Passwords match</span>
                </div>
              )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-700 text-white text-sm font-medium rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
            >
              {savingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Business Info */}
      <SectionCard title="Business Information" icon={Building2}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Business contact details are managed via environment variables in your{' '}
            <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-xs">.env</code> file.
            Update the values below and restart the server to apply changes.
          </p>
        </div>
        <div className="space-y-4">
          {[
            {
              label: 'Phone Number',
              envKey: 'NEXT_PUBLIC_BUSINESS_PHONE',
              example: '+234 800 000 0000',
            },
            {
              label: 'Email Address',
              envKey: 'NEXT_PUBLIC_BUSINESS_EMAIL',
              example: 'info@ecsendiautos.com',
            },
            {
              label: 'Business Address',
              envKey: 'NEXT_PUBLIC_BUSINESS_ADDRESS',
              example: '123 Victoria Island, Lagos, Nigeria',
            },
          ].map(({ label, envKey, example }) => (
            <div key={envKey} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                  <code className="text-xs text-maroon-700 font-mono">{envKey}</code>
                  <span className="text-gray-400 text-xs">=</span>
                  <span className="text-gray-500 text-xs italic">{example}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${envKey}="${example}"`)}
                  className="p-2.5 text-gray-400 hover:text-maroon-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Copy env key"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Supabase Storage Setup */}
      <SectionCard title="Supabase Storage Setup" icon={Database}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Follow these steps to configure Supabase Storage for photo uploads:
          </p>
          <ol className="space-y-4">
            {[
              {
                step: 1,
                title: 'Create a Storage Bucket',
                description:
                  'Go to your Supabase dashboard → Storage → New Bucket. Name it "car-photos" and set it to Public.',
              },
              {
                step: 2,
                title: 'Set Bucket Policies',
                description:
                  'In the bucket settings, add a policy allowing authenticated users to upload (INSERT) and anyone to read (SELECT).',
              },
              {
                step: 3,
                title: 'Add Environment Variables',
                description: 'Add the following to your .env.local file:',
                code: `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key\nSUPABASE_STORAGE_BUCKET=car-photos`,
              },
              {
                step: 4,
                title: 'Test the Upload',
                description:
                  'Go to Add New Car and try uploading a photo. Check the Supabase Storage dashboard to confirm the file appeared.',
              },
            ].map(({ step, title, description, code }) => (
              <li key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 bg-maroon-700 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                  {step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{description}</p>
                  {code && (
                    <div className="relative mt-2">
                      <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre font-mono leading-relaxed">
                        {code}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(code)}
                        className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              The <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code> gives
              full access to your Supabase project. Keep it secret and never expose it
              in client-side code or commit it to version control.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
