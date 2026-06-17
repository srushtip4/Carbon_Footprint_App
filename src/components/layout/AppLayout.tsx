import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Leaf, BarChart3, TreePine, Target, Trophy, HelpCircle, LogOut, Menu, X, BookOpen } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, protected: true },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle, protected: true },
  { id: 'actions', label: 'Action Center', icon: Target, protected: true },
  { id: 'garden', label: 'Eco-Garden', icon: TreePine, protected: true },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, protected: true },
];

export default function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (id: string) => { onNavigate(id); setMobileMenuOpen(false); };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#f0faf4' }}>
      {/* Background Image */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.35,
        }}
        aria-hidden="true"
      />
      {/* Soft white overlay for readability */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-white/40" aria-hidden="true" />

      <a href="#main-content" className="skip-nav">Skip to main content</a>

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100" role="banner">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => handleNav(user ? 'dashboard' : 'education')} aria-label="CarbonLens home" className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              <span className="text-lg font-bold text-gray-900">CarbonLens</span>
            </button>
          </div>
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <button onClick={() => handleNav('education')} aria-current={currentPage === 'education' ? 'page' : undefined} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${currentPage === 'education' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}><BookOpen className="w-4 h-4" aria-hidden="true" />Carbon Math</button>
            {NAV_ITEMS.map(item => {
              const locked = item.protected && !user;
              return (<button key={item.id} onClick={() => locked ? handleNav('auth') : handleNav(item.id)} aria-current={currentPage === item.id ? 'page' : undefined} aria-disabled={locked} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${currentPage === item.id ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'} ${locked ? 'opacity-50' : ''}`}><item.icon className="w-4 h-4" aria-hidden="true" />{item.label}{locked && <span className="text-[10px] bg-gray-200 text-gray-500 px-1 rounded">Login</span>}</button>);
            })}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700" aria-label={`User: ${user.name}`} role="img">{user.name.charAt(0)}</div>
                <button onClick={logout} aria-label="Sign out" className="text-gray-500 hover:text-red-600 transition"><LogOut className="w-4 h-4" aria-hidden="true" /></button>
              </div>
            ) : (
              <button onClick={() => handleNav('auth')} className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition">Sign In</button>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-controls="mobile-menu" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} className="md:hidden text-gray-600">{mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}</button>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-menu" className="md:hidden bg-white border-t border-gray-100 py-3 px-4 space-y-1" aria-label="Mobile navigation">
            <button onClick={() => handleNav('education')} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 flex items-center gap-2"><BookOpen className="w-4 h-4" aria-hidden="true" />Carbon Math</button>
            {NAV_ITEMS.map(item => {
              const locked = item.protected && !user;
              return (<button key={item.id} onClick={() => locked ? handleNav('auth') : handleNav(item.id)} aria-disabled={locked} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 flex items-center gap-2"><item.icon className="w-4 h-4" aria-hidden="true" />{item.label} {locked && '(Login Required)'}</button>);
            })}
            {user ? (<button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut className="w-4 h-4" aria-hidden="true" />Sign Out</button>) : (<button onClick={() => handleNav('auth')} className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">Sign In</button>)}
          </nav>
        )}
      </header>

      <main id="main-content" className="relative z-10" role="main" tabIndex={-1}>{children}</main>
    </div>
  );
}
