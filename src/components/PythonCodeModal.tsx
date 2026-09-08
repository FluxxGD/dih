import React, { useState } from 'react';
import { X, Copy, Check, Download, Bug, CheckCircle2, FileCode } from 'lucide-react';
import { FIXED_PYTHON_CODE, ORIGINAL_BUGS_EXPLANATION } from '../data/pythonVersion';
import { sound } from '../services/sound';

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bugs' | 'code'>('bugs');

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FIXED_PYTHON_CODE);
      setCopied(true);
      sound.playStar();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    sound.playClick();
    const blob = new Blob([FIXED_PYTHON_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neon_dodge_fixed.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="python-code-modal"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileCode size={20} />
            </div>
            <div>
              <h3 className="text-lg font-arcade font-bold text-white tracking-wide">
                Python Turtle: Bug Report & Solution
              </h3>
              <p className="text-xs text-neutral-400">
                Detailed analysis of original bugs + runnable, 100% bug-free Python script
              </p>
            </div>
          </div>
          <button
            id="close-python-modal-btn"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-neutral-800/80 bg-neutral-900">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('bugs');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'bugs'
                  ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Bug size={14} />
              Bugs & Improvements ({ORIGINAL_BUGS_EXPLANATION.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('code');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <FileCode size={14} />
              Fixed Python Script
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]"
            >
              <Download size={14} />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {activeTab === 'bugs' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <strong>Summary of Changes:</strong> We addressed all 7 critical bugs in the original code, including the fatal crash on game over, non-incrementing score, extreme keyboard stutter, text overlapping, and 100% CPU runaway.
              </div>

              <div className="grid gap-3">
                {ORIGINAL_BUGS_EXPLANATION.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="font-arcade text-sm font-bold text-white tracking-wide">
                        {item.title}
                      </h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mt-1 text-xs">
                      <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/40 text-red-200">
                        <span className="font-bold text-red-400 uppercase tracking-wider block mb-1">
                          Original Issue:
                        </span>
                        {item.original}
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-200">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          Fix Applied:
                        </span>
                        {item.fix}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed">
                <code>{FIXED_PYTHON_CODE}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/40 flex justify-between items-center text-xs text-neutral-400">
          <span>Target Environment: Python 3.8+ with standard library (no pip dependencies needed!)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
