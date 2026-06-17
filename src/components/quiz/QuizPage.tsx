import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QuizAnswers, LocaleConfig } from '../../types';
import { calculateEmissions } from '../../utils/emissions';
import { saveQuizAnswers, getEcoPoints, saveEcoPoints } from '../../db/database';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { validateNumberInput, sanitizeText } from '../../utils/validation';

interface QuizQuestion {
  id: keyof QuizAnswers;
  category: string;
  label: string;
  type: 'select' | 'number';
  options?: { value: number; label: string }[];
  min?: number;
  max?: number;
  unitOverride?: string;
}

function getQuestions(locale: LocaleConfig): QuizQuestion[] {
  const distUnit = locale.distanceUnit === 'miles' ? 'miles' : 'km';
  const cs = locale.currencySymbol;
  return [
    { id: 'q1_transport_mode', category: 'TRANSPORTATION', label: 'What is your primary mode of daily transport?', type: 'select', options: [
      { value: 0, label: 'Gasoline SUV' }, { value: 1, label: 'Sedan' }, { value: 2, label: 'Hybrid' },
      { value: 3, label: 'Electric Vehicle' }, { value: 4, label: 'Public Transit' }, { value: 5, label: 'Walking/Biking' },
    ]},
    { id: 'q2_weekly_distance', category: 'TRANSPORTATION', label: 'What is your average weekly travel distance?', type: 'number', min: 0, max: 1000, unitOverride: distUnit },
    { id: 'q3_public_transit_hours', category: 'TRANSPORTATION', label: 'How many hours per week do you spend on public transit?', type: 'number', min: 0, max: 30, unitOverride: 'hours' },
    { id: 'q4_rideshare_frequency', category: 'TRANSPORTATION', label: 'How often do you use ride-sharing services per week?', type: 'select', options: [
      { value: 0, label: 'Never' }, { value: 1, label: '1-2 times' }, { value: 2, label: '3-5 times' }, { value: 3, label: 'Daily' },
    ]},
    { id: 'q5_short_flights', category: 'FLIGHTS', label: 'How many short-haul flights (under 3 hours) per year?', type: 'number', min: 0, max: 50, unitOverride: 'flights/year' },
    { id: 'q6_long_flights', category: 'FLIGHTS', label: 'How many medium/long-haul flights (over 3 hours) per year?', type: 'number', min: 0, max: 30, unitOverride: 'flights/year' },
    { id: 'q7_electricity_bill', category: 'HOME ENERGY & UTILITIES', label: 'What is your average monthly electricity bill?', type: 'number', min: 0, max: 1000, unitOverride: cs },
    { id: 'q8_heating_fuel', category: 'HOME ENERGY & UTILITIES', label: 'Primary heating/cooling fuel source?', type: 'select', options: [
      { value: 0, label: 'Natural Gas' }, { value: 1, label: 'Electricity' }, { value: 2, label: 'Fuel Oil' }, { value: 3, label: 'Solar/Renewables' },
    ]},
    { id: 'q9_renewable_pct', category: 'HOME ENERGY & UTILITIES', label: 'Percentage of home energy from renewables?', type: 'select', options: [
      { value: 0, label: '0%' }, { value: 25, label: '25%' }, { value: 50, label: '50%' }, { value: 100, label: '100%' },
    ]},
    { id: 'q10_diet', category: 'DIET & FOOD', label: 'Which best describes your diet?', type: 'select', options: [
      { value: 0, label: 'Heavy Meat Eater' }, { value: 1, label: 'Moderate Meat Eater' }, { value: 2, label: 'Low Meat / Flexitarian' },
      { value: 3, label: 'Vegetarian' }, { value: 4, label: 'Vegan' },
    ]},
    { id: 'q11_local_food', category: 'DIET & FOOD', label: 'How often do you buy locally sourced food vs imported?', type: 'select', options: [
      { value: 0, label: 'Always imported' }, { value: 1, label: 'Balanced' }, { value: 2, label: 'Mostly Local/Seasonal' },
    ]},
    { id: 'q12_food_waste', category: 'DIET & FOOD', label: 'How much food waste does your household generate weekly?', type: 'select', options: [
      { value: 0, label: 'High waste' }, { value: 1, label: 'Average' }, { value: 2, label: 'Minimal/Zero Waste' },
    ]},
    { id: 'q13_garbage_bags', category: 'CONSUMER HABITS & WASTE', label: 'How many bags of household garbage weekly?', type: 'number', min: 0, max: 10, unitOverride: 'bags' },
    { id: 'q14_recycling', category: 'CONSUMER HABITS & WASTE', label: 'Do you actively recycle glass, paper, aluminum, plastic?', type: 'select', options: [
      { value: 0, label: 'No recycling' }, { value: 1, label: 'Partial recycling' }, { value: 2, label: 'Strict recycling of all materials' },
    ]},
    { id: 'q15_shopping', category: 'CONSUMER HABITS & WASTE', label: 'How frequently do you purchase new clothing/electronics?', type: 'select', options: [
      { value: 0, label: 'Very frequent / Monthly' }, { value: 1, label: 'Moderate / Seasonal' }, { value: 2, label: 'Rare / Only when necessary' },
    ]},
  ];
}

const COLORS = ['#f97316', '#3b82f6', '#eab308', '#22c55e', '#8b5cf6'];

export default function QuizPage() {
  const { user, locale, refreshUserData, addPoints } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [showResults, setShowResults] = useState(false);
  const [emissions, setEmissions] = useState<ReturnType<typeof calculateEmissions> | null>(null);
  const [validationError, setValidationError] = useState('');
  const optionRef = useRef<HTMLButtonElement[]>([]);

  if (!user || !locale) return null;

  const questions = getQuestions(locale);
  const question = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    setValidationError('');
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) { setStep(step + 1); }
    else {
      const fullAnswers: QuizAnswers = {
        q1_transport_mode: newAnswers.q1_transport_mode ?? 0, q2_weekly_distance: newAnswers.q2_weekly_distance ?? 0,
        q3_public_transit_hours: newAnswers.q3_public_transit_hours ?? 0, q4_rideshare_frequency: newAnswers.q4_rideshare_frequency ?? 0,
        q5_short_flights: newAnswers.q5_short_flights ?? 0, q6_long_flights: newAnswers.q6_long_flights ?? 0,
        q7_electricity_bill: newAnswers.q7_electricity_bill ?? 0, q8_heating_fuel: newAnswers.q8_heating_fuel ?? 0,
        q9_renewable_pct: newAnswers.q9_renewable_pct ?? 0, q10_diet: newAnswers.q10_diet ?? 0,
        q11_local_food: newAnswers.q11_local_food ?? 0, q12_food_waste: newAnswers.q12_food_waste ?? 0,
        q13_garbage_bags: newAnswers.q13_garbage_bags ?? 0, q14_recycling: newAnswers.q14_recycling ?? 0,
        q15_shopping: newAnswers.q15_shopping ?? 0,
      };
      const result = calculateEmissions(fullAnswers, locale);
      setEmissions(result);
      setShowResults(true);
      saveQuizAnswers(user.id, fullAnswers, result).then(async () => {
        const currentPoints = await getEcoPoints(user.id);
        await saveEcoPoints(user.id, currentPoints + 100);
        await addPoints(0);
        await refreshUserData();
      }).catch(console.error);
    }
  };

  const handleNumberSubmit = () => {
    setValidationError('');
    const value = answers[question.id] as number | undefined;
    if (question.type === 'number' && question.min !== undefined && question.max !== undefined) {
      const result = validateNumberInput(value, question.min, question.max, question.label);
      if (!result.valid) { setValidationError(result.error); return; }
    }
    handleAnswer(value ?? 0);
  };

  const currentValue = question ? answers[question.id] : undefined;

  if (showResults && emissions) {
    const chartData = [
      { name: 'Transport', value: emissions.transport }, { name: 'Flights', value: emissions.flights },
      { name: 'Energy', value: emissions.energy }, { name: 'Food', value: emissions.food },
      { name: 'Waste', value: emissions.waste },
    ].filter(d => d.value > 0);

    return (
      <section className="max-w-3xl mx-auto px-4 py-8" aria-labelledby="results-heading">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
          <h1 id="results-heading" className="text-3xl font-bold text-gray-900">Your Carbon Footprint Results</h1>
          <p className="text-gray-500 mt-2">Based on your lifestyle using {sanitizeText(locale.emissionSource)} factors</p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-emerald-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-64 h-64" role="img" aria-label={`Emission breakdown chart. Transport: ${emissions.transport} kg, Flights: ${emissions.flights} kg, Energy: ${emissions.energy} kg, Food: ${emissions.food} kg, Waste: ${emissions.waste} kg`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={1200}>
                    {chartData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => `${Number(val).toLocaleString()} kg CO2`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <div className="text-center md:text-left mb-4">
                <p className="text-gray-500 text-sm">Total Annual Carbon Footprint</p>
                <p className="text-5xl font-bold text-emerald-700">{emissions.total.toLocaleString()}</p>
                <p className="text-gray-500">kg CO2 per year</p>
              </div>
              <div className="space-y-2">
                {chartData.map((d, idx) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} aria-hidden="true" />
                    <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{d.value.toLocaleString()} kg</span>
                    <span className="text-xs text-gray-400">{((d.value / emissions.total) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-200">Go to Dashboard</button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-8" aria-labelledby="quiz-heading">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{question.category}</span>
          <span aria-live="polite">{step + 1} of {questions.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label="Quiz progress">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-emerald-100">
        <h2 id="quiz-heading" className="text-xl font-bold text-gray-900 mb-6">{question.label}</h2>
        {question.type === 'select' ? (
          <div className="space-y-3" role="radiogroup" aria-labelledby="quiz-heading">
            {question.options?.map((opt, idx) => (
              <button
                key={opt.value}
                ref={el => { if (el) optionRef.current[idx] = el; }}
                onClick={() => handleAnswer(opt.value)}
                role="radio"
                aria-checked={currentValue === opt.value}
                className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all ${currentValue === opt.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-gray-100 hover:border-emerald-200 text-gray-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <label htmlFor={`quiz-${question.id}`} className="sr-only">{question.label}</label>
              <input id={`quiz-${question.id}`} type="number" min={question.min} max={question.max} value={currentValue != null ? String(currentValue) : ''} onChange={e => { setValidationError(''); setAnswers({ ...answers, [question.id]: Number(e.target.value) }); }} aria-describedby={validationError ? 'quiz-validation-error' : undefined} className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-lg font-semibold text-gray-800" placeholder="0" />
              <span className="text-gray-500 font-medium">{question.unitOverride}</span>
            </div>
            {question.min !== undefined && question.max !== undefined && (
              <>
                <label htmlFor={`quiz-range-${question.id}`} className="sr-only">{question.label} slider</label>
                <input id={`quiz-range-${question.id}`} type="range" min={question.min} max={question.max} value={(currentValue as number) ?? question.min ?? 0} onChange={e => { setValidationError(''); setAnswers({ ...answers, [question.id]: Number(e.target.value) }); }} aria-labelledby={`quiz-${question.id}`} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
              </>
            )}
          </div>
        )}
        {validationError && <div id="quiz-validation-error" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mt-4" role="alert">{validationError}</div>}
        <div className="flex justify-between mt-8">
          <button onClick={() => { setValidationError(''); setStep(Math.max(0, step - 1)); }} disabled={step === 0} className="flex items-center gap-1 px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4" aria-hidden="true" /> Back</button>
          {question.type === 'number' && (
            <button onClick={handleNumberSubmit} className="flex items-center gap-1 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition">
              {step === questions.length - 1 ? 'See Results' : 'Next'} <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
