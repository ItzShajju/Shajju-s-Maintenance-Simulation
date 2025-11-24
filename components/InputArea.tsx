/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { PlayIcon, CpuChipIcon } from '@heroicons/react/24/solid';

interface InputAreaProps {
  onGenerate: (prompt: string, aircraft: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [topic, setTopic] = useState('');
  const [aircraft, setAircraft] = useState('B737NG');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !disabled && !isGenerating) {
        onGenerate(topic, aircraft);
    }
  };

  const boeingFleet = ['B737NG', 'B747-8', 'B777-300ER', 'B787-9'];

  const suggestions = [
      "Engine 1 Fire Loop Fault",
      "Left Hydraulic System Low Pressure",
      "APU Gen Off Bus",
      "Pack Trip Off"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Aircraft Selection */}
            <div className="flex flex-wrap gap-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800 w-fit">
                {boeingFleet.map((ac) => (
                    <button
                        key={ac}
                        type="button"
                        onClick={() => setAircraft(ac)}
                        disabled={isGenerating || disabled}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            aircraft === ac 
                            ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {ac}
                    </button>
                ))}
            </div>

            {/* Topic Input */}
            <div className="relative">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe failure scenario (e.g., 'Right IDG Disconnect')"
                    disabled={isGenerating || disabled}
                    className="w-full bg-zinc-950 text-white placeholder-zinc-600 border border-zinc-800 rounded-xl px-4 py-4 pr-32 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
                <button
                    type="submit"
                    disabled={!topic.trim() || isGenerating || disabled}
                    className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-medium flex items-center space-x-2 transition-all"
                >
                    {isGenerating ? (
                        <CpuChipIcon className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <span>Simulate</span>
                            <PlayIcon className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-zinc-500 font-mono py-1">SUGGESTED:</span>
                {suggestions.map(s => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setTopic(s)}
                        disabled={isGenerating || disabled}
                        className="text-xs px-2 py-1 rounded bg-zinc-800/50 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 border border-transparent hover:border-cyan-900 transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </form>
      </div>
    </div>
  );
};