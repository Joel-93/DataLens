import React, { useState, useRef } from 'react';
import { DashboardGrid, WidgetConfig } from '../components/DashboardGrid';
import { Calendar, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

const defaultLayout: WidgetConfig[] = [
  { i: 'kpi-1', x: 0, y: 0, w: 3, h: 1, type: 'kpi', title: 'Total Revenue', settings: { metric: 'Total Revenue', value: '124,563', format: 'currency' } },
  { i: 'kpi-2', x: 3, y: 0, w: 3, h: 1, type: 'kpi', title: 'Total Orders', settings: { metric: 'Total Orders', value: '1,234', format: 'number' } },
  { i: 'kpi-3', x: 6, y: 0, w: 3, h: 1, type: 'kpi', title: 'Average Order Value', settings: { metric: 'Average Order Value', value: '100.94', format: 'currency' } },
  { i: 'kpi-4', x: 9, y: 0, w: 3, h: 1, type: 'kpi', title: 'Active Customers', settings: { metric: 'Active Customers', value: '892', format: 'number' } },
  { i: 'chart-1', x: 0, y: 1, w: 8, h: 3, type: 'area', title: 'Revenue Over Time', settings: {} },
  { i: 'chart-2', x: 8, y: 1, w: 4, h: 3, type: 'pie', title: 'Sales by Category', settings: {} },
  { i: 'chart-3', x: 0, y: 4, w: 6, h: 3, type: 'bar', title: 'Orders by Region', settings: {} },
  { i: 'table-1', x: 6, y: 4, w: 6, h: 3, type: 'table', title: 'Recent Transactions', settings: {} },
];

export const DashboardPage: React.FC = () => {
  const [layout, setLayout] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('datalens_dashboard_layout');
    return saved ? JSON.parse(saved) : defaultLayout;
  });
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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
      pdf.save('Business_Overview.pdf');
    } catch (error) {
      console.error('Error downloading dashboard:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor your key metrics and performance indicators.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>All Time</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors disabled:opacity-50"
            title="Download Business Overview"
          >
            <Download size={18} className={isDownloading ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>

      <div className="mt-6" ref={dashboardRef}>
        <DashboardGrid
          isEditing={true}
          layout={layout}
          onLayoutChange={(newLayout) => {
            setLayout(prev => {
              const updatedLayout = prev.map(item => {
                const updated = newLayout.find(nl => nl.i === item.i);
                return updated ? { ...item, ...updated } : item;
              });
              localStorage.setItem('datalens_dashboard_layout', JSON.stringify(updatedLayout));
              return updatedLayout;
            });
          }}
        />
      </div>
    </div>
  );
};
