import { useState, useEffect } from 'react';
import { Countdown } from './components/Countdown';
import { Chatbot } from './components/Chatbot';
import { Leaf, ArrowRight, Loader2, CheckCircle2, Star, Mail, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

import { ShareSection } from './components/ShareSection';
import { ContentFeed } from './components/ContentFeed';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Auth Modal & Interception State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const isAdmin = user?.email === 'auracommunityact@gmail.com';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Execute pending action if they just logged in
      if (currentUser && pendingAction) {
        pendingAction();
        setPendingAction(null);
        setIsAuthModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [pendingAction]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-teal-100 overflow-x-hidden relative">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-2 text-teal-700">
          <Leaf className="w-6 h-6" />
          <span className="font-semibold text-lg tracking-tight">Aura</span>
        </div>
        {!user ? (
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }} 
              className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => { setAuthModalMode('signup'); setIsAuthModalOpen(true); }} 
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <span className="flex items-center space-x-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                <ShieldAlert size={14} />
                <span>Admin</span>
              </span>
            )}
            <span className="text-sm text-slate-600 hidden sm:inline-block">{user.email}</span>
            <button 
              onClick={handleSignOut} 
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-20 pb-16 relative z-0">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <div className="w-full text-center space-y-12 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 max-w-3xl mx-auto px-4"
          >
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-slate-900 mt-8">
              Find your <span className="text-teal-600 font-serif italic">calm</span> in learning.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Aura is a minimalist, distraction-free learning platform designed to help you focus, retain information, and enjoy the process. 
            </p>
          </motion.div>

          {/* Guest Feed & Content Gate */}
          <ContentFeed 
            user={user} 
            onRequireAuth={requireAuth}
            onShowToast={triggerToast}
          />

          <ShareSection onShowToast={triggerToast} />

        </div>
      </main>

      {/* Auth Modal & Toast */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null); // Clear pending action if user cancels
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          triggerToast('Successfully authenticated!');
          // pendingAction will be triggered by onAuthStateChanged
        }}
        initialMode={authModalMode}
      />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-3 z-50 max-w-[90vw] text-sm font-medium"
          >
            <Mail className="w-5 h-5 text-teal-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
}
