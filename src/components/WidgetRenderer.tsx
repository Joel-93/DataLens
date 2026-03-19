import React from 'react';
import { WidgetConfig } from './DashboardGrid';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface WidgetRendererProps {
  widget: WidgetConfig;
}

// Mock data for widgets
const mockData = [
  { name: 'Jan', value: 4000, revenue: 2400 },
  { name: 'Feb', value: 3000, revenue: 1398 },
  { name: 'Mar', value: 2000, revenue: 9800 },
  { name: 'Apr', value: 2780, revenue: 3908 },
  { name: 'May', value: 1890, revenue: 4800 },
  { name: 'Jun', value: 2390, revenue: 3800 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const data = widget.settings?.data && widget.settings.data.length > 0 ? widget.settings.data : mockData;
  const xAxisKey = widget.settings?.xAxis || 'name';
  const yAxisKey = widget.settings?.yAxis || 'value';
  const showLegend = widget.settings?.showLegend !== false;

  const safeXAxisKey = xAxisKey.replace(/\./g, '_');
  const safeYAxisKey = yAxisKey.replace(/\./g, '_');

  // Recharts requires numeric values for the Y-axis. If the Excel/CSV data contains strings 
  // (like "$1,000" or "500"), we need to parse them into numbers for the charts to render correctly.
  const formattedData = React.useMemo(() => {
    if (!data || data.length === 0) return data;
    
    return data.map((item: any) => {
      const formattedItem: any = {};
      
      // Copy all properties, replacing dots in keys to prevent Recharts nested object parsing issues
      for (const key in item) {
        const safeKey = key.replace(/\./g, '_');
        formattedItem[safeKey] = item[key];
      }
      
      if (yAxisKey && item[yAxisKey] !== undefined) {
        let val = item[yAxisKey];
        if (typeof val === 'string') {
          // Remove currency symbols, commas, spaces, etc.
          const cleanString = val.replace(/[^0-9.-]+/g, "");
          const parsed = parseFloat(cleanString);
          if (!isNaN(parsed) && cleanString.length > 0) {
            formattedItem[safeYAxisKey] = parsed;
          } else {
            formattedItem[safeYAxisKey] = 0; // Fallback for invalid strings
          }
        } else if (typeof val !== 'number') {
          formattedItem[safeYAxisKey] = Number(val) || 0;
        }
      }
      
      return formattedItem;
    });
  }, [data, xAxisKey, yAxisKey]);

  const renderContent = () => {
    switch (widget.type) {
      case 'kpi':
        return (
          <div className="flex flex-col justify-center h-full px-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {widget.settings?.format === 'currency' ? '$' : ''}
                {widget.settings?.value || '12,345'}
                {widget.settings?.format === 'percentage' ? '%' : ''}
              </span>
            </div>
          </div>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={safeXAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              {showLegend && <Legend />}
              <Bar dataKey={safeYAxisKey} name={yAxisKey} fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={safeXAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              {showLegend && <Legend />}
              <Line type="monotone" dataKey={safeYAxisKey} name={yAxisKey} stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={safeXAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              {showLegend && <Legend />}
              <Area type="monotone" dataKey={safeYAxisKey} name={yAxisKey} stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey={safeYAxisKey}
                nameKey={safeXAxisKey}
                name={yAxisKey}
              >
                {formattedData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      case 'table': {
        const columns = widget.settings?.selectedColumns && widget.settings.selectedColumns.length > 0
          ? widget.settings.selectedColumns
          : (data.length > 0 ? Object.keys(data[0]) : ['name', 'value', 'revenue']);

        return (
          <div className="overflow-auto h-full">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                <tr>
                  {columns.map((col: string) => (
                    <th key={col} className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {data.map((row: any, i: number) => (
                  <tr key={i}>
                    {columns.map((col: string) => (
                      <td key={col} className="px-4 py-2 text-sm text-slate-900 dark:text-slate-300">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            Widget type not supported
          </div>
        );
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};
