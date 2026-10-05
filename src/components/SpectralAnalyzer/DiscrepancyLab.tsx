import React, { useState } from 'react';
import { Parcel, CropType } from '../../types';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  FileCheck, 
  Ban, 
  Send, 
  Cpu, 
  Activity, 
  TrendingUp,
  Download,
  CheckCircle2,
  RefreshCw,
  Coins,
  Radio
} from 'lucide-react';

interface DiscrepancyLabProps {
  parcels: Parcel[];
  selectedParcelId?: string;
  onAuditComplete?: (parcel: Parcel) => void;
}

export const DiscrepancyLab: React.FC<DiscrepancyLabProps> = ({
  parcels,
  selectedParcelId,
}) => {
  const [activeParcelId, setActiveParcelId] = useState<string>(selectedParcelId || parcels[1].id);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeParcel = parcels.find(p => p.id === activeParcelId) || parcels[0];

  const handleRunFullAudit = () => {
    setIsAuditing(true);
    setAuditLog([]);
    setActionNotice(null);

    const steps = [
      '1. استدعاء المضلع الجغرافي من PostgreSQL / PostGIS عبر ST_GeomFromText...',
      `2. حساب المساحة الجيوديسية الحقيقية: ST_Area(ST_Transform(boundary_geom, 32631)) = ${(activeParcel.calculatedAreaHa * 10000).toLocaleString()} م² (${activeParcel.calculatedAreaHa.toFixed(1)} هكتار)...`,
      `3. مقارنة المساحة المصرحة (${activeParcel.declaredAreaHa} ha) مع المحسوبة: فارق ${activeParcel.areaDeltaPct.toFixed(1)}%...`,
      '4. تحميل السلسلة الزمنية لصور قمر Sentinel-2B للأشهر الستة الأخيرة وحساب أطياف NDVI/NDWI/SAVI...',
      `5. احتساب معامل ارتباط بيرسون الفينولوجي مع مكتبة المحاصيل الوطنية: r = ${activeParcel.spectralCorrelation.toFixed(2)}...`,
      '6. تطبيق خوارزمية Discrepancy Engine وإصدار القرار الآلي النهائي...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setAuditLog(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsAuditing(false);
        }
      }, (idx + 1) * 350);
    });
  };

  const handleTriggerAction = (actionType: 'FREEZE_BADR' | 'DISPATCH_INSPECTION' | 'SEND_SMS' | 'RELEASE_LOAN') => {
    if (actionType === 'FREEZE_BADR') {
      setActionNotice(`تم إرسال إشعار آلي فوري إلى بنك الفلاحة (BADR) لتجميد الشطر الثاني من قرض الرفيق لحساب المستغل ${activeParcel.farmerName}. تم الحفاظ على ${activeParcel.subsidiesSavedDzd.toLocaleString()} دج.`);
    } else if (actionType === 'DISPATCH_INSPECTION') {
      setActionNotice(`تم تحرير أمر بمهمة تفتيش ميداني موجهة لفائدة مفتشي مديرية المصالح الفلاحية (DSA ${activeParcel.wilayaNameAr}) مع تحديد إحداثيات GPS الدقيقة للمضلع.`);
    } else if (actionType === 'SEND_SMS') {
      setActionNotice(`تم إرسال رسالة نصية SMS ورسالة صوتية بالدارجة إلى هاتف الفلاح (${activeParcel.phone}): "السلام عليكم، منظومة SolVision ترصد إجهاداً مائياً في حقل البطاطس بحاسي خليفة، يرجى فحص مضخة الرشاش المحوري فوراً".`);
    } else if (actionType === 'RELEASE_LOAN') {
      setActionNotice(`تم إصدار شهادة مطابقة طيفية رقم SV-CERT-${activeParcel.code} والإفراج الآلي عن الدعم وقرض الرفيق بنسبة فائدة 0%.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Header and Hero Overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Discrepancy & Fraud Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Copernicus Sentinel-2 & Landsat-9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            وحدة التحقق الطيفي الآلي وكشف التضارب والمزارع الوهمية
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            الانتقال من الاستمارة الورقية إلى الحقيقة الفيزيائية الفضائية: كشف تضخيم المساحات، رصد الأراضي البور المصرحة كقمح للاستفادة من البذور والوقود وقروض BADR، وحماية المال العام.
          </p>
        </div>

        {/* Global Protection Counter */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-4 text-xs font-mono">
          <div className="w-10 h-10 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">إجمالي الوفر المحمي من الدعم الوهمي</div>
            <div className="text-lg font-bold text-white font-mono">2,490,000 دج</div>
            <div className="text-[10px] text-emerald-400">بذور OAIC المدعومة + قروض الرفيق BADR</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Selector & Audit Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parcel Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>قائمة الحقول الخاضعة للتدقيق الآلي</span>
            <span className="text-[10px] font-mono text-slate-500">6 مستثمرات نموذجية</span>
          </div>

          <div className="space-y-2">
            {parcels.map((parcel) => {
              const isSelected = parcel.id === activeParcelId;
              const isCritical = parcel.discrepancySeverity === 'CRITICAL' || parcel.discrepancySeverity === 'HIGH';
              return (
                <div
                  key={parcel.id}
                  onClick={() => { setActiveParcelId(parcel.id); setAuditLog([]); setActionNotice(null); }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 text-xs ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white font-mono">{parcel.code}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      parcel.verificationStatus === 'VERIFIED_COMPLIANT'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isCritical
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {parcel.verificationStatus === 'VERIFIED_COMPLIANT' ? 'مطابق 100%' :
                       parcel.verificationStatus === 'FALLOW_DECLARED_ACTIVE' ? 'أرض بور وهمية' :
                       parcel.verificationStatus === 'SEVERE_WATER_STRESS' ? 'إجهاد مائي حاد' :
                       parcel.verificationStatus === 'CROP_MISMATCH' ? 'تناقض المحصول' : 'تضخيم مساحة'}
                    </span>
                  </div>

                  <div className="text-slate-300 font-medium truncate">{parcel.farmerName}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5 flex justify-between">
                    <span>{parcel.wilayaNameAr} - {parcel.commune}</span>
                    <span className="text-emerald-400">{parcel.cropNameAr}</span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>مساحة: {parcel.declaredAreaHa}ha &rarr; {parcel.calculatedAreaHa}ha</span>
                    <span>NDVI: {parcel.spectral.ndviCurrent.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Parcel Deep Audit Engine (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Parcel Header Card */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-mono">{activeParcel.code}</h2>
                  <span className="text-xs text-slate-400">({activeParcel.farmerName})</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeParcel.wilayaNameAr} &bull; دائرة {activeParcel.commune} &bull; بطاقة الفلاح: {activeParcel.farmerNationalId}
                </p>
              </div>

              <button
                onClick={handleRunFullAudit}
                disabled={isAuditing}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm shadow-emerald-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'جاري التحقق الفضائي عبر Sentinel-2...' : 'إعادة تشغيل محرك المطابقة'}</span>
              </button>
            </div>

            {/* Discrepancy Diagnostics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Criterion 1: Surface Area Cross-Check */}
              <div className={`p-3 rounded-lg border ${
                activeParcel.areaDeltaPct > 15 
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' 
                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px]">المطابقة الهندسية</span>
                  {activeParcel.areaDeltaPct > 15 ? (
                    <Ban className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="font-mono text-base font-bold text-white">
                  فارق {activeParcel.areaDeltaPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  مصرح: {activeParcel.declaredAreaHa}ha | مضلع PostGIS: {activeParcel.calculatedAreaHa}ha
                </div>
              </div>

              {/* Criterion 2: Phenological Spectral Correlation */}
              <div className={`p-3 rounded-lg border ${
                activeParcel.spectralCorrelation < 0.65 
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' 
                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px]">معامل ارتباط بيرسون</span>
                  {activeParcel.spectralCorrelation < 0.65 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="font-mono text-base font-bold text-white">
                  r = {activeParcel.spectralCorrelation.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {activeParcel.spectralCorrelation >= 0.90 ? 'مطابقة ممتازة للمنحنى الفينولوجي' : 'انحراف عن البصمة الطيفية للصنف'}
                </div>
              </div>

              {/* Criterion 3: Water Canopy Stress (NDWI) */}
              <div className={`p-3 rounded-lg border ${
                activeParcel.spectral.ndwiCurrent < -0.15 
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' 
                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px]">المحتوى المائي (NDWI)</span>
                  {activeParcel.spectral.ndwiCurrent < -0.15 ? (
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className={`font-mono text-base font-bold ${activeParcel.spectral.ndwiCurrent < -0.15 ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {activeParcel.spectral.ndwiCurrent.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {activeParcel.spectral.ndwiCurrent < -0.15 ? 'جفاف حاد - خطر موت النبتة قبل الحصاد' : 'رطوبة متوازنة للأوراق'}
                </div>
              </div>
            </div>

            {/* Execution Audit Console Output */}
            {auditLog.length > 0 && (
              <div className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                <div className="text-emerald-400 font-bold mb-1">// سجل تنفيذ محرك التحقق الفضائي (Rasterio & PostGIS Engine)</div>
                {auditLog.map((log, i) => (
                  <div key={i} className="text-slate-300 leading-relaxed">&gt; {log}</div>
                ))}
              </div>
            )}

            {/* Phenological Spectral Curve Chart Comparison */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>المنحنى الفينولوجي: المرصود عبر الأقمار الصناعية مقابل المتوقع للصنف</span>
                </span>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span> المرصود (Sentinel-2)
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-0.5 bg-slate-400 border-dashed inline-block"></span> المتوقع (Crop Library)
                  </span>
                </div>
              </div>

              {/* SVG Line Chart */}
              <div className="w-full h-44 bg-slate-900/60 rounded border border-slate-800/80 p-2 relative flex flex-col justify-end">
                <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Y-axis labels */}
                  <text x="5" y="23" fill="#64748b" fontSize="8" fontFamily="monospace">NDVI 0.8</text>
                  <text x="5" y="63" fill="#64748b" fontSize="8" fontFamily="monospace">NDVI 0.5</text>
                  <text x="5" y="103" fill="#64748b" fontSize="8" fontFamily="monospace">NDVI 0.2</text>

                  {/* Expected Crop Curve (Dashed line) */}
                  <polyline
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    points={activeParcel.timeseries.map((pt, idx) => {
                      const x = (idx / (activeParcel.timeseries.length - 1)) * 460 + 30;
                      const y = 120 - (pt.expectedNdvi * 120);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Observed Satellite NDVI Curve (Solid line) */}
                  <polyline
                    fill="none"
                    stroke={activeParcel.verificationStatus === 'VERIFIED_COMPLIANT' ? '#10b981' : '#ef4444'}
                    strokeWidth="2.5"
                    points={activeParcel.timeseries.map((pt, idx) => {
                      const x = (idx / (activeParcel.timeseries.length - 1)) * 460 + 30;
                      const y = 120 - (pt.ndvi * 120);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Data Points */}
                  {activeParcel.timeseries.map((pt, idx) => {
                    const x = (idx / (activeParcel.timeseries.length - 1)) * 460 + 30;
                    const y = 120 - (pt.ndvi * 120);
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="3" fill="#020617" stroke="#10b981" strokeWidth="2" />
                        <text x={x} y="118" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                          {pt.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Prescriptive Inter-Agency Enforcement Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                الإجراءات والقرارات الآلية الفورية المتاحة (Inter-Agency Enforcement):
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {activeParcel.discrepancySeverity === 'CRITICAL' || activeParcel.discrepancySeverity === 'HIGH' ? (
                  <>
                    <button
                      onClick={() => handleTriggerAction('FREEZE_BADR')}
                      className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>تجميد قرض الرفيق الفلاحي (بنك BADR)</span>
                    </button>

                    <button
                      onClick={() => handleTriggerAction('DISPATCH_INSPECTION')}
                      className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>إصدار أمر معاينة تفتيشية لمصالح الفلاحة (DSA)</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleTriggerAction('RELEASE_LOAN')}
                    className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>إصدار شهادة المطابقة الطيفية والإفراج عن الدعم</span>
                  </button>
                )}

                <button
                  onClick={() => handleTriggerAction('SEND_SMS')}
                  className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال إنذار SMS + رسالة صوتية للفلاح</span>
                </button>
              </div>

              {/* Action notice toast */}
              {actionNotice && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs mt-2 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{actionNotice}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
