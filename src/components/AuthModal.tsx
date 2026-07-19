import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'signup' | 'updatePassword';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isUpdatePassword, setIsUpdatePassword] = useState(initialMode === 'updatePassword');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setIsForgotPassword(false);
    setIsUpdatePassword(initialMode === 'updatePassword');
    setStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialMode, isOpen]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatePassword && !password) return;
    if (!isUpdatePassword && !email) return;
    if (!isUpdatePassword && !isForgotPassword && !password) return;

    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isUpdatePassword) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setStatus('success');
        setSuccessMessage('Password updated successfully!');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '?mode=recovery',
        });
        if (error) throw error;
        setStatus('success');
        setSuccessMessage('Password reset email sent! Check your inbox.');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus('idle');
        onSuccess();
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          setErrorMessage('This email is already registered. Please log in.');
          setStatus('error');
        } else {
          setStatus('success');
          setSuccessMessage('Account created! Please check your email to confirm your account.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Authentication failed.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-50 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-medium text-slate-900">
                  {isUpdatePassword ? "Update Password" : isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Join Aura"}
                </h3>
                <p className="text-sm text-slate-500">
                  {isUpdatePassword
                    ? "Enter your new password below."
                    : isForgotPassword 
                      ? "Enter your email to receive a reset link." 
                      : isLogin 
                        ? "Sign in to continue exploring." 
                        : "Create an account to access exclusive content."}
                </p>
              </div>
              
              {status === 'success' ? (
                <div className="space-y-6 text-center">
                  <div className="bg-teal-50 text-teal-700 p-4 rounded-xl text-sm border border-teal-100">
                    {successMessage}
                  </div>
                  {!isUpdatePassword && (
                    <button
                      onClick={() => {
                        setIsForgotPassword(false);
                        setIsLogin(true);
                        setStatus('idle');
                      }}
                      className="text-teal-600 font-medium hover:text-teal-700 transition-colors"
                    >
                      Back to login
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div className="space-y-4">
                      {!isUpdatePassword && (
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                          />
                        </div>
                      )}
                      {(isUpdatePassword || !isForgotPassword) && (
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="password"
                            required
                            placeholder={isUpdatePassword ? "New Password" : "Password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {isLogin && !isForgotPassword && !isUpdatePassword && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-slate-500 hover:text-teal-600 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {errorMessage && (
                      <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
                    >
                      {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                      <span>{isUpdatePassword ? 'Update Password' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}</span>
                    </button>
                  </form>

                  <div className="text-center text-sm text-slate-500">
                    {isForgotPassword ? (
                      <button
                        onClick={() => setIsForgotPassword(false)}
                        className="text-teal-600 font-medium hover:text-teal-700 transition-colors"
                      >
                        Back to login
                      </button>
                    ) : !isUpdatePassword && (
                      <>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                          onClick={() => setIsLogin(!isLogin)}
                          className="text-teal-600 font-medium hover:text-teal-700 transition-colors"
                        >
                          {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
