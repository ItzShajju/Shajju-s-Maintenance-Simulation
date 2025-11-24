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
- 'switch' (boolean: true=ON/AUTO, false=OFF).
- 'button' (boolean: true=PRESSED).
- 'indicator' (string: 'OFF', 'GREEN', 'AMBER', 'RED', 'WHITE', 'BLUE').
- 'gauge' (number: value).
- 'knob' (string: position).

Requirements:
1. 'logs': Initial EICAS messages for the fault.
2. 'maintenanceTasks': A logical list of AMM (Aircraft Maintenance Manual) steps to diagnose/fix the fault.
3. 'techData': Brief technical description or AMM reference text.
4. 'controls': 10-15 relevant controls.
`;

const SIMULATE_STEP_SYSTEM_PROMPT = `You are a High-Fidelity Boeing Aircraft System Simulator. 
You receive the current state of the cockpit controls, the checklist status, and the last user action.
Calculate the new state of the aircraft systems based on real-world Boeing aircraft logic.

Rules:
1. Simulate realistic system latency (e.g., APU start time, valve transit).
2. Gauges must reflect physical changes (pressure, temp, volts).
3. Indicators must follow 'Dark Cockpit' philosophy.
4. Provide technical feedback in 'feedback' field explaining the system response.
5. CRITICAL: Do NOT change the 'id', 'label', or 'type' of existing controls. Only update 'value'.
6. CRITICAL: Preserve the 'status' of maintenanceTasks unless the user's action explicitly contradicts the completion of a task (e.g. they turned off a system required for the task).
7. If the fault is cleared, update status to 'resolved'.

Return the fully updated state object.
`;

const RESPONSE_SCHEMA = {
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
          type: { type: Type.STRING, enum: ['switch', 'button', 'indicator', 'gauge', 'knob'] },
          value: { type: Type.STRING }, // passing as string to simplify schema, cast later
          system: { type: Type.STRING },
          description: { type: Type.STRING },
          unit: { type: Type.STRING }
        },
        required: ['id', 'label', 'type', 'value', 'system']
      }
    }
  },
  required: ['scenarioTitle', 'aircraft', 'description', 'controls', 'status', 'logs', 'maintenanceTasks', 'techData']
};

export async function generateScenario(topic: string, aircraft: string): Promise<SimulationState> {
  const prompt = `Create a training scenario for Boeing ${aircraft} involving: ${topic}. 
  Include at least 10-14 relevant controls across affected systems.
  Response must be valid JSON matching the SimulationState interface.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: GENERATE_SCENARIO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const json = JSON.parse(response.text || "{}");
    return postProcessState(json);
  } catch (error) {
    console.error("Scenario Generation Error:", error);
    throw error;
  }
}

export async function simulateStep(currentState: SimulationState, actionDescription: string): Promise<SimulationState> {
  // We strip out feedback to save tokens/confusion, but keep the rest
  const statePayload = {
      ...currentState,
      feedback: undefined 
  };
  
  const prompt = `Current State: ${JSON.stringify(statePayload)}. 
  User Action: ${actionDescription}.
  Update the state based on aircraft logic.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SIMULATE_STEP_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    
    const json = JSON.parse(response.text || "{}");
    return postProcessState(json);
  } catch (error) {
    console.error("Simulation Step Error:", error);
    throw error;
  }
}

function postProcessState(json: any): SimulationState {
    if (json.controls) {
        json.controls = json.controls.map((c: any) => ({
            ...c,
            value: c.type === 'switch' || c.type === 'button' ? (String(c.value).toLowerCase() === 'true') 
                 : c.type === 'gauge' ? Number(c.value) 
                 : c.value
        }));
    }
    return json as SimulationState;
}