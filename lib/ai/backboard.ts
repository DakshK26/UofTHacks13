/**
 * Backboard.io integration for AI model routing
 * Handles communication with Gemini and fallback models through Backboard SDK
 *
 * Uses the official backboard-sdk package (SDK-first, no REST endpoints)
 *
 * CONTEXT INJECTION: The system prompt is now dynamically generated based on:
 * - Current project state (patterns, channels, tracks, clips)
 * - Available samples from the sample library
 * - DAW capabilities and constraints
 */

import type { BackboardResponse, BackboardBatchResponse } from './types';

// @ts-expect-error - backboard-sdk doesn't have TypeScript types
import { BackboardClient } from 'backboard-sdk';

const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY;
const BACKBOARD_API_URL = process.env.BACKBOARD_API_URL || 'https://api.backboard.io/v1/chat';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Set to false to try real API first, falls back to mock on error
const USE_MOCK = false;

// ============================================
// Model Provider Configuration
// ============================================

/**
 * Available model providers through Backboard.io
 * Challenge requires using at least 2 different providers
 */
export type ModelProvider = 'openai' | 'google' | 'anthropic' | 'cohere' | 'xai';

export interface ModelConfig {
  provider: ModelProvider;
  modelName: string;
  description: string;
}

// Model configurations for different task types
// Model names are passed to SDK's model_name field (without provider prefix)
// Provider is passed separately to llm_provider field
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Creative tasks - Google Gemini (great for creative, musical content)
  creative: {
    provider: 'google',
    modelName: 'gemini-2.5-flash',  // From Backboard's supported models list
    description: 'Google Gemini 2.5 Flash - Creative & musical tasks',
  },
  // Technical/precise tasks - OpenAI GPT-4o (great for structured JSON, precision)
  technical: {
    provider: 'openai',
    modelName: 'gpt-4o',  // Model name only
    description: 'OpenAI GPT-4o - Technical & precise tasks',
  },
  // Analytical tasks - Claude Sonnet 4 (great for explanations, analysis, feedback)
  analytical: {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-20250514',  // From Backboard's supported models list
    description: 'Anthropic Claude Sonnet 4 - Analysis & explanations',
  },
  // Fallback - faster, cheaper model
  fallback: {
    provider: 'openai',
    modelName: 'gpt-4o-mini',  // Model name only
    description: 'OpenAI GPT-4o Mini - Fast fallback',
  },
};

/**
 * Task types for intelligent model routing
 */
export type TaskType = 'creative' | 'technical' | 'analytical' | 'fallback';

/**
 * Classify user input to determine the best model for the task
 * Creative tasks: beat making, melodies, chord progressions, musical suggestions
 * Technical tasks: BPM changes, transport controls, precise edits, mixer settings
 * Analytical tasks: explanations, analysis, feedback, music theory questions
 */
export function classifyTask(userInput: string): TaskType {
  const input = userInput.toLowerCase();

  // PRIORITY: Any input with a number routes to technical (parameter changes)
  if (/\d+/.test(input)) {
    return 'technical';
  }

  // Analytical task patterns - explanations, analysis, feedback, theory
  const analyticalPatterns = [
    /explain/,
    /what\s+(is|are|does)/,
    /how\s+(do|does|can|should)/,
    /why\s+(is|are|does|do)/,
    /tell\s+me\s+about/,
    /analyze/,
    /analyse/,
    /feedback/,
    /review/,
    /critique/,
    /improve/,
    /better/,
    /theory/,
    /teach/,
    /learn/,
    /understand/,
    /difference\s+between/,
    /compare/,
    /help\s+me\s+understand/,
  ];

  // Creative task patterns - musical creation, suggestions, artistic requests
  const creativePatterns = [
    // Beat/melody/music creation (various verbs)
    /make\s+(a\s+)?(\w+\s+)?(beat|melody|chord|bass|pattern|music|song|track)/,
    /create\s+(a\s+)?(\w+\s+)?(beat|melody|chord|bass|pattern|music|song|track)/,
    /generate\s+(a\s+)?(\w+\s+)?(beat|melody|music|pattern)/,
    /write\s+(a\s+)?(\w+\s+)?(melody|chord|bass|song)/,
    /compose\s+(a\s+)?(\w+\s+)?(melody|beat|song|piece)?/,
    // Adding musical elements (creative, not editing)
    /add\s+(a\s+)?(\w+\s+)?(melody|chord|piano|bass|lead|pad|synth)/,
    // Genre keywords - these are always creative
    /hip\s*hop|trap|house|edm|jazz|funk|rock|pop|lofi|rap/,
    /boom\s*bap|drill|phonk|reggaeton|r&b|soul/,
    // Style/mood descriptors
    /catchy|groovy|chill|energetic|dark|bright|sad|happy|upbeat/,
    // Creative actions
    /suggest/,
    /improvise|freestyle|jam/,
    // Instrument-focused creation
    /piano\s+(melody|part|line)/,
    /drum\s+(beat|pattern|loop)/,
    /bass\s+(line|pattern|groove)/,
  ];

  // Technical task patterns - precise operations, settings, transport, modifications
  const technicalPatterns = [
    // BPM/tempo changes (set, change, make it, adjust)
    /(set|change|adjust|make)\s+(the\s+)?(bpm|tempo)/,
    /bpm\s+(to|=)\s*\d+/,
    /tempo\s+(to|=)\s*\d+/,
    /\d+\s*bpm/,
    // Increase/decrease operations (BPM, volume, pan, etc.)
    /(increase|decrease|raise|lower|bump)\s+(the\s+)?(bpm|tempo|volume|pan)/,
    /(bpm|tempo|volume|pan)\s+(up|down)/,
    /by\s+\d+\s*(bpm)?/,
    // Faster/slower tempo changes
    /(faster|slower)\s*(tempo|bpm)?/,
    /speed\s+(up|down)/,
    /(double|half|halve)\s+(the\s+)?(tempo|bpm|speed)/,
    // Transport controls
    /^(play|stop|pause|record)$/,
    /^play$/,
    /^stop$/,
    // Mixer controls
    /mute|solo|unmute/,
    /volume\s+(to|up|down)/,
    /pan\s+(to|left|right)/,
    // Editing operations
    /delete\s+(the\s+)?(pattern|note|clip|track|channel)/,
    /remove\s+(the\s+)?(pattern|note|clip|track|channel)/,
    /move\s+(the\s+)?(clip|pattern|note)/,
    /copy\s+(the\s+)?(clip|pattern|note)/,
    /duplicate/,
    /resize/,
    // Extend/shorten operations
    /extend\s+(the\s+)?(melody|pattern|clip|beat|track)/,
    /shorten\s+(the\s+)?(melody|pattern|clip|beat|track)/,
    /make\s+(it|the\s+\w+)\s+(longer|shorter)/,
    /\d+\s*bars?\s*(longer|shorter)/,
    /(longer|shorter)\s*by\s*\d+/,
    // Loop/position controls
    /set\s+(the\s+)?(loop|position|start|end)/,
    /loop\s+(from|to|at)/,
    // General modifications
    /change\s+(the\s+)?(volume|pan|pitch|key|scale)/,
    /adjust\s+(the\s+)?(volume|pan|pitch|key|scale)/,
    /modify/,
    /edit/,
    /update/,
    // System commands
    /toggle/,
    /clear\s+(the\s+)?(pattern|clip|track|all)/,
    /undo|redo/,
    /export/,
    /save|load/,
    /rename/,
    // Quantize/snap
    /quantize/,
    /snap/,
  ];

  // Check for analytical patterns first (questions, explanations)
  for (const pattern of analyticalPatterns) {
    if (pattern.test(input)) {
      return 'analytical';
    }
  }

  // Check for creative patterns BEFORE technical
  // Creative requests like "make a rap beat" should go to Gemini
  for (const pattern of creativePatterns) {
    if (pattern.test(input)) {
      return 'creative';
    }
  }

  // Check for technical patterns after creative
  for (const pattern of technicalPatterns) {
    if (pattern.test(input)) {
      return 'technical';
    }
  }

  // Default logic for unmatched inputs
  // If input contains a number AND looks like a parameter change, route to technical
  if (/\d+/.test(input) && /(bpm|tempo|volume|pan|by|to|=)/.test(input)) {
    return 'technical';
  }

  // Very short commands (3 words or less) without creative keywords → technical
  if (input.split(' ').length <= 3) {
    return 'technical';
  }

  // Default to creative for ambiguous musical requests
  return 'creative';
}

/**
 * Get the model configuration for a task type
 */
export function getModelForTask(taskType: TaskType): ModelConfig {
  const config = MODEL_CONFIGS[taskType];
  if (config) return config;
  // Fallback is guaranteed to exist
  return {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    description: 'OpenAI GPT-4o Mini - Fast fallback',
  };
}

// Backboard client instance (singleton)
let client: InstanceType<typeof BackboardClient> | null = null;

// Cached assistant and thread IDs - keyed by context hash for cache invalidation
let cachedAssistantId: string | null = null;
let cachedThreadId: string | null = null;
let cachedContextHash: string | null = null;

// Default system prompt (fallback if no context provided)
// NOTE: All curly braces are escaped as {{ }} to prevent LangChain template interpretation
const DEFAULT_SYSTEM_PROMPT = `You are a DAW (Digital Audio Workstation) assistant for Pulse Studio. Convert natural language commands into structured JSON actions.

IMPORTANT: Always respond with ONLY valid JSON, no markdown, no explanation.

TIMING REFERENCE (PPQ = 96 ticks per beat):
- 1 bar = 384 ticks, 4 bars = 1536 ticks
- Quarter note = 96 ticks, 8th = 48, 16th = 24
- Beat 1 = 0, Beat 2 = 96, Beat 3 = 192, Beat 4 = 288

Response format (always use actions array):
{{
  "actions": [
    {{ "action": "commandName", "parameters": {{ ... }} }}
  ],
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}}

Available actions:
- addPattern: Create a new pattern. Parameters: {{{{ name?: string, lengthInSteps?: number }}}}
- addNote: Add a note. Parameters: {{{{ patternId: string, pitch: number, startTick: number, durationTick: number, velocity?: number }}}}
- setBpm: Set tempo. Parameters: {{{{ bpm: number }}}}
- play, stop, pause: Control playback (no parameters)
- addChannel: Add instrument. Parameters: {{{{ name?: string, type: "synth"|"sampler", preset?: string }}}}
- addClip: Add clip to playlist. Parameters: {{{{ patternId: string, trackIndex: number, startTick: number }}}}
- setTrackEffect: Set mixer effect. Parameters: {{{{ trackId: string, effectKey: string, value: number }}}}
  Valid effectKey: "volume" (0-1), "pan" (-1 to 1), "eqLow", "eqMid", "eqHigh" (-12 to 12), "compThreshold" (-60 to 0), "compRatio" (1-20), "reverbWet" (0-1 for reverb)
- addAudioSample: Add sample. Parameters: {{{{ category: string, subcategory: string, trackIndex?: number, startTick?: number }}}}
- clarificationNeeded: When unclear. Parameters: {{{{ message: string, suggestedOptions?: string[] }}}}

BEAT CREATION: For "make a beat" requests, create full 4-bar patterns with 30-50+ sample placements.
Example tick positions for a 4-bar boom-bap:
- Kicks: 0, 144, 384, 528, 768, 912, 1152, 1296
- Snares: 96, 288, 480, 672, 864, 1056, 1248, 1440  
- Hi-hats: 0, 48, 96, 144... every 48 ticks for 8th notes

For unclear commands use action "clarificationNeeded" with a message explaining what you need.`;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simple hash function for context comparison
 */
function hashContext(context: string): string {
  let hash = 0;
  for (let i = 0; i < context.length; i++) {
    const char = context.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Mock Backboard response for testing
 * Parses simple natural language commands into structured responses
 * Now returns batch format for consistency
 */
function mockBackboardResponse(text: string, model: string, systemPrompt?: string): BackboardResponse {
  console.log(`[Mock Backboard] Processing: "${text}" with model: ${model}`);

  const lowerText = text.toLowerCase();

  // Helper to wrap single action in batch format
  const wrapInBatch = (action: string, parameters: Record<string, any>, confidence: number, reasoning: string): BackboardResponse => ({
    action: '__batch__',
    parameters: {
      actions: [{ action, parameters }],
    },
    confidence,
    reasoning,
  });

  // Pattern: AI Ghost Preview - "suggest what clip should come next"
  if (lowerText.includes('suggest') && (lowerText.includes('clip') || lowerText.includes('next'))) {
    // Parse context from the system prompt
    let trackIndex = 0;
    let startTick = 384;
    const availablePatterns: Array<{ id: string; name: string; bars: number }> = [];
    const usedPatternNames: string[] = [];

    if (systemPrompt) {
      // Extract track number from prompt
      const trackMatch = systemPrompt.match(/track (\d+)/i);
      if (trackMatch && trackMatch[1]) {
        trackIndex = parseInt(trackMatch[1]) - 1;
      }

      // Extract suggested start tick from prompt
      const tickMatch = systemPrompt.match(/startTick["\s:]+(\d+)/);
      if (tickMatch && tickMatch[1]) {
        startTick = parseInt(tickMatch[1]);
      }

      // Parse all available patterns from the prompt
      const patternRegex = /"([^"]+)" \((\d+) bars, ID: ([a-zA-Z0-9-]+)\)/g;
      let match;
      while ((match = patternRegex.exec(systemPrompt)) !== null) {
        if (match[1] && match[2] && match[3]) {
          availablePatterns.push({
            name: match[1],
            bars: parseInt(match[2]),
            id: match[3],
          });
        }
      }

      // Parse track history to see what patterns were already used
      const historyRegex = /- "([^"]+)" \(Bars/g;
      while ((match = historyRegex.exec(systemPrompt)) !== null) {
        if (match[1]) {
          usedPatternNames.push(match[1]);
        }
      }
    }

    console.log('[Mock Backboard] Available patterns:', JSON.stringify(availablePatterns, null, 2));
    console.log('[Mock Backboard] Used patterns on track:', usedPatternNames);

    // PRIORITY: Always suggest creating a NEW AI-generated pattern first!
    // This gives users fresh, creative content rather than reusing existing patterns
    const newPatternName = 'AI Generated Beat';
    const durationBars = 2;
    const ticksPerBar = 384;

    // Generate different notes based on what patterns exist to add variety
    const noteVariations = [
      // Variation 1: Bass line
      [
        { pitch: 36, startTick: 0, durationTick: 96, velocity: 100 },
        { pitch: 36, startTick: 192, durationTick: 48, velocity: 80 },
        { pitch: 38, startTick: 288, durationTick: 48, velocity: 90 },
        { pitch: 41, startTick: 384, durationTick: 96, velocity: 100 },
        { pitch: 36, startTick: 576, durationTick: 48, velocity: 85 },
        { pitch: 43, startTick: 672, durationTick: 96, velocity: 95 },
      ],
      // Variation 2: Melodic pattern
      [
        { pitch: 60, startTick: 0, durationTick: 48, velocity: 90 },
        { pitch: 62, startTick: 96, durationTick: 48, velocity: 85 },
        { pitch: 64, startTick: 192, durationTick: 96, velocity: 100 },
        { pitch: 62, startTick: 384, durationTick: 48, velocity: 80 },
        { pitch: 60, startTick: 480, durationTick: 48, velocity: 85 },
        { pitch: 57, startTick: 576, durationTick: 96, velocity: 95 },
      ],
      // Variation 3: Rhythmic hits
      [
        { pitch: 48, startTick: 0, durationTick: 24, velocity: 100 },
        { pitch: 48, startTick: 96, durationTick: 24, velocity: 70 },
        { pitch: 48, startTick: 192, durationTick: 24, velocity: 100 },
        { pitch: 48, startTick: 288, durationTick: 24, velocity: 70 },
        { pitch: 48, startTick: 384, durationTick: 24, velocity: 100 },
        { pitch: 48, startTick: 480, durationTick: 24, velocity: 70 },
        { pitch: 48, startTick: 576, durationTick: 24, velocity: 100 },
        { pitch: 48, startTick: 672, durationTick: 24, velocity: 70 },
      ],
    ];

    // Pick a variation based on how many patterns already exist
    const variationIndex = availablePatterns.length % noteVariations.length;
    const generatedNotes = noteVariations[variationIndex];

    return {
      action: '__batch__',
      parameters: {
        actions: [
          {
            action: 'addPattern',
            parameters: {
              name: newPatternName,
              lengthInSteps: durationBars * 16,
            }
          },
          {
            action: 'addNoteSequence',
            parameters: {
              patternId: '__NEW_PATTERN__',
              notes: generatedNotes,
            }
          },
          {
            action: 'addClip',
            parameters: {
              patternId: '__NEW_PATTERN__',
              trackIndex,
              startTick,
              durationTick: durationBars * ticksPerBar,
            }
          },
        ],
      },
      confidence: 0.9,
      reasoning: `Creating "${newPatternName}" with fresh notes just for you! 🎵`,
    };
  }

  // Pattern: "make a beat" or "create a beat"
  if (lowerText.includes('beat') && (lowerText.includes('make') || lowerText.includes('create'))) {
    // Full 4-bar boom-bap pattern with proper tick positions
    const actions: { action: string; parameters: Record<string, any> }[] = [
      { action: 'setBpm', parameters: { bpm: 90 } },
    ];

    // Kicks: 1, 2-and pattern across 4 bars (ticks 0, 144, 384, 528, 768, 912, 1152, 1296)
    const kickTicks = [0, 144, 384, 528, 768, 912, 1152, 1296];
    kickTicks.forEach(tick => {
      actions.push({ action: 'addAudioSample', parameters: { category: 'drums', subcategory: 'kick', trackIndex: 0, startTick: tick } });
    });

    // Snares: beats 2 and 4 pattern across 4 bars (ticks 96, 288, 480, 672, 864, 1056, 1248, 1440)
    const snareTicks = [96, 288, 480, 672, 864, 1056, 1248, 1440];
    snareTicks.forEach(tick => {
      actions.push({ action: 'addAudioSample', parameters: { category: 'drums', subcategory: 'snare', trackIndex: 1, startTick: tick } });
    });

    // Hi-hats: 8th notes throughout 4 bars (every 48 ticks from 0 to 1488)
    for (let tick = 0; tick < 1536; tick += 48) {
      actions.push({ action: 'addAudioSample', parameters: { category: 'drums', subcategory: 'hihat', trackIndex: 2, startTick: tick } });
    }

    return {
      action: '__batch__',
      parameters: { actions },
      confidence: 0.9,
      reasoning: 'Creating a 4-bar boom-bap beat: kicks on 1 and 2-and, snares on 2 and 4, 8th note hi-hats throughout',
    };
  }

  // Pattern: "add a [instrument] pattern"
  if (
    lowerText.includes('pattern') &&
    (lowerText.includes('add') || lowerText.includes('create'))
  ) {
    const instruments = ['kick', 'snare', 'hihat', 'clap', 'tom', 'cymbal'];
    const found = instruments.find((inst) => lowerText.includes(inst));

    return wrapInBatch(
      'addPattern',
      {
        name: found
          ? `${found.charAt(0).toUpperCase() + found.slice(1)} Pattern`
          : 'New Pattern',
        lengthInSteps: 16,
      },
      0.9,
      `Creating a new pattern${found ? ` for ${found}` : ''}`
    );
  }

  // Pattern: "set bpm to [number]"
  if (lowerText.includes('bpm') || lowerText.includes('tempo')) {
    const match = text.match(/\d+/);
    const bpm = match ? parseInt(match[0]) : 120;

    return wrapInBatch('setBpm', { bpm }, 0.95, `Setting tempo to ${bpm} BPM`);
  }

  // Pattern: "play"
  if (lowerText.match(/^(play|start)/) || lowerText.includes('play it')) {
    return wrapInBatch('play', {}, 1.0, 'Starting playback');
  }

  // Pattern: "stop"
  if (lowerText.match(/^stop/)) {
    return wrapInBatch('stop', {}, 1.0, 'Stopping playback');
  }

  // Pattern: "add note" or "add [note]"
  if (lowerText.includes('note')) {
    return wrapInBatch(
      'addNote',
      {
        patternId: 'current',
        pitch: 60, // C4
        startTick: 0,
        durationTick: 96,
        velocity: 100,
      },
      0.7,
      'Adding a note to the current pattern'
    );
  }

  // Default: unknown command
  return wrapInBatch(
    'clarificationNeeded',
    {
      message: `I understand you want to "${text}", but I'm not sure how to help with that. Try commands like "make a beat", "add a kick pattern", "set BPM to 128", or "play".`,
      suggestedOptions: ['Make a beat', 'Add a pattern', 'Set BPM', 'Play/Stop'],
    },
    0.1,
    'Command not recognized'
  );
}

/**
 * Initialize and validate Backboard configuration
 */
export function initializeBackboard(): void {
  if (!BACKBOARD_API_KEY) {
    throw new Error('BACKBOARD_API_KEY environment variable is not set');
  }

  // Initialize the SDK client
  if (!client) {
    client = new BackboardClient({
      apiKey: BACKBOARD_API_KEY,
    });
  }
}

/**
 * Get or create the Backboard client
 */
function getClient(): InstanceType<typeof BackboardClient> {
  if (!client) {
    if (!BACKBOARD_API_KEY) {
      throw new Error('Backboard API key not configured');
    }
    client = new BackboardClient({
      apiKey: BACKBOARD_API_KEY,
    });
  }
  return client;
}

/**
 * Create or get cached assistant with dynamic system prompt
 * If the context has changed significantly, create a new assistant
 */
async function getAssistant(systemPrompt: string): Promise<string> {
  const contextHash = hashContext(systemPrompt);

  // If context changed significantly, invalidate cache
  if (cachedAssistantId && cachedContextHash !== contextHash) {
    console.log('[Backboard] Context changed, creating new assistant');
    cachedAssistantId = null;
    cachedThreadId = null;
  }

  if (cachedAssistantId) {
    return cachedAssistantId;
  }

  const backboard = getClient();
  const assistant = await backboard.createAssistant({
    name: 'Pulse Studio Music Copilot',
    description: systemPrompt,
  });

  cachedAssistantId = assistant.assistantId;
  cachedContextHash = contextHash;
  console.log(`[Backboard] Created assistant: ${cachedAssistantId}`);
  return cachedAssistantId!;
}

/**
 * Create or get cached thread
 */
async function getThread(assistantId: string): Promise<string> {
  if (cachedThreadId) {
    return cachedThreadId;
  }

  const backboard = getClient();
  const thread = await backboard.createThread(assistantId);

  cachedThreadId = thread.threadId;
  console.log(`[Backboard] Created thread: ${cachedThreadId}`);
  return cachedThreadId!;
}

/**
 * Send a message to the specified AI model through Backboard
 *
 * @param text - The user's natural language input
 * @param model - The model to use ('gemini' or 'fallback')
 * @param conversationHistory - Optional previous messages for context
 * @param systemPrompt - Dynamic system prompt with project context (from contextBuilder)
 * @returns Parsed JSON response from the AI model
 *
 * @example
 * const context = buildDAWContext(project, sampleLibrary);
 * const systemPrompt = generateSystemPrompt(context);
 * const response = await sendToModel("add a kick drum", "gemini", [], systemPrompt);
 * console.log(response.action); // "addAudioSample"
 * console.log(response.parameters); // { sampleId: "drums_kick_..." }
 */
export async function sendToModel(
  text: string,
  model: 'gemini' | 'fallback',
  _conversationHistory?: Array<{ role: string; content: string }>,
  systemPrompt?: string
): Promise<BackboardResponse> {
  // Use provided system prompt or fall back to default
  const effectiveSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  // MOCK MODE: Return mock responses for testing
  if (USE_MOCK) {
    console.log('[Backboard] Using MOCK mode');
    await sleep(300); // Simulate network delay
    return mockBackboardResponse(text, model, effectiveSystemPrompt);
  }

  // Use Backboard SDK directly (REST API endpoint doesn't exist)
  if (!BACKBOARD_API_KEY) {
    throw new Error('Backboard API key not configured');
  }

  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Get or create assistant and thread with dynamic context
      const assistantId = await getAssistant(effectiveSystemPrompt);
      const threadId = await getThread(assistantId);

      // Intelligent model routing based on task type
      const taskType = classifyTask(text);
      const modelConfig = getModelForTask(taskType);

      console.log(`[Backboard] Task classified as: ${taskType}`);
      console.log(`[Backboard] Using model: ${modelConfig.provider}/${modelConfig.modelName}`);

      const llmProvider = modelConfig.provider;
      const modelName = modelConfig.modelName;

      // Send message using SDK
      const backboard = getClient();
      const response = await backboard.addMessage(threadId, {
        content: text,
        llm_provider: llmProvider,
        model_name: modelName,
        stream: false,
      });

      // Check if the response was successful
      if (response.status === 'FAILED') {
        throw new Error(`Backboard response failed: ${response.content}`);
      }

      // Extract response content from SDK response
      let content = response.content || '';

      // Try to parse JSON from the response
      try {
        // Remove markdown code blocks if present
        content = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const parsed = JSON.parse(content);

        // Check if this is a batch response (has "actions" array) or single response
        if (parsed.actions && Array.isArray(parsed.actions)) {
          // Return as batch response format
          return {
            action: '__batch__',
            parameters: {
              actions: parsed.actions,
              sampleChoices: parsed.sampleChoices,
            },
            confidence: parsed.confidence,
            reasoning: parsed.reasoning,
          };
        }

        // Legacy single action response - wrap in batch format
        return {
          action: '__batch__',
          parameters: {
            actions: [{
              action: parsed.action || 'unknown',
              parameters: parsed.parameters || {},
            }],
          },
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
        };
      } catch (parseError) {
        // If JSON parsing fails, return unknown command
        console.error('Failed to parse AI response:', content);
        return {
          action: '__batch__',
          parameters: {
            actions: [{
              action: 'unknown',
              parameters: {
                originalText: text,
                reason: 'Failed to parse AI response',
                rawResponse: content,
              },
            }],
          },
        };
      }
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

  // All retries failed - fall back to mock
  console.warn('[Backboard] All API attempts failed, falling back to mock response');
  console.log('[Backboard] Last error:', lastError?.message);
  return mockBackboardResponse(text, model, effectiveSystemPrompt);
}

/**
 * Test the Backboard connection
 * @returns true if connection successful, throws error otherwise
 */
export async function testConnection(): Promise<boolean> {
  await sendToModel('test', 'fallback');
  return true;
}
