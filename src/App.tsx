import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { GisMap } from './components/GisMap/GisMap';
import { DiscrepancyLab } from './components/SpectralAnalyzer/DiscrepancyLab';
import { PrescriptiveOptimizer } from './components/PrescriptiveEngine/PrescriptiveOptimizer';
import { FieldAppSimulator } from './components/FieldApp/FieldAppSimulator';
import { InstitutionalHub } from './components/IntegrationHub/InstitutionalHub';
import { ArchitectureViewer } from './components/ArchitectureDocs/ArchitectureViewer';
import { DashboardWeather72h } from './components/WeatherWidget/DashboardWeather72h';
import { ParcelAuditModal } from './components/ParcelAuditModal';
import { INITIAL_PARCELS } from './data/parcelsData';
import { Parcel } from './types';

// High-fidelity generated imagery assets
import heroSatelliteImg from './assets/images/hero_satellite_agriculture_1791168764027.jpg';
import fieldTabletImg from './assets/images/field_inspector_tablet_1791168774848.jpg';
import satelliteSensorImg from './assets/images/sentinel_multispectral_sensor_1791168785963.jpg';
import harvestLogisticsImg from './assets/images/harvest_grain_logistics_1791168795282.jpg';

import { 
  Satellite, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Building2, 
  Terminal, 
  ArrowLeft,
  Coins,
  Cpu,
  Droplet,
  CloudSun
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('gis-map');
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [selectedAuditParcelId, setSelectedAuditParcelId] = useState<string>(INITIAL_PARCELS[1].id);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const criticalAlertCount = parcels.filter(
    p => p.discrepancySeverity === 'CRITICAL' || p.discrepancySeverity === 'HIGH'
  ).length;

  const handleSelectParcelForAudit = (parcel: Parcel) => {
    setSelectedAuditParcelId(parcel.id);
    setActiveTab('discrepancy');
  };

  const handleAddNewParcel = (newParcel: Parcel) => {
    setParcels([newParcel, ...parcels]);
    setSelectedAuditParcelId(newParcel.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'gis-map' && (
          <div>
            {/* Quick Hero Banner with Authenticated Imagery */}
            <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                  src={heroSatelliteImg}
                  alt="Copernicus Sentinel-2 Remote Sensing Over Algerian Agriculture"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent"></div>
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Algerian Autonomous Agri-Spatial Intelligence
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">58 Wilayas Coverage</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    الخريطة الطيفية الميدانية للجزائر (Sentinel-2 & Landsat-9)
                  </h1>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    مسح تلقائي كل 5 أيام لكشف المزارع الوهمية، تتبع حيوية الكلوروفيل (NDVI)، رصد الإجهاد المائي قبل الذبول (NDWI)، ومعادلة رمال الصحراء بمؤشر SAVI.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('weather-72h')}
                    className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
                  >
                    <CloudSun className="w-3.5 h-3.5" />
                    <span>طقس الـ 72h والمخاطر</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('discrepancy')}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>كشف التضارب ({criticalAlertCount} تنبيهات)</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('prescriptive')}
                    className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>الذكاء التوجيهي</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Full-Height GIS Map Viewport */}
            <GisMap
              parcels={parcels}
              onSelectParcelForAudit={handleSelectParcelForAudit}
            />
          </div>
        )}

        {activeTab === 'weather-72h' && (
          <DashboardWeather72h
            initialCoords={{
              lat: parcels.find(p => p.id === selectedAuditParcelId)?.centerLat || 36.19,
              lng: parcels.find(p => p.id === selectedAuditParcelId)?.centerLng || 5.41,
              locationName: parcels.find(p => p.id === selectedAuditParcelId) 
                ? `${parcels.find(p => p.id === selectedAuditParcelId)?.commune} (${parcels.find(p => p.id === selectedAuditParcelId)?.code})` 
                : 'العلمة / قجال',
              wilayaName: parcels.find(p => p.id === selectedAuditParcelId)?.wilayaNameAr || 'سطيف',
            }}
          />
        )}

        {activeTab === 'discrepancy' && (
          <div>
            {/* Visual Header Strip with Inspector Tablet Photo */}
            <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                <img
                  src={fieldTabletImg}
                  alt="Field Agronomist Cross-Validating Satellite NDVI in Sétif"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-3 text-xs text-slate-400 flex items-center justify-between">
                <span>وحدة التحقق الطيفي الفضائي &bull; خوارزميات Rasterio & PostGIS</span>
                <span className="font-mono text-emerald-400">Pearson Correlation r &ge; 0.90</span>
              </div>
            </div>

            <DiscrepancyLab
              parcels={parcels}
              selectedParcelId={selectedAuditParcelId}
            />
          </div>
        )}

        {activeTab === 'prescriptive' && (
          <div>
            {/* Visual Strip with Combine Harvester Photo */}
            <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                <img
                  src={harvestLogisticsImg}
                  alt="Durum Wheat Harvest Logistics for OAIC Silos"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-3 text-xs text-slate-400 flex items-center justify-between">
                <span>محرك التوجيه الاستثماري الزراعي &bull; تعظيم الأمن الغذائي وترشيد المياه الجوفية</span>
                <span className="font-mono text-cyan-400">OAIC Grain Quotas & Prices Guaranteed</span>
              </div>
            </div>

            <PrescriptiveOptimizer />
          </div>
        )}

        {activeTab === 'field-app' && (
          <FieldAppSimulator />
        )}

        {activeTab === 'institutions' && (
          <InstitutionalHub />
        )}

        {activeTab === 'architecture' && (
          <div>
            {/* Visual Strip with Sentinel Satellite Sensor Render */}
            <div className="relative bg-slate-900 border-b border-slate-800 overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                <img
                  src={satelliteSensorImg}
                  alt="Sentinel-2 Multispectral Payload Sensor"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-3 text-xs text-slate-400 flex items-center justify-between">
                <span>المعمارية السحابية الهندسية &bull; PostgreSQL 16 / PostGIS 3.4 / Golang Ingestion</span>
                <span className="font-mono text-emerald-400">Copernicus Hub & Landsat 9</span>
              </div>
            </div>

            <ArchitectureViewer />
          </div>
        )}
      </main>

      {/* Audit Modal */}
      <ParcelAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onAddParcel={handleAddNewParcel}
      />

      {/* Standard Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">منظومة SolVision الفلاحية</span>
            <span>&bull;</span>
            <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Copernicus Sentinel-2A/B</span>
            <span>&bull;</span>
            <span>Landsat-9 OLI/TIRS</span>
            <span>&bull;</span>
            <span>PostGIS 3.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
