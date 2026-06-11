import { useState } from 'react';
import { Leaf, Car, Utensils, Zap, Plane, Calculator, ArrowRight } from 'lucide-react';

const ACTIVITIES = [
  { icon: Car, label: 'Driving a gasoline car', factor: 0.21, unit: 'km', defaultVal: 50, color: 'text-orange-500' },
  { icon: Plane, label: 'Flying economy class', factor: 0.255, unit: 'km', defaultVal: 500, color: 'text-blue-500' },
  { icon: Utensils, label: 'Eating a beef meal', factor: 6.61, unit: 'meal', defaultVal: 1, color: 'text-red-500' },
  { icon: Zap, label: 'Home electricity usage', factor: 0.417, unit: 'kWh', defaultVal: 30, color: 'text-yellow-500' },
];

export default function CarbonMathPage() {
  const [selectedActivity, setSelectedActivity] = useState(0);
  const [sliderVal, setSliderVal] = useState(ACTIVITIES[0].defaultVal);

  const activity = ACTIVITIES[selectedActivity];
  const co2Result = (activity.factor * sliderVal).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
          <Leaf className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Carbon Math Made Easy</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Understanding your carbon footprint doesn't need a PhD. Here's the simple truth behind the numbers.</p>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 border border-emerald-100 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Core Formula</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl px-6 py-4 text-center">
            <span className="text-3xl font-bold text-emerald-700">Emissions</span>
            <p className="text-xs text-emerald-600 mt-1">kg of CO2</p>
          </div>
          <span className="text-3xl font-bold text-gray-400">=</span>
          <div className="bg-sky-50 border-2 border-sky-200 rounded-xl px-6 py-4 text-center">
            <span className="text-3xl font-bold text-sky-700">Activity</span>
            <p className="text-xs text-sky-600 mt-1">how much you do it</p>
          </div>
          <span className="text-3xl font-bold text-gray-400">&times;</span>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-6 py-4 text-center">
            <span className="text-3xl font-bold text-amber-700">Emission Factor</span>
            <p className="text-xs text-amber-600 mt-1">CO2 per unit of activity</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-700 text-lg">Think of it like a recipe: <strong>how much</strong> of something you do, multiplied by <strong>how polluting</strong> each unit is.</p>
          <p className="text-gray-500 mt-2 text-sm">Example: Driving 50 km &times; 0.21 kg CO2/km = <strong>10.5 kg CO2</strong></p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 border border-emerald-100 mb-12">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Try It Yourself</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {ACTIVITIES.map((act, idx) => (
            <button key={idx} onClick={() => { setSelectedActivity(idx); setSliderVal(act.defaultVal); }} className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${selectedActivity === idx ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-100 bg-white hover:border-emerald-200'}`}>
              <act.icon className={`w-8 h-8 ${act.color} mb-2`} />
              <span className="text-xs text-gray-700 text-center font-medium">{act.label}</span>
            </button>
          ))}
        </div>
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{activity.label}</span>
            <span className="text-sm font-bold text-emerald-700">{sliderVal} {activity.unit}</span>
          </div>
          <input type="range" min={activity.unit === 'meal' ? 1 : 1} max={activity.unit === 'meal' ? 10 : activity.unit === 'km' ? 2000 : 1000} value={sliderVal} onChange={e => setSliderVal(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 {activity.unit}</span>
            <span>{activity.unit === 'meal' ? '10' : activity.unit === 'km' ? '2,000' : '1,000'} {activity.unit}</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl p-6 text-center border border-emerald-200">
          <p className="text-gray-600 mb-2">{sliderVal} {activity.unit} of {activity.label.toLowerCase()} produces</p>
          <div className="text-5xl font-bold text-emerald-700 mb-1">{co2Result}</div>
          <p className="text-gray-500">kg of CO2 emissions</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <ArrowRight className="w-4 h-4" />
            <span>That's equivalent to about <strong>{(Number(co2Result) / 0.5).toFixed(0)}</strong> hours of charging a smartphone</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-emerald-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What is an Emission Factor?</h3>
          <p className="text-gray-600 leading-relaxed">An emission factor is a number that tells you how much CO2 is released per unit of activity. For example, burning 1 liter of gasoline releases about 2.3 kg of CO2. These factors are measured by scientists at agencies like the US EPA and UK DEFRA, and they vary by region depending on how energy is produced locally.</p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-emerald-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Why Does Location Matter?</h3>
          <p className="text-gray-600 leading-relaxed">The same activity can have very different emissions depending on where you live. Charging an electric car in Norway (98% renewable grid) produces far less CO2 than in a region powered by coal plants. That's why your country's energy mix is critical for accurate carbon accounting.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white">
        <h2 className="text-2xl font-bold mb-6">Did You Know?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-6"><p className="text-3xl font-bold mb-2">4.7t</p><p className="text-emerald-100">Average annual CO2 per person globally</p></div>
          <div className="bg-white/10 rounded-xl p-6"><p className="text-3xl font-bold mb-2">15.5t</p><p className="text-emerald-100">Average annual CO2 per person in the US</p></div>
          <div className="bg-white/10 rounded-xl p-6"><p className="text-3xl font-bold mb-2">1.9t</p><p className="text-emerald-100">Average annual CO2 per person in India</p></div>
        </div>
      </div>
    </div>
  );
}
