import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  theme?: 'dark' | 'light';
  showCloseButton?: boolean;
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
  theme = 'dark',
  showCloseButton = true,
}: ResponsiveModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative w-full ${maxWidthClass} max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border z-10 overflow-hidden ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            {(title || showCloseButton) && (
              <div
                className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0 ${
                  isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {icon && <div className="shrink-0">{icon}</div>}
                  <div className="min-w-0">
                    {typeof title === 'string' ? (
                      <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">{title}</h3>
                    ) : (
                      title
                    )}
                    {subtitle && (
                      <div className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={`touch-target p-2 rounded-xl transition-all cursor-pointer ${
                      isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Close"
                    aria-label="Close dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Modal Body (Scrollable with custom scrollbar) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar overscroll-contain">
              {children}
            </div>

            {/* Modal Footer */}
            {footer && (
              <div
                className={`p-4 sm:px-6 border-t shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 ${
                  isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/70'
                }`}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
