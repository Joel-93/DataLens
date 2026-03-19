import React, { useState, useRef } from 'react';
import { DashboardGrid, WidgetConfig } from '../components/DashboardGrid';
import { Layout, BarChart2, LineChart, PieChart, Table, Activity, X, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

const initialLayout: WidgetConfig[] = [
  { i: 'kpi-1', x: 0, y: 0, w: 3, h: 1, type: 'kpi', title: 'Total Revenue', settings: { metric: 'Total Revenue', value: '124,563', format: 'currency' } },
  { i: 'chart-1', x: 0, y: 1, w: 8, h: 3, type: 'area', title: 'Revenue Over Time', settings: {} },
];

const WIDGET_TYPES = [
  { type: 'kpi', label: 'KPI Card', icon: Activity, w: 3, h: 1 },
  { type: 'bar', label: 'Bar Chart', icon: BarChart2, w: 6, h: 3 },
  { type: 'line', label: 'Line Chart', icon: LineChart, w: 6, h: 3 },
  { type: 'area', label: 'Area Chart', icon: Activity, w: 6, h: 3 },
  { type: 'pie', label: 'Pie Chart', icon: PieChart, w: 4, h: 3 },
  { type: 'table', label: 'Data Table', icon: Table, w: 8, h: 4 },
];

export const ConfigureDashboardPage: React.FC = () => {
  const [layout, setLayout] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('datalens_dashboard_layout');
    return saved ? JSON.parse(saved) : initialLayout;
  });

  // Auto-save layout whenever it changes
  React.useEffect(() => {
    localStorage.setItem('datalens_dashboard_layout', JSON.stringify(layout));
  }, [layout]);

  const [configModal, setConfigModal] = useState<{ isOpen: boolean; widgetId: string | null; type: string | null; isNewWidget?: boolean }>({ isOpen: false, widgetId: null, type: null });
  const [configData, setConfigData] = useState<any>({});
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const draggedWidgetType = useRef<string | null>(null);

  const handleDownload = async () => {
    if (!dashboardRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Add a slight delay to ensure any rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const width = dashboardRef.current.offsetWidth;
      const height = dashboardRef.current.offsetHeight;

      const dataUrl = await htmlToImage.toPng(dashboardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc'
      });
      
      // Calculate PDF dimensions based on the element aspect ratio
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save('Configured_Dashboard.pdf');
    } catch (error) {
      console.error('Error downloading dashboard:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('text/plain', type);
    draggedWidgetType.current = type;
  };

  const handleDeleteWidget = (id: string) => {
    setLayout(layout.filter((w) => w.i !== id));
  };

  const openConfigModal = (id: string, type: string, newWidget?: WidgetConfig, isNew: boolean = false) => {
    const widget = newWidget || layout.find(w => w.i === id);
    setConfigData({ ...widget?.settings, title: widget?.title || widget?.settings?.title || '' });
    setConfigModal({ isOpen: true, widgetId: id, type, isNewWidget: isNew });
    setParsedData([]);
    
    // Use existing columns, or extract from data, or fallback to mock data columns so user can configure immediately
    let initialColumns = widget?.settings?.columns || [];
    if (initialColumns.length === 0 && widget?.settings?.data && widget.settings.data.length > 0) {
      initialColumns = Object.keys(widget.settings.data[0]);
    }
    if (initialColumns.length === 0) {
      initialColumns = ['name', 'value', 'revenue'];
    }
    setColumns(initialColumns);
  };

  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          if (results.meta.fields && results.meta.fields.length > 0) {
            const fields = results.meta.fields;
            setColumns(fields);
            
            // Auto-select first two columns if not already selected
            setConfigData(prev => ({
              ...prev,
              xAxis: prev.xAxis || fields[0],
              yAxis: prev.yAxis || (fields.length > 1 ? fields[1] : fields[0]),
              selectedColumns: prev.selectedColumns || fields.slice(0, 5) // Select up to 5 columns for table
            }));
          }
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json.length > 0) {
          setParsedData(json);
          const fields = Object.keys(json[0] as object);
          setColumns(fields);
          
          // Auto-select first two columns if not already selected
          setConfigData(prev => ({
            ...prev,
            xAxis: prev.xAxis || fields[0],
            yAxis: prev.yAxis || (fields.length > 1 ? fields[1] : fields[0]),
            selectedColumns: prev.selectedColumns || fields.slice(0, 5) // Select up to 5 columns for table
          }));
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Please upload a CSV or Excel file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCloseModal = () => {
    if (configModal.isNewWidget && configModal.widgetId) {
      setLayout(prev => prev.filter(w => w.i !== configModal.widgetId));
    }
    setConfigModal({ isOpen: false, widgetId: null, type: null, isNewWidget: false });
  };

  const saveWidgetConfig = () => {
    if (configModal.widgetId) {
      setLayout(prev => prev.map(w => {
        if (w.i === configModal.widgetId) {
          return {
            ...w,
            title: configData.title || w.title,
            settings: {
              ...configData,
              data: parsedData.length > 0 ? parsedData : w.settings.data,
            }
          };
        }
        return w;
      }));
    }
    setConfigModal({ isOpen: false, widgetId: null, type: null, isNewWidget: false });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar for Widgets */}
      <div className="w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Widgets</h2>
        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
          {WIDGET_TYPES.map((widget) => {
            const Icon = widget.icon;
            return (
              <div
                key={widget.type}
                draggable={true}
                unselectable="on"
                onDragStart={(e) => handleDragStart(e, widget.type)}
                className="droppableElement flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg cursor-grab hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm text-indigo-600 dark:text-indigo-400">
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{widget.label}</span>
              </div>
            );
          })}
        </div>
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto flex flex-col gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading || layout.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            <Download size={16} className={isDownloading ? "animate-pulse" : ""} />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Dashboard Canvas */}
      <div 
        className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4 overflow-y-auto relative" 
        ref={dashboardRef}
      >
        {layout.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
            <Layout size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Your dashboard is empty</p>
            <p className="text-sm mt-1">Drag widgets from the sidebar to get started.</p>
          </div>
        )}
        <DashboardGrid
          isEditing={true}
          layout={layout}
          onLayoutChange={(newLayout) => {
            setLayout(prev => {
              return prev.map(item => {
                const updated = newLayout.find(nl => nl.i === item.i);
                return updated ? { ...item, ...updated } : item;
              });
            });
          }}
          onDeleteWidget={handleDeleteWidget}
          onEditWidget={(id) => {
            const widget = layout.find(w => w.i === id);
            if (widget) openConfigModal(id, widget.type);
          }}
          onDrop={(newLayout, item, e) => {
            const type = (draggedWidgetType.current || (e as any).dataTransfer?.getData('text/plain')) as WidgetConfig['type'];
            if (type && item) {
              const widgetTypeInfo = WIDGET_TYPES.find(w => w.type === type);
              const newWidget: WidgetConfig = {
                i: `widget-${Date.now()}`,
                x: item.x,
                y: item.y,
                w: widgetTypeInfo?.w || 6,
                h: widgetTypeInfo?.h || 3,
                type,
                title: `New ${type.toUpperCase()} Widget`,
                settings: {},
              };
              setLayout(prev => [...prev, newWidget]);
              openConfigModal(newWidget.i, type, newWidget, true);
              draggedWidgetType.current = null;
            }
          }}
        />
      </div>

      {/* Configuration Modal */}
      {configModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm" onClick={handleCloseModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Configure Widget</h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Basic Details Section */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">1. Basic Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Widget Title</label>
                    <input
                      type="text"
                      value={configData.title || ''}
                      onChange={(e) => setConfigData({ ...configData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g., Revenue by Month"
                    />
                  </div>
                </div>

                {/* Data Source Section */}
                {configModal.type !== 'kpi' && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">2. Data Source</h4>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Data (CSV or Excel)</label>
                    <div 
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                        isDragging 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileDrop}
                    >
                      <div className="space-y-1 text-center">
                        <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-1 shadow-sm border border-slate-200 dark:border-slate-700">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={handleFileUpload} />
                          </label>
                          <p className="pl-2 pt-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">CSV, XLSX, XLS up to 10MB</p>
                      </div>
                    </div>
                    {parsedData.length > 0 ? (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <Activity size={14} /> Data loaded successfully: {parsedData.length} rows
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">Using default mock data. Upload a file to use custom data.</p>
                    )}
                  </div>
                )}

                {/* Configuration Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    {configModal.type === 'kpi' ? '2. Metric Configuration' : '3. Chart Configuration'}
                  </h4>
                  
                  {configModal.type === 'kpi' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Metric Name</label>
                        <input type="text" value={configData.metric || ''} onChange={(e) => setConfigData({ ...configData, metric: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Total Users" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                        <input type="text" value={configData.value || ''} onChange={(e) => setConfigData({ ...configData, value: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., 1,234" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Format</label>
                        <select value={configData.format || 'number'} onChange={(e) => setConfigData({ ...configData, format: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option value="number">Number</option>
                          <option value="currency">Currency ($)</option>
                          <option value="percentage">Percentage (%)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {['bar', 'line', 'area', 'scatter', 'pie'].includes(configModal.type || '') && columns.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">X-Axis Field (Dimension)</label>
                          <select value={configData.xAxis || ''} onChange={(e) => setConfigData({ ...configData, xAxis: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="">Select a field</option>
                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Y-Axis Field (Measure)</label>
                          <select value={configData.yAxis || ''} onChange={(e) => setConfigData({ ...configData, yAxis: e.target.value })} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="">Select a field</option>
                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <input type="checkbox" id="showLegend" checked={configData.showLegend !== false} onChange={(e) => setConfigData({ ...configData, showLegend: e.target.checked })} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" />
                        <label htmlFor="showLegend" className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Show Chart Legend</label>
                      </div>
                    </div>
                  )}
                  
                  {configModal.type === 'table' && columns.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Columns to Display</label>
                      <div className="max-h-40 overflow-y-auto p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-2">
                        {columns.map(col => (
                          <div key={col} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`col-${col}`} 
                              checked={configData.selectedColumns?.includes(col) || (!configData.selectedColumns && true)} 
                              onChange={(e) => {
                                const current = configData.selectedColumns || columns;
                                if (e.target.checked) {
                                  setConfigData({ ...configData, selectedColumns: [...current, col] });
                                } else {
                                  setConfigData({ ...configData, selectedColumns: current.filter((c: string) => c !== col) });
                                }
                              }} 
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer" 
                            />
                            <label htmlFor={`col-${col}`} className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">{col}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button onClick={saveWidgetConfig} className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  Save Widget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
