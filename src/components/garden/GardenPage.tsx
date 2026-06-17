import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCheckins } from '../../db/database';
import { getReductionPct, getGardenLevel } from '../../utils/emissions';
import VirtualGarden from './VirtualGarden';
import { TreePine, Info } from 'lucide-react';

export default function GardenPage() {
  const { user, baselineEmissions } = useAuth();
  const [reductionPct, setReductionPct] = useState(0);
  const [prevReductionPct, setPrevReductionPct] = useState(0);

  useEffect(() => {
    if (!user || !baselineEmissions) return;
    loadGardenState();
  }, [user, baselineEmissions]);

  const loadGardenState = async () => {
    if (!user || !baselineEmissions) return;
    const checkins = await getCheckins(user.id);
    if (checkins.length > 0) {
      const latest = checkins[checkins.length - 1].totalNetEmissions;
      setReductionPct(getReductionPct(baselineEmissions.total, latest));
      if (checkins.length > 1) setPrevReductionPct(getReductionPct(baselineEmissions.total, checkins[checkins.length - 2].totalNetEmissions));
    }
  };

  if (!user || !baselineEmissions) {
    return (<div className="max-w-3xl mx-auto px-4 py-12 text-center" role="status"><TreePine className="w-12 h-12 text-emerald-400 mx-auto mb-4" aria-hidden="true" /><h2 className="text-xl font-bold text-gray-800">Complete Your Quiz to Unlock</h2><p className="text-gray-500">Your eco-garden grows as you reduce your carbon footprint.</p></div>);
  }

  const gardenLevel = getGardenLevel(reductionPct);
  const wilting = reductionPct < prevReductionPct;
  const phases = [
    { level: 1, name: 'Dormant Seed', desc: 'Your journey begins here', range: '0%' },
    { level: 2, name: 'Green Sprout', desc: 'A tiny sprout breaks through', range: '1-5%' },
    { level: 3, name: 'Leafy Sapling', desc: 'Growing stronger with leaves', range: '6-14%' },
    { level: 4, name: 'Young Tree', desc: 'A strong young tree with branches', range: '15-24%' },
    { level: 5, name: 'Blossoming Eco-Tree', desc: 'A magnificent tree with flowers and fruit!', range: '25%+' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6"><TreePine className="w-6 h-6 text-emerald-600" aria-hidden="true" /><h1 className="text-2xl font-bold text-gray-900">Your Eco-Garden</h1></div>
      <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100 mb-6" aria-labelledby="garden-view-heading">
        <h2 id="garden-view-heading" className="sr-only">Garden Visualization</h2>
        <VirtualGarden level={gardenLevel} wilting={wilting} />
        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-gray-900" aria-live="polite">{wilting ? 'Your tree is wilting...' : phases[gardenLevel - 1].name}</p>
          <p className="text-sm text-gray-500">{wilting ? 'Complete actions to nurture it back.' : phases[gardenLevel - 1].desc}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
            <span className="text-sm font-semibold text-emerald-700">{reductionPct.toFixed(1)}% reduction</span>
            <span className="text-xs text-emerald-500">from baseline</span>
          </div>
        </div>
      </section>
      <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-100" aria-labelledby="phases-heading">
        <div className="flex items-center gap-2 mb-4"><Info className="w-5 h-5 text-emerald-600" aria-hidden="true" /><h2 id="phases-heading" className="text-lg font-bold text-gray-900">Growth Phases</h2></div>
        <ol className="space-y-3" aria-label="Garden growth phases">
          {phases.map(phase => (
            <li key={phase.level} className={`flex items-center gap-4 p-3 rounded-xl transition ${gardenLevel === phase.level ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50/50'}`} aria-current={gardenLevel === phase.level ? 'step' : undefined}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${gardenLevel >= phase.level ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`} aria-hidden="true">
                {gardenLevel > phase.level ? '\u2713' : phase.level}
              </div>
              <div className="flex-1"><p className="text-sm font-semibold text-gray-800">{phase.name}</p><p className="text-xs text-gray-500">{phase.desc}</p></div>
              <span className="text-xs font-semibold text-gray-400">{phase.range} reduction</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
