import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboard } from '../../db/database';
import { LeaderboardEntry, Badge } from '../../types';
import { Trophy, Medal, Award, Star, Crown, Globe2, TrendingDown } from 'lucide-react';

function BadgeIcons({ badges }: { badges: Badge[] }) {
  const earned = badges.filter(b => b.earned);
  if (earned.length === 0) return null;
  return (
    <div className="flex gap-1">
      {earned.map(b => {
        const colors: Record<string, string> = { bronze: 'bg-orange-400 text-white', silver: 'bg-gray-400 text-white', gold: 'bg-yellow-500 text-white', platinum: 'bg-emerald-600 text-white' };
        return <span key={b.id} className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${colors[b.id] ?? 'bg-gray-300 text-white'}`}>{b.id === 'bronze' ? 'B' : b.id === 'silver' ? 'S' : b.id === 'gold' ? 'G' : 'P'}</span>;
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'country'>('all');

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getLeaderboard(user.id);
    setEntries(data);
    setLoading(false);
  };

  const filteredEntries = filter === 'country' && user ? entries.filter(e => e.country === user.country) : entries;
  const userEntry = entries.find(e => e.userId === user?.id);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-300';
    if (rank === 2) return 'bg-gray-50 border-gray-300';
    if (rank === 3) return 'bg-orange-50 border-orange-300';
    return 'bg-white border-gray-100';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-gray-400 w-5 text-center">{rank}</span>;
  };

  if (loading) return (<div className="max-w-3xl mx-auto px-4 py-12 text-center"><div className="animate-pulse text-gray-400">Loading leaderboard...</div></div>);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6"><Trophy className="w-6 h-6 text-emerald-600" /><h1 className="text-2xl font-bold text-gray-900">Global Leaderboard</h1></div>

      {userEntry && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-3"><Star className="w-5 h-5" /><span className="font-semibold">Your Global Rank</span></div>
          <div className="flex items-end gap-4">
            <div><span className="text-5xl font-bold">#{userEntry.rank}</span><p className="text-emerald-100 text-sm mt-1">out of {entries.length} users worldwide</p></div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-1"><TrendingDown className="w-4 h-4" /><span className="text-lg font-semibold">{userEntry.netFootprint.toLocaleString()} kg CO2</span></div>
              <div className="flex items-center justify-end gap-2 text-emerald-100 text-sm"><span>{userEntry.ecoPoints} Eco-Points</span><span>&bull;</span><span>{userEntry.streak}-week streak</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}><Globe2 className="w-4 h-4 inline mr-1" />Global</button>
        <button onClick={() => setFilter('country')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'country' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}>{user?.country ?? 'Country'} Only</button>
      </div>

      {filteredEntries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 mb-2 mx-auto">{filteredEntries[1].name.charAt(0)}</div>
            <p className="text-xs font-semibold text-gray-800 truncate max-w-20">{filteredEntries[1].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{filteredEntries[1].netFootprint.toLocaleString()} kg</p>
            <div className="bg-gray-300 rounded-t-lg w-20 h-16 mt-2 mx-auto flex items-center justify-center"><span className="text-2xl font-bold text-gray-600">2</span></div>
          </div>
          <div className="text-center">
            <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center text-3xl font-bold text-yellow-700 mb-2 mx-auto border-2 border-yellow-400">{filteredEntries[0].name.charAt(0)}</div>
            <p className="text-sm font-semibold text-gray-800 truncate max-w-24">{filteredEntries[0].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{filteredEntries[0].netFootprint.toLocaleString()} kg</p>
            <div className="bg-yellow-400 rounded-t-lg w-24 h-24 mt-2 mx-auto flex items-center justify-center"><span className="text-3xl font-bold text-yellow-800">1</span></div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-2xl font-bold text-orange-600 mb-2 mx-auto">{filteredEntries[2].name.charAt(0)}</div>
            <p className="text-xs font-semibold text-gray-800 truncate max-w-20">{filteredEntries[2].name.split(' ')[0]}</p>
            <p className="text-xs text-gray-500">{filteredEntries[2].netFootprint.toLocaleString()} kg</p>
            <div className="bg-orange-300 rounded-t-lg w-20 h-12 mt-2 mx-auto flex items-center justify-center"><span className="text-2xl font-bold text-orange-700">3</span></div>
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filteredEntries.slice(0, 50).map(entry => (
            <div key={entry.userId} className={`flex items-center gap-3 px-4 py-3 ${getRankStyle(entry.rank)} ${entry.userId === user?.id ? 'ring-2 ring-emerald-400 ring-inset' : ''} border`}>
              <div className="w-8 flex-shrink-0 flex items-center justify-center">{getRankIcon(entry.rank)}</div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 flex-shrink-0">{entry.name.charAt(0)}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{entry.name} {entry.userId === user?.id && <span className="text-emerald-600 text-xs">(You)</span>}</p><p className="text-xs text-gray-400">{entry.city}, {entry.country}</p></div>
              <BadgeIcons badges={entry.badges} />
              <div className="text-right flex-shrink-0"><p className="text-sm font-bold text-gray-800">{entry.netFootprint.toLocaleString()} kg</p><p className="text-xs text-gray-400">{entry.ecoPoints} pts &bull; {entry.streak}w</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
