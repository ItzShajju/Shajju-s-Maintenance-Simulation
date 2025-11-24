/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { SimulationDashboard } from './components/SimulationDashboard';
import { CreationHistory } from './components/CreationHistory';
import { UserGuide } from './components/UserGuide';
import { generateScenario, SimulationState } from './services/gemini';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<SimulationState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [history, setHistory] = useState<any[]>([]); // simplified history

  const handleGenerate = async (topic: string, aircraft: string) => {
    setIsGenerating(true);
    try {
      const scenario = await generateScenario(topic, aircraft);
      setActiveScenario(scenario);
      
      // Add to simple history log
      setHistory(prev => [{
          id: crypto.randomUUID(),
          name: scenario.scenarioTitle,
          html: '', // Legacy field for history component compat
          timestamp: new Date(),
          scenarioData: scenario // Save full data
      }, ...prev]);

    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to initialize simulation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseSimulation = () => {
    setActiveScenario(null);
  };

  const handleRestore = (item: any) => {
      if (item.scenarioData) {
          setActiveScenario(item.scenarioData);
      }
  }

  return (
    <div className="h-[100dvh] bg-[#09090b] text-zinc-50 overflow-hidden relative font-sans">
        
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6">
        {/* Navbar */}
        <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-black text-xl">S</div>
                <span className="font-bold text-xl tracking-tight text-white">SHAJJU <span className="text-zinc-500 font-normal">SIMULATION</span></span>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => setShowGuide(true)}
                    className="flex items-center space-x-1 text-xs font-medium text-zinc-400 hover:text-cyan-400 transition-colors"
                >
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">USER GUIDE</span>
                </button>
                <div className="text-xs font-mono text-zinc-500 border-l border-zinc-800 pl-4">
                    V2.1.0 • CONNECTED
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center pb-20">
            <Hero />
            <InputArea onGenerate={handleGenerate} isGenerating={isGenerating} disabled={!!activeScenario} />
        </div>

        {/* Footer / History */}
        <div className="pb-8">
            <CreationHistory history={history} onSelect={handleRestore} />
        </div>
      </div>

      {/* User Guide Modal */}
      <UserGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* Full Screen Simulator Modal */}
      {activeScenario && (
        <SimulationDashboard 
            scenario={activeScenario} 
            onClose={handleCloseSimulation} 
            onUpdateScenario={setActiveScenario}
        />
      )}

    </div>
  );
};

export default App;