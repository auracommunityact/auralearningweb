import { useState, useEffect } from 'react';
import { Countdown } from './components/Countdown';
import { Chatbot } from './components/Chatbot';
import { Leaf, ArrowRight, Twitter, Facebook, Linkedin, Loader2, CheckCircle2, Star, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
provider.addScope('https://www.googleapis.com/auth/classroom.profile.emails');

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const shareUrl = encodeURIComponent("https://ais-pre-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app");
  const shareText = encodeURIComponent("Find your calm in learning. Join the waitlist for Aura, a minimalist and distraction-free learning platform!");

  async function handleGoogleSignIn() {
    if (window !== window.top) {
      setStatus('error');
      setErrorMessage("Google Sign-In requires opening the app in a new tab. Please click 'Open in new tab' in the top right corner of the preview.");
      return;
    }
    
    setIsSigningIn(true);
    setErrorMessage('');
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      
      // Save their email to waitlist
      if (result.user.email) {
        await addDoc(collection(db, 'waitlist'), {
          email: result.user.email,
          createdAt: serverTimestamp(),
          source: 'google_classroom'
        });
        
        // Optionally notify them via our backend
        await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: result.user.email })
        }).catch(console.error);
        
        setStatus('success');
      }
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      
      // Ignore popup closed by user, it's not a real error
      if (error?.code === 'auth/popup-closed-by-user') {
        setIsSigningIn(false);
        return;
      }
      
      setStatus('error');
      if (error?.code === 'auth/network-request-failed') {
        setErrorMessage("Sign-in failed. Please click 'Open in new tab' in the top right corner of the preview, as authentication popups are blocked inside the preview iframe.");
      } else {
        setErrorMessage(error.message || 'Error signing in with Google.');
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    setUser(null);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || emailError) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        
        // Save to waitlist collection for consistency
        try {
          await addDoc(collection(db, 'waitlist'), {
            email: result.user.email,
            createdAt: serverTimestamp(),
            source: 'email_password'
          });
        } catch (dbError) {
          console.error("Firestore error:", dbError);
        }

        setToastMessage(`Registration email sent to ${result.user.email}. Please verify your inbox.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
      setStatus('success');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      if (err?.code === 'auth/network-request-failed' || err?.message === 'Failed to fetch') {
        setErrorMessage("Authentication failed. Please click 'Open in new tab' in the top right corner of the preview, as authentication may be blocked inside the preview iframe.");
      } else {
        setErrorMessage(err.message || 'Something went wrong. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-teal-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-2 text-teal-700">
          <Leaf className="w-6 h-6" />
          <span className="font-semibold text-lg tracking-tight">Aura</span>
        </div>
        {!user ? (
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => { setIsLogin(true); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} 
              className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => { setIsLogin(false); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} 
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
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
      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-16 relative z-0">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <div className="max-w-3xl w-full text-center space-y-12 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-slate-900">
              Find your <span className="text-teal-600 font-serif italic">calm</span> in learning.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Aura is a minimalist, distraction-free learning platform designed to help you focus, retain information, and enjoy the process. 
            </p>
            <div className="pt-4 flex flex-col items-center space-y-3">
              <a 
                href="/AuraLearning.apk" 
                download
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto"
              >
                Download App
              </a>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The app is currently under development, so no complete books or videos are available in the app yet, in the next update all the books will be added.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Countdown />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-8 max-w-xl mx-auto relative overflow-hidden"
          >
            {user ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col text-left space-y-6 py-2"
              >
                <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-2xl font-medium uppercase shadow-sm">
                    {user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-slate-900">Your Profile</h3>
                    <p className="text-slate-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Pre-registration Status</p>
                    <div className="flex items-center space-x-2 text-teal-600 font-medium">
                      <CheckCircle2 size={18} />
                      <span>Active</span>
                    </div>
                  </div>
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Early Access</p>
                    <div className="flex items-center space-x-2 text-blue-600 font-medium">
                      <Star size={18} />
                      <span>Tier 1 Member</span>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-50/80 rounded-2xl p-5 border border-teal-100 shadow-sm">
                  <h4 className="font-medium text-teal-900 mb-3 text-sm tracking-wide uppercase">Exclusive Updates</h4>
                  <ul className="space-y-3 text-sm text-teal-800">
                    <li className="flex items-start space-x-3">
                      <div className="min-w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5" />
                      <span>Aura is currently in closed beta. Watch your email for the next release wave.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="min-w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5" />
                      <span>Next week: Preview of the new distraction-free reading mode.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            ) : status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 py-6"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-medium text-slate-900">Success!</h3>
                <p className="text-slate-500">You're all set.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-slate-900">{isLogin ? "Sign In" : "Get Early Access"}</h3>
                  <p className="text-sm text-slate-500">{isLogin ? "Welcome back to Aura." : "Sign up now to be the first to experience Aura."}</p>
                </div>
                
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                          setEmailError('Please enter a valid email address');
                        } else {
                          setEmailError('');
                        }
                      }}
                      placeholder="Email address"
                      className={`w-full px-4 py-3 rounded-xl border ${emailError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'} bg-white/80 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-700 placeholder:text-slate-400`}
                      disabled={status === 'loading'}
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs text-left pl-1">{emailError}</p>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-700 placeholder:text-slate-400"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading' || !!emailError}
                    className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-all shadow-md shadow-teal-500/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Sign Up"}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
                
                <div className="text-center">
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-sm text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
                
                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                )}

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/60 backdrop-blur-xl px-2 text-slate-500 font-medium tracking-wider">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="gsi-material-button w-full sm:w-auto h-12 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center space-x-3 shadow-sm disabled:opacity-70"
                  >
                    {isSigningIn ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                    ) : (
                      <>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" style={{display: 'block'}}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        <span className="text-slate-600 font-medium">Continue with Google Classroom</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-8 flex flex-col items-center space-y-4"
          >
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Spread the calm</p>
            <div className="flex space-x-6">
              <a 
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-100 hover:shadow-md transition-all"
                aria-label="Share on Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-100 hover:shadow-md transition-all"
                aria-label="Share on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-100 hover:shadow-md transition-all"
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </motion.div>

        </div>
      </main>

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
