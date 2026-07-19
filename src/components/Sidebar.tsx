import { motion, AnimatePresence } from 'motion/react';
import { X, Download, LogOut, ShieldAlert, Youtube, Instagram, Sparkles } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { ShareSection } from './ShareSection';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isAdmin: boolean;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export function Sidebar({ isOpen, onClose, user, isAdmin, onSignOut, onShowToast, onOpenAuth }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-medium text-slate-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-8 pb-12">
              {/* Profile Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Account</h3>
                {user ? (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium shrink-0">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <div className="flex items-center space-x-1 mt-1 text-xs font-medium text-amber-600">
                            <ShieldAlert size={12} />
                            <span>Admin</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSignOut();
                        onClose();
                      }}
                      className="w-full py-2 flex items-center justify-center space-x-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
                    <p className="text-sm text-slate-500 text-center">Sign in to access your account.</p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth('login');
                      }}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth('signup');
                      }}
                      className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* App Download */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">App</h3>
                
                <a
                  href="/updates.html"
                  className="flex items-center space-x-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Updates & Announcements</p>
                    <p className="text-xs text-slate-500 mt-0.5">News and releases</p>
                  </div>
                </a>

                <a
                  href="/AuraLearning.apk"
                  download
                  className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 hover:shadow-md transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Download size={20} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-teal-900">Download App</p>
                    <p className="text-xs text-teal-700 mt-1">Get Aura for Android (Beta)</p>
                  </div>
                </a>
              </div>

              {/* Share */}
              <div className="-mt-4">
                <ShareSection onShowToast={onShowToast} />
              </div>

              {/* Social Channels */}
              <div className="space-y-4 mt-auto pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Follow Our Journey</h3>
                <div className="flex flex-col gap-4 max-w-[160px] mx-auto">
                  <a
                    href="https://youtube.com/@auralearningofficialy?si=anKX8ID1oPFd6MHi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-600 hover:text-[#FF0000] transition-colors group"
                    aria-label="YouTube"
                  >
                    <Youtube size={28} color="#FF0000" className="transition-transform group-hover:scale-110" />
                    <span className="text-xs font-bold uppercase tracking-wider">YouTube</span>
                  </a>
                  <a
                    href="https://www.instagram.com/auralearningofficialy?igsh=NmJ0Mm83OXo2NjMx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-600 hover:text-[#E1306C] transition-colors group"
                    aria-label="Instagram"
                  >
                    <Instagram size={28} color="#E1306C" className="transition-transform group-hover:scale-110" />
                    <span className="text-xs font-bold uppercase tracking-wider">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
