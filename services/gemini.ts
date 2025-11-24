/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using flash for faster JSON generation and simulation steps
const MODEL_NAME = 'gemini-2.5-flash';

export interface Control {
  id: string;
  label: string;
  type: 'switch' | 'button' | 'indicator' | 'gauge' | 'knob';
  value: any; // boolean for switch/button, number for gauge, string for indicator color
  system: string; // e.g., "ELEC", "HYD", "APU"
  description?: string;
  unit?: string;
}

export interface MaintenanceTask {
  id: string;
  description: string;
  status: 'pending' | 'completed' | 'skipped';
}

export interface TechData {
  title: string;
  content: string; // Markdown supported
}

export interface SimulationState {
  scenarioTitle: string;
  aircraft: string;
  description: string;
  controls: Control[];
  logs: string[];
  status: 'active' | 'resolved' | 'critical';
  feedback?: string;
  maintenanceTasks: MaintenanceTask[];
  techData: TechData;
}

const GENERATE_SCENARIO_SYSTEM_PROMPT = `You are an expert Boeing Aviation Maintenance Instructor. 
Your goal is to generate realistic maintenance training scenarios for Boeing aircraft (737NG, 747-8, 777, 787).
Focus on systems like Electrical (IDG, BUS, STBY POWER), Hydraulics (EMDP, EDP), APU, Bleed Air, and Engine Start.

When asked, generate a JSON object representing the initial state of a cockpit overhead panel for a specific fault.
The controls should be realistic and use Boeing terminology (e.g., "DISCONNECT", "STBY PWR", "L PACK", "GND CALL").

Types: 
- 'switch' (boolean: true=ON, false=OFF). IMPORTANT: Switches usually default to false (OFF) or true (AUTO/ON) depending on normal state.
- 'button' (boolean: true=PRESSED)
- 'indicator' (string: 'OFF', 'GREEN', 'AMBER', 'RED', 'WHITE', 'BLUE'). Boeing often uses Amber for caution, Red for warning.
- 'gauge' (number: value)
- 'knob' (string: position)

Ensure the 'logs' array contains the initial EICAS messages corresponding to the fault.
Generate a list of 'maintenanceTasks' that correspond to the AMM (Aircraft Maintenance Manual) procedure to fix the fault.
Generate 'techData' which provides a brief technical description of the system or the specific AMM reference text.
`;

const SIMULATE_STEP_SYSTEM_PROMPT = `You are a High-Fidelity Boeing Aircraft System Simulator. 
You receive the current state of the cockpit controls and the last user action.
Calculate the new state of the aircraft systems (indicators, gauges, logs) based on real-world Boeing aircraft logic.

Rules:
1. Simulate realistic system latency.
2. Gauges should reflect pressure/temp changes physically (e.g. if pump off, pressure drops to 0 or accumulator pressure).
3. Indicators should follow 'Dark Cockpit' philosophy where applicable.
4. Provide technical feedback in the 'feedback' field describing the physical system response.

Return the updated state including controls, logs, and status.
If the user solved the problem (e.g., turned on the pump, reset the generator), update the status to 'resolved'.
If they made it worse, set status to 'critical'.
`;

export async function generateScenario(topic: string, aircraft: string): Promise<SimulationState> {
  const prompt = `Create a training scenario for Boeing ${aircraft} involving: ${topic}. 
  Include at least 10-14 relevant controls (switches, indicators, gauges) across relevant systems.
  Make sure there is a fault or a task to complete.
  Response must be valid JSON matching the SimulationState interface.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: GENERATE_SCENARIO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioTitle: { type: Type.STRING },
            aircraft: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['active', 'resolved', 'critical'] },
            logs: { type: Type.ARRAY, items: { type: Type.STRING } },
            maintenanceTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['pending', 'completed', 'skipped'] }
                }
              }
            },
            techData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            },
            controls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['switch', 'button', 'indicator', 'gauge', 'knob'] },
                  value: { type: Type.STRING }, // passing as string to simplify schema
                  system: { type: Type.STRING },
                  description: { type: Type.STRING },
                  unit: { type: Type.STRING }
                },
                required: ['id', 'label', 'type', 'value', 'system']
              }
            }
          },
          required: ['scenarioTitle', 'aircraft', 'description', 'controls', 'status', 'logs', 'maintenanceTasks', 'techData']
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    // Post-process values
    json.controls = json.controls.map((c: any) => ({
        ...c,
        value: c.type === 'switch' || c.type === 'button' ? (c.value === 'true' || c.value === true) 
             : c.type === 'gauge' ? Number(c.value) 
             : c.value
    }));

    return json;
  } catch (error) {
    console.error("Scenario Generation Error:", error);
    throw error;
  }
}

export async function simulateStep(currentState: SimulationState, actionDescription: string): Promise<SimulationState> {
  const prompt = `Current State: ${JSON.stringify(currentState)}. 
  User Action: ${actionDescription}.
  Update the state based on aircraft logic.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SIMULATE_STEP_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioTitle: { type: Type.STRING },
            aircraft: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['active', 'resolved', 'critical'] },
            feedback: { type: Type.STRING },
            logs: { type: Type.ARRAY, items: { type: Type.STRING } },
            maintenanceTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    description: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['pending', 'completed', 'skipped'] }
                  }
                }
              },
              techData: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              },
            controls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING },
                  value: { type: Type.STRING },
                  system: { type: Type.STRING },
                  description: { type: Type.STRING },
                  unit: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    
    const json = JSON.parse(response.text || "{}");
     json.controls = json.controls.map((c: any) => ({
        ...c,
        value: c.type === 'switch' || c.type === 'button' ? (c.value === 'true' || c.value === true) 
             : c.type === 'gauge' ? Number(c.value) 
             : c.value
    }));
    return json;
  } catch (error) {
    console.error("Simulation Step Error:", error);
    throw error;
  }
}