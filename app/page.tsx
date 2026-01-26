'use client';
  
import { useState } from "react";

export default function Home() {
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [customGoal, setCustomGoal] = useState<string>('');
  
  // Personal Profile States
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [gender, setGender] = useState<string>('male');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [dailyCalories, setDailyCalories] = useState<string>('');
  const [bmr, setBmr] = useState<number | null>(null);
  
  // Store Sync States
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  
  const goalOptions = [
    { id: 'save-2m', label: 'Save 2,000,000 VND this month', icon: '💰' },
    { id: 'protein-500k', label: 'Eat High-Protein for 500.000/week', icon: '💪' },
    { id: 'budget-meals', label: 'Budget meals under 50k/day', icon: '🍱' },
    { id: 'healthy-1m', label: 'Healthy eating within 1.000.000/month', icon: '🥗' },
    { id: 'custom', label: 'Custom Goal', icon: '✨' }
  ];
  
  const stores = [
    { id: 'bachhoaxanh', name: 'Bách Hóa Xanh', logo: '🏪', color: 'bg-green-100 border-green-500' },
    { id: 'winmart', name: 'WinMart', logo: '🏬', color: 'bg-orange-100 border-orange-500' },
    { id: 'coopmart', name: 'Co.opMart', logo: '🛒', color: 'bg-blue-100 border-blue-500' },
    { id: 'lottemart', name: 'Lotte Mart', logo: '🏪', color: 'bg-red-100 border-red-500' }
  ];

  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    if (!w || !h || !a) return;
    
    let calculatedBMR;
    if (gender === 'male') {
      calculatedBMR = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      calculatedBMR = 10 * w + 6.25 * h - 5 * a - 161;
    }
    
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    const tdee = Math.round(calculatedBMR * activityMultipliers[activityLevel]);
    setBmr(tdee);
    setDailyCalories(tdee.toString());
  };

  const toggleStore = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSubmit = () => {
    const setupData = {
      goal: selectedGoal === 'custom' ? customGoal : goalOptions.find(g => g.id === selectedGoal)?.label,
      profile: {
        age,
        weight,
        height,
        gender,
        activityLevel,
        dailyCalories: dailyCalories || bmr,
        bmr
      },
      stores: selectedStores
    };
    
    console.log('Setup completed:', setupData);
    alert('Setup completed! Your AI agent is ready to help you save on meals.');
    // Here you would typically save to database or state management
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to AgentEco AI 🌱
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your intelligent companion for budget-friendly, healthy meals
          </p>
        </div>

        {/* Main Setup Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-10">
          
          {/* Goal Picker Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Choose Your Goal
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your New Year's Resolution
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-5 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                    selectedGoal === goal.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {goal.label}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {selectedGoal === 'custom' && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter your custom goal..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </section>

          {/* Personal Profile Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Personal Profile
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us calculate your nutritional needs
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* BMR Calculator */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  BMR Calculator
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="veryActive">Very Active (intense exercise daily)</option>
                  </select>
                </div>

                <button
                  onClick={calculateBMR}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Calculate Daily Calorie Needs
                </button>

                {bmr && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Your daily calorie needs (TDEE):
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {bmr} calories/day
                    </p>
                  </div>
                )}
              </div>

              {/* Manual Calorie Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or enter your daily calorie target manually
                </label>
                <input
                  type="number"
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                  placeholder="2000"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Store Sync Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Store Preferences
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your preferred retailers for deal scouting
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => toggleStore(store.id)}
                  className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    selectedStores.includes(store.id)
                      ? `${store.color} border-2`
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{store.logo}</span>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {store.name}
                      </h3>
                      {selectedStores.includes(store.id) && (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedStores.length === 0 && (
              <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                💡 Select at least one store to get personalized deals
              </p>
            )}
          </section>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSubmit}
              disabled={!selectedGoal || !dailyCalories || selectedStores.length === 0}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                selectedGoal && dailyCalories && selectedStores.length > 0
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedGoal && dailyCalories && selectedStores.length > 0
                ? '🚀 Start Saving with AgentEco AI'
                : '⚠️ Complete all sections to continue'}
            </button>
          </div>

        </div>

        {/* Footer */}
        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>Your data is secure and used only to provide personalized meal recommendations</p>
        </div>
      </div>
    </div>
  );
}
