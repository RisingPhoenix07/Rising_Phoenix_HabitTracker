import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

const appearanceTheme = {
  elements: {
    card: 'bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl rounded-2xl text-slate-100',
    headerTitle: 'text-2xl font-bold text-white tracking-tight',
    headerSubtitle: 'text-slate-400 text-sm',
    socialButtonsBlockButton: 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/60 transition-all',
    socialButtonsBlockButtonText: 'text-slate-200 font-medium',
    dividerLine: 'bg-slate-800',
    dividerText: 'text-slate-500 text-xs uppercase',
    formFieldLabel: 'text-xs font-semibold uppercase tracking-wider text-slate-300',
    formFieldInput: 'bg-slate-950/80 border border-slate-700/80 rounded-xl text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all',
    formButtonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-2.5 transition-all shadow-lg shadow-cyan-500/20',
    footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-semibold',
    identityPreviewText: 'text-slate-200 font-medium',
    identityPreviewEditButtonIcon: 'text-cyan-400',
  },
};

export default function SignUpPage() {
  return (
    <main 
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 font-sans"
      style={{ backgroundImage: `url('/bg-phoenix.jpg')` }}
    >
      <div className="bg-slate-950/80 backdrop-blur-md p-2 rounded-3xl border border-slate-800/80 shadow-2xl">
        <Suspense fallback={<div className="text-cyan-400 p-8 font-bold">Loading workspace...</div>}>
          <SignUp appearance={appearanceTheme} />
        </Suspense>
      </div>
    </main>
  );
}
