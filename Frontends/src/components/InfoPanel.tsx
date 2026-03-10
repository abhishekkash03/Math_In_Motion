import React from 'react';
import { Formula } from '../formulas/registry';
import { exportJSON } from '../utils/exportJSON';
import { exportCSV } from '../utils/exportCSV';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, Download, RotateCcw, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InfoPanelProps {
  formula: Formula;
  points: {x: number, y: number, z: number}[];
  renderMode: 'line' | 'particles' | 'both';
  setRenderMode: (mode: 'line' | 'particles' | 'both') => void;
  showAxes: boolean;
  setShowAxes: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  onRestart: () => void;
  onResetCamera: () => void;
}

export const InfoPanel = ({
  formula,
  points,
  renderMode,
  setRenderMode,
  showAxes,
  setShowAxes,
  showGrid,
  setShowGrid,
  speed,
  setSpeed,
  onRestart,
  onResetCamera
}: InfoPanelProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-y-auto text-zinc-300">
      <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur z-10 flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-xl font-bold text-white truncate">{formula.name}</h1>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">
        <section>
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Equation</h2>
          <div className="bg-zinc-900 rounded-lg p-4 overflow-x-auto">
            <BlockMath math={formula.latex} />
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Description</h2>
          <p className="text-sm leading-relaxed">{formula.description}</p>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">History</h2>
          <p className="text-sm leading-relaxed">{formula.history}</p>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Applications</h2>
          <p className="text-sm leading-relaxed">{formula.applications}</p>
        </section>

        <hr className="border-zinc-800" />

        <section className="flex flex-col gap-5">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Controls</h2>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">Render Mode</label>
            <div className="flex bg-zinc-900 rounded-lg p-1">
              {(['line', 'particles', 'both'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRenderMode(mode)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    renderMode === mode 
                      ? 'bg-zinc-700 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showAxes} 
                onChange={(e) => setShowAxes(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/20"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Axes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showGrid} 
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500/20"
              />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Grid</span>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-400">Drawing Speed</label>
              <span className="text-xs text-zinc-500 font-mono">{speed}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={onRestart}
              className="flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Restart
            </button>
            <button 
              onClick={onResetCamera}
              className="flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded-lg transition-colors"
            >
              <Video size={16} />
              Reset Cam
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-zinc-400">Export Data</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => exportJSON(formula.id, points)}
                className="flex items-center justify-center gap-2 py-2 border border-zinc-700 hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors"
              >
                <Download size={16} />
                JSON
              </button>
              <button 
                onClick={() => exportCSV(formula.id, points)}
                className="flex items-center justify-center gap-2 py-2 border border-zinc-700 hover:bg-zinc-800 text-sm font-medium rounded-lg transition-colors"
              >
                <Download size={16} />
                CSV
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
