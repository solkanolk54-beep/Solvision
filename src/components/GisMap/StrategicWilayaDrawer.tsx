import React from 'react';
import { WilayaHeatmapData } from '../../data/wilayasHeatmapData';
import { 
  X, 
  Droplet, 
  Flame, 
  Wheat, 
  ShieldAlert, 
  Building2, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  Layers
} from 'lucide-react';

interface StrategicWilayaDrawerProps {
  wilaya: WilayaHeatmapData | null;
  mode: 'WATER_STRESS' | 'CROP_DISTRIBUTION';
  onClose: () => void;
  onOpenWeather?: (wilaya: WilayaHeatmapData) => void;
}

export const StrategicWilayaDrawer: React.FC<StrategicWilayaDrawerProps> = ({
  wilaya,
  mode,
  onClose,
  onOpenWeather,
}) => {
  const [exported, setExported] = React.useState<boolean>(false);
  if (!wilaya) return null;

  const isCriticalStress = wilaya.waterStressSeverity === 'CRITICAL';
  const isHighStress = wilaya.waterStressSeverity === 'HIGH';

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-slate-900/98 backdrop-blur-xl border-r border-slate-800 shadow-2xl flex flex-col text-slate-200 transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
            mode === 'WATER_STRESS'
              ? isCriticalStress
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {mode === 'WATER_STRESS' ? <Droplet className="w-5 h-5" /> : <Wheat className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">ولاية {wilaya.nameAr}</h3>
              <span className="text-[10px] font-mono text-slate-400">({wilaya.nameFr} &bull; W.{wilaya.code})</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {mode === 'WATER_STRESS' ? 'تقرير الإجهاد المائي الاستراتيجي' : 'تقرير توزيع المحاصيل والأمن الغذائي'}
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

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {mode === 'WATER_STRESS' ? (
          <>
            {/* Water Stress Severity Banner */}
            <div className={`p-3 rounded-lg border ${
              isCriticalStress
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                : isHighStress
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>مستوى الإجهاد المائي: {wilaya.waterStressSeverity === 'CRITICAL' ? 'حرج جداً' : wilaya.waterStressSeverity === 'HIGH' ? 'مرتفع' : 'متوسط إلى منخفض'}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                  مؤشر العجز: {wilaya.waterStressScore}/100
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{wilaya.waterStressDirective}</p>
            </div>

            {/* Hydrological Metrics Grid */}
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
              <span className="font-medium text-slate-300 block pb-1 border-b border-slate-800/80">
                المؤشرات الهيدرولوجية والمناخية الدقيقة (ERA5-Agro & Landsat 9)
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">معدل التبخر النتحي (ET₀)</div>
                  <div className="text-base font-bold font-mono text-amber-400">{wilaya.evapotranspirationMmDay} mm/يوم</div>
                  <div className="text-[10px] text-slate-500">فقدان الرطوبة الجوي</div>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">استنزاف المياه الجوفية</div>
                  <div className="text-base font-bold font-mono text-rose-400">{wilaya.groundwaterDepletionPct}%</div>
                  <div className="text-[10px] text-slate-500">طبقة الألبيان / المياه السطحية</div>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">المساحة المهددة بالإجهاد</div>
                  <div className="text-base font-bold font-mono text-white">{wilaya.stressedAreaHa.toLocaleString()} ha</div>
                  <div className="text-[10px] text-slate-500">مزارع تحت عتبة NDWI السلبية</div>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">المستثمرات المتأثرة</div>
                  <div className="text-base font-bold font-mono text-cyan-400">{wilaya.affectedParcelsCount} مستثمرة</div>
                  <div className="text-[10px] text-slate-500">تنبيهات SMS مرسلة</div>
                </div>
              </div>
            </div>

            {/* Strategic Directive for Government Planners */}
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
              <span className="font-medium text-slate-300 block pb-1 border-b border-slate-800/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>إجراءات التدخل الحكومي المقترحة (ANRH & ONID)</span>
              </span>

              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span>تعديل ساعات ضخ الآبار الارتوازية وتوجيه الفلاحين للسقي الليلي بين الساعة 21:00 و05:00 لخفض التبخر بنسبة 35%.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span>صرف تعويضات بارامترية مبكرة عبر صندوق CNMA للمستثمرين المتضررين من انخفاض منسوب الآبار.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span>إرسال فرق المعاينة الهيدروليكية لمعايرة عدادات الاستهلاك وحظر حفر الآبار العشوائية غير المرخصة.</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Strategic Crop Distribution Profile */}
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                  <span>المحصول الاستراتيجي المهيمن: {wilaya.cropNameAr}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                  {wilaya.strategicFoodSecurityPriority === 'VITAL_GRAIN' ? 'حبوب استراتيجية' :
                   wilaya.strategicFoodSecurityPriority === 'STRATEGIC_OILS' ? 'زيوت نباتية' :
                   wilaya.strategicFoodSecurityPriority === 'EXPORT_OASIS' ? 'تمور تصديرية' : 'خضروات وتموين وطني'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                تساهم الولاية بنسبة <strong>{wilaya.nationalContributionPct}%</strong> من الإنتاج الوطني الإجمالي لهذا المحصول الاستراتيجي، مما يجعلها ركيزة حيوية للأمن الغذائي.
              </p>
            </div>

            {/* Production Statistics */}
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
              <span className="font-medium text-slate-300 block pb-1 border-b border-slate-800/80">
                أرقام الإنتاج والكتلة الحيوية المرصودة فضائياً
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">المساحة المزروعة الكلية</div>
                  <div className="text-base font-bold font-mono text-white">{wilaya.totalCropAreaHa.toLocaleString()} ha</div>
                  <div className="text-[10px] text-slate-500">مضلعات موثقة بالأقمار</div>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">المردودية المتوسطة</div>
                  <div className="text-base font-bold font-mono text-emerald-400">{wilaya.cropDensityQHa} ق/هكتار</div>
                  <div className="text-[10px] text-slate-500">توقّع الذكاء الاصطناعي (TCN)</div>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">الإنتاج الإجمالي المتوقع</div>
                  <div className="text-base font-bold font-mono text-amber-400">{wilaya.totalProductionExpectedTons.toLocaleString()} طن</div>
                  <div className="text-[10px] text-slate-500">جاهز للتوريد الصيفي</div>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800/60">
                  <div className="text-slate-400 text-[10px]">الحصة من السلة الوطنية</div>
                  <div className="text-base font-bold font-mono text-cyan-400">{wilaya.nationalContributionPct}%</div>
                  <div className="text-[10px] text-slate-500">معدل الاكتفاء الذاتي</div>
                </div>
              </div>
            </div>

            {/* Strategic Logistics Directive */}
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 space-y-2">
              <span className="font-medium text-slate-300 block pb-1 border-b border-slate-800/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>توجيهات التخزين وسلاسل الإمداد لديوان الحبوب (OAIC)</span>
              </span>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                بناءً على التنبؤ الفضائي المبكر، يتعين حجز وتأهيل مراكز التجميع في الولاية وتجهيز أسطول نقل يضم ما لا يقل عن 180 شاحنة لنقل المحصول إلى الصوامع المركزية لمنع تراكم الطوابير أثناء فترة ذروة الحصاد.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
        {exported && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
            <span>تم تصدير المذكرة الاستراتيجية لولاية {wilaya.nameAr} بنجاح</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )}
        <div className="flex items-center gap-2">
          {onOpenWeather && (
            <button
              onClick={() => onOpenWeather(wilaya)}
              className="py-2 px-3 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5 shrink-0"
              title="عرض توقعات الطقس وتنبيهات الصقيع والشهيلي للولاية"
            >
              <span>طقس الولاية (72h)</span>
            </button>
          )}
          <button
            onClick={() => {
              setExported(true);
              setTimeout(() => setExported(false), 4000);
            }}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصدير المذكرة (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
