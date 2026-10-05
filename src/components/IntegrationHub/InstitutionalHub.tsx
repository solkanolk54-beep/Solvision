import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Coins, 
  Wheat, 
  Umbrella, 
  Satellite, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  Lock,
  ArrowRight,
  Landmark,
  BadgeAlert
} from 'lucide-react';

export const InstitutionalHub: React.FC = () => {
  const [selectedAgency, setSelectedAgency] = useState<'BADR' | 'OAIC' | 'CNMA' | 'ONTA' | 'ASAL'>('BADR');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Header and Vision */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              National Inter-Agency Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">REST & gRPC Microservices</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            بوابة الربط البيني والتحول المؤسساتي لمنظومة SolVision
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            ربط المنظومة الفضائية عضوياً مع الهيئات الحكومية الخمس الرائدة في الجزائر، لتحويل بيانات الأقمار الصناعية إلى قرارات مالية ولوجستية وتأمينية فورية ومؤتمتة بالكامل.
          </p>
        </div>
      </div>

      {/* Agency Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { id: 'BADR', name: 'بنك BADR', subtitle: 'قروض الرفيق والوقود', icon: <Landmark className="w-5 h-5 text-emerald-400" /> },
          { id: 'OAIC', name: 'ديوان الحبوب OAIC', subtitle: 'الصوامع وتوريد القمح', icon: <Wheat className="w-5 h-5 text-amber-400" /> },
          { id: 'CNMA', name: 'التعاون الفلاحي CNMA', subtitle: 'التأمين البارامتري', icon: <Umbrella className="w-5 h-5 text-cyan-400" /> },
          { id: 'ONTA', name: 'الأراضي الفلاحية ONTA', subtitle: 'عقود الامتياز والبور', icon: <Building2 className="w-5 h-5 text-purple-400" /> },
          { id: 'ASAL', name: 'وكالة الفضاء ASAL', subtitle: 'سواتل Alsat الوطنية', icon: <Satellite className="w-5 h-5 text-blue-400" /> },
        ].map((agency) => (
          <button
            key={agency.id}
            onClick={() => setSelectedAgency(agency.id as any)}
            className={`p-3 rounded-lg border text-right transition-all duration-150 text-xs ${
              selectedAgency === agency.id
                ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="mb-2">{agency.icon}</div>
            <div className="font-bold text-white text-sm">{agency.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{agency.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Active Agency Detailed Panel */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-5">
        {selectedAgency === 'BADR' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  بنك الفلاحة والتنمية الريفية (BADR) &bull; أتمتة الإفراج وتجميد قروض الرفيق
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  القضاء على ظاهرة "الاستفادة من القروض بدون زراعة" عبر الإفراج المشروط بالبصمة الخضرية الحية (NDVI).
                </p>
              </div>
              <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                API Endpoint: /api/v1/badr/loan-validation
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 block">1. الإفراج الآلي عن الشطر الثاني:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  بمجرد رصد قمر Sentinel-2 لتجاوز مؤشر NDVI عتبة 0.50 في الموعد المحدد، يرسل SolVision إشارة إلكترونية مؤمنة إلى نظام البنك للإفراج عن أموال الأسمدة والمبيدات دون الحاجة لتنقل لجان المراقبة.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-rose-400 block">2. تجميد فوري للاحتيال:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  إذا ظل الحقل بوراً أو بمؤشر NDVI &lt; 0.22، يتم تجميد الملف آلياً ومنع صرف قسائم الوقود الفلاحي المدعوم، مما حمى حتى الآن أكثر من 2.4 مليون دج من النزيف المالي.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-400 block">3. تقييم الملاءة الزراعية:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  بناء سجل ائتماني تاريخي (Agri-Credit Score) لكل مستغل يوضح مدى انضباطه في مواعيد البذر والإنتاجية المحققة عبر المواسم.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedAgency === 'OAIC' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  الديوان الجزائري المهني للحبوب (OAIC) &bull; تنظيم سلاسل الإمداد ومراكز التجميع
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  معرفة حجم المحصول الوطني بالطن قبل شهرين من الحصاد لإنهاء طوابير الشاحنات وتلف الحبوب.
                </p>
              </div>
              <div className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/30">
                API Endpoint: /api/v1/oaic/silo-inflow
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 block">جدولة تفريغ الشاحنات:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  توجيه شاحنات الحصاد مسبقاً نحو صوامع العلمة، مهدية، قالمة، أو المنيعة بناءً على السعة الشاغرة اللحظية لمنع الاكتظاظ.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 block">التأكد من أصناف القمح:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  مطابقة البصمة الطيفية للشحنة مع المضلع المورد منه لضمان عدم خلط القمح الصلب بالقمح اللين أو الشعير الرعوي للاستفادة من فرق السعر المدعوم.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedAgency === 'CNMA' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  الصندوق الوطني للتعاون الفلاحي (CNMA) &bull; التأمين البارامتري الفضائي ضد الجفاف
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تعويض الفلاحين تلقائياً عند هبوط مؤشرات NDVI أو NDWI دون حاجة لجان معاينة الخسائر.
                </p>
              </div>
              <div className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-500/30">
                API Endpoint: /api/v1/cnma/parametric-claims
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p>
                يقوم التأمين البارامتري (Parametric Insurance) على عقود ذكية: إذا انخفض مؤشر NDWI عن عتبة -0.15 ومؤشر سقوط الأمطار ERA5 عن 40 ملم خلال فترة التزهير في ولايات الهضاب (تيارت، سطيف)، يتم تفعيل التعويض المالي مباشرة لحساب الفلاح البنكي في ظرف 48 ساعة، مما يرفع ثقة الفلاحين في نظام التأمين الفلاحي بنسبة تفوق 70%.
              </p>
            </div>
          </div>
        )}

        {selectedAgency === 'ONTA' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  الديوان الوطني للأراضي الفلاحية (ONTA) &bull; مراقبة عقود الامتياز ومكافحة الأراضي المهملة
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  رصد استغلال أراضي الدولة ومنع تحويل الأراضي الخصبة إلى بوار أو نشاطات غير فلاحية.
                </p>
              </div>
              <div className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-xs border border-purple-500/30">
                API Endpoint: /api/v1/onta/concession-audit
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p>
                يمتلك المستثمرون أراضي شاسعة بموجب عقود امتياز فلاحية. تقوم SolVision بعمل مسح سنوي آلي لجميع مضلعات الامتياز، وتحديد المساحات غير المزروعة بدقة 10 أمتار، وإرسال تقارير دورية لـ ONTA لاتخاذ الإجراءات القانونية أو إعادة توجيه الأراضي لمستثمرين جادين.
              </p>
            </div>
          </div>
        )}

        {selectedAgency === 'ASAL' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  الوكالة الفضائية الجزائرية (ASAL) &bull; دمج صور السواتل الوطنية Alsat-1B و Alsat-2
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  استغلال السيادة الفضائية الجزائرية لرفع الدقة المكانية إلى 2.5 متر في البيوت البلاستيكية والواحات.
                </p>
              </div>
              <div className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-500/30">
                API Endpoint: /api/v1/asal/alsat-mosaic
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p>
                بينما توفر منظومة Copernicus Sentinel-2 دقة 10 أمتار وتواتراً كل 5 أيام، توفر أقمار Alsat الجزائرية صوراً فائقة الدقة (High-Resolution 2.5m) تدعم فحص البيوت البلاستيكية في بسكرة وشبكات السقي بالتنقيط في المتيجة لرصد أي انسداد أو تسرب مائي في أمتار معدودة.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Land Tenure Innovation: Decoupling Legal Cadastre from Spectral Reality */}
      <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/60 text-xs space-y-2">
        <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>ابتكار SolVision لمعالجة الملكيات العرفية وعقود الشيوع (Land Tenure Resolution)</span>
        </span>
        <p className="text-slate-300 leading-relaxed">
          إحدى أكبر معضلات الفلاحة في الجزائر هي تأخر عقود الملكية الرسمية ونزاعات الإرث والشيوع. ابتكرت SolVision حلاً هندسياً جذرياً يتمثل في **الفصل التام بين "الواقع الفيزيائي الطيفي للأرض" و"الوضع الإداري للوثيقة"**. تمنح المنظومة الفلاح رقم مضلع جغرافي رقمي (Geo-UID) وشهادة استغلال طيفية تثبت زراعته للمحصول وتسمح له باستلام أكياس البذور وتوريد القمح لـ OAIC دون انتظار تسوية النزاعات الإدارية، مما يحافظ على استمرار عجلة الإنتاج الوطني.
        </p>
      </div>
    </div>
  );
};
