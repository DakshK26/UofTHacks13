/**
 * Backboard.io integration for AI model routing
 * Handles communication with Gemini and fallback models through Backboard SDK
 * 
 * Note: Using mock implementation until backboard-sdk is properly configured
 */

import type { BackboardResponse } from './types';

// Backboard SDK is not yet available - using mock implementation
// Once the SDK is published, uncomment:
// import { BackboardClient } from 'backboard-sdk';

const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// TEMPORARY: Mock mode for testing (set to false when real API is available)
const USE_MOCK = true; // Always use mock until SDK is available

// Backboard client instance (singleton) - currently null as SDK is not available
let client: unknown | null = null;

// Cached assistant and thread IDs
let cachedAssistantId: string | null = null;
let cachedThreadId: string | null = null;

// System prompt for DAW assistant (avoid curly braces to prevent template issues)
const DAW_SYSTEM_PROMPT = `You are a DAW (Digital Audio Workstation) assistant. Convert natural language commands into structured JSON actions.
              
Available actions:
- addPattern: Create a new pattern with name and lengthInSteps parameters
- addNote: Add a note to a pattern with patternId, pitch, startTick, durationTick, velocity
- setBpm: Set the tempo with bpm parameter
- play, stop, pause: Control playback (no parameters)
- addChannel: Add a synth or sampler channel with name and type parameters
- addClip: Add a clip to the playlist with patternId, trackIndex, startTime parameters
- setVolume, setPan: Adjust mixer settings with channelId and value parameters
- toggleMute, toggleSolo: Mixer controls with channelId parameter

Always respond with valid JSON only, no markdown, no explanation. Format:
action: the action name
parameters: object with action-specific parameters
confidence: number between 0 and 1
reasoning: brief explanation

For unclear commands use action clarificationNeeded with parameters.message explaining what you need.`;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock Backboard response for testing
 * Parses simple natural language commands into structured responses
 */
function mockBackboardResponse(text: string, model: string): BackboardResponse {
  console.log(`[Mock Backboard] Processing: "${text}" with model: ${model}`);

  const lowerText = text.toLowerCase();

  // Pattern: "add a [instrument] pattern"
  if (lowerText.includes('pattern') && (lowerText.includes('add') || lowerText.includes('create'))) {
    const instruments = ['kick', 'snare', 'hihat', 'clap', 'tom', 'cymbal'];
    const found = instruments.find(inst => lowerText.includes(inst));

    return {
      action: 'addPattern',
      parameters: {
        name: found ? `${found.charAt(0).toUpperCase() + found.slice(1)} Pattern` : 'New Pattern',
        lengthInSteps: 16,
      },
      confidence: 0.9,
      reasoning: `Creating a new pattern${found ? ` for ${found}` : ''}`,
    };
  }

  // Pattern: "set bpm to [number]"
  if (lowerText.includes('bpm') || lowerText.includes('tempo')) {
    const match = text.match(/\d+/);
    const bpm = match ? parseInt(match[0]) : 120;

    return {
      action: 'setBpm',
      parameters: { bpm },
      confidence: 0.95,
      reasoning: `Setting tempo to ${bpm} BPM`,
    };
  }

  // Pattern: "play"
  if (lowerText.match(/^(play|start)/) || lowerText.includes('play it')) {
    return {
      action: 'play',
      parameters: {},
      confidence: 1.0,
      reasoning: 'Starting playback',
    };
  }

  // Pattern: "stop"
  if (lowerText.match(/^stop/)) {
    return {
      action: 'stop',
      parameters: {},
      confidence: 1.0,
      reasoning: 'Stopping playback',
    };
  }

  // Pattern: "add note" or "add [note]"
  if (lowerText.includes('note')) {
    return {
      action: 'addNote',
      parameters: {
        patternId: 'current',
        pitch: 60, // C4
        startTick: 0,
        durationTick: 96,
        velocity: 100,
      },
      confidence: 0.7,
      reasoning: 'Adding a note to the current pattern',
    };
  }

  // Default: unknown command
  return {
    action: 'clarificationNeeded',
    parameters: {
      message: `I understand you want to "${text}", but I'm not sure how to help with that. Try commands like "add a kick pattern", "set BPM to 128", or "play".`,
      suggestedOptions: ['Add a pattern', 'Set BPM', 'Play/Stop', 'Add a note'],
    },
    confidence: 0.1,
    reasoning: 'Command not recognized',
  };
}

/**
 * Initialize and validate Backboard configuration
 */
export function initializeBackboard(): void {
  if (!BACKBOARD_API_KEY) {
    console.warn('BACKBOARD_API_KEY not set - using mock mode');
    return;
  }

  // SDK not yet available - using mock mode
  console.log('[Backboard] Initialized in mock mode (SDK not available)');
}

/**
 * Get or create the Backboard client
 * Currently returns null as SDK is not available
 */
function getClient(): unknown | null {
  if (!BACKBOARD_API_KEY) {
    console.warn('Backboard API key not configured - using mock mode');
    return null;
  }
  // SDK not available yet
  return null;
}

/**
 * Create or get cached assistant
 * Note: Currently returns placeholder as SDK is not available
 */
async function getAssistant(): Promise<string> {
  if (cachedAssistantId) {
    return cachedAssistantId;
  }

  // SDK not available - return placeholder
  console.warn('[Backboard] SDK not available - using placeholder assistant ID');
  cachedAssistantId = 'mock-assistant-id';
  return cachedAssistantId;
}

/**
 * Create or get cached thread
 * Note: Currently returns placeholder as SDK is not available
 */
async function getThread(assistantId: string): Promise<string> {
  if (cachedThreadId) {
    return cachedThreadId;
  }

  // SDK not available - return placeholder
  console.warn('[Backboard] SDK not available - using placeholder thread ID');
  cachedThreadId = 'mock-thread-id';
  return cachedThreadId;
}

/**
 * Send a message to the specified AI model through Backboard
 * 
 * @param text - The user's natural language input
 * @param model - The model to use ('gemini' or 'fallback')
 * @param conversationHistory - Optional previous messages for context
 * @returns Parsed JSON response from the AI model
 * 
 * @example
 * const response = await sendToModel("add a kick drum pattern", "gemini");
 * console.log(response.action); // "addPattern"
 * console.log(response.parameters); // { name: "kick", ... }
 */
export async function sendToModel(
  text: string,
  model: 'gemini' | 'fallback',
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<BackboardResponse> {
  // MOCK MODE: Return mock responses for testing
  if (USE_MOCK) {
    console.log('[Backboard] Using MOCK mode');
    await sleep(300); // Simulate network delay
    return mockBackboardResponse(text, model);
  }

  // REAL API MODE using Backboard SDK
  if (!BACKBOARD_API_KEY) {
    throw new Error('Backboard API key not configured');
  }

  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Get or create assistant and thread
      const assistantId = await getAssistant();
      const threadId = await getThread(assistantId);

      // Use OpenAI models (Gemini not available on this Backboard instance)
      const llmProvider = 'openai';
      const modelName = model === 'gemini' ? 'gpt-4o' : 'gpt-4o-mini';

      // SDK not available - fall back to mock
      console.warn('[Backboard] SDK not available - falling back to mock mode');
      return mockBackboardResponse(text, model);
    } catch (error) {
      lastError = error as Error;
      console.error(`Backboard request attempt ${attempt + 1} failed:`, error);

      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Invalid Backboard API key');
        }
        if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }

      // Wait before retrying
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  // All retries failed
  throw new Error(`Failed to connect to Backboard after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}

/**
 * Test the Backboard connection
 * @returns true if connection successful, throws error otherwise
 */
export async function testConnection(): Promise<boolean> {
  await sendToModel('test', 'fallback');
  return true;
}
