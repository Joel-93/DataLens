import React, { useState, useEffect, useRef } from 'react';
import GridLayout, { useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidgetRenderer } from './WidgetRenderer';
import { useTheme } from '../context/ThemeContext';

export interface WidgetConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'kpi' | 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'table';
  title: string;
  settings: any;
}

interface DashboardGridProps {
  isEditing: boolean;
  layout: WidgetConfig[];
  onLayoutChange?: (newLayout: WidgetConfig[]) => void;
  onDeleteWidget?: (id: string) => void;
  onEditWidget?: (id: string) => void;
  onDrop?: (layout: any[], item: any, e: Event) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  isEditing,
  layout,
  onLayoutChange,
  onDeleteWidget,
  onEditWidget,
  onDrop,
}) => {
  const { theme } = useTheme();
  const { width, containerRef, mounted } = useContainerWidth();

  const handleLayoutChange = (newLayout: any[]) => {
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
  };

  return (
    <div id="dashboard-container" className="w-full" ref={containerRef}>
      {mounted && (
        <GridLayout
          className="layout"
          style={{ minHeight: '100vh' }}
          layout={layout}
          cols={12}
          rowHeight={100}
          margin={[16, 16]}
          width={width}
          dragConfig={{ enabled: isEditing, handle: '.drag-handle' }}
          resizeConfig={{ enabled: isEditing }}
          dropConfig={{ enabled: isEditing && !!onDrop, defaultItem: { w: 6, h: 3 } }}
          onLayoutChange={handleLayoutChange}
          onDrop={onDrop}
        >
          {layout.map((widget) => (
            <div
              key={widget.i}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-shadow hover:shadow-md"
            >
              <div className="drag-handle px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80 cursor-move">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {widget.title}
                </h3>
                {(onEditWidget || onDeleteWidget) && (
                  <div className="flex space-x-2">
                    {onEditWidget && (
                      <button
                        onClick={() => onEditWidget(widget.i)}
                        className="text-slate-400 hover:text-indigo-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                    )}
                    {onDeleteWidget && (
                      <button
                        onClick={() => onDeleteWidget(widget.i)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 overflow-hidden relative">
                <WidgetRenderer widget={widget} />
              </div>
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
};
