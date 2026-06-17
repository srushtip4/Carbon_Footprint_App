import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES, CITIES } from '../../utils/locale';
import { Leaf, Mail, Lock, User as UserIcon, MapPin, ChevronDown, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { Country } from '../../types';
import { getUserByEmail, resetUserPassword } from '../../db/database';
import { validateEmail, validateName, validatePassword, validateCity, getPasswordStrength, sanitizeText } from '../../utils/validation';

type Mode = 'login' | 'signup' | 'forgot-email' | 'forgot-otp' | 'forgot-newpass' | 'forgot-done';

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const pct = ((strength.score + 1) / 5) * 100;
  if (!password) return null;
  return (
    <div className="mt-2" role="meter" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={4} aria-label={`Password strength: ${strength.label}`}>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: strength.color }} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
        {strength.suggestions.length > 0 && (
          <span className="text-xs text-gray-400">{strength.suggestions[0]}</span>
        )}
      </div>
    </div>
  );
}

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
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.error); return; }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.error); return; }
    setLoading(true);
    const user = await login(sanitizeText(email), password);
    if (!user) setError('Invalid email or password. Please try again.');
    setLoading(false);
  };

  // ---- SIGNUP ----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const nameCheck = validateName(name);
    if (!nameCheck.valid) { setError(nameCheck.error); return; }
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.error); return; }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.error); return; }
    const cityCheck = validateCity(city);
    if (!cityCheck.valid) { setError(cityCheck.error); return; }
    setLoading(true);
    const user = await signup(sanitizeText(email), password, sanitizeText(name), country, city);
    if (!user) { setError('An account with this email already exists.'); setLoading(false); return; }
    setSignupSuccess(true);
    setLoading(false);
  };

  // ---- FORGOT PASSWORD — step 1: enter email ----
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailCheck = validateEmail(forgotEmail);
    if (!emailCheck.valid) { setError(emailCheck.error); return; }
    setLoading(true);
    const user = await getUserByEmail(sanitizeText(forgotEmail.trim().toLowerCase()));
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
    if (!otpInput.trim()) { setError('Please enter the verification code.'); return; }
    if (otpInput.trim() !== otpCode) { setError('Incorrect code. Please try again.'); return; }
    setMode('forgot-newpass');
  };

  // ---- FORGOT PASSWORD — step 3: set new password ----
  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) { setError(passCheck.error); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await resetUserPassword(sanitizeText(forgotEmail.trim().toLowerCase()), newPassword);
    setMode('forgot-done');
    setLoading(false);
  };

  // ---- SUCCESS after signup ----
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 border border-emerald-100 text-center animate-fade-in" role="status" aria-live="polite">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-500 mb-1">Welcome to <span className="font-semibold text-emerald-700">CarbonLens</span>, {sanitizeText(name)}.</p>
            <p className="text-gray-400 text-sm mb-8">Your account has been set up successfully. You're now signed in and ready to start tracking your carbon footprint.</p>
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium" aria-live="polite">
              <Leaf className="w-4 h-4" aria-hidden="true" />
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 border border-emerald-100 text-center animate-fade-in" role="status" aria-live="polite">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" aria-hidden="true" />
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
              <KeyRound className="w-8 h-8 text-emerald-600" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-500 mt-1">Enter your email to receive a verification code</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            <form onSubmit={handleForgotEmailSubmit} noValidate className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="forgot-email" className="sr-only">Account email</label>
                <input id="forgot-email" type="email" placeholder="Your account email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required aria-describedby="forgot-email-error" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              </div>
              {error && <div id="forgot-email-error" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3" role="alert">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 shadow-lg shadow-emerald-200">
                {loading ? 'Checking...' : 'Send Verification Code'}
              </button>
              <button type="button" onClick={resetToLogin} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2 transition">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Sign In
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
              <Mail className="w-8 h-8 text-emerald-600" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
            <p className="text-gray-500 mt-1">Enter the 6-digit verification code</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            {/* Simulated email preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5" role="status" aria-live="polite" aria-label="Verification code display">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-blue-500" aria-hidden="true" />
                <span className="text-xs font-semibold text-blue-700">Email sent to: {forgotEmail}</span>
              </div>
              <p className="text-xs text-blue-600 mb-3">Your verification code (for demo — shown here instead of email):</p>
              <div className="flex items-center justify-center gap-3 bg-white rounded-lg py-3 border border-blue-100" aria-label={`Verification code: ${otpCode}`}>
                {otpCode.split('').map((digit, i) => (
                  <span key={i} className="text-2xl font-bold text-gray-800 w-8 text-center border-b-2 border-emerald-400" aria-hidden="true">{digit}</span>
                ))}
              </div>
            </div>
            <form onSubmit={handleOtpSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700 mb-1">Enter verification code</label>
                <input id="otp-input" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))} aria-describedby="otp-error" autoComplete="one-time-code" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-center text-xl font-bold tracking-[0.5em] text-gray-800 bg-white" />
              </div>
              {error && <div id="otp-error" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3" role="alert">{error}</div>}
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-lg shadow-emerald-200">
                Verify Code
              </button>
              <button type="button" onClick={() => { const code = String(Math.floor(100000 + Math.random() * 900000)); setOtpCode(code); setOtpInput(''); setError(''); }} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2 transition">
                <RefreshCw className="w-4 h-4" aria-hidden="true" /> Resend Code
              </button>
              <button type="button" onClick={resetToLogin} className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-1 transition">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Sign In
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
              <Lock className="w-8 h-8 text-emerald-600" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">New Password</h1>
            <p className="text-gray-500 mt-1">Choose a strong new password</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            <form onSubmit={handleNewPasswordSubmit} noValidate className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="new-password" className="sr-only">New password</label>
                <input id="new-password" type={showNewPassword ? 'text' : 'password'} placeholder="New password (min. 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required aria-describedby="new-password-strength" className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition">
                  {showNewPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              <div id="new-password-strength"><PasswordStrengthMeter password={newPassword} /></div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="confirm-password" className="sr-only">Confirm new password</label>
                <input id="confirm-password" type={showNewPassword ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3" role="alert">{error}</div>}
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
            <Leaf className="w-8 h-8 text-emerald-600" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CarbonLens</h1>
          <p className="text-gray-500 mt-1">Track. Reduce. Thrive.</p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Account access">
            <button onClick={() => { setMode('login'); setError(''); }} role="tab" aria-selected={isLogin} aria-controls="login-form" id="login-tab" className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isLogin ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>Sign In</button>
            <button onClick={() => { setMode('signup'); setError(''); }} role="tab" aria-selected={!isLogin} aria-controls="signup-form" id="signup-tab" className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLogin ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>Sign Up</button>
          </div>
          <form onSubmit={isLogin ? handleLogin : handleSignup} noValidate id={isLogin ? 'login-form' : 'signup-form'} role="tabpanel" aria-labelledby={isLogin ? 'login-tab' : 'signup-tab'} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="signup-name" className="sr-only">Full Name</label>
                <input id="signup-name" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} aria-required="true" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="auth-email" className="sr-only">Email address</label>
              <input id="auth-email" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required aria-required="true" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="auth-password" className="sr-only">Password</label>
              <input id="auth-password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} aria-required="true" aria-describedby={isLogin ? undefined : 'signup-password-strength'} className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition">
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            {!isLogin && (
              <div id="signup-password-strength"><PasswordStrengthMeter password={password} /></div>
            )}
            {!isLogin && (
              <>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" aria-hidden="true" />
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <label htmlFor="signup-country" className="sr-only">Country</label>
                  <select id="signup-country" value={country} onChange={e => { setCountry(e.target.value as Country); setCity(''); }} aria-required="true" className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white appearance-none">
                    {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <label htmlFor="signup-city" className="sr-only">City</label>
                  <select id="signup-city" value={city} onChange={e => setCity(e.target.value)} required aria-required="true" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-gray-800 bg-white appearance-none">
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3" role="alert">{error}</div>}
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
