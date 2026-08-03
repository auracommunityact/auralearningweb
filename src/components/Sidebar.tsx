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
              <div className="space-y-3 mt-auto pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Follow Our Journey</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="https://youtube.com/@auralearningofficialy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 hover:border-red-500/50 hover:text-red-600 transition-all duration-300 group"
                    aria-label="YouTube"
                  >
                    <span className="p-1.5 bg-red-50 rounded-lg text-[#FF0000] group-hover:bg-[#FF0000] group-hover:text-white transition-all duration-300 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </span>
                    <span className="text-xs font-bold truncate">YouTube</span>
                  </a>
                  <a
                    href="https://www.instagram.com/auralearningofficialy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 hover:border-pink-500/50 hover:text-pink-600 transition-all duration-300 group"
                    aria-label="Instagram"
                  >
                    <span className="p-1.5 bg-pink-50 rounded-lg text-[#E1306C] group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888] group-hover:text-white transition-all duration-300 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </span>
                    <span className="text-xs font-bold truncate">Instagram</span>
                  </a>
                  <a
                    href="https://x.com/auralearninge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-all duration-300 group"
                    aria-label="X (Twitter)"
                  >
                    <span className="p-1.5 bg-slate-100 rounded-lg text-slate-900 group-hover:bg-black group-hover:text-white transition-all duration-300 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </span>
                    <span className="text-xs font-bold truncate">X</span>
                  </a>
                  <a
                    href="https://www.snapchat.com/add/auralearning"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 hover:border-amber-400/50 hover:text-amber-600 transition-all duration-300 group"
                    aria-label="Snapchat"
                  >
                    <span className="p-1.5 bg-amber-50 rounded-lg text-[#FFFC00] group-hover:bg-[#FFFC00] group-hover:text-black transition-all duration-300 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.001 2c-3.322 0-5.834 2.378-5.834 5.642 0 1.341.455 2.327 1.134 3.011-.184.502-.686 1.443-1.528 1.936-.265.155-.427.435-.413.74.014.304.202.571.482.686 1.571.646 2.553 1.53 2.887 2.107.136.235.072.533-.143.695-.687.517-1.693 1.222-1.693 2.278 0 .98 1.214 1.663 3.585 1.663 1.088 0 1.98-.143 2.329-.218.241-.052.492.018.673.192.24.229.854.815 2.059.815 1.206 0 1.82-.586 2.06-.815.181-.174.432-.244.673-.192.349.07 1.241.218 2.329.218 2.371 0 3.585-.683 3.585-1.663 0-1.056-1.006-1.761-1.693-2.278-.215-.162-.279-.46-.143-.695.334-.577 1.316-1.461 2.887-2.107.28-.115.468-.382.482-.686.014-.305-.148-.585-.413-.74-.842-.493-1.344-1.434-1.528-1.936.679-.684 1.134-1.67 1.134-3.011 0-3.264-2.512-5.642-5.834-5.642z"/></svg>
                    </span>
                    <span className="text-xs font-bold truncate">Snapchat</span>
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
