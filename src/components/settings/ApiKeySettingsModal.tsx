import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Bot,
  Cpu,
  ShieldCheck,
  Star,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { AIProvider, UserApiKeyMetadata } from '../../types';
import { AI_PROVIDERS, PROVIDER_LIST } from '../../lib/aiProviders';
import {
  listUserApiKeysClient,
  saveApiKeyClient,
  validateApiKeyClient,
  removeApiKeyClient,
  setDefaultApiKeyClient,
} from '../../lib/apiKeyService';
import { useAuth } from '../../contexts/AuthContext';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProvider?: AIProvider;
  onKeysUpdated?: () => void;
}

export default function ApiKeySettingsModal({
  isOpen,
  onClose,
  initialProvider = 'gemini',
  onKeysUpdated,
}: ApiKeySettingsModalProps) {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(initialProvider);
  const [keysList, setKeysList] = useState<UserApiKeyMetadata[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);

  // Form states for selected provider
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load configured keys
  const loadKeys = async () => {
    if (!user) return;
    setIsLoadingKeys(true);
    try {
      const keys = await listUserApiKeysClient();
      setKeysList(keys);
    } catch (err) {
      console.error('Failed to load keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadKeys();
      setFeedback(null);
      setInputKey('');
      setShowKey(false);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (initialProvider) {
      setSelectedProvider(initialProvider);
    }
  }, [initialProvider]);

  // Reset input when switching tabs
  useEffect(() => {
    setInputKey('');
    setShowKey(false);
    setFeedback(null);
    const existing = keysList.find((k) => k.provider === selectedProvider);
    setIsDefault(existing ? existing.isDefault : keysList.length === 0);
  }, [selectedProvider, keysList]);

  if (!isOpen) return null;

  const currentMeta = AI_PROVIDERS[selectedProvider];
  const configuredKey = keysList.find((k) => k.provider === selectedProvider);
  const defaultProvider = keysList.find((k) => k.isDefault)?.provider || null;

  const handleValidateOnly = async () => {
    if (!inputKey.trim()) {
      setFeedback({ type: 'error', message: 'Please enter an API key to validate.' });
      return;
    }
    setIsValidating(true);
    setFeedback(null);
    try {
      const res = await validateApiKeyClient(selectedProvider, inputKey.trim());
      if (res.valid) {
        setFeedback({
          type: 'success',
          message: res.message || `${currentMeta.name} API key is valid and working!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Validation failed. Please check your API key.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Validation request failed' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your API key.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await saveApiKeyClient(
        selectedProvider,
        inputKey.trim(),
        isDefault || keysList.length === 0
      );

      if (res.success && res.metadata) {
        setFeedback({
          type: 'success',
          message: `${currentMeta.name} API key encrypted and saved securely!`,
        });
        setInputKey('');
        await loadKeys();
        if (onKeysUpdated) onKeysUpdated();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to save API key. Please check the key.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save API key' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!configuredKey) return;
    if (!confirm(`Are you sure you want to remove your ${currentMeta.name} API key?`)) {
      return;
    }

    setIsRemoving(true);
    setFeedback(null);
    try {
      const res = await removeApiKeyClient(selectedProvider);
      if (res.success) {
        setFeedback({
          type: 'info',
          message: `${currentMeta.name} API key has been removed.`,
        });
        await loadKeys();
        if (onKeysUpdated) onKeysUpdated();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to remove key' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove key' });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSetDefault = async (provider: AIProvider) => {
    try {
      const res = await setDefaultApiKeyClient(provider);
      if (res.success) {
        await loadKeys();
        if (onKeysUpdated) onKeysUpdated();
      }
    } catch (err) {
      console.error('Failed to set default provider:', err);
    }
  };

  const getProviderIcon = (providerId: AIProvider) => {
    switch (providerId) {
      case 'gemini':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      case 'claude':
        return <Bot className="w-4 h-4 text-amber-400" />;
      case 'openai':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-200 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI Provider & API Keys</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  BYOK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Provide your own API keys for Gemini, Claude, or OpenAI. Encrypted server-side with AES-256-GCM.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar">
          {/* Provider Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800">
            {PROVIDER_LIST.map((prov) => {
              const isSelected = selectedProvider === prov.id;
              const hasKey = keysList.some((k) => k.provider === prov.id);
              const isDef = keysList.some((k) => k.provider === prov.id && k.isDefault);

              return (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSelectedProvider(prov.id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {getProviderIcon(prov.id)}
                    <span className="text-xs sm:text-sm font-bold">{prov.shortName}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    {hasKey ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Saved</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Not set</span>
                    )}
                    {isDef && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40">
                        Default
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Provider Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {getProviderIcon(currentMeta.id)}
                    <span>{currentMeta.name}</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                    Model: {currentMeta.recommendedModel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {currentMeta.tagline}
                </p>
              </div>

              {/* Link to get key */}
              <a
                href={currentMeta.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-all shrink-0 cursor-pointer"
              >
                <span>{currentMeta.helpLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* If key already configured: Show status and manage controls */}
            {configuredKey ? (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Configured Key:</span>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      {configuredKey.maskedKey}
                    </span>
                    {configuredKey.isDefault && (
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-700/40">
                        Default Provider
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Validated & Encrypted • Last updated {new Date(configuredKey.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!configuredKey.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(selectedProvider)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors flex items-center gap-1"
                      title="Make this your default AI provider"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>Set as Default</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveKey}
                    disabled={isRemoving}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove API Key"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Input Form for adding / updating key */}
            <form onSubmit={handleSaveKey} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {configuredKey ? 'Update API Key' : `Paste your ${currentMeta.name} API Key`}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      if (feedback) setFeedback(null);
                    }}
                    placeholder={currentMeta.placeholder}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all pr-20"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 text-slate-500 hover:text-slate-300 rounded"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Options & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Set as default provider for AI generations</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleValidateOnly}
                    disabled={!inputKey.trim() || isValidating || isSaving}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  >
                    {isValidating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Test Key</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!inputKey.trim() || isSaving || isValidating}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{configuredKey ? 'Validate & Update' : 'Validate & Save'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-fade-in ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : feedback.type === 'error'
                    ? 'bg-red-950/40 border-red-500/40 text-red-300'
                    : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{feedback.message}</span>
              </div>
            )}
          </div>

          {/* Security & Privacy Guarantee Note */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How your API keys are protected:</span>
            </div>
            <p className="leading-relaxed">
              Your API keys are encrypted immediately using <strong>AES-256-GCM</strong> symmetric encryption before being stored in Firestore. Keys are never transmitted in plaintext, never exposed in client logs or browser console, and are only decrypted in ephemeral memory on the backend during AI requests.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
