import { useAuth } from '../../context/AuthContext';
import { Leaf, Lock } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center" role="alert">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
          <Lock className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
        <p className="text-gray-500 mb-6">You need an account to access this feature. Join the community and start tracking your carbon footprint.</p>
        <a href="#auth" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate', { detail: 'auth' })); }} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-lg shadow-emerald-200">
          <Leaf className="w-4 h-4" aria-hidden="true" /> Sign In or Create Account
        </a>
      </div>
    );
  }
  return <>{children}</>;
}
