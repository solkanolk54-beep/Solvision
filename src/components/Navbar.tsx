import React from 'react';
import { Satellite, ShieldAlert, Sparkles, Smartphone, Building2, Terminal, Plus, MapPin, CloudSun } from 'lucide-react';

export type NavTab = 'gis-map' | 'weather-72h' | 'discrepancy' | 'prescriptive' | 'field-app' | 'institutions' | 'architecture';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAuditModal: () => void;
  criticalAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuditModal,
  criticalAlertCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'gis-map', label: 'الخريطة الطيفية GIS', icon: <MapPin className="w-4 h-4" /> },
    { id: 'weather-72h', label: 'طقس الـ 72h والمخاطر', icon: <CloudSun className="w-4 h-4 text-cyan-400" /> },
    { id: 'discrepancy', label: 'كشف التضارب والتزوير', icon: <ShieldAlert className="w-4 h-4" />, badge: criticalAlertCount },
    { id: 'prescriptive', label: 'الذكاء التوجيهي والتنبؤ', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'field-app', label: 'محاكي تطبيق الميدان', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'institutions', label: 'الربط المؤسساتي (BADR/OAIC)', icon: <Building2 className="w-4 h-4" /> },
    { id: 'architecture', label: 'المعمارية السحابية', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Satellite className="w-5 h-5" />
          </div>
          <button 
            onClick={() => setActiveTab('gis-map')}
            className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <span>منظومة SolVision</span>
            <span className="text-xs font-normal text-slate-400 font-mono hidden sm:inline">DZ-SAT</span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="ml-1 w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono flex items-center justify-center border border-rose-500/40">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions & Telemetry indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sentinel-2B: مدار حي (5d)</span>
          </div>

          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm shadow-emerald-500/20 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تدقيق حقل جديد</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="lg:hidden border-t border-slate-800/80 px-2 py-1.5 flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
              activeTab === item.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
