import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES, CITIES } from '../../utils/locale';
import { Leaf, Mail, Lock, User as UserIcon, MapPin, ChevronDown, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { Country } from '../../types';
import { getUserByEmail, resetUserPassword } from '../../db/database';

type Mode = 'login' | 'signup' | 'forgot-email' | 'forgot-otp' | 'forgot-newpass' | 'forgot-done';

export default function AuthPage() {
  const { signup, login } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState<Country>('US');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // OTP state — generated in-memory, shown in a simulated email preview
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const cities = CITIES[country] ?? [];

  useEffect(() => {
    if (!signupSuccess) return;
    const t = setTimeout(() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' })), 2500);
    return () => clearTimeout(t);
  }, [signupSuccess]);

  const resetToLogin = () => {
    setMode('login');
    setError('');
    setOtpInput('');
    setOtpCode('');
    setForgotEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
  };

  // ---- LOGIN ----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const user = await login(email, password);
    if (!user) setError('Invalid email or password. Please try again.');
    setLoading(false);
  };

  // ---- SIGNUP ----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!city) { setError('Please select a city.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const user = await signup(email, password, name, country, city);
    if (!user) { setError('An account with this email already exists.'); setLoading(false); return; }
    setSignupSuccess(true);
    setLoading(false);
  };

  // ---- FORGOT PASSWORD — step 1: enter email ----
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const user = await getUserByEmail(forgotEmail.trim().toLowerCase());
    if (!user) { setError('No account found with that email address.'); setLoading(false); return; }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(code);
    setMode('forgot-otp');
    setLoading(false);
  };

  // ---- FORGOT PASSWORD — step 2: verify OTP ----
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otpInput.trim() !== otpCode) { setError('Incorrect code. Please try again.'); return; }
    setMode('forgot-newpass');
  };

  // ---- FORGOT PASSWORD — step 3: set new password ----
  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await resetUserPassword(forgotEmail.trim().toLowerCase(), newPassword);
    setMode('forgot-done');
    setLoading(false);
  };

  // ---- SUCCESS after signup ----
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 border border-emerald-100 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-500 mb-1">Welcome to <span className="font-semibold text-emerald-700">CarbonLens</span>, {name}.</p>
            <p className="text-gray-400 text-sm mb-8">Your account has been set up successfully. You're now signed in and ready to start tracking your carbon footprint.</p>
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
              <Leaf className="w-4 h-4" />
              <span>Redirecting you to your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- FORGOT DONE ----
  if (mode === 'forgot-done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 border border-emerald-100 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-gray-500 mb-8">Your password has been updated successfully. You can now sign in with your new password.</p>
            <button onClick={resetToLogin} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-lg shadow-emerald-200">
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- FORGOT — enter email ----
  if (mode === 'forgot-email') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <KeyRound className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-500 mt-1">Enter your email to receive a verification code</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="Your account email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 shadow-lg shadow-emerald-200">
                {loading ? 'Checking...' : 'Send Verification Code'}
              </button>
              <button type="button" onClick={resetToLogin} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---- FORGOT — enter OTP ----
  if (mode === 'forgot-otp') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
            <p className="text-gray-500 mt-1">Enter the 6-digit verification code</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            {/* Simulated email preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-blue-700">Email sent to: {forgotEmail}</span>
              </div>
              <p className="text-xs text-blue-600 mb-3">Your verification code (for demo — shown here instead of email):</p>
              <div className="flex items-center justify-center gap-3 bg-white rounded-lg py-3 border border-blue-100">
                {otpCode.split('').map((digit, i) => (
                  <span key={i} className="text-2xl font-bold text-gray-800 w-8 text-center border-b-2 border-emerald-400">{digit}</span>
                ))}
              </div>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter verification code</label>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-center text-xl font-bold tracking-[0.5em] text-gray-800 bg-white" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-lg shadow-emerald-200">
                Verify Code
              </button>
              <button type="button" onClick={() => { const code = String(Math.floor(100000 + Math.random() * 900000)); setOtpCode(code); setOtpInput(''); setError(''); }} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2 transition">
                <RefreshCw className="w-4 h-4" /> Resend Code
              </button>
              <button type="button" onClick={resetToLogin} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-1 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---- FORGOT — set new password ----
  if (mode === 'forgot-newpass') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">New Password</h1>
            <p className="text-gray-500 mt-1">Choose a strong new password</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type={showNewPassword ? 'text' : 'password'} placeholder="New password (min. 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type={showNewPassword ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 shadow-lg shadow-emerald-200">
                {loading ? 'Saving...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---- MAIN: LOGIN / SIGNUP ----
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <Leaf className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CarbonLens</h1>
          <p className="text-gray-500 mt-1">Track. Reduce. Thrive.</p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isLogin ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>Sign In</button>
            <button onClick={() => { setMode('signup'); setError(''); }} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLogin ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>Sign Up</button>
          </div>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition" tabIndex={-1}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isLogin && (
              <>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select value={country} onChange={e => { setCountry(e.target.value as Country); setCity(''); }} className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white appearance-none">
                    {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select value={city} onChange={e => setCity(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white appearance-none">
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
            {isLogin && (
              <div className="text-right -mt-1">
                <button type="button" onClick={() => { setMode('forgot-email'); setForgotEmail(email); setError(''); }} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition">
                  Forgot password?
                </button>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-200">
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
