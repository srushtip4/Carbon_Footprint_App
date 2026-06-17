import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActionItem } from '../../types';
import { getActions, saveAction, generateId } from '../../db/database';
import { getWorstCategory } from '../../utils/emissions';
import { Target, Check, Plus, Leaf, Car, Zap, Utensils, Trash2, Sparkles } from 'lucide-react';

const ACTION_TEMPLATES: Record<string, Omit<ActionItem, 'id' | 'userId' | 'completed' | 'completedAt'>[]> = {
  transport: [
    { category: 'transport', title: 'Carpooled or used public transit today', description: 'Share a ride or take the bus/train instead of driving alone', co2SavingKg: 2.5 },
    { category: 'transport', title: 'Walked or biked for a short trip', description: 'Replace a car trip under 3 km/mi with walking or cycling', co2SavingKg: 1.8 },
    { category: 'transport', title: 'Combined multiple errands into one trip', description: 'Plan your route to reduce total driving distance', co2SavingKg: 3.0 },
    { category: 'transport', title: 'Worked from home today', description: 'Eliminate the commute entirely for the day', co2SavingKg: 4.2 },
    { category: 'transport', title: 'Used an EV or hybrid for travel', description: 'Choose electric over gasoline when possible', co2SavingKg: 2.0 },
  ],
  energy: [
    { category: 'energy', title: 'Unplugged standby electronics', description: 'Unplug chargers, TVs, and devices not in active use', co2SavingKg: 0.5 },
    { category: 'energy', title: 'Turned off lights in empty rooms', description: 'Be mindful of unnecessary lighting', co2SavingKg: 0.3 },
    { category: 'energy', title: 'Used natural light instead of artificial', description: 'Open curtains and position desks near windows', co2SavingKg: 0.4 },
    { category: 'energy', title: 'Adjusted thermostat by 2 degrees', description: 'Lower heating or raise cooling by 2 degrees', co2SavingKg: 1.5 },
    { category: 'energy', title: 'Ran appliances during off-peak hours', description: 'Use washing machine, dishwasher during low-demand periods', co2SavingKg: 0.6 },
  ],
  food: [
    { category: 'food', title: 'Had a meat-free day', description: 'Choose plant-based meals for the entire day', co2SavingKg: 3.6 },
    { category: 'food', title: 'Bought locally sourced produce', description: 'Purchase food grown within 100 km/mi of your location', co2SavingKg: 1.2 },
    { category: 'food', title: 'Cooked exact portions to avoid waste', description: 'Measure ingredients precisely to prevent leftover waste', co2SavingKg: 0.8 },
    { category: 'food', title: 'Composted food scraps', description: 'Divert organic waste from landfill to compost', co2SavingKg: 0.5 },
    { category: 'food', title: 'Packed lunch instead of takeout', description: 'Avoid disposable containers and delivery emissions', co2SavingKg: 1.0 },
  ],
  waste: [
    { category: 'waste', title: 'Recycled all materials today', description: 'Properly sorted glass, paper, aluminum, and plastic', co2SavingKg: 0.7 },
    { category: 'waste', title: 'Used a reusable water bottle', description: 'Avoid single-use plastic bottles', co2SavingKg: 0.2 },
    { category: 'waste', title: 'Avoided fast fashion purchase', description: 'Chose not to buy new clothing — repaired or wore existing items', co2SavingKg: 5.0 },
    { category: 'waste', title: 'Repaired instead of replaced', description: 'Fixed a broken item rather than buying new', co2SavingKg: 8.0 },
    { category: 'waste', title: 'Used reusable shopping bags', description: 'Brought your own bags to every store visit', co2SavingKg: 0.15 },
  ],
  general: [
    { category: 'general', title: 'Planted a tree or contributed to reforestation', description: 'Direct carbon sequestration through tree planting', co2SavingKg: 21.0 },
    { category: 'general', title: 'Offset travel emissions', description: 'Purchased carbon offset for a trip', co2SavingKg: 10.0 },
  ],
};

const CATEGORY_ICONS: Record<string, React.ElementType> = { transport: Car, energy: Zap, food: Utensils, waste: Trash2, general: Sparkles };

export default function ActionCenter() {
  const { user, baselineEmissions, addPoints } = useAuth();
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  useEffect(() => { if (user) loadActions(); }, [user]);

  const loadActions = async () => {
    if (!user) return;
    const existing = await getActions(user.id);
    if (existing.length === 0 && baselineEmissions) {
      const worst = getWorstCategory(baselineEmissions);
      const templates = ACTION_TEMPLATES[worst] ?? ACTION_TEMPLATES.general;
      const initial: ActionItem[] = templates.map(t => ({ ...t, id: generateId(), userId: user.id, completed: false, completedAt: null }));
      for (const a of initial) await saveAction(a);
      setActions(initial);
    } else { setActions(existing); }
  };

  const toggleAction = async (action: ActionItem) => {
    if (!user) return;
    const updated: ActionItem = { ...action, completed: !action.completed, completedAt: !action.completed ? Date.now() : null };
    await saveAction(updated);
    if (!action.completed) { await addPoints(10); setJustCompleted(action.id); setTimeout(() => setJustCompleted(null), 2000); }
    setActions(prev => prev.map(a => a.id === action.id ? updated : a));
  };

  const addAction = async (template: Omit<ActionItem, 'id' | 'userId' | 'completed' | 'completedAt'>) => {
    if (!user) return;
    const newAction: ActionItem = { ...template, id: generateId(), userId: user.id, completed: false, completedAt: null };
    await saveAction(newAction);
    setActions(prev => [...prev, newAction]);
    setShowAddMenu(false);
  };

  const completedCount = actions.filter(a => a.completed).length;
  const totalSavings = actions.filter(a => a.completed).reduce((sum, a) => sum + a.co2SavingKg, 0);

  if (!baselineEmissions) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center" role="status">
        <Target className="w-12 h-12 text-emerald-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Complete Your Quiz First</h2>
        <p className="text-gray-500 mb-4">Take the carbon footprint quiz to get personalized action recommendations.</p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'quiz' }))} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Take the Quiz</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6"><Target className="w-6 h-6 text-emerald-600" aria-hidden="true" /><h1 className="text-2xl font-bold text-gray-900">Action Center</h1></div>
      <div className="grid grid-cols-2 gap-4 mb-6" role="list" aria-label="Action statistics">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-emerald-100 shadow-sm" role="listitem"><p className="text-sm text-gray-500">Completed Actions</p><p className="text-2xl font-bold text-emerald-700">{completedCount}/{actions.length}</p></div>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-emerald-100 shadow-sm" role="listitem"><p className="text-sm text-gray-500">CO2 Savings from Actions</p><p className="text-2xl font-bold text-emerald-700">{totalSavings.toFixed(1)} kg</p></div>
      </div>
      <ul className="space-y-3 mb-6" aria-label="Action items">
        {actions.map(action => {
          const Icon = CATEGORY_ICONS[action.category] ?? Leaf;
          return (
            <li key={action.id} className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 border transition-all flex items-start gap-4 ${action.completed ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100'} ${justCompleted === action.id ? 'ring-2 ring-emerald-400 scale-[1.02]' : ''}`}>
              <button onClick={() => toggleAction(action)} aria-label={`${action.completed ? 'Mark as incomplete' : 'Mark as complete'}: ${action.title}`} role="checkbox" aria-checked={action.completed} className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${action.completed ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}>
                {action.completed && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-gray-400" aria-hidden="true" /><span className={`font-semibold text-sm ${action.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{action.title}</span></div>
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">-{action.co2SavingKg} kg</span>
            </li>
          );
        })}
      </ul>
      <div className="relative">
        <button onClick={() => setShowAddMenu(!showAddMenu)} aria-expanded={showAddMenu} aria-haspopup="true" aria-label="Add new action" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-sm"><Plus className="w-4 h-4" aria-hidden="true" /> Add Action</button>
        {showAddMenu && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 max-h-80 overflow-y-auto" role="menu" aria-label="Available actions to add">
            {Object.entries(ACTION_TEMPLATES).map(([cat, templates]) => (
              <div key={cat} className="mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{cat}</h3>
                {templates.map((t, idx) => (
                  <button key={idx} onClick={() => addAction(t)} role="menuitem" className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 transition text-sm">
                    <Plus className="w-3 h-3 text-emerald-500" aria-hidden="true" /><span className="text-gray-700 flex-1">{t.title}</span><span className="text-xs text-emerald-600">-{t.co2SavingKg} kg</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
