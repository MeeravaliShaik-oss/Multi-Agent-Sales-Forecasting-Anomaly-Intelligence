import React, { useState } from 'react';
import {
  Layers,
  LogIn,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Bot,
  Database,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignInScreen: React.FC = () => {
  const { signInWithGoogleAccount, signInWithCredentials, authError } = useAuth();
  const [email, setEmail] = useState('manager@superstore-analytics.com');
  const [name, setName] = useState('Retail Store Manager');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSubmittingGoogle(true);
    try {
      await signInWithGoogleAccount();
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    signInWithCredentials(email, name);
  };

  const handleQuickDemoAccess = () => {
    signInWithCredentials('store.manager@retail-demo.com', 'Sarah Lin (Store Director)');
  };

  return (
    <div className="min-h-screen bg-[#080c14] bg-grid-pattern text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-indigo-600/12 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-24 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[110px]" />
        <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] bg-purple-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-tight">
                  Multi-Agent Sales Forecasting System
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider text-slate-400 border border-slate-800 rounded px-1.5 py-0.2">
                  Prophet v2.4
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              System Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero & Sign-In Grid */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Visual Telemetry Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enterprise Predictive Intelligence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Autonomous <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-teal-200">
                  Time-Series Intelligence
                </span>
              </h1>
              <p className="text-sm text-slate-300/80 max-w-xl leading-relaxed">
                A high-precision retail forecasting workbench driven by 4 specialized agents: clean raw transactions, decompose trend &amp; seasonality via Facebook Prophet, flag rolling Z-score anomalies, and synthesize managerial executive briefs.
              </p>
            </div>

            {/* Interactive Telemetry Preview Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 text-xs">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Forecast Horizon Snapshot</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Superstore Retail Benchmark
                </div>
              </div>

              {/* Mini Sparkline Simulation */}
              <div className="h-20 w-full relative overflow-hidden flex items-end pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Confidence Envelope */}
                  <path
                    d="M 0,38 Q 40,25 80,34 T 160,20 T 240,30 T 320,15 T 400,24 L 400,50 L 320,55 L 240,48 L 160,52 L 80,50 L 0,55 Z"
                    fill="url(#heroGradient)"
                  />
                  {/* Forecast Line */}
                  <path
                    d="M 0,42 Q 40,28 80,38 T 160,26 T 240,36 T 320,20 T 400,30"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Anomaly Outlier Dots */}
                  <circle cx="160" cy="26" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.5" />
                  <circle cx="320" cy="20" r="3.5" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.5" />
                </svg>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Input Data</div>
                  <div className="text-sm font-bold text-white mt-0.5 font-mono">730 Days</div>
                  <div className="text-[10px] text-slate-500">Lag_7 features</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Model Accuracy</div>
                  <div className="text-sm font-bold text-indigo-300 mt-0.5 font-mono">±303.95 MAE</div>
                  <div className="text-[10px] text-emerald-400">92.4% confidence</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Z-Score Outliers</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5 font-mono">14 Events</div>
                  <div className="text-[10px] text-rose-400">9 Spikes · 5 Drops</div>
                </div>
              </div>
            </div>

            {/* 4 Agent Pipeline Mini Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/70 px-2.5 py-1 rounded-lg">
                <Database className="w-3 h-3 text-blue-400" />
                <span>Agent 1: Prep</span>
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/70 px-2.5 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3 text-purple-400" />
                <span>Agent 2: Prophet</span>
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/70 px-2.5 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Agent 3: Z-Score</span>
              </span>
              <span className="text-slate-600">→</span>
              <span className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/70 px-2.5 py-1 rounded-lg">
                <Bot className="w-3 h-3 text-emerald-400" />
                <span>Agent 4: Briefing</span>
              </span>
            </div>
          </div>

          {/* Right Column: Glassmorphic Sign-In Panel (5 cols) */}
          <div className="lg:col-span-5">
            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 relative">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white tracking-tight">Sign in to Workbench</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect via Google OAuth or authenticate with store credentials.
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmittingGoogle}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-md shadow-white/5 transition-all cursor-pointer active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>{isSubmittingGoogle ? 'Connecting securely...' : 'Sign in with Google'}</span>
              </button>

              {authError && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  Or Credentials Access
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* Direct Credentials Sign-In Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Store Manager Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="manager@store.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Access Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-[0.98] mt-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Launch Forecasting Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Instant Quick Demo Sign In */}
                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="w-full py-2 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>One-click instant demo access</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Multi-Agent Sales Forecasting System</span>
            <span aria-hidden="true">·</span>
            <span>Facebook Prophet Decomposition</span>
            <span aria-hidden="true">·</span>
            <span>Statistical Z-Score Anomaly Engine</span>
          </div>
          <span className="font-mono text-[11px] text-slate-600">Enterprise Edition</span>
        </div>
      </footer>
    </div>
  );
};
