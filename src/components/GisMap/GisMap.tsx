import React, { useState } from 'react';
import { Parcel } from '../../types';
import { ParcelDetailDrawer } from './ParcelDetailDrawer';
import { StrategicWilayaDrawer } from './StrategicWilayaDrawer';
import { WILAYAS_HEATMAP_DATA, WilayaHeatmapData } from '../../data/wilayasHeatmapData';
import { WeatherCoordinates } from '../WeatherWidget/AgroWeatherWidget';
import { MapWeatherSubDashboard } from './MapWeatherSubDashboard';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Droplet, 
  Flame, 
  Eye, 
  Search,
  Satellite,
  Compass,
  Info,
  MapPin,
  Wheat,
  Sliders,
  TrendingDown,
  Building2,
  CloudSun
} from 'lucide-react';

export type GisDisplayMode = 'PARCELS_SPECTRAL' | 'WATER_STRESS_HEATMAP' | 'CROP_DISTRIBUTION_HEATMAP';
export type SpectralLayer = 'TRUE_COLOR' | 'NIR_FALSE_COLOR' | 'NDVI' | 'NDWI' | 'SAVI' | 'LST_THERMAL';

interface GisMapProps {
  parcels: Parcel[];
  onSelectParcelForAudit: (parcel: Parcel) => void;
}

export const GisMap: React.FC<GisMapProps> = ({ parcels, onSelectParcelForAudit }) => {
  // Primary visualization mode
  const [displayMode, setDisplayMode] = useState<GisDisplayMode>('PARCELS_SPECTRAL');
  const [selectedLayer, setSelectedLayer] = useState<SpectralLayer>('NDVI');
  const [cropFilter, setCropFilter] = useState<string>('ALL');
  const [heatmapIntensity, setHeatmapIntensity] = useState<number>(0.75);

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<WilayaHeatmapData | null>(null);
  const [wilayaFilter, setWilayaFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredParcel, setHoveredParcel] = useState<Parcel | null>(null);
  const [hoveredWilaya, setHoveredWilaya] = useState<WilayaHeatmapData | null>(null);

  // Weather Widget State
  const [showWeatherWidget, setShowWeatherWidget] = useState<boolean>(true);
  const [weatherCoords, setWeatherCoords] = useState<WeatherCoordinates>({
    lat: 36.19,
    lng: 5.41,
    locationName: 'العلمة / قجال',
    wilayaName: 'سطيف',
  });

  // Filter parcels for parcel mode
  const filteredParcels = parcels.filter(p => {
    if (wilayaFilter !== 'ALL' && p.wilayaNameAr !== wilayaFilter) return false;
    if (statusFilter !== 'ALL' && p.verificationStatus !== statusFilter) return false;
    return true;
  });

  // Filter wilayas for heatmap mode
  const filteredWilayas = WILAYAS_HEATMAP_DATA.filter(w => {
    if (wilayaFilter !== 'ALL' && w.nameAr !== wilayaFilter) return false;
    if (cropFilter !== 'ALL' && w.cropCategory !== cropFilter) return false;
    return true;
  });

  // Summary metrics for parcels
  const totalHectares = filteredParcels.reduce((acc, p) => acc + p.calculatedAreaHa, 0);
  const compliantCount = filteredParcels.filter(p => p.verificationStatus === 'VERIFIED_COMPLIANT').length;
  const flaggedCount = filteredParcels.length - compliantCount;
  const totalSubsidiesSaved = filteredParcels.reduce((acc, p) => acc + p.subsidiesSavedDzd, 0);

  // Summary metrics for regional heatmap
  const totalStressedAreaHa = WILAYAS_HEATMAP_DATA.reduce((acc, w) => acc + w.stressedAreaHa, 0);
  const criticalWilayasCount = WILAYAS_HEATMAP_DATA.filter(w => w.waterStressSeverity === 'CRITICAL').length;
  const totalExpectedCerealTons = WILAYAS_HEATMAP_DATA
    .filter(w => w.cropCategory === 'WHEAT')
    .reduce((acc, w) => acc + w.totalProductionExpectedTons, 0);

  // Color mapping based on active spectral layer
  const getParcelFillColor = (parcel: Parcel) => {
    switch (selectedLayer) {
      case 'TRUE_COLOR':
        return parcel.verificationStatus === 'VERIFIED_COMPLIANT' ? 'rgba(34, 197, 94, 0.45)' : 'rgba(217, 119, 6, 0.35)';
      case 'NIR_FALSE_COLOR':
        return parcel.spectral.ndviCurrent > 0.7 
          ? 'rgba(239, 68, 68, 0.75)' 
          : parcel.spectral.ndviCurrent > 0.4 
          ? 'rgba(244, 114, 182, 0.6)' 
          : 'rgba(156, 163, 175, 0.3)';
      case 'NDVI':
        if (parcel.spectral.ndviCurrent >= 0.75) return 'rgba(16, 185, 129, 0.85)';
        if (parcel.spectral.ndviCurrent >= 0.50) return 'rgba(52, 211, 153, 0.7)';
        if (parcel.spectral.ndviCurrent >= 0.30) return 'rgba(250, 204, 21, 0.65)';
        return 'rgba(239, 68, 68, 0.75)';
      case 'NDWI':
        if (parcel.spectral.ndwiCurrent < -0.1) return 'rgba(239, 68, 68, 0.85)';
        if (parcel.spectral.ndwiCurrent < 0.1) return 'rgba(245, 158, 11, 0.7)';
        return 'rgba(6, 182, 212, 0.85)';
      case 'SAVI':
        return parcel.spectral.saviCurrent >= 0.65 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(217, 119, 6, 0.7)';
      case 'LST_THERMAL':
        return parcel.spectral.lstSurfaceTempC > 35 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.7)';
    }
  };

  const getParcelStrokeColor = (parcel: Parcel) => {
    if (parcel.verificationStatus === 'FALLOW_DECLARED_ACTIVE' || parcel.verificationStatus === 'SURFACE_OVERESTIMATION') {
      return '#ef4444';
    }
    if (parcel.verificationStatus === 'SEVERE_WATER_STRESS') {
      return '#f97316';
    }
    if (parcel.verificationStatus === 'CROP_MISMATCH') {
      return '#eab308';
    }
    return '#10b981';
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* Top Main Mode & Filter Ribbon */}
      <div className="relative z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-2 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Primary View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto max-w-full no-scrollbar shrink-0">
          <button
            onClick={() => { setDisplayMode('PARCELS_SPECTRAL'); setSelectedWilaya(null); }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs ${
              displayMode === 'PARCELS_SPECTRAL'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 shrink-0" />
            <span>الحقول والأطياف <span className="hidden sm:inline">(Sentinel-2)</span></span>
          </button>

          <button
            onClick={() => { setDisplayMode('WATER_STRESS_HEATMAP'); setSelectedParcel(null); }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs ${
              displayMode === 'WATER_STRESS_HEATMAP'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>خريطة الإجهاد المائي <span className="hidden sm:inline">(Water Stress)</span></span>
          </button>

          <button
            onClick={() => { setDisplayMode('CROP_DISTRIBUTION_HEATMAP'); setSelectedParcel(null); }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs ${
              displayMode === 'CROP_DISTRIBUTION_HEATMAP'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>توزيع المحاصيل <span className="hidden sm:inline">الاستراتيجية</span></span>
          </button>
        </div>

        {/* Dynamic Context Controls per Mode */}
        {displayMode === 'PARCELS_SPECTRAL' && (
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-x-auto max-w-full no-scrollbar shrink-0">
            <span className="text-[11px] font-medium text-slate-400 px-1.5 flex items-center gap-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden xs:inline">الطبقة:</span>
            </span>

            <button
              onClick={() => setSelectedLayer('NDVI')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedLayer === 'NDVI' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              مؤشر الكلوروفيل (NDVI)
            </button>

            <button
              onClick={() => setSelectedLayer('NDWI')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedLayer === 'NDWI' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              المحتوى المائي (NDWI)
            </button>

            <button
              onClick={() => setSelectedLayer('NIR_FALSE_COLOR')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedLayer === 'NIR_FALSE_COLOR' ? 'bg-rose-500 text-white font-bold shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              تحت الأحمر (NIR)
            </button>

            <button
              onClick={() => setSelectedLayer('SAVI')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedLayer === 'SAVI' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              معدل التربة (SAVI)
            </button>

            <button
              onClick={() => setSelectedLayer('LST_THERMAL')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedLayer === 'LST_THERMAL' ? 'bg-orange-500 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              الحرارة السطحية (LST)
            </button>
          </div>
        )}

        {displayMode === 'CROP_DISTRIBUTION_HEATMAP' && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-x-auto max-w-full no-scrollbar shrink-0">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1 shrink-0">
              <Wheat className="w-3.5 h-3.5 text-amber-400" />
              <span>تصفية المحصول:</span>
            </span>

            {[
              { id: 'ALL', label: 'جميع المحاصيل' },
              { id: 'WHEAT', label: 'القمح الصلب (الحبوب)' },
              { id: 'POTATO', label: 'البطاطس (الخضار)' },
              { id: 'DATE_PALM', label: 'نخيل دقلة نور' },
              { id: 'CITRUS', label: 'حمضيات المتيجة' },
              { id: 'CANOLA', label: 'الكولزا (الزيوت)' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCropFilter(c.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                  cropFilter === c.id ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Heatmap Intensity Slider for Planning Accuracy */}
        {displayMode !== 'PARCELS_SPECTRAL' && (
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-950 rounded border border-slate-800 text-[11px] shrink-0">
            <span className="text-slate-400 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span>كثافة الخريطة الحرارية:</span>
            </span>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={heatmapIntensity}
              onChange={(e) => setHeatmapIntensity(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-white text-[10px]">{Math.round(heatmapIntensity * 100)}%</span>
          </div>
        )}

        {/* Wilaya Filter & Weather Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[10px] sm:text-[11px] hidden xs:inline">الولاية:</span>
            <select
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 max-w-[125px] sm:max-w-none"
            >
              <option value="ALL">جميع الأقطاب الزراعية</option>
              <option value="سطيف">سطيف (الهضاب)</option>
              <option value="الوادي">الوادي (الصحراء)</option>
              <option value="بسكرة">بسكرة (الزيبان)</option>
              <option value="تيارت">تيارت (الغرب)</option>
              <option value="البليدة">البليدة (المتيجة)</option>
              <option value="المنيعة">المنيعة (الجنوب)</option>
              <option value="قالمة">قالمة (الشرق)</option>
              <option value="معسكر">معسكر (حوض هبرة)</option>
              <option value="عين الدفلى">عين الدفلى (الشلف)</option>
            </select>
          </div>

          <button
            onClick={() => setShowWeatherWidget(!showWeatherWidget)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              showWeatherWidget
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm ring-1 ring-cyan-500/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
            title="عرض / إخفاء لوحة الطقس الفلاحي وتوقعات الـ 72 ساعة وتنبيهات الصقيع والشهيلي"
          >
            <CloudSun className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xs:inline">طقس 72h والمخاطر</span>
            <span className="xs:hidden">72h</span>
          </button>
        </div>
      </div>

      {/* Strategic Government KPI Ribbon (When Heatmap active) */}
      {displayMode !== 'PARCELS_SPECTRAL' && (
        <div className="relative z-25 bg-slate-950/90 border-b border-slate-800/80 px-2 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">نطاق التخطيط الحكومي:</span>
            <span className="font-bold text-white">الجمهورية الجزائرية (58 ولاية)</span>
          </div>

          {displayMode === 'WATER_STRESS_HEATMAP' ? (
            <>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">إجمالي المساحة تحت إجهاد مائي حرج:</span>
                <span className="font-bold text-rose-400">{totalStressedAreaHa.toLocaleString()} هكتار</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">ولايات تحت عجز هيدرولوجي قصوي:</span>
                <span className="font-bold text-rose-400">{criticalWilayasCount} ولايات (الوادي، بسكرة)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <span>توصية استباقية: تفعيل ضوابط السقي الليلي لحماية طبقة الألبيان</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">إنتاج الحبوب الاستراتيجي المتوقع:</span>
                <span className="font-bold text-emerald-400">{(totalExpectedCerealTons / 1000).toFixed(1)} ألف طن</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-500">قطب إنتاج البطاطس الأول:</span>
                <span className="font-bold text-amber-400">الوادي (41.5% من السلة الوطنية)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span>جاهزية صوامع OAIC ومخازن ONILEV</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Canvas Viewport Area */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-crosshair">
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Satellite Grid pattern */}
            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
            </pattern>

            {/* Radar Background Glow */}
            <radialGradient id="algeriaAura" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.08)" />
              <stop offset="60%" stopColor="rgba(15, 23, 42, 0.4)" />
              <stop offset="100%" stopColor="rgba(2, 6, 23, 0.95)" />
            </radialGradient>

            {/* Heatmap Multi-Stop Gradients */}
            {/* Water Stress Gradients */}
            <radialGradient id="stressGradCritical">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.95)" />
              <stop offset="45%" stopColor="rgba(249, 115, 22, 0.65)" />
              <stop offset="75%" stopColor="rgba(234, 179, 8, 0.3)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>

            <radialGradient id="stressGradHigh">
              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.85)" />
              <stop offset="50%" stopColor="rgba(234, 179, 8, 0.5)" />
              <stop offset="85%" stopColor="rgba(249, 115, 22, 0.15)" />
              <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
            </radialGradient>

            <radialGradient id="stressGradModerate">
              <stop offset="0%" stopColor="rgba(234, 179, 8, 0.8)" />
              <stop offset="60%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
            </radialGradient>

            <radialGradient id="stressGradLow">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.85)" />
              <stop offset="65%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </radialGradient>

            {/* Strategic Crop Gradients */}
            <radialGradient id="cropGradWheat">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.9)" />
              <stop offset="50%" stopColor="rgba(52, 211, 153, 0.55)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </radialGradient>

            <radialGradient id="cropGradPotato">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.9)" />
              <stop offset="55%" stopColor="rgba(251, 191, 36, 0.55)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
            </radialGradient>

            <radialGradient id="cropGradDatePalm">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.85)" />
              <stop offset="55%" stopColor="rgba(251, 113, 133, 0.5)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
            </radialGradient>

            <radialGradient id="cropGradCitrus">
              <stop offset="0%" stopColor="rgba(132, 204, 22, 0.85)" />
              <stop offset="60%" stopColor="rgba(163, 230, 53, 0.45)" />
              <stop offset="100%" stopColor="rgba(132, 204, 22, 0)" />
            </radialGradient>

            <radialGradient id="cropGradCanola">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.85)" />
              <stop offset="60%" stopColor="rgba(167, 139, 250, 0.45)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
          </defs>

          {/* Grid background */}
          <rect width="1000" height="650" fill="url(#gisGrid)" />

          {/* Mediterranean Sea outline (North) */}
          <path
            d="M 100 80 Q 250 110, 400 95 T 700 85 T 900 70 L 900 0 L 100 0 Z"
            fill="rgba(14, 116, 144, 0.2)"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth="1.2"
          />
          <text x="500" y="45" fill="rgba(6, 182, 212, 0.6)" fontSize="11" fontFamily="sans-serif" textAnchor="middle" letterSpacing="2">
            البحر الأبيض المتوسط (MEDITERRANEAN SEA)
          </text>

          {/* Algerian National Boundary Silhouette */}
          <path
            d="M 180 120 
               C 220 110, 320 125, 450 110 
               C 550 105, 680 95, 760 110 
               C 740 180, 780 260, 750 340 
               C 730 400, 680 500, 620 590 
               C 520 620, 420 610, 350 560 
               C 280 510, 200 450, 160 360 
               C 130 280, 140 180, 180 120 Z"
            fill="url(#algeriaAura)"
            stroke="rgba(71, 85, 105, 0.6)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Topographic Natural Belts */}
          <path
            d="M 220 130 Q 350 145, 520 135 T 720 130"
            fill="none"
            stroke="rgba(34, 197, 94, 0.2)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 200 210 Q 380 200, 560 215 T 730 200"
            fill="none"
            stroke="rgba(245, 158, 11, 0.18)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 440 370 Q 560 380, 660 390"
            fill="none"
            stroke="rgba(249, 115, 22, 0.15)"
            strokeWidth="28"
            strokeLinecap="round"
          />

          {/* ========================================================= */}
          {/* MODE 1: PARCELS SPECTRAL VIEW (Individual farm polygons) */}
          {/* ========================================================= */}
          {displayMode === 'PARCELS_SPECTRAL' && (
            <g>
              {filteredParcels.map((parcel) => {
                const isHovered = hoveredParcel?.id === parcel.id;
                const isSelected = selectedParcel?.id === parcel.id;
                const fillColor = getParcelFillColor(parcel);
                const strokeColor = getParcelStrokeColor(parcel);

                return (
                  <g
                    key={parcel.id}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setSelectedParcel(parcel);
                      setSelectedWilaya(null);
                      setWeatherCoords({
                        lat: parcel.centerLat,
                        lng: parcel.centerLng,
                        locationName: `${parcel.commune} (${parcel.code})`,
                        wilayaName: parcel.wilayaNameAr,
                      });
                    }}
                    onMouseEnter={() => setHoveredParcel(parcel)}
                    onMouseLeave={() => setHoveredParcel(null)}
                  >
                    {parcel.discrepancySeverity === 'CRITICAL' && (
                      <circle
                        cx={parcel.polygonSvgPath.includes('M') ? parseInt(parcel.polygonSvgPath.split(' ')[1]) + 25 : 450}
                        cy={parcel.polygonSvgPath.includes('M') ? parseInt(parcel.polygonSvgPath.split(' ')[2]) + 25 : 300}
                        r="32"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        opacity="0.8"
                        className="animate-ping"
                      />
                    )}

                    <path
                      d={parcel.polygonSvgPath}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered || isSelected ? 3 : 1.8}
                      filter={isHovered ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' : undefined}
                    />

                    <g transform={`translate(${
                      parcel.polygonSvgPath.includes('M') ? parseInt(parcel.polygonSvgPath.split(' ')[1]) + 20 : 450
                    }, ${
                      parcel.polygonSvgPath.includes('M') ? parseInt(parcel.polygonSvgPath.split(' ')[2]) + 15 : 300
                    })`}>
                      <rect
                        x="-40"
                        y="-18"
                        width="80"
                        height="16"
                        rx="3"
                        fill="rgba(2, 6, 23, 0.85)"
                        stroke={strokeColor}
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="-6"
                        fill="#f8fafc"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {parcel.code}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ========================================================= */}
          {/* MODE 2: WATER STRESS HEATMAP (Regional Wilaya Heatmap)     */}
          {/* ========================================================= */}
          {displayMode === 'WATER_STRESS_HEATMAP' && (
            <g style={{ opacity: heatmapIntensity }}>
              {filteredWilayas.map((wilaya) => {
                const isHovered = hoveredWilaya?.code === wilaya.code;
                const isSelected = selectedWilaya?.code === wilaya.code;

                // Density radius proportional to water stress score & stressed area
                const radius = Math.min(Math.max((wilaya.waterStressScore / 100) * 110 + (wilaya.stressedAreaHa / 500), 45), 140);
                
                const gradId = wilaya.waterStressSeverity === 'CRITICAL' ? 'url(#stressGradCritical)' :
                               wilaya.waterStressSeverity === 'HIGH' ? 'url(#stressGradHigh)' :
                               wilaya.waterStressSeverity === 'MODERATE' ? 'url(#stressGradModerate)' :
                               'url(#stressGradLow)';

                return (
                  <g
                    key={`ws-${wilaya.code}`}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setSelectedWilaya(wilaya);
                      setSelectedParcel(null);
                      setWeatherCoords({
                        lat: wilaya.region === 'SAHARA' ? (wilaya.code === 39 ? 33.36 : wilaya.code === 7 ? 34.85 : 30.58) : (wilaya.code === 19 ? 36.19 : wilaya.code === 14 ? 35.37 : 36.47),
                        lng: wilaya.region === 'SAHARA' ? (wilaya.code === 39 ? 6.86 : wilaya.code === 7 ? 5.73 : 2.89) : (wilaya.code === 19 ? 5.41 : wilaya.code === 14 ? 1.32 : 2.83),
                        locationName: `ولاية ${wilaya.nameAr}`,
                        wilayaName: wilaya.nameAr,
                      });
                    }}
                    onMouseEnter={() => setHoveredWilaya(wilaya)}
                    onMouseLeave={() => setHoveredWilaya(null)}
                  >
                    {/* Concentric Heat Glow Circles */}
                    <circle
                      cx={wilaya.svgX}
                      cy={wilaya.svgY}
                      r={radius}
                      fill={gradId}
                    />

                    {/* Concentric stress isoline rings */}
                    <circle
                      cx={wilaya.svgX}
                      cy={wilaya.svgY}
                      r={radius * 0.6}
                      fill="none"
                      stroke={wilaya.waterStressSeverity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(249, 115, 22, 0.35)'}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />

                    {/* Critical pulsation */}
                    {wilaya.waterStressSeverity === 'CRITICAL' && (
                      <circle
                        cx={wilaya.svgX}
                        cy={wilaya.svgY}
                        r={radius * 0.4}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        opacity="0.8"
                        className="animate-ping"
                      />
                    )}

                    {/* Central Wilaya Pin Badge */}
                    <g transform={`translate(${wilaya.svgX}, ${wilaya.svgY})`}>
                      <rect
                        x="-48"
                        y="-14"
                        width="96"
                        height="26"
                        rx="5"
                        fill="rgba(2, 6, 23, 0.92)"
                        stroke={wilaya.waterStressSeverity === 'CRITICAL' ? '#ef4444' : wilaya.waterStressSeverity === 'HIGH' ? '#f97316' : '#06b6d4'}
                        strokeWidth={isHovered || isSelected ? 2.2 : 1.2}
                      />
                      <text
                        x="0"
                        y="-1"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        {wilaya.nameAr}
                      </text>
                      <text
                        x="0"
                        y="9"
                        fill={wilaya.waterStressSeverity === 'CRITICAL' ? '#f87171' : '#fb923c'}
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        إجهاد {wilaya.waterStressScore}%
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ========================================================= */}
          {/* MODE 3: STRATEGIC CROP DISTRIBUTION HEATMAP                */}
          {/* ========================================================= */}
          {displayMode === 'CROP_DISTRIBUTION_HEATMAP' && (
            <g style={{ opacity: heatmapIntensity }}>
              {filteredWilayas.map((wilaya) => {
                const isHovered = hoveredWilaya?.code === wilaya.code;
                const isSelected = selectedWilaya?.code === wilaya.code;

                // Density radius proportional to total strategic production volume
                const radius = Math.min(Math.max((wilaya.nationalContributionPct / 60) * 120 + 40, 50), 135);

                const gradId = 
                  wilaya.cropCategory === 'WHEAT' ? 'url(#cropGradWheat)' :
                  wilaya.cropCategory === 'POTATO' ? 'url(#cropGradPotato)' :
                  wilaya.cropCategory === 'DATE_PALM' ? 'url(#cropGradDatePalm)' :
                  wilaya.cropCategory === 'CITRUS' ? 'url(#cropGradCitrus)' :
                  'url(#cropGradCanola)';

                const strokeColor =
                  wilaya.cropCategory === 'WHEAT' ? '#10b981' :
                  wilaya.cropCategory === 'POTATO' ? '#f59e0b' :
                  wilaya.cropCategory === 'DATE_PALM' ? '#f43f5e' :
                  wilaya.cropCategory === 'CITRUS' ? '#84cc16' :
                  '#8b5cf6';

                return (
                  <g
                    key={`crop-${wilaya.code}`}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setSelectedWilaya(wilaya);
                      setSelectedParcel(null);
                      setWeatherCoords({
                        lat: wilaya.region === 'SAHARA' ? (wilaya.code === 39 ? 33.36 : wilaya.code === 7 ? 34.85 : 30.58) : (wilaya.code === 19 ? 36.19 : wilaya.code === 14 ? 35.37 : 36.47),
                        lng: wilaya.region === 'SAHARA' ? (wilaya.code === 39 ? 6.86 : wilaya.code === 7 ? 5.73 : 2.89) : (wilaya.code === 19 ? 5.41 : wilaya.code === 14 ? 1.32 : 2.83),
                        locationName: `ولاية ${wilaya.nameAr}`,
                        wilayaName: wilaya.nameAr,
                      });
                    }}
                    onMouseEnter={() => setHoveredWilaya(wilaya)}
                    onMouseLeave={() => setHoveredWilaya(null)}
                  >
                    {/* Concentric Agricultural Volume Glow */}
                    <circle
                      cx={wilaya.svgX}
                      cy={wilaya.svgY}
                      r={radius}
                      fill={gradId}
                    />

                    {/* Concentric yield contour */}
                    <circle
                      cx={wilaya.svgX}
                      cy={wilaya.svgY}
                      r={radius * 0.55}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                      opacity="0.6"
                    />

                    {/* Central Wilaya Crop Badge */}
                    <g transform={`translate(${wilaya.svgX}, ${wilaya.svgY})`}>
                      <rect
                        x="-52"
                        y="-15"
                        width="104"
                        height="28"
                        rx="5"
                        fill="rgba(2, 6, 23, 0.92)"
                        stroke={strokeColor}
                        strokeWidth={isHovered || isSelected ? 2.2 : 1.2}
                      />
                      <text
                        x="0"
                        y="-2"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        {wilaya.nameAr}: {wilaya.cropNameAr.split(' ')[0]}
                      </text>
                      <text
                        x="0"
                        y="9"
                        fill={strokeColor}
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {wilaya.nationalContributionPct}% من الإنتاج الوطني
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Coordinate Marks */}
          <text x="960" y="635" fill="rgba(148, 163, 184, 0.4)" fontSize="9" fontFamily="monospace" textAnchor="end">
            WGS84 EPSG:4326 | SOLVISION STRATEGIC SPATIAL ENGINE
          </text>
        </svg>

        {/* Hover Tooltip for Wilaya Heatmaps */}
        {hoveredWilaya && !selectedWilaya && displayMode !== 'PARCELS_SPECTRAL' && (
          <div className="absolute top-4 left-4 z-20 w-80 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-xs shadow-2xl pointer-events-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white">ولاية {hoveredWilaya.nameAr} ({hoveredWilaya.nameFr})</span>
              <span className="text-[10px] font-mono text-emerald-400">قطب W.{hoveredWilaya.code}</span>
            </div>

            {displayMode === 'WATER_STRESS_HEATMAP' ? (
              <div className="mt-2 space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">مؤشر الإجهاد المائي:</span>
                  <span className={`font-mono font-bold ${hoveredWilaya.waterStressSeverity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {hoveredWilaya.waterStressScore}/100 ({hoveredWilaya.waterStressSeverity === 'CRITICAL' ? 'حرج' : 'مرتفع'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">معدل التبخر النتحي:</span>
                  <span className="font-mono text-white">{hoveredWilaya.evapotranspirationMmDay} mm/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المساحة المهددة:</span>
                  <span className="font-mono text-rose-400 font-bold">{hoveredWilaya.stressedAreaHa.toLocaleString()} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">استنزاف المياه العميقة:</span>
                  <span className="font-mono text-amber-400">{hoveredWilaya.groundwaterDepletionPct}%</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 italic">
                  اضغط لفتح مذكرة التدخل الاستراتيجي الحكومي &larr;
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">المحصول الاستراتيجي:</span>
                  <span className="font-bold text-emerald-400">{hoveredWilaya.cropNameAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المساحة المزروعة:</span>
                  <span className="font-mono text-white">{hoveredWilaya.totalCropAreaHa.toLocaleString()} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الإنتاج المتوقع:</span>
                  <span className="font-mono text-amber-400 font-bold">{hoveredWilaya.totalProductionExpectedTons.toLocaleString()} طن</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المساهمة في الأمن القومي:</span>
                  <span className="font-mono text-cyan-400 font-bold">{hoveredWilaya.nationalContributionPct}% من سلة الغذاء</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 italic">
                  اضغط لفتح تقرير صوامع OAIC وسلاسل الإمداد &larr;
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hover Tooltip for Parcel mode */}
        {hoveredParcel && !selectedParcel && displayMode === 'PARCELS_SPECTRAL' && (
          <div className="absolute top-4 left-4 z-20 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-xs shadow-2xl pointer-events-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white font-mono">{hoveredParcel.code}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                hoveredParcel.verificationStatus === 'VERIFIED_COMPLIANT' 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : 'bg-rose-500/20 text-rose-300'
              }`}>
                {hoveredParcel.verificationStatus === 'VERIFIED_COMPLIANT' ? 'مطابق' : 'تضارب'}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">المستغل:</span>
                <span className="font-medium text-slate-200">{hoveredParcel.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الولاية:</span>
                <span>{hoveredParcel.wilayaNameAr} ({hoveredParcel.commune})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المحصول:</span>
                <span className="text-emerald-400 font-medium">{hoveredParcel.cropNameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المساحة:</span>
                <span className="font-mono">
                  مصرح: {hoveredParcel.declaredAreaHa}ha | مضلع: {hoveredParcel.calculatedAreaHa}ha
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-500">مؤشر NDVI:</span>
                <span className="font-mono font-bold text-emerald-400">{hoveredParcel.spectral.ndviCurrent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المحتوى المائي NDWI:</span>
                <span className="font-mono font-bold text-cyan-400">{hoveredParcel.spectral.ndwiCurrent.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* GIS Map Controls HUD (Bottom Left) */}
        <div className={`absolute ${showWeatherWidget ? 'bottom-16 sm:bottom-14' : 'bottom-4 sm:bottom-5'} left-3 sm:left-5 z-20 flex flex-col gap-2 transition-all duration-300`}>
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 flex flex-col gap-1 shadow-lg">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
              className="p-1.5 sm:p-2 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="تكبير الخريطة"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.8))}
              className="p-1.5 sm:p-2 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="تصغير الخريطة"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setWilayaFilter('ALL'); setStatusFilter('ALL'); setCropFilter('ALL'); }}
              className="p-1.5 sm:p-2 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="إعادة ضبط المنظور"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Scale & Planning Legend (Bottom Right) */}
        <div className={`absolute ${showWeatherWidget ? 'bottom-16 sm:bottom-14' : 'bottom-4 sm:bottom-5'} right-3 sm:right-5 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 sm:p-3 text-[11px] sm:text-xs shadow-lg max-w-[220px] sm:max-w-xs transition-all duration-300 hidden sm:block`}>
          {displayMode === 'WATER_STRESS_HEATMAP' ? (
            <div className="space-y-1.5">
              <div className="font-semibold text-white mb-1 flex items-center justify-between">
                <span>كثافة الإجهاد المائي الإقليمي (Heatmap)</span>
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-300">&gt; 75%: إجهاد حرج (الوادي، بسكرة - خطر استنزاف الآبار)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-slate-300">50% - 75%: إجهاد مرتفع (تيارت، معسكر)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0"></span>
                  <span className="text-slate-300">35% - 50%: إجهاد متوسط (سطيف، عين الدفلى)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0"></span>
                  <span className="text-slate-300">&lt; 35%: توازن هيدرولوجي مستقر (البليدة، قالمة)</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                يساعد المخططين في توجيه مخصصات السدود ومواعيد السقي الليلي.
              </div>
            </div>
          ) : displayMode === 'CROP_DISTRIBUTION_HEATMAP' ? (
            <div className="space-y-1.5">
              <div className="font-semibold text-white mb-1 flex items-center justify-between">
                <span>توزيع المحاصيل الاستراتيجية الكبرى</span>
                <Wheat className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-300">القمح الصلب الاستراتيجي (سطيف، تيارت، المنيعة)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-slate-300">البطاطس والخضار التموينية (الوادي، معسكر)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-300">نخيل التمر التصديري (بسكرة، طولقة)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-lime-500 shrink-0"></span>
                  <span className="text-slate-300">حمضيات المتيجة (البليدة)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
                  <span className="text-slate-300">الكولزا والزيوت النباتية (قالمة)</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                الحجم الدائري يمثل نسبة المساهمة الوطنية بالطن.
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="font-semibold text-slate-200 mb-1 flex items-center justify-between">
                <span>مقياس التدريج الطيفي: {selectedLayer}</span>
                <Compass className="w-3.5 h-3.5 text-slate-500" />
              </div>

              {selectedLayer === 'NDVI' && (
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    <span className="text-slate-300">0.70 - 0.85: نشاط كلوروفيل كثيف</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-300"></span>
                    <span className="text-slate-300">0.45 - 0.70: نمو خضري متوسط</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-yellow-400"></span>
                    <span className="text-slate-300">0.25 - 0.45: نمو ضعيف / بداية البزوغ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-rose-500"></span>
                    <span className="text-slate-300">&lt; 0.22: تربة جرداء / أرض بور مهملة</span>
                  </div>
                </div>
              )}

              {selectedLayer === 'NDWI' && (
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-cyan-500"></span>
                    <span className="text-slate-300">&gt; 0.15: محتوى مائي وفير في الأوراق</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-500"></span>
                    <span className="text-slate-300">-0.10 إلى 0.15: رطوبة حرجة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-rose-500"></span>
                    <span className="text-slate-300">&lt; -0.15: إجهاد مائي حاد (إنذار جفاف)</span>
                  </div>
                </div>
              )}

              {selectedLayer === 'NIR_FALSE_COLOR' && (
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-rose-600"></span>
                    <span className="text-slate-300">أحمر قرمزي: امتصاص وانعكاس ضوئي (NIR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-400"></span>
                    <span className="text-slate-300">رمادي / ترابي: مبانٍ وطرق وأراضٍ صلبة</span>
                  </div>
                </div>
              )}

              {selectedLayer === 'SAVI' && (
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  معايرة معامل $L = 0.5$ لمعادلة انعكاس رمال الصحراء وطين الهضاب العليا.
                </div>
              )}

              {selectedLayer === 'LST_THERMAL' && (
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  حرارة سطح الأرض بمستشعر TIRS-2 لقمر Landsat-9 بدقة 100م لرصد التبخر النتحي.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-Dashboard for 72-Hour Weather & Frost/Sirocco Hazards inside the Map View */}
      <MapWeatherSubDashboard
        currentCoords={weatherCoords}
        onCoordinatesChange={(coords) => setWeatherCoords(coords)}
        isOpen={showWeatherWidget}
        onClose={() => setShowWeatherWidget(false)}
      />

      {/* Parcel Detail Drawer */}
      <ParcelDetailDrawer
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
        onOpenAudit={(p) => onSelectParcelForAudit(p)}
        onOpenWeather={(p) => {
          setWeatherCoords({
            lat: p.centerLat,
            lng: p.centerLng,
            locationName: `${p.commune} (${p.code})`,
            wilayaName: p.wilayaNameAr,
          });
          setShowWeatherWidget(true);
        }}
      />

      {/* Strategic Government Wilaya Heatmap Drawer */}
      <StrategicWilayaDrawer
        wilaya={selectedWilaya}
        mode={displayMode === 'CROP_DISTRIBUTION_HEATMAP' ? 'CROP_DISTRIBUTION' : 'WATER_STRESS'}
        onClose={() => setSelectedWilaya(null)}
        onOpenWeather={(w) => {
          setWeatherCoords({
            lat: w.region === 'SAHARA' ? (w.code === 39 ? 33.36 : w.code === 7 ? 34.85 : 30.58) : (w.code === 19 ? 36.19 : w.code === 14 ? 35.37 : 36.47),
            lng: w.region === 'SAHARA' ? (w.code === 39 ? 6.86 : w.code === 7 ? 5.73 : 2.89) : (w.code === 19 ? 5.41 : w.code === 14 ? 1.32 : 2.83),
            locationName: `ولاية ${w.nameAr}`,
            wilayaName: w.nameAr,
          });
          setShowWeatherWidget(true);
        }}
      />
    </div>
  );
};
