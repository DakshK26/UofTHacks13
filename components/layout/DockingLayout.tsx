'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Mosaic,
  MosaicWindow,
  MosaicNode,
  MosaicBranch,
} from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';

import Browser from '@/components/panels/Browser';
import ChannelRack from '@/components/panels/ChannelRack';
import Playlist from '@/components/panels/Playlist';
import PianoRoll from '@/components/panels/PianoRoll';
import Mixer from '@/components/panels/Mixer';
import ChatPanel from '@/components/panels/ChatPanel';

// Panel types
type PanelType = 'browser' | 'channelRack' | 'playlist' | 'pianoRoll' | 'mixer' | 'chat';

// Panel titles
const PANEL_TITLES: Record<PanelType, string> = {
  browser: 'Browser',
  channelRack: 'Channel Rack',
  playlist: 'Playlist',
  pianoRoll: 'Piano Roll',
  mixer: 'Mixer',
  chat: 'AI Assistant',
};

// Panel components
const PANEL_COMPONENTS: Record<PanelType, React.FC> = {
  browser: Browser,
  channelRack: ChannelRack,
  playlist: Playlist,
  pianoRoll: PianoRoll,
  mixer: Mixer,
  chat: ChatPanel,
};

// Secondary panels that get darker styling
const SECONDARY_PANELS: PanelType[] = ['browser', 'channelRack', 'mixer'];

// Default layout - AI panel on right side (Option A: Right-Side Vertical AI Dock)
const DEFAULT_LAYOUT: MosaicNode<PanelType> = {
  direction: 'row',
  first: {
    direction: 'row',
    first: {
      direction: 'column',
      first: 'browser',
      second: 'channelRack',
      splitPercentage: 50,
    },
    second: {
      direction: 'column',
      first: 'playlist',
      second: 'mixer',
      splitPercentage: 60,
    },
    splitPercentage: 22,
  },
  second: 'chat',
  splitPercentage: 78,
};

export default function DockingLayout() {
  const [layout, setLayout] = useState<MosaicNode<PanelType> | null>(
    DEFAULT_LAYOUT
  );

  const handleChange = useCallback((newLayout: MosaicNode<PanelType> | null) => {
    setLayout(newLayout);
  }, []);

  const renderTile = useCallback((id: PanelType, path: MosaicBranch[]) => {
    const Component = PANEL_COMPONENTS[id];
    const title = PANEL_TITLES[id];
    const isSecondary = SECONDARY_PANELS.includes(id);
    const isAI = id === 'chat';

    return (
      <MosaicWindow<PanelType>
        path={path}
        title={title}
        toolbarControls={<PanelToolbar panelId={id} />}
        className={isAI ? 'ai-panel-window' : ''}
      >
        <div className={`h-full w-full overflow-hidden ${
          isAI 
            ? '' // AI panel has its own background 
            : isSecondary 
              ? 'bg-ps-bg-850' 
              : 'bg-ps-bg-800'
        }`}>
          <Component />
        </div>
      </MosaicWindow>
    );
  }, []);

  // Memoize the Mosaic component to prevent unnecessary re-initialization
  const mosaicComponent = useMemo(() => (
    <Mosaic<PanelType>
      renderTile={renderTile}
      value={layout}
      onChange={handleChange}
      className="mosaic-blueprint-theme"
    />
  ), [renderTile, layout, handleChange]);

  return (
    <div className="h-full w-full">
      {mosaicComponent}
    </div>
  );
}

// Panel toolbar component
function PanelToolbar({ panelId }: { panelId: PanelType }) {
  const isAI = panelId === 'chat';
  
  return (
    <div className="flex items-center gap-1">
      {!isAI && (
        <button
          className="btn btn-ghost btn-icon opacity-50 hover:opacity-100 transition-opacity"
          title="Panel options"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      )}
    </div>
  );
}

