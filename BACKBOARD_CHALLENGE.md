# Backboard.io Technical Challenge: Memory Lane

## Challenge: Adaptive AI Journeys

**Team:** Pulse Studio  
**Project:** AI-Powered Digital Audio Workstation (DAW)

---

## How We Meet the Judging Criteria

### 1. ✅ Adaptive Memory

Our application utilizes past interactions to personalize the current experience through **two key mechanisms**:

#### A. Conversation History
- We maintain the **last 5 messages** of conversation context
- Each API call includes `conversationHistory` allowing the AI to reference previous requests
- Located in: `components/panels/ChatPanel.tsx` (line 138)

```typescript
conversationHistory: messages.slice(-5), // Last 5 messages for context
```

#### B. Dynamic Project Context
- Every request includes a **dynamically generated system prompt** containing:
  - Current BPM, master volume, and project settings
  - All existing patterns with their IDs, names, and note counts
  - All channels (instruments) with their presets and settings
  - All playlist tracks and clips currently on the timeline
  - Available samples from the sample library
  - DAW capabilities and constraints

- Located in: `lib/ai/contextBuilder.ts`

```typescript
export function generateSystemPrompt(context: DAWContext): string {
  // Builds a comprehensive prompt with current project state
  // AI knows exactly what exists and can reference it by ID
}
```

**Result:** The AI adapts its responses based on what the user has already created. For example:
- If tracks 0-2 have drums, it suggests adding bass on track 3
- If a pattern named "Kick Pattern" exists, it references it by ID
- If BPM is 90, it creates boom-bap patterns; if 140, it creates trap patterns

---

### 2. ✅ Model Switching (2+ Providers)

We implement **intelligent model switching** between different LLM providers based on task type:

| Task Type | Provider | Model | Use Case |
|-----------|----------|-------|----------|
| **Creative** | Google | `gemini-2.5-flash` | Beat making, melodies, chord progressions, musical suggestions |
| **Technical** | OpenAI | `gpt-4o` | BPM changes, transport controls, precise edits, mixer settings |
| **Analytical** | Anthropic | `claude-sonnet-4-20250514` | Explanations, music theory, feedback, analysis |
| **Fallback** | OpenAI | `gpt-4o-mini` | Fast responses for simple commands |

#### Implementation Details

**Task Classification** (`lib/ai/backboard.ts`):

```typescript
export function classifyTask(userInput: string): TaskType {
  // Creative patterns - musical creation, suggestions
  const creativePatterns = [
    /make\s+(a\s+)?beat/,
    /create\s+(a\s+)?(beat|melody|chord|bass|pattern)/,
    /hip\s*hop|trap|house|edm|jazz|funk|rock|pop|lofi/,
    // ... more patterns
  ];
  
  // Technical patterns - precise operations
  const technicalPatterns = [
    /set\s+(bpm|tempo)/,
    /^(play|stop|pause)$/,
    /mute|solo|unmute/,
    // ... more patterns
  ];
  
  // Route to appropriate model
}
```

**Model Routing**:

```typescript
const MODEL_CONFIGS = {
  creative: {
    provider: 'google',
    modelName: 'gemini-2.5-flash',
    description: 'Google Gemini 2.5 Flash - Creative & musical tasks',
  },
  technical: {
    provider: 'openai',
    modelName: 'gpt-4o',
    description: 'OpenAI GPT-4o - Technical & precise tasks',
  },
  analytical: {
    provider: 'anthropic',
    modelName: 'claude-sonnet-4-20250514',
    description: 'Anthropic Claude Sonnet 4 - Analysis & explanations',
  },
};
```

**Why This Approach?**
- **Gemini** excels at creative, open-ended tasks like composing beats and suggesting musical ideas
- **GPT-4o** excels at structured JSON output and precise parameter handling
- **Claude** excels at detailed explanations, music theory, and thoughtful analysis
- This leverages each model's unique strengths for the user's journey

---

### 3. ✅ Framework: Backboard.io

We use **Backboard.io** as our primary AI framework:

- **SDK Integration**: `backboard-sdk` package
- **API Integration**: REST API fallback at `https://api.backboard.io/v1/chat`
- **Features Used**:
  - Assistant creation with custom system prompts
  - Thread management for conversation continuity
  - Multi-provider model routing (`llm_provider`, `model_name`)
  - Streaming support (optional)

Located in: `lib/ai/backboard.ts`

```typescript
import { BackboardClient } from 'backboard-sdk';

const client = new BackboardClient({
  apiKey: BACKBOARD_API_KEY,
});

// Create assistant with dynamic context
const assistant = await backboard.createAssistant({
  name: 'Pulse Studio Music Copilot',
  description: systemPrompt,
});

// Send message with provider routing
const response = await backboard.addMessage(threadId, {
  content: text,
  llm_provider: modelConfig.provider,  // 'google' or 'openai'
  model_name: modelConfig.modelName,   // 'gemini-2.0-flash' or 'gpt-4.1'
  stream: false,
});
```

---

### 4. ✅ User Experience

#### Intuitive Chat Interface
- Natural language input: "make a trap beat", "add piano chords", "set tempo to 120"
- Real-time feedback with loading states
- Error handling with helpful messages
- Model selection dropdown (Gemini/Fallback)

#### Seamless DAW Integration
- AI commands execute immediately in the DAW
- Undo support for AI-generated changes
- Visual feedback as patterns and clips are created

#### Smart Suggestions
- AI understands musical context (genres, BPM ranges, instrument combinations)
- Suggests appropriate next steps based on current project state
- Creates complete 4-bar patterns with proper timing

---

### 5. ✅ Technical Implementation

#### Clean Architecture
```
lib/ai/
├── backboard.ts      # Backboard SDK integration & model routing
├── contextBuilder.ts # Dynamic context generation
├── commandParser.ts  # AI response → DAW command conversion
├── batchExecutor.ts  # Execute multiple AI actions
├── types.ts          # TypeScript interfaces
└── beatPatterns.ts   # Genre-specific beat templates
```

#### Key Features
- **Type Safety**: Full TypeScript with strict types
- **Error Handling**: Retry logic, rate limiting, graceful fallbacks
- **Caching**: Assistant and thread IDs cached for performance
- **Batch Actions**: Single request can generate 50+ sample placements

#### API Flow
```
User Input → ChatPanel → /api/chat → backboard.ts
                                          ↓
                              classifyTask() → TaskType
                                          ↓
                              getModelForTask() → ModelConfig
                                          ↓
                              Backboard API (Gemini or GPT-4)
                                          ↓
                              Parse JSON → Execute Commands → Update DAW
```

---

## Demo Commands to Try

| Command | Model Used | Result |
|---------|------------|--------|
| "make a hip hop beat" | Gemini (creative) | 4-bar boom-bap with kicks, snares, hi-hats |
| "set bpm to 140" | GPT-4 (technical) | Precise BPM change |
| "add a trap beat" | Gemini (creative) | 4-bar trap pattern with 808s |
| "stop" | GPT-4 (technical) | Transport control |
| "add piano chords" | Gemini (creative) | Piano channel + chord progression |
| "mute track 1" | GPT-4 (technical) | Mixer control |

---

## Files to Review

| File | Purpose |
|------|---------|
| `lib/ai/backboard.ts` | **Core integration** - Model routing, Backboard SDK |
| `lib/ai/contextBuilder.ts` | **Adaptive memory** - Dynamic context generation |
| `app/api/chat/route.ts` | API endpoint handling |
| `components/panels/ChatPanel.tsx` | User interface |

---

## Summary

✅ **Adaptive Memory**: Conversation history + dynamic project context  
✅ **Model Switching**: Google Gemini (creative) + OpenAI GPT-4 (technical)  
✅ **Framework**: Backboard.io SDK with full API integration  
✅ **User Experience**: Natural language → instant DAW actions  
✅ **Technical Implementation**: Clean, typed, production-ready code
