import React from 'react';
import { Parcel } from '../../types';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Droplet, 
  Thermometer, 
  Layers, 
  TrendingUp, 
  Building, 
  FileText,
  Phone,
  Calendar,
  Satellite,
  CloudSun
} from 'lucide-react';

interface ParcelDetailDrawerProps {
  parcel: Parcel | null;
  onClose: () => void;
  onOpenAudit: (parcel: Parcel) => void;
  onOpenWeather?: (parcel: Parcel) => void;
}

export const ParcelDetailDrawer: React.FC<ParcelDetailDrawerProps> = ({
  parcel,
  onClose,
  onOpenAudit,
  onOpenWeather,
}) => {
  if (!parcel) return null;

  const isCompliant = parcel.verificationStatus === 'VERIFIED_COMPLIANT';
  const isSevere = parcel.discrepancySeverity === 'CRITICAL' || parcel.discrepancySeverity === 'HIGH';

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-slate-900/98 backdrop-blur-xl border-r border-slate-800 shadow-2xl flex flex-col text-slate-200 transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
            isCompliant ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            isSevere ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isCompliant ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">{parcel.code}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{parcel.wilayaNameAr} - {parcel.commune}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Verification Status Banner */}
        <div className={`p-3 rounded-lg border ${
          isCompliant
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            : isSevere
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-xs">
              {isCompliant ? 'مطابق بالكامل للأقمار الصناعية' : 'تنبيه تدقيق آلي'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
              دقة المطابقة: {Math.round(parcel.spectralCorrelation * 100)}%
            </span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">{parcel.verificationFlagText}</p>
        </div>

        {/* Surface Area Audit Table */}
        <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
            <span className="font-medium text-slate-300">مقارنة المساحة (الهندسة الفضائية)</span>
            <span className="text-[10px] font-mono text-emerald-400">PostGIS Geodesic ST_Area</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div>
              <span className="block text-[10px] text-slate-500">المساحة المصرحة</span>
              <span className="text-sm font-semibold font-mono text-white">{parcel.declaredAreaHa.toFixed(1)} ha</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">المضلع الفعلي</span>
              <span className="text-sm font-semibold font-mono text-emerald-400">{parcel.calculatedAreaHa.toFixed(1)} ha</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">نسبة التفاوت</span>
              <span className={`text-sm font-semibold font-mono ${parcel.areaDeltaPct > 15 ? 'text-rose-400' : 'text-slate-300'}`}>
                {parcel.areaDeltaPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Satellite Multispectral Telemetry */}
        <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>القياسات الطيفية (Copernicus Sentinel-2)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">{parcel.spectral.lastObservationTime}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">مؤشر الكلوروفيل (NDVI)</div>
              <div className="text-base font-bold font-mono text-emerald-400">{parcel.spectral.ndviCurrent.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500">الحيوية الضوئية</div>
            </div>

            <div className="p-2 rounded bg-slate-900/80 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">مؤشر المحتوى المائي (NDWI)</div>
              <div className={`text-base font-bold font-mono ${parcel.spectral.ndwiCurrent < -0.1 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {parcel.spectral.ndwiCurrent.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500">رطوبة الأوراق السائلة</div>
            </div>

            <div className="p-2 rounded bg-slate-900/80 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">معدل التربة الصحراوية (SAVI)</div>
              <div className="text-base font-bold font-mono text-amber-400">{parcel.spectral.saviCurrent.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500">معامل L = 0.5</div>
            </div>

            <div className="p-2 rounded bg-slate-900/80 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">حرارة سطح الأرض (LST)</div>
              <div className="text-base font-bold font-mono text-orange-400">{parcel.spectral.lstSurfaceTempC}°C</div>
              <div className="text-[10px] text-slate-500">Landsat 9 TIRS-2</div>
            </div>
          </div>
        </div>

        {/* Farmer & Agronomic Profile */}
        <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
          <div className="font-medium text-slate-300 pb-1 border-b border-slate-800/80 flex items-center justify-between">
            <span>بيانات المستثمر والتربة</span>
            <span className="text-[10px] text-slate-500 font-mono">NID: {parcel.farmerNationalId}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-500">المستغل:</span>
              <span className="text-slate-200 mr-1.5 font-medium">{parcel.farmerName}</span>
            </div>
            <div>
              <span className="text-slate-500">الهاتف:</span>
              <span className="text-slate-200 mr-1.5 font-mono">{parcel.phone}</span>
            </div>
            <div>
              <span className="text-slate-500">المحصول:</span>
              <span className="text-slate-200 mr-1.5 font-medium">{parcel.cropNameAr}</span>
            </div>
            <div>
              <span className="text-slate-500">نظام السقي:</span>
              <span className="text-slate-200 mr-1.5 font-mono">{parcel.irrigationSystem}</span>
            </div>
            <div>
              <span className="text-slate-500">ملوحة التربة:</span>
              <span className="text-slate-200 mr-1.5 font-mono">{parcel.soilSalinityEce} dS/m</span>
            </div>
            <div>
              <span className="text-slate-500">ملوحة مياه البئر:</span>
              <span className="text-slate-200 mr-1.5 font-mono">{parcel.waterSalinityGL} g/L</span>
            </div>
          </div>
        </div>

        {/* Institutional Decision Impact */}
        <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
          <div className="font-medium text-slate-300 pb-1 border-b border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>القرارات المؤسساتية (BADR & OAIC)</span>
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">قرض الرفيق الفلاحي (BADR):</span>
              <span className={`font-medium px-2 py-0.5 rounded text-[10px] ${
                parcel.badrLoanStatus === 'RELEASED_AUTOMATIC'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : parcel.badrLoanStatus === 'FROZEN_SUSPECTED_FRAUD'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {parcel.badrLoanStatus === 'RELEASED_AUTOMATIC' ? 'تم الإفراج الآلي' :
                 parcel.badrLoanStatus === 'FROZEN_SUSPECTED_FRAUD' ? 'مجمّد للاشتباه بالتزوير' : 'قيد التدقيق الميداني'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">توقّع المحصول بالطن (AI):</span>
              <span className="font-mono font-semibold text-white">{parcel.predictedTotalProductionTons.toFixed(1)} طن</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">مردودية الهكتار المتوقعة:</span>
              <span className="font-mono text-emerald-400">{parcel.predictedYieldQHa} قنطار/هكتار</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">صومعة التخزين الموجهة:</span>
              <span className="text-slate-300 font-medium truncate max-w-[180px]">{parcel.oaicSiloAllocated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        {onOpenWeather && (
          <button
            onClick={() => onOpenWeather(parcel)}
            className="py-2 px-3 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5 shrink-0"
            title="عرض حالة الطقس وتوقعات الـ 72 ساعة ومخاطر الصقيع والشهيلي لهذا الحقل"
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>طقس الحقل (72h)</span>
          </button>
        )}
        <button
          onClick={() => onOpenAudit(parcel)}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>فتح تقرير التدقيق الفضائي</span>
        </button>
      </div>
    </div>
  );
};
