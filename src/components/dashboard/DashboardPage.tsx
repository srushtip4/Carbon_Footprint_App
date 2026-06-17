import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WeeklyCheckin, EmissionBreakdown } from '../../types';
import { getCheckins, saveCheckin, generateId, saveStreak, getStreak } from '../../db/database';
import { getReductionPct, getGardenLevel } from '../../utils/emissions';
import VirtualGarden from '../garden/VirtualGarden';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TreePine, CheckCircle2, TrendingDown, Leaf, Award, Flame, Droplets } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#eab308', '#22c55e', '#8b5cf6'];

export default function DashboardPage() {
  const { user, locale, baselineEmissions, ecoPoints, streak, badges, refreshUserData, addPoints } = useAuth();
  const [checkins, setCheckins] = useState<WeeklyCheckin[]>([]);
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinAnswers, setCheckinAnswers] = useState({ transport: 0, energy: 0, food: 0, waste: 0 });
  const [reductionPct, setReductionPct] = useState(0);
  const [prevReductionPct, setPrevReductionPct] = useState(0);
  const [dropAnimation, setDropAnimation] = useState(false);

  useEffect(() => { if (user) loadCheckins(); }, [user]);

  const loadCheckins = async () => {
    if (!user || !baselineEmissions) return;
    const data = await getCheckins(user.id);
    setCheckins(data);
    if (data.length > 0) {
      const latest = data[data.length - 1].totalNetEmissions;
      setReductionPct(getReductionPct(baselineEmissions.total, latest));
      if (data.length > 1) setPrevReductionPct(getReductionPct(baselineEmissions.total, data[data.length - 2].totalNetEmissions));
    }
  };

  const handleCheckin = async () => {
    if (!user || !baselineEmissions || !locale) return;
    const transportEmissions = Math.round(baselineEmissions.transport * (1 - checkinAnswers.transport / 100));
    const energyEmissions = Math.round(baselineEmissions.energy * (1 - checkinAnswers.energy / 100));
    const foodEmissions = Math.round(baselineEmissions.food * (1 - checkinAnswers.food / 100));
    const wasteEmissions = Math.round(baselineEmissions.waste * (1 - checkinAnswers.waste / 100));
    const totalNetEmissions = transportEmissions + energyEmissions + foodEmissions + wasteEmissions;
    const newReduction = getReductionPct(baselineEmissions.total, totalNetEmissions);
    const gardenLevel = getGardenLevel(newReduction);

    await saveCheckin({ id: generateId(), userId: user.id, checkinDate: Date.now(), transportEmissions, energyEmissions, foodEmissions, wasteEmissions, totalNetEmissions, gardenStateLevel: gardenLevel });
    const lastStreak = await getStreak(user.id);
    await saveStreak(user.id, lastStreak + 1, Date.now());
    await addPoints(50);
    setDropAnimation(true);
    setTimeout(() => setDropAnimation(false), 1500);
    setShowCheckin(false);
    await loadCheckins();
    await refreshUserData();
  };

  if (!user || !locale || !baselineEmissions) {
    return (<div className="max-w-5xl mx-auto px-4 py-12 text-center" role="status"><Leaf className="w-12 h-12 text-emerald-400 mx-auto mb-4" aria-hidden="true" /><h2 className="text-xl font-bold text-gray-800 mb-2">Complete Your Quiz First</h2><p className="text-gray-500">Head to the Quiz to calculate your baseline carbon footprint.</p><button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'quiz' }))} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Take the Quiz</button></div>);
  }

  const gardenLevel = getGardenLevel(reductionPct);
  const wilting = reductionPct < prevReductionPct;
  const latestBreakdown: EmissionBreakdown = checkins.length > 0 ? {
    transport: checkins[checkins.length - 1].transportEmissions, flights: baselineEmissions.flights,
    energy: checkins[checkins.length - 1].energyEmissions, food: checkins[checkins.length - 1].foodEmissions,
    waste: checkins[checkins.length - 1].wasteEmissions, total: checkins[checkins.length - 1].totalNetEmissions,
  } : baselineEmissions;

  const donutData = [
    { name: 'Transport', value: latestBreakdown.transport }, { name: 'Flights', value: latestBreakdown.flights },
    { name: 'Energy', value: latestBreakdown.energy }, { name: 'Food', value: latestBreakdown.food },
    { name: 'Waste', value: latestBreakdown.waste },
  ].filter(d => d.value > 0);

  const lineData = checkins.map(c => ({
    date: new Date(c.checkinDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    total: c.totalNetEmissions, transport: c.transportEmissions, energy: c.energyEmissions, food: c.foodEmissions, waste: c.wasteEmissions,
  }));
  if (lineData.length === 0) lineData.push({ date: 'Baseline', total: baselineEmissions.total, transport: baselineEmissions.transport, energy: baselineEmissions.energy, food: baselineEmissions.food, waste: baselineEmissions.waste });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 text-sm">Welcome back, {user.name}</p></div>
        <button onClick={() => setShowCheckin(true)} aria-label="Start weekly check-in" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" aria-hidden="true" />Weekly Check-in</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" role="list" aria-label="Dashboard statistics">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 shadow-sm" role="listitem"><div className="flex items-center gap-2 mb-1"><TrendingDown className="w-4 h-4 text-emerald-500" aria-hidden="true" /><span className="text-xs text-gray-500">Reduction</span></div><p className={`text-2xl font-bold ${dropAnimation ? 'text-emerald-400 animate-pulse' : 'text-emerald-700'}`}>{reductionPct.toFixed(1)}%</p></div>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 shadow-sm" role="listitem"><div className="flex items-center gap-2 mb-1"><Flame className="w-4 h-4 text-orange-500" aria-hidden="true" /><span className="text-xs text-gray-500">Streak</span></div><p className="text-2xl font-bold text-gray-800">{streak} weeks</p></div>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 shadow-sm" role="listitem"><div className="flex items-center gap-2 mb-1"><Award className="w-4 h-4 text-yellow-500" aria-hidden="true" /><span className="text-xs text-gray-500">Eco-Points</span></div><p className="text-2xl font-bold text-gray-800">{ecoPoints}</p></div>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 shadow-sm" role="listitem"><div className="flex items-center gap-2 mb-1"><Droplets className="w-4 h-4 text-blue-500" aria-hidden="true" /><span className="text-xs text-gray-500">Annual Footprint</span></div><p className="text-2xl font-bold text-gray-800">{(latestBreakdown.total / 1000).toFixed(1)}t</p></div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap" aria-label="Earned badges">
        {badges.map(b => {
          const colors: Record<string, string> = { bronze: b.earned ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400', silver: b.earned ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-400', gold: b.earned ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-400', platinum: b.earned ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400' };
          return <span key={b.id} aria-label={`${b.name} badge${b.earned ? ' - earned' : ' - not yet earned'}`} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colors[b.id]}`}>{b.id === 'bronze' ? 'B' : b.id === 'silver' ? 'S' : b.id === 'gold' ? 'G' : 'P'} {b.name}</span>;
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm" aria-labelledby="breakdown-heading">
          <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-emerald-600" aria-hidden="true" /><h2 id="breakdown-heading" className="text-lg font-bold text-gray-900">Emission Breakdown</h2></div>
          <div className="flex items-center gap-4">
            <div className="w-40 h-40" role="img" aria-label={`Emission breakdown: ${donutData.map(d => `${d.name} ${d.value} kg`).join(', ')}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={800}>{donutData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}</Pie><Tooltip formatter={(val) => `${Number(val).toLocaleString()} kg CO2`} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {donutData.map((d, idx) => (<div key={d.name} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} aria-hidden="true" /><span className="text-xs text-gray-600 flex-1">{d.name}</span><span className="text-xs font-semibold text-gray-800">{d.value.toLocaleString()} kg</span></div>))}
            </div>
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm" aria-labelledby="garden-heading">
          <div className="flex items-center gap-2 mb-4"><TreePine className="w-5 h-5 text-emerald-600" aria-hidden="true" /><h2 id="garden-heading" className="text-lg font-bold text-gray-900">Your Eco-Garden</h2></div>
          <VirtualGarden level={gardenLevel} wilting={wilting} />
          <p className="text-center text-xs text-gray-500 mt-2">{wilting ? 'Your tree is wilting! Complete actions to nurture it back.' : `${reductionPct.toFixed(1)}% reduction from baseline — keep going!`}</p>
        </section>
      </div>

      <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm mb-6" aria-labelledby="progress-heading">
        <div className="flex items-center gap-2 mb-4"><TrendingDown className="w-5 h-5 text-emerald-600" aria-hidden="true" /><h2 id="progress-heading" className="text-lg font-bold text-gray-900">Progress Over Time</h2></div>
        <div className="h-64" role="img" aria-label="Line chart showing emissions progress over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a3a3a3" />
              <YAxis tick={{ fontSize: 12 }} stroke="#a3a3a3" />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Total (kg CO2)" />
              <Line type="monotone" dataKey="transport" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 5" name="Transport" />
              <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={1.5} strokeDasharray="5 5" name="Energy" />
              <Line type="monotone" dataKey="food" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 5" name="Food" />
              <Line type="monotone" dataKey="waste" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 5" name="Waste" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {showCheckin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="checkin-heading">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 id="checkin-heading" className="text-xl font-bold text-gray-900 mb-4">Weekly Check-in</h2>
            <p className="text-sm text-gray-500 mb-6">Estimate your reduction in each category compared to your baseline.</p>
            <div className="space-y-4">
              {[{ key: 'transport' as const, label: 'Transport Reduction' }, { key: 'energy' as const, label: 'Energy Reduction' }, { key: 'food' as const, label: 'Food Reduction' }, { key: 'waste' as const, label: 'Waste Reduction' }].map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between mb-1"><label htmlFor={`checkin-${key}`} className="text-sm font-medium text-gray-700">{label}</label><span className="text-sm font-bold text-emerald-700" aria-live="polite">{checkinAnswers[key]}%</span></div>
                  <input id={`checkin-${key}`} type="range" min={0} max={50} value={checkinAnswers[key]} onChange={e => setCheckinAnswers({ ...checkinAnswers, [key]: Number(e.target.value) })} aria-labelledby={`checkin-${key}`} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCheckin(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCheckin} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition">Submit Check-in</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
