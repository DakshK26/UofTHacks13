'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@/state/store';
import type { ChatMessage, BackboardResponse, BackboardBatchResponse } from '@/lib/ai/types';
import { undoLastAIAction, canUndoAIAction } from '@/lib/ai/undoHandler';
import { parseAIResponse } from '@/lib/ai/commandParser';
import { executeCommand } from '@/lib/ai/dawController';
import { executeBatch } from '@/lib/ai/batchExecutor';
import { buildDAWContext, generateSystemPrompt } from '@/lib/ai/contextBuilder';
import { loadSampleLibrary } from '@/lib/audio/SampleLibrary';

// Format timestamp as relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Message component with improved styling
function Message({ message }: { message: ChatMessage }) {
  const isUser = message.from === 'user';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 ${isUser
            ? 'ai-message-user'
            : isError
              ? 'bg-red-900/50 border border-red-500/30 text-red-100 rounded-2xl'
              : 'ai-message-agent'
            } ${isSending ? 'opacity-60' : ''}`}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
        </div>
        <div className={`flex items-center gap-2 mt-1.5 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-ps-text-dim">
            {formatRelativeTime(message.timestamp)}
          </span>
          {isSending && (
            <span className="text-xs text-ps-text-muted">Sending...</span>
          )}
          {isError && (
            <span className="text-xs text-red-400">Failed</span>
          )}
        </div>
      </div>
    </div>
  );
}

// AI typing indicator component
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="ai-message-agent px-4 py-3">
        <div className="ai-typing-indicator">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const [inputText, setInputText] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    chat,
  } = useStore();

  const { messages, isPending, selectedModel, lastAICommandId } = chat;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea based on content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    // Calculate rows (max 5)
    const lineCount = e.target.value.split('\n').length;
    const newRows = Math.min(lineCount, 5);
    setTextareaRows(newRows);
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!inputText.trim() || isPending) return;

    const userMessage = inputText.trim();

    // Clear input and reset textarea
    setInputText('');
    setTextareaRows(1);

    // Add user message to chat immediately
    const userMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    chat.addMessage('user', userMessage, 'sent');

    // Set pending state
    chat.setPending(true);

    try {
      // Build dynamic context from current project state and sample library
      const project = useStore.getState().project;
      const sampleLibrary = await loadSampleLibrary();
      const dawContext = buildDAWContext(project, sampleLibrary);
      const systemPrompt = generateSystemPrompt(dawContext);

      // Call API endpoint with context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
          model: selectedModel,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
          systemPrompt, // Dynamic context for the AI
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const apiResponse = await response.json();

      // Check if API returned success
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Unknown API error');
      }

      // Parse and execute the AI command(s)
      if (apiResponse.data?.commandResult) {
        const backboardResponse = apiResponse.data.commandResult as BackboardResponse;

        try {
          // Check if this is a batch response
          if (backboardResponse.action === '__batch__' && backboardResponse.parameters?.actions) {
            // Extract batch data
            const batchData: BackboardBatchResponse = {
              actions: backboardResponse.parameters.actions,
              sampleChoices: backboardResponse.parameters.sampleChoices,
              confidence: backboardResponse.confidence,
              reasoning: backboardResponse.reasoning,
            };

            // Execute the batch using the batch executor
            const batchResult = await executeBatch(batchData, sampleLibrary);

            // Add response message based on result
            if (batchResult.success) {
              chat.addMessage('agent', batchResult.message, 'sent');

              // Track command for undo functionality
              if (batchResult.undoGroupId) {
                chat.setLastCommand(batchResult.undoGroupId);
              }
            } else {
              // Partial success - show what worked and what failed
              chat.addMessage('agent', batchResult.message, batchResult.successCount > 0 ? 'sent' : 'error');
            }
          } else {
            // Legacy single command response
            const command = parseAIResponse(backboardResponse);
            const result = await executeCommand(command);

            if (result.success) {
              chat.addMessage('agent', result.message, 'sent');
              if (result.data?.commandId) {
                chat.setLastCommand(result.data.commandId);
              }
            } else {
              chat.addMessage('agent', `Error: ${result.message}`, 'error');
            }
          }
        } catch (parseError) {
          console.error('Command parsing/execution error:', parseError);
          chat.addMessage(
            'agent',
            `Failed to execute command: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            'error'
          );
        }
      } else if (apiResponse.data?.message) {
        // If no command, just show the message
        chat.addMessage('agent', apiResponse.data.message, 'sent');
      } else {
        chat.addMessage('agent', 'Received response but no actionable command.', 'sent');
      }
    } catch (error) {
      console.error('API call error:', error);

      // Show error message in chat
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      chat.addMessage(
        'agent',
        `Failed to process your request: ${errorMessage}`,
        'error'
      );

      // Show toast notification for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showErrorToast('Network error - please check your connection');
      } else {
        showErrorToast(errorMessage);
      }
    } finally {
      // Clear pending state
      chat.setPending(false);
    }
  };

  // Show error toast notification
  const showErrorToast = (message: string) => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle model selection
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    chat.setModel(e.target.value as 'gemini' | 'fallback');
  };

  // Handle clear chat
  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (confirm('Clear all chat history?')) {
      chat.clearHistory();
    }
  };

  // Handle undo
  const handleUndo = () => {
    const success = undoLastAIAction();
    if (!success) {
      console.warn('Could not undo: No AI action to undo or undo history is empty');
    }
  };

  return (
    <div className="flex flex-col h-full ai-panel text-white relative">
      {/* Header */}
      <div className="ai-panel-header flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* AI Icon with glow */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow-ai">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ps-text-primary">AI Assistant</h2>
            <span className="text-2xs text-indigo-400">Powered by Gemini</span>
          </div>
        </div>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={handleModelChange}
            disabled={isPending}
            className="ai-model-pill bg-transparent border-0 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            title="Select AI model"
          >
            <option value="gemini" className="bg-ps-bg-800">Gemini</option>
            <option value="fallback" className="bg-ps-bg-800">Fallback</option>
          </select>
          
          {/* Header action buttons */}
          <button
            onClick={handleUndo}
            disabled={!canUndoAIAction() || isPending}
            className="w-7 h-7 flex items-center justify-center rounded-md text-ps-text-muted hover:text-ps-text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Undo last AI action"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={handleClearChat}
            disabled={messages.length === 0 || isPending}
            className="w-7 h-7 flex items-center justify-center rounded-md text-ps-text-muted hover:text-ps-text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Clear chat history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 ? (
          // Empty state - demo-ready with suggestions
          <div className="flex flex-col items-center justify-center h-full">
            {/* Animated AI icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mb-6 animate-pulse-glow">
              <svg
                className="w-10 h-10 text-indigo-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ps-text-primary mb-2">How can I help?</h3>
            <p className="text-sm text-ps-text-muted text-center mb-6 max-w-[220px]">
              Describe what you want to create and I&apos;ll help build it.
            </p>
            
            {/* Suggestion chips */}
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              <button 
                onClick={() => setInputText('Add a kick drum pattern')}
                className="text-left px-4 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-sm text-ps-text-secondary hover:text-ps-text-primary transition-all"
              >
                &ldquo;Add a kick drum pattern&rdquo;
              </button>
              <button 
                onClick={() => setInputText('Set BPM to 128')}
                className="text-left px-4 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-sm text-ps-text-secondary hover:text-ps-text-primary transition-all"
              >
                &ldquo;Set BPM to 128&rdquo;
              </button>
              <button 
                onClick={() => setInputText('Add a bass line')}
                className="text-left px-4 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-sm text-ps-text-secondary hover:text-ps-text-primary transition-all"
              >
                &ldquo;Add a bass line&rdquo;
              </button>
            </div>
          </div>
        ) : (
          // Messages
          <>
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isPending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="ai-input-container px-4 py-4 shrink-0">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to do..."
            disabled={isPending}
            rows={textareaRows}
            className="ai-input flex-1 text-white text-sm px-4 py-3 resize-none focus:outline-none disabled:opacity-50 placeholder-ps-text-dim"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isPending}
            className="ai-send-btn w-11 h-11 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed text-white shrink-0"
            title="Send message (Enter)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-2xs text-ps-text-dim mt-2.5 flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-ps-text-muted font-mono text-2xs">↵</kbd>
          <span>to send</span>
          <span className="text-ps-text-dim/50">•</span>
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-ps-text-muted font-mono text-2xs">⇧↵</kbd>
          <span>new line</span>
        </p>
      </div>
    </div>
  );
}
