import { useState } from 'react';
import { Leaf, Car, Utensils, Zap, Plane, Calculator, ArrowRight, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const ACTIVITIES = [
  { icon: Car, label: 'Driving a gasoline car', factor: 0.21, unit: 'km', defaultVal: 50, color: 'text-orange-500', max: 2000 },
  { icon: Plane, label: 'Flying economy class', factor: 0.255, unit: 'km', defaultVal: 500, color: 'text-blue-500', max: 2000 },
  { icon: Utensils, label: 'Eating a beef meal', factor: 6.61, unit: 'meal', defaultVal: 1, color: 'text-red-500', max: 10 },
  { icon: Zap, label: 'Home electricity usage', factor: 0.417, unit: 'kWh', defaultVal: 30, color: 'text-yellow-500', max: 1000 },
];

const GLOSSARY = [
  { term: 'Carbon Footprint', short: 'The total greenhouse gases you produce', detail: 'Your carbon footprint is the total amount of greenhouse gases (mainly CO2 and methane) that are released into the atmosphere as a result of your activities. Think of it like a "shadow" you leave on the planet — the bigger your shadow, the more you\'re heating the Earth.' },
  { term: 'CO2 (Carbon Dioxide)', short: 'The main greenhouse gas from burning fuel', detail: 'Carbon dioxide is a gas released when you burn coal, oil, gas, or wood. It\'s invisible, but it acts like a blanket around the Earth, trapping heat. Even though it exists naturally, humans are producing too much of it — about 37 billion tonnes every year.' },
  { term: 'Greenhouse Gas (GHG)', short: 'Gases that trap heat in Earth\'s atmosphere', detail: 'Greenhouse gases include CO2, methane, nitrous oxide, and water vapor. They act exactly like the glass in a greenhouse — they let sunlight in but trap heat from escaping. Without them, Earth would be freezing. Too many of them causes dangerous warming.' },
  { term: 'Emission Factor', short: 'How much CO2 one unit of activity produces', detail: 'An emission factor is a number that tells scientists how much CO2 is produced per unit of activity. For example, driving 1 km in an average petrol car releases about 0.21 kg of CO2. These factors are carefully measured by environmental agencies like the US EPA and UK DEFRA.' },
  { term: 'Carbon Offset', short: 'Paying to remove CO2 elsewhere to balance yours', detail: 'A carbon offset is when you pay for an activity that removes or avoids CO2 somewhere else to "cancel out" your own emissions. For example, paying to plant trees that absorb CO2. It\'s like eating an unhealthy meal but then going for a run — you\'re trying to balance it out.' },
  { term: 'Net Zero', short: 'Producing only as much CO2 as you remove', detail: 'Net zero means the total CO2 you produce equals the total CO2 you\'re removing or offsetting. Imagine a bucket — net zero means you\'re pouring in the same amount of water as you\'re taking out, keeping the level steady. Many countries have pledged to reach net zero by 2050.' },
  { term: 'Renewable Energy', short: 'Power from sources that naturally replenish', detail: 'Renewable energy comes from sources that nature constantly restores — sunlight, wind, rain, tides, and geothermal heat. Unlike coal or oil which took millions of years to form and run out when used, renewable sources are essentially unlimited and produce little to no CO2 during use.' },
  { term: 'Carbon Sequestration', short: 'Capturing and storing CO2 from the atmosphere', detail: 'Sequestration means capturing CO2 and locking it away so it can\'t warm the planet. Trees do this naturally by absorbing CO2 as they grow. Scientists are also developing machines that suck CO2 directly from the air and store it underground — like a vacuum cleaner for greenhouse gases.' },
  { term: 'Fossil Fuels', short: 'Ancient organic matter burned for energy', detail: 'Fossil fuels (coal, oil, natural gas) are formed from plants and animals that died millions of years ago and were compressed underground. When we burn them for energy, we release all that stored carbon into the atmosphere as CO2 — essentially undoing millions of years of carbon storage in just a few centuries.' },
  { term: 'Carbon Budget', short: 'The maximum CO2 humanity can still emit', detail: 'A carbon budget is the total amount of CO2 that humans can still emit while keeping global warming below a certain level (like 1.5°C). Once this budget is spent, we\'ve locked in dangerous climate change. Scientists estimate we\'ll exhaust the 1.5°C budget in fewer than 10 years at current emission rates.' },
  { term: 'Scope 1, 2 & 3 Emissions', short: 'Categories of emissions by source and control', detail: 'These are three levels used in business and personal accounting. Scope 1 = emissions you produce directly (driving your car). Scope 2 = emissions from energy you buy (your electricity use). Scope 3 = all other indirect emissions in your supply chain (the manufacturing of your phone, shipping of food you buy, etc.). Scope 3 is usually the biggest — and hardest to measure.' },
  { term: 'Paris Agreement', short: 'A global treaty to limit temperature rise to 1.5°C', detail: 'The Paris Agreement is an international climate treaty signed in 2015 by nearly every country. They agreed to work together to limit global warming to well below 2°C above pre-industrial levels, aiming for 1.5°C. Each country pledges emissions cuts, but scientists say current pledges aren\'t enough.' },
  { term: 'Life Cycle Assessment (LCA)', short: 'Measuring a product\'s total environmental impact', detail: 'An LCA measures the total environmental impact of a product from creation to disposal — "cradle to grave." For example, an electric car\'s LCA includes the CO2 from mining battery materials, manufacturing, the electricity used while driving, and eventually recycling. It gives a full picture, not just the tailpipe emissions.' },
  { term: 'Carbon Neutral', short: 'Achieving zero net CO2 by balancing emissions with offsets', detail: 'Carbon neutral means that the CO2 a person, product, or company releases is exactly matched by the CO2 they remove or offset elsewhere. Unlike "net zero" which includes all greenhouse gases, carbon neutral focuses specifically on CO2. Many companies claim to be carbon neutral by buying offsets, though critics say this isn\'t always meaningful.' },
  { term: 'Methane (CH4)', short: 'A powerful greenhouse gas from livestock and landfills', detail: 'Methane is a greenhouse gas 80 times more powerful than CO2 over 20 years, though it breaks down faster. It\'s released by livestock digestion, rice paddies, landfills, and natural gas leaks. Even though there\'s less methane in the atmosphere than CO2, its short-term warming impact is enormous — making it a top priority target for climate action.' },
];

export default function CarbonMathPage() {
  const [selectedActivity, setSelectedActivity] = useState(0);
  const [sliderVal, setSliderVal] = useState(ACTIVITIES[0].defaultVal);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const activity = ACTIVITIES[selectedActivity];
  const co2Result = (activity.factor * sliderVal).toFixed(2);
  const maxVal = activity.max;
  const maxLabel = activity.unit === 'meal' ? '10' : activity.unit === 'km' ? '2,000' : '1,000';

  return (
    <article className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
          <Leaf className="w-10 h-10 text-emerald-600" aria-hidden="true" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Carbon Math Made Easy</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Understanding your carbon footprint doesn't need a PhD. Here's the simple truth behind the numbers.</p>
      </div>

      <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 border border-emerald-100 mb-12" aria-labelledby="formula-heading">
        <h2 id="formula-heading" className="text-2xl font-bold text-gray-900 mb-6 text-center">The Core Formula</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8" role="math" aria-label="Emissions equals Activity multiplied by Emission Factor">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl px-6 py-4 text-center">
            <span className="text-3xl font-bold text-emerald-700">Emissions</span>
            <p className="text-xs text-emerald-600 mt-1">kg of CO2</p>
          </div>
          <span className="text-3xl font-bold text-gray-400" aria-hidden="true">=</span>
          <div className="bg-sky-50 border-2 border-sky-200 rounded-xl px-6 py-4 text-center">
            <span className="text-3xl font-bold text-sky-700">Activity</span>
            <p className="text-xs text-sky-600 mt-1">how much you do it</p>
          </div>
          <span className="text-3xl font-bold text-gray-400" aria-hidden="true">&times;</span>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-6 py-4 text-center">
            <span className="text-3xl font-bold text-amber-700">Emission Factor</span>
            <p className="text-xs text-amber-600 mt-1">CO2 per unit of activity</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-700 text-lg">Think of it like a recipe: <strong>how much</strong> of something you do, multiplied by <strong>how polluting</strong> each unit is.</p>
          <p className="text-gray-500 mt-2 text-sm">Example: Driving 50 km &times; 0.21 kg CO2/km = <strong>10.5 kg CO2</strong></p>
        </div>
      </section>

      <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 border border-emerald-100 mb-12" aria-labelledby="calculator-heading">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-6 h-6 text-emerald-600" aria-hidden="true" />
          <h2 id="calculator-heading" className="text-2xl font-bold text-gray-900">Try It Yourself</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8" role="tablist" aria-label="Activity types">
          {ACTIVITIES.map((act, idx) => (
            <button key={idx} onClick={() => { setSelectedActivity(idx); setSliderVal(act.defaultVal); }} role="tab" aria-selected={selectedActivity === idx} aria-controls="calculator-result" className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${selectedActivity === idx ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-100 bg-white hover:border-emerald-200'}`}>
              <act.icon className={`w-8 h-8 ${act.color} mb-2`} aria-hidden="true" />
              <span className="text-xs text-gray-700 text-center font-medium">{act.label}</span>
            </button>
          ))}
        </div>
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <label htmlFor="activity-slider" className="text-sm font-medium text-gray-600">{activity.label}</label>
            <span className="text-sm font-bold text-emerald-700" aria-live="polite">{sliderVal} {activity.unit}</span>
          </div>
          <input id="activity-slider" type="range" min={1} max={maxVal} value={sliderVal} onChange={e => setSliderVal(Number(e.target.value))} aria-valuemin={1} aria-valuemax={maxVal} aria-valuenow={sliderVal} aria-valuetext={`${sliderVal} ${activity.unit}`} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1" aria-hidden="true">
            <span>1 {activity.unit}</span>
            <span>{maxLabel} {activity.unit}</span>
          </div>
        </div>
        <div id="calculator-result" role="tabpanel" className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl p-6 text-center border border-emerald-200" aria-live="polite">
          <p className="text-gray-600 mb-2">{sliderVal} {activity.unit} of {activity.label.toLowerCase()} produces</p>
          <div className="text-5xl font-bold text-emerald-700 mb-1" aria-label={`${co2Result} kilograms of CO2`}>{co2Result}</div>
          <p className="text-gray-500">kg of CO2 emissions</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            <span>That's equivalent to about <strong>{(Number(co2Result) / 0.5).toFixed(0)}</strong> hours of charging a smartphone</span>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-emerald-100" aria-labelledby="ef-heading">
          <h3 id="ef-heading" className="text-xl font-bold text-gray-900 mb-4">What is an Emission Factor?</h3>
          <p className="text-gray-600 leading-relaxed">An emission factor is a number that tells you how much CO2 is released per unit of activity. For example, burning 1 liter of gasoline releases about 2.3 kg of CO2. These factors are measured by scientists at agencies like the US EPA and UK DEFRA, and they vary by region depending on how energy is produced locally.</p>
        </section>
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-emerald-100" aria-labelledby="location-heading">
          <h3 id="location-heading" className="text-xl font-bold text-gray-900 mb-4">Why Does Location Matter?</h3>
          <p className="text-gray-600 leading-relaxed">The same activity can have very different emissions depending on where you live. Charging an electric car in Norway (98% renewable grid) produces far less CO2 than in a region powered by coal plants. That's why your country's energy mix is critical for accurate carbon accounting.</p>
        </section>
      </div>

      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white" aria-labelledby="facts-heading">
        <h2 id="facts-heading" className="text-2xl font-bold mb-6">Did You Know?</h2>
        <div className="grid md:grid-cols-3 gap-6" role="list" aria-label="Carbon emission facts">
          <div className="bg-white/10 rounded-xl p-6" role="listitem"><p className="text-3xl font-bold mb-2">4.7t</p><p className="text-emerald-100">Average annual CO2 per person globally</p></div>
          <div className="bg-white/10 rounded-xl p-6" role="listitem"><p className="text-3xl font-bold mb-2">15.5t</p><p className="text-emerald-100">Average annual CO2 per person in the US</p></div>
          <div className="bg-white/10 rounded-xl p-6" role="listitem"><p className="text-3xl font-bold mb-2">1.9t</p><p className="text-emerald-100">Average annual CO2 per person in India</p></div>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="glossary-heading">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-100 mb-4">
            <BookOpen className="w-7 h-7 text-teal-600" aria-hidden="true" />
          </div>
          <h2 id="glossary-heading" className="text-3xl font-bold text-gray-900 mb-3">Carbon Glossary</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Every confusing term explained in plain, simple English — no science degree required.</p>
        </div>
        <dl className="space-y-3">
          {GLOSSARY.map(({ term, short, detail }) => {
            const isOpen = expandedTerm === term;
            return (
              <div key={term} className={`bg-white/90 backdrop-blur-sm rounded-xl border transition-all shadow-sm overflow-hidden ${isOpen ? 'border-teal-300 shadow-md' : 'border-gray-100 hover:border-teal-200'}`}>
                <dt>
                  <button onClick={() => setExpandedTerm(isOpen ? null : term)} aria-expanded={isOpen} aria-controls={`glossary-${term.replace(/\s/g, '-')}`} className="w-full flex items-center gap-4 px-6 py-4 text-left">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full transition-colors ${isOpen ? 'bg-teal-500' : 'bg-gray-300'}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 text-sm md:text-base">{term}</span>
                      {!isOpen && <span className="ml-2 text-gray-400 text-sm hidden sm:inline">— {short}</span>}
                    </div>
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`} aria-hidden="true">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                </dt>
                {isOpen && (
                  <dd id={`glossary-${term.replace(/\s/g, '-')}`} className="px-6 pb-5">
                    <div className="pl-6 border-l-2 border-teal-200">
                      <p className="text-sm font-semibold text-teal-700 mb-2">{short}</p>
                      <p className="text-gray-600 leading-relaxed text-sm md:text-base">{detail}</p>
                    </div>
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
        <p className="text-center text-xs text-gray-400 mt-6">Definitions use simplified language for educational purposes. Sources: IPCC, EPA, DEFRA, UNEP.</p>
      </section>
    </article>
  );
}
