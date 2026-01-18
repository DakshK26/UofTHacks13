# Fix: AI Agent "Extend Track by N Times" Issue

## Problem
When users asked the AI agent to "extend the track by 2 times" or "make it 3 times longer", the command would fail. The AI didn't know how to:
1. Find the current clip's duration
2. Calculate the new duration (current × multiplier)
3. Use the `resizeClip` command with the calculated value

## Root Cause
The AI context builder ([lib/ai/contextBuilder.ts](lib/ai/contextBuilder.ts)) was missing:
- Instructions on how to handle "extend by N times" requests
- Examples showing the calculation process
- Explicit guidance to look at the project state for current clip durations

## Solution Applied

### 1. Added Example (lines 882-896 in contextBuilder.ts)
```typescript
### Extending clips by multiplier:
User: "extend the track by 2 times" or "make it 3 times longer"
Response:
{
  "actions": [
    { "action": "resizeClip", "parameters": { "clipId": "current", "durationTick": <CURRENT_DURATION * MULTIPLIER> } }
  ],
  "confidence": 0.9,
  "reasoning": "Extending the most recent clip by multiplying its current duration..."
}

**CRITICAL FOR EXTENDING CLIPS:**
1. Check the project state for the most recent clip's durationTick value
2. Multiply that duration by the requested factor (2x, 3x, etc.)
3. Use the calculated value in resizeClip
4. Example: If current clip is 1536 ticks (4 bars) and user says "extend by 2 times", 
   the new duration is 1536 * 2 = 3072 ticks (8 bars)
5. Example: If current clip is 768 ticks (2 bars) and user says "make it 3 times longer", 
   the new duration is 768 * 3 = 2304 ticks (6 bars)
```

### 2. Added Critical Rule #12 (line 423 in contextBuilder.ts)
Added explicit instruction to the CRITICAL RULES section:
```
12. **EXTENDING CLIPS: When user asks to "extend by N times" or "make it N times longer", 
    look at the most recent clip's duration in the project state, multiply it by N, 
    and use that calculated value in resizeClip. Do NOT guess - use the actual current 
    duration from the project state.**
```

## How It Works Now

### Project State Context
The AI already receives clip information in this format:
```
### Clips on Timeline:
  - pattern clip "Piano Chords" on track 4 at tick 0 (duration: 1536 ticks)
  - pattern clip "Bass Line" on track 3 at tick 0 (duration: 768 ticks)
```

### AI Processing Flow
1. **User says**: "extend the track by 2 times"
2. **AI reads** the most recent clip from project state (e.g., 1536 ticks)
3. **AI calculates**: 1536 × 2 = 3072 ticks
4. **AI returns**:
   ```json
   {
     "actions": [
       { 
         "action": "resizeClip", 
         "parameters": { 
           "clipId": "current", 
           "durationTick": 3072 
         } 
       }
     ],
     "confidence": 0.9,
     "reasoning": "Extending clip from 1536 ticks (4 bars) to 3072 ticks (8 bars) - 2x multiplier"
   }
   ```
5. **System executes**: The `batchExecutor` resolves "current" to the actual clip ID
6. **Result**: Clip is resized to 2x its original length

## Testing
To test the fix:
1. Create a clip in the DAW (e.g., add a beat pattern)
2. Ask the AI: "extend the track by 2 times"
3. Verify the clip duration doubles
4. Try other multipliers: "make it 3 times longer", "extend by 4 times", etc.

## Related Files
- **Modified**: `lib/ai/contextBuilder.ts` - Added examples and instructions
- **Supporting**: `lib/ai/batchExecutor.ts` - Handles "current" clipId resolution
- **Supporting**: `lib/ai/dawController.ts` - Executes resizeClip commands
- **Supporting**: `lib/ai/commandParser.ts` - Parses resizeClip action

## Why It Failed Before
The AI had all the necessary tools:
- ✅ `resizeClip` command existed
- ✅ Project state included clip durations
- ✅ "extend" was recognized as a technical pattern

But it lacked:
- ❌ **Instructions** on the calculation process
- ❌ **Examples** showing how to multiply durations
- ❌ **Explicit guidance** to read from project state

## Note
This fix doesn't require any code changes to the execution layer - it's purely a prompt engineering fix. The underlying commands always worked; the AI just didn't know when and how to use them.
