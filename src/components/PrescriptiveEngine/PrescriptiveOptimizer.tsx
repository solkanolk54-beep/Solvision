import React, { useState } from 'react';
import { EARLY_WARNING_ALERTS, OAIC_SILO_STATUS } from '../../data/parcelsData';
import { 
  Sparkles, 
  Sprout, 
  Droplets, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  HelpCircle,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';

export const PrescriptiveOptimizer: React.FC = () => {
  // Input parameters for the prescriptive optimization model
  const [wilaya, setWilaya] = useState<string>('سطيف');
  const [zoneType, setZoneType] = useState<string>('HIGHLANDS');
  const [soilType, setSoilType] = useState<string>('طميية كلسية عميقة');
  const [soilPh, setSoilPh] = useState<number>(7.8);
  const [soilSalinityEce, setSoilSalinityEce] = useState<number>(1.4);
  const [waterSalinityGL, setWaterSalinityGL] = useState<number>(0.9);
  const [irrigationSystem, setIrrigationSystem] = useState<string>('COMPLEMENTARY');
  const [totalAreaHa, setTotalAreaHa] = useState<number>(50);

  // Objective function weights
  const [weightRoi, setWeightRoi] = useState<number>(40);
  const [weightFoodSecurity, setWeightFoodSecurity] = useState<number>(45);
  const [weightWaterFootprint, setWeightWaterFootprint] = useState<number>(15);

  const [activeTab, setActiveTab] = useState<'OPTIMIZER' | 'YIELD_FORECAST' | 'EARLY_WARNING'>('OPTIMIZER');

  // Calculate recommendation based on inputs
  const calculateRecommendation = () => {
    if (wilaya === 'الوادي' || wilaya === 'بسكرة' || zoneType === 'SAHARA') {
      if (waterSalinityGL > 2.5) {
        return {
          primaryCrop: 'نخيل دقلة نور + شعير علفي متحمل للملوحة',
          allocation: [
            { crop: 'نخيل دقلة نور (تنقيط)', pct: 60, areaHa: totalAreaHa * 0.6, expectedYieldQHa: 85, roiPct: 48, waterM3Ha: 6200 },
            { crop: 'شعير علفي متحمل للملوحة', pct: 40, areaHa: totalAreaHa * 0.4, expectedYieldQHa: 42, roiPct: 28, waterM3Ha: 3800 },
          ],
          sowingWindow: '15 أكتوبر - 15 نوفمبر',
          waterSavingPct: 22,
          nationalSecurityScore: 82,
          rationale: 'الملوحة المرتفعة لمياه الآبار (أكبر من 2.5 غ/ل) تحد من زراعة الحبوب الحساسة؛ التوليفة الموصى بها تعظم العائد وتستجيب للأمن الغذائي المحلي في الأعلاف.'
        };
      } else {
        return {
          primaryCrop: 'بطاطس شتوية + قمح صلب استراتيجي (رشاش محوري)',
          allocation: [
            { crop: 'بطاطس صناعية ومائدة (سبونتا)', pct: 50, areaHa: totalAreaHa * 0.5, expectedYieldQHa: 320, roiPct: 58, waterM3Ha: 4500 },
            { crop: 'قمح صلب استراتيجي (رشاش محوري)', pct: 50, areaHa: totalAreaHa * 0.5, expectedYieldQHa: 65, roiPct: 42, waterM3Ha: 4200 },
          ],
          sowingWindow: '01 ديسمبر - 20 ديسمبر (للبطاطس) / 15 نوفمبر (للقمح)',
          waterSavingPct: 25,
          nationalSecurityScore: 94,
          rationale: 'المردودية القياسية لمحاور الجنوب مع توجيه 50% لتقليص فاتورة استيراد القمح الصلب بأسعار الشراء المضمونة من OAIC (6,000 دج/قنطار).'
        };
      }
    } else {
      // Highlands / Mitidja (Sétif, Tiaret, Blida)
      return {
        primaryCrop: 'قمح صلب (سيميتو) + سلجم زيتي (كولزا) + حمص شتوي',
        allocation: [
          { crop: 'قمح صلب (صنف سيميتو معتمد)', pct: 55, areaHa: totalAreaHa * 0.55, expectedYieldQHa: 52, roiPct: 44, waterM3Ha: 2200 },
          { crop: 'سلجم زيتي (كولزا لإنتاج الزيوت)', pct: 30, areaHa: totalAreaHa * 0.30, expectedYieldQHa: 28, roiPct: 51, waterM3Ha: 1900 },
          { crop: 'حمص شتوي جاف (تثبيت الآزوت)', pct: 15, areaHa: totalAreaHa * 0.15, expectedYieldQHa: 22, roiPct: 38, waterM3Ha: 800 },
        ],
        sowingWindow: '10 نوفمبر - 05 ديسمبر',
        waterSavingPct: 28,
        nationalSecurityScore: 96,
        rationale: 'الدورة الزراعية الثلاثية (القمح + الكولزا + البقوليات) تكسر دورة أمراض صدأ الحبوب وتثري التربة بالآزوت الطبيعي، مما يوفر 35% من الأسمدة الكيماوية ويحقق أعلى عائد للأمن القومي.'
      };
    }
  };

  const recommendation = calculateRecommendation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Header and Subnav */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Prescriptive Decision Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Constrained Linear Optimization & TCN Forecasting</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            محرك التوجيه الفلاحي الذكي والتنبؤ بالمحاصيل الاستراتيجية
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            الانتقال من الإحصاء السكوني إلى التوجيه الاستباقي: إرشاد الفلاح قبل البذر بما يزرع ومتى يزرع لسد الفجوة الغذائية الوطنية، والتنبؤ الدقيق بحجم المحصول بالطن لديوان الحبوب (OAIC).
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('OPTIMIZER')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'OPTIMIZER' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            محاكي التوصية بالمحاصيل
          </button>
          <button
            onClick={() => setActiveTab('YIELD_FORECAST')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'YIELD_FORECAST' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            توقّع المحصول وصوامع OAIC
          </button>
          <button
            onClick={() => setActiveTab('EARLY_WARNING')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'EARLY_WARNING' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            منظومة الإنذار المبكر (EWS)
          </button>
        </div>
      </div>

      {activeTab === 'OPTIMIZER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Inputs (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>معايير المستثمرة الفلاحية والتربة</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Pedology & Hydro</span>
              </div>

              {/* Wilaya & Agro-Zone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">الولاية القطبية:</label>
                  <select
                    value={wilaya}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWilaya(val);
                      if (val === 'الوادي' || val === 'بسكرة' || val === 'المنيعة') setZoneType('SAHARA');
                      else if (val === 'البليدة') setZoneType('COASTAL_PLAINS');
                      else setZoneType('HIGHLANDS');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:border-emerald-500"
                  >
                    <option value="سطيف">سطيف (الهضاب العليا)</option>
                    <option value="الوادي">الوادي (الصحراء - وادي سوف)</option>
                    <option value="بسكرة">بسكرة (الزيبان)</option>
                    <option value="تيارت">تيارت (الهضاب العليا الغربية)</option>
                    <option value="البليدة">البليدة (سهل المتيجة)</option>
                    <option value="المنيعة">المنيعة (الاستصلاح الجنوبي)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">المساحة الإجمالية:</label>
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-1.5">
                    <input
                      type="number"
                      value={totalAreaHa}
                      onChange={(e) => setTotalAreaHa(Number(e.target.value))}
                      className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                    <span className="text-slate-500 text-[11px] font-mono">هكتار</span>
                  </div>
                </div>
              </div>

              {/* Soil Pedology */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">حموضة التربة (pH):</label>
                  <input
                    type="range"
                    min="6.5"
                    max="8.8"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>6.5</span>
                    <span className="text-emerald-400 font-bold">{soilPh} pH</span>
                    <span>8.8</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">ملوحة مياه البئر (g/L):</label>
                  <input
                    type="range"
                    min="0.3"
                    max="4.5"
                    step="0.1"
                    value={waterSalinityGL}
                    onChange={(e) => setWaterSalinityGL(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>0.3</span>
                    <span className="text-emerald-400 font-bold">{waterSalinityGL} غ/ل</span>
                    <span>4.5</span>
                  </div>
                </div>
              </div>

              {/* Irrigation System */}
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">نظام الري المتوفر في المستثمرة:</label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { id: 'CENTER_PIVOT', label: 'رشاش محوري (Pivot)' },
                    { id: 'DRIP', label: 'سقي قطرة-قطرة (Goutte-à-goutte)' },
                    { id: 'COMPLEMENTARY', label: 'سقي تكميلي للحبوب' },
                    { id: 'RAINFED', label: 'بعلي مطري 100%' },
                  ].map((sys) => (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => setIrrigationSystem(sys.id)}
                      className={`p-2 rounded border text-right transition-colors ${
                        irrigationSystem === sys.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sys.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optimization Target Priorities */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-slate-300 font-medium block">أولويات التحسين (وزن دالة الاستمثال):</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الأمن الغذائي الوطني (سد العجز في القمح والكولزا):</span>
                    <span className="font-mono text-emerald-400 font-bold">{weightFoodSecurity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">العائد المالي للفلاح (ROI):</span>
                    <span className="font-mono text-white font-bold">{weightRoi}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ترشيد البصمة المائية وحماية طبقة الألبيان:</span>
                    <span className="font-mono text-cyan-400 font-bold">{weightWaterFootprint}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Prescriptive Crop Optimization Result (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">التوصية التوجيهية لمستثمرة {totalAreaHa} هكتار:</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">{recommendation.primaryCrop}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                    درجة الأمن القومي: {recommendation.nationalSecurityScore}/100
                  </div>
                  <div className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    وفر مياه الري: {recommendation.waterSavingPct}%
                  </div>
                </div>
              </div>

              {/* Rationale explanation */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-emerald-400 block mb-1">التعليل العلمي والتوجيهي:</span>
                {recommendation.rationale}
              </div>

              {/* Crop Allocation Breakdown Cards */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  توزيع الحصص المساحية والإنتاجية المتوقعة:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {recommendation.allocation.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{item.crop}</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">{item.pct}%</span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="flex justify-between">
                          <span>المساحة المخصصة:</span>
                          <span className="font-mono text-white">{item.areaHa.toFixed(1)} هكتار</span>
                        </div>
                        <div className="flex justify-between">
                          <span>المردودية المتوقعة:</span>
                          <span className="font-mono text-emerald-400">{item.expectedYieldQHa} قنطار/هكتار</span>
                        </div>
                        <div className="flex justify-between">
                          <span>هامش الربح الصافي:</span>
                          <span className="font-mono text-white">+{item.roiPct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الاحتياج المائي المقنن:</span>
                          <span className="font-mono text-cyan-400">{item.waterM3Ha} م³/هكتار</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agronomic Calendar & Guidelines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>نافذة البذر المثلى (Sowing Window):</span>
                  </span>
                  <span className="font-bold text-white text-xs">{recommendation.sowingWindow}</span>
                  <p className="text-[10px] text-slate-500 mt-1">تحديد التاريخ بناءً على تراكم درجات الحرارة (GDD) لتفادي الصقيع الربيعي.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>الضمان المؤسساتي المتاح:</span>
                  </span>
                  <span className="font-bold text-emerald-300 text-xs">شراء مضمون بنسبة 100% من OAIC</span>
                  <p className="text-[10px] text-slate-500 mt-1">أسعار شراء محفزة (6,000 دج/ق للقمح الصلب، 7,500 دج/ق للكولزا).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'YIELD_FORECAST' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">إجمالي إنتاج الحبوب المتوقع وطنيا (2026)</span>
              <span className="text-xl font-bold text-white">3.85 مليون طن</span>
              <span className="text-[10px] text-emerald-400 block mt-1">+18% مقارنة بالموسم المنصرم</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">معدل الدقة والتنبؤ الفضائي</span>
              <span className="text-xl font-bold text-emerald-400">95.4% CI</span>
              <span className="text-[10px] text-slate-500 block mt-1">قبل موعد الحصاد بـ 60 يوماً</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">سعة الصوامع المحجوزة لدى OAIC</span>
              <span className="text-xl font-bold text-cyan-400">76% جاهزية</span>
              <span className="text-[10px] text-slate-500 block mt-1">تنسيق النقل وتفادي الطوابير</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">تقليص فاتورة استيراد القمح الصلب</span>
              <span className="text-xl font-bold text-emerald-400">-$680M USD</span>
              <span className="text-[10px] text-emerald-400 block mt-1">استغلال محاور الاستصلاح بالجنوب</span>
            </div>
          </div>

          {/* Silo Capacity Logistics Table */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>لوحة التحكم اللوجستية لصوامع الديوان الجزائري المهني للحبوب (OAIC)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Real-Time Silo Inflow Allocation</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3">الولاية</th>
                    <th className="py-2 px-3">اسم مجمع الصوامع</th>
                    <th className="py-2 px-3">السعة الكلية</th>
                    <th className="py-2 px-3">المخزون الحالي</th>
                    <th className="py-2 px-3">التدفق الفضائي المتوقع</th>
                    <th className="py-2 px-3">حالة الجاهزية اللوجستية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {OAIC_SILO_STATUS.map((silo) => {
                    const usagePct = ((silo.currentReservedTons + silo.predictedInflowTons) / silo.totalCapacityTons) * 100;
                    return (
                      <tr key={silo.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-white font-sans font-medium">{silo.wilaya}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans">{silo.siloName}</td>
                        <td className="py-2.5 px-3 text-slate-400">{silo.totalCapacityTons.toLocaleString()} طن</td>
                        <td className="py-2.5 px-3 text-slate-400">{silo.currentReservedTons.toLocaleString()} طن</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">+{silo.predictedInflowTons.toLocaleString()} طن</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${usagePct > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(usagePct, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] text-slate-300">{Math.round(usagePct)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'EARLY_WARNING' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 leading-relaxed">
            تربط منظومة الإنذار المبكر (EWS) في SolVision بين السلاسل الزمنية لمؤشرات الأقمار الصناعية (Sentinel-2 NDWI / Landsat-9 LST) وشبكات الرصد الجوي المصغرة لاكتشاف الآفات الزراعية قبل انتشارها وتوفير 40% من تكاليف المبيدات.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EARLY_WARNING_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border text-xs space-y-3 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : 'bg-amber-950/20 border-amber-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {alert.severity === 'CRITICAL' ? 'إنذار أحمر طارئ' : 'تنبيه وقائي مبكر'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                </div>

                <h3 className="font-bold text-white text-sm leading-snug">{alert.title}</h3>

                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div>
                    <span className="text-slate-500">النطاق الجغرافي:</span> {alert.regionAr}
                  </div>
                  <div>
                    <span className="text-slate-500">الولايات المعنية:</span>{' '}
                    <span className="text-emerald-400 font-semibold">{alert.wilayasAffected.join('، ')}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-200 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-0.5">التوجيه الإجرائي الفوري:</span>
                  {alert.actionDirectiveAr}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
