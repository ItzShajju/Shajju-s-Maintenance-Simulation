/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { SimulationState, Control, simulateStep } from '../services/gemini';
import { XMarkIcon, BoltIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon, ArrowUturnLeftIcon, ClockIcon, ClipboardDocumentCheckIcon, BookOpenIcon, TvIcon } from '@heroicons/react/24/outline';

interface SimulationDashboardProps {
  scenario: SimulationState;
  onClose: () => void;
  onUpdateScenario: (newState: SimulationState) => void;
}

// --- Helper Components ---

// A Gauge that "jitters" slightly to simulate real sensor noise
const LiveGauge = ({ value, unit, label }: { value: number, unit?: string, label: string }) => {
    const [displayValue, setDisplayValue] = useState(value);
    
    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    useEffect(() => {
        const interval = setInterval(() => {
            const noise = (Math.random() - 0.5) * (value * 0.01); 
            if (value > 0) {
                setDisplayValue(v => Math.max(0, value + noise));
            }
        }, 800);
        return () => clearInterval(interval);
    }, [value]);

    let max = 100;
    if (unit === 'PSI') max = 4000;
    if (unit === 'C') max = 1000;
    
    const percentage = Math.min(100, Math.max(0, (displayValue / max) * 100));
    const rotation = -135 + (percentage * 2.7); 

    return (
        <div className="flex flex-col items-center group">
            <div className="relative w-20 h-20 rounded-full bg-[#111] border-2 border-zinc-700 shadow-lg flex items-center justify-center mb-1">
                <div className="absolute inset-0 rounded-full border border-zinc-800"></div>
                {[0, 45, 90, 135, 180, 225, 270].map(deg => (
                    <div key={deg} className="absolute w-full h-full flex justify-center" style={{ transform: `rotate(${deg - 135}deg)` }}>
                        <div className="w-0.5 h-1.5 bg-zinc-600 mt-1"></div>
                    </div>
                ))}
                <div 
                    className="absolute w-full h-full flex justify-center transition-transform duration-700 ease-out"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="w-0.5 h-10 bg-cyan-500 origin-bottom mt-1 shadow-[0_0_5px_cyan]"></div>
                </div>
                <div className="absolute w-2 h-2 bg-zinc-500 rounded-full z-10"></div>
                <div className="absolute bottom-4 font-mono text-[10px] text-cyan-400 bg-black/50 px-1 rounded">
                    {Math.round(displayValue)}
                </div>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase">{label} ({unit || ''})</div>
        </div>
    );
};

// Skeuomorphic Toggle Switch
const ToggleSwitch = ({ value, onClick }: { value: boolean, onClick: () => void }) => {
    return (
        <div 
            onClick={onClick}
            className="cursor-pointer flex flex-col items-center group"
        >
            <div className="relative w-12 h-20 bg-[#1a1a1c] rounded border border-zinc-800 shadow-inner flex justify-center p-1">
                <div className="absolute top-1 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-900"></div>
                <div className="absolute bottom-1 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-900"></div>
                <div className={`relative w-8 h-full transition-all duration-200 ease-in-out ${value ? 'translate-y-0' : 'translate-y-6'}`}>
                    <div className={`w-full h-10 rounded shadow-lg border border-zinc-500 bg-gradient-to-b ${value ? 'from-zinc-300 to-zinc-500' : 'from-zinc-400 to-zinc-600'}`}>
                        <div className="absolute top-2 w-full h-px bg-black/10"></div>
                        <div className="absolute top-4 w-full h-px bg-black/10"></div>
                        <div className="absolute top-6 w-full h-px bg-black/10"></div>
                    </div>
                </div>
            </div>
            <div className={`mt-2 text-[10px] font-bold ${value ? 'text-cyan-400 text-glow' : 'text-zinc-600'}`}>
                {value ? 'ON' : 'OFF'}
            </div>
        </div>
    );
};

// Main Control Unit Wrapper
const ControlUnit = ({ control, onToggle }: { control: Control, onToggle: (id: string, val: any) => void }) => {
    const isIndicator = control.type === 'indicator';
    return (
        <div className="flex flex-col items-center justify-start p-2 w-28 h-40 relative">
            <div className="mb-2 text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider text-center h-8 flex items-center justify-center leading-tight">
                {control.label}
            </div>
            <div className="flex-1 flex items-center justify-center w-full">
                {control.type === 'switch' && (
                    <ToggleSwitch value={control.value} onClick={() => onToggle(control.id, !control.value)} />
                )}
                {control.type === 'button' && (
                    <button
                        onMouseDown={() => onToggle(control.id, true)}
                        onMouseUp={() => onToggle(control.id, false)}
                        className={`w-14 h-14 rounded-full border-4 shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
                            control.value ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-700 bg-[#222]'
                        }`}
                    >
                         <div className={`w-10 h-10 rounded-full ${control.value ? 'bg-cyan-500 blur-sm opacity-50' : 'bg-transparent'}`}></div>
                         <div className="absolute text-[9px] font-bold text-zinc-500">PUSH</div>
                    </button>
                )}
                {isIndicator && (
                    <div className={`w-full max-w-[80px] h-10 border flex items-center justify-center text-center font-bold text-[10px] font-mono transition-all duration-300 ${
                        control.value === 'OFF' ? 'bg-[#050505] border-zinc-800 text-zinc-800' :
                        control.value === 'GREEN' ? 'bg-green-900/20 border-green-900 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' :
                        control.value === 'BLUE' ? 'bg-blue-900/20 border-blue-900 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' :
                        control.value === 'AMBER' ? 'bg-amber-900/20 border-amber-900 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' :
                        control.value === 'WHITE' ? 'bg-zinc-100/10 border-zinc-600 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' :
                        'bg-red-900/20 border-red-900 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                    }`}>
                        {control.value !== 'OFF' ? control.value : 'OFF'}
                    </div>
                )}
                {control.type === 'gauge' && (
                    <LiveGauge value={Number(control.value)} unit={control.unit} label="" />
                )}
            </div>
        </div>
    );
};

export const SimulationDashboard: React.FC<SimulationDashboardProps> = ({ scenario, onClose, onUpdateScenario }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [lastAction, setLastAction] = useState<string>("Initial State");
    const [initialState] = useState<SimulationState>(() => JSON.parse(JSON.stringify(scenario)));
    const [sessionTime, setSessionTime] = useState(0);
    const [activeTab, setActiveTab] = useState<'monitor' | 'tasks' | 'tech'>('monitor');

    useEffect(() => {
        const timer = setInterval(() => setSessionTime(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleReset = () => {
        const resetState = JSON.parse(JSON.stringify(initialState));
        onUpdateScenario(resetState);
        setLastAction("Reset to initial state");
        setSessionTime(0);
    };

    const handleControlToggle = (id: string, newVal: any) => {
        const updatedControls = scenario.controls.map(c => 
            c.id === id ? { ...c, value: newVal } : c
        );
        const updatedScenario = { ...scenario, controls: updatedControls };
        onUpdateScenario(updatedScenario);
        handleSimulationStep(updatedScenario, `User toggled ${id} to ${newVal}`);
    };

    const handleSimulationStep = async (current: SimulationState, action: string) => {
        setIsSimulating(true);
        setLastAction(action);
        try {
            const nextState = await simulateStep(current, action);
            onUpdateScenario(nextState);
        } catch (e) {
            console.error("Sim error", e);
        } finally {
            setIsSimulating(false);
        }
    };

    const toggleTask = (taskId: string) => {
        // Just for visual tracking on the client side, doesn't impact simulation logic yet unless we send it
        const newTasks = scenario.maintenanceTasks?.map(t => 
            t.id === taskId ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
        );
        // We do a shallow update here just for the UI state
        onUpdateScenario({ ...scenario, maintenanceTasks: newTasks as any });
    };

    const systems = Array.from(new Set(scenario.controls.map(c => c.system)));

    return (
        <div className="fixed inset-0 z-50 bg-[#0c0c0e] flex flex-col font-sans">
            {/* Header */}
            <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#121214] shadow-md z-10">
                <div className="flex items-center space-x-6">
                    <div className="bg-cyan-900/20 p-2 rounded-lg border border-cyan-800/30 flex items-center space-x-3">
                        <BoltIcon className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-mono text-cyan-100 font-bold">{scenario.aircraft} | {scenario.scenarioTitle}</span>
                    </div>
                    <div className="h-8 w-px bg-zinc-800"></div>
                    <div className="flex items-center space-x-2 text-zinc-400">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border transition-colors ${
                        scenario.status === 'resolved' ? 'bg-green-950/50 border-green-800 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)]' :
                        scenario.status === 'critical' ? 'bg-red-950/50 border-red-800 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                        'bg-blue-950/50 border-blue-800 text-blue-400'
                    }`}>
                        {scenario.status === 'resolved' ? <CheckCircleIcon className="w-4 h-4"/> : 
                         scenario.status === 'critical' ? <ExclamationTriangleIcon className="w-4 h-4 animate-pulse"/> : 
                         <ArrowPathIcon className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`}/>}
                        <span className="text-xs font-bold uppercase tracking-wider">{scenario.status}</span>
                    </div>
                    <button onClick={handleReset} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-cyan-400" title="Reset Scenario">
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded-full transition-colors text-zinc-500 hover:text-red-400" title="Close Simulation">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Overhead Panel */}
                <div className="flex-1 overflow-auto bg-[#18181b] relative custom-scrollbar">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                    <div className="p-8 pb-32">
                        <div className="max-w-5xl mx-auto flex flex-wrap gap-6 justify-center">
                            {systems.map(sys => (
                                <div key={sys} className="bg-[#222225] border-2 border-zinc-700/50 rounded-lg overflow-hidden shadow-2xl relative group">
                                    {/* Panel Screws */}
                                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center opacity-50"><div className="w-1.5 h-0.5 bg-black rotate-45"></div></div>
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center opacity-50"><div className="w-1.5 h-0.5 bg-black rotate-45"></div></div>
                                    <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center opacity-50"><div className="w-1.5 h-0.5 bg-black rotate-45"></div></div>
                                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center opacity-50"><div className="w-1.5 h-0.5 bg-black rotate-45"></div></div>
                                    
                                    <div className="bg-[#2a2a2d] px-4 py-1.5 border-b border-zinc-700/50 flex justify-center items-center shadow-sm">
                                        <h3 className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-[0.2em]">{sys}</h3>
                                    </div>
                                    <div className="p-4 flex flex-wrap justify-center gap-2">
                                        {scenario.controls.filter(c => c.system === sys).map(control => (
                                            <ControlUnit key={control.id} control={control} onToggle={handleControlToggle} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Electronic Flight Bag (EFB) */}
                <div className="w-[450px] border-l border-zinc-800 bg-[#0e0e10] flex flex-col shadow-2xl z-20">
                    {/* EFB Tabs */}
                    <div className="flex items-center bg-[#18181b] border-b border-zinc-800">
                        <button onClick={() => setActiveTab('monitor')} className={`flex-1 py-4 flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'monitor' ? 'text-cyan-400 bg-[#121214] border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <TvIcon className="w-4 h-4" />
                            <span>Monitor</span>
                        </button>
                        <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-4 flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'tasks' ? 'text-cyan-400 bg-[#121214] border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            <span>Work Order</span>
                        </button>
                        <button onClick={() => setActiveTab('tech')} className={`flex-1 py-4 flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'tech' ? 'text-cyan-400 bg-[#121214] border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <BookOpenIcon className="w-4 h-4" />
                            <span>Tech Data</span>
                        </button>
                    </div>

                    {/* EFB Content */}
                    <div className="flex-1 overflow-hidden relative bg-[#111]">
                        {activeTab === 'monitor' && (
                            <div className="flex flex-col h-full animate-in fade-in duration-300">
                                {/* EICAS Display */}
                                <div className="p-4 bg-zinc-900 border-b border-zinc-800">
                                    <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden border-4 border-[#333] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,black_150%)] z-20 pointer-events-none"></div>
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_4px,4px_100%] pointer-events-none"></div>
                                        <div className="absolute inset-0 animate-[flicker_0.15s_infinite] pointer-events-none opacity-[0.02] bg-white z-20"></div>

                                        <div className="h-full w-full p-4 font-mono text-sm relative overflow-y-auto scrollbar-hide">
                                            <div className="flex justify-between border-b border-white/20 pb-2 mb-3 text-cyan-500/80 text-xs font-bold tracking-widest uppercase">
                                                <span>EICAS DISPLAY</span>
                                                <span>{new Date().toLocaleTimeString()}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {scenario.logs.length > 0 ? (
                                                    scenario.logs.map((log, i) => (
                                                        <div key={i} className={`tracking-tight ${
                                                            log.includes('FAIL') || log.includes('FIRE') || log.includes('FAULT') ? 'text-red-500 font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 
                                                            log.includes('OFF') ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' :
                                                            'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]'
                                                        }`}>
                                                            {`> ${log}`}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-green-500/50 flex items-center justify-center h-40">SYSTEM STATUS: NORMAL</div>
                                                )}
                                                {isSimulating && <div className="text-cyan-400 animate-pulse mt-4">_ SYSTEM COMPUTING...</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Instructor Feedback */}
                                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                     <div className="flex items-center space-x-2 mb-4">
                                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                         <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Instructor Feedback</h4>
                                     </div>
                                     <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                                         {scenario.feedback ? (
                                             <div className="bg-zinc-800/50 border-l-2 border-blue-500 p-3 rounded-r text-sm text-zinc-300 leading-relaxed">
                                                 {scenario.feedback}
                                             </div>
                                         ) : (
                                             <div className="text-zinc-600 text-xs italic text-center mt-10">Awaiting system response...</div>
                                         )}
                                         <div className="border-t border-zinc-800 pt-3 mt-2">
                                             <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Last Action</div>
                                             <div className="text-xs text-zinc-400 font-mono bg-black p-2 rounded border border-zinc-800">{lastAction}</div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="h-full flex flex-col p-6 animate-in fade-in duration-300 overflow-y-auto scrollbar-thin">
                                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4">Maintenance Work Order</h3>
                                <div className="space-y-3">
                                    {scenario.maintenanceTasks?.map((task) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => toggleTask(task.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${task.status === 'completed' ? 'bg-green-900/10 border-green-900/30 opacity-75' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-black' : 'border-zinc-600'}`}>
                                                {task.status === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className={`text-sm ${task.status === 'completed' ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                                                    {task.description}
                                                </div>
                                                <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Ref: {task.id}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!scenario.maintenanceTasks || scenario.maintenanceTasks.length === 0) && (
                                        <div className="text-zinc-500 text-sm italic">No specific tasks generated for this scenario.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tech' && (
                            <div className="h-full flex flex-col p-6 animate-in fade-in duration-300 overflow-y-auto scrollbar-thin">
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">AMM Reference</h3>
                                    <div className="text-xs text-zinc-500 font-mono">BOEING {scenario.aircraft} • REV 12</div>
                                </div>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
                                        {scenario.techData?.content || "Technical data loading..."}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};