import React, { useState } from 'react';
import { SPECTRAL_FORMULAS } from '../../data/parcelsData';
import { 
  Terminal, 
  Database, 
  Layers, 
  Cpu, 
  Code2, 
  CheckCircle, 
  Compass, 
  FileText,
  Workflow,
  Sparkles
} from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const [selectedSubTab, setSelectedSubTab] = useState<'FORMULAS' | 'PIPELINE' | 'POSTGIS_DDL' | 'ROADMAP'>('FORMULAS');
  const [sqlQueryResult, setSqlQueryResult] = useState<string | null>(null);

  const handleRunSampleQuery = () => {
    setSqlQueryResult(
      `-- ST_Area & ST_Centroid Real-Time Execution Result
[
  {
    "parcel_code": "DZ-19-SET-0842",
    "wilaya": "Sétif",
    "calculated_area_ha": 44.82,
    "declared_area_ha": 45.00,
    "area_delta_pct": 0.40,
    "centroid_lat": 36.1528,
    "centroid_lng": 5.6892,
    "spatial_index_hit": "idx_parcels_spatial_gist (Time: 1.2ms)"
  },
  {
    "parcel_code": "DZ-19-SET-1904",
    "wilaya": "Sétif",
    "calculated_area_ha": 26.38,
    "declared_area_ha": 68.00,
    "area_delta_pct": 61.20,
    "flag": "DISCREPANCY_DETECTED_SURFACE_OVERESTIMATION",
    "spatial_index_hit": "idx_parcels_spatial_gist (Time: 0.9ms)"
  }
]`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Header and Spec */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Enterprise GIS & Cloud Architecture
            </span>
            <span className="text-xs text-slate-400 font-mono">v1.0 Specifications & Mathematical Core</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            المعمارية السحابية والنواة الرياضية لمنظومة SolVision
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            التوثيق الهندسي الشامل: الحسابات الرياضية للمؤشرات الطيفية، أنابيب معالجة الصور الفضائية بالمليارات، ومخطط قاعدة البيانات الجغرافية PostGIS 3.4 مع TimescaleDB.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedSubTab('FORMULAS')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              selectedSubTab === 'FORMULAS' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            المعادلات الطيفية
          </button>
          <button
            onClick={() => setSelectedSubTab('PIPELINE')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              selectedSubTab === 'PIPELINE' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            مسار البيانات الحي
          </button>
          <button
            onClick={() => setSelectedSubTab('POSTGIS_DDL')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              selectedSubTab === 'POSTGIS_DDL' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            مخطط PostGIS DDL
          </button>
          <button
            onClick={() => setSelectedSubTab('ROADMAP')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              selectedSubTab === 'ROADMAP' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            خارطة النشر الميداني
          </button>
        </div>
      </div>

      {selectedSubTab === 'FORMULAS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPECTRAL_FORMULAS.map((formula, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-white text-sm font-mono text-emerald-400">{formula.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{formula.sensor}</span>
                </div>

                <div className="text-slate-200 font-semibold">{formula.fullNameAr}</div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-center text-xs text-white dir-ltr">
                  {formula.formula}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>المجال النظري: {formula.domainRange}</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  {formula.usageAr}
                </p>
              </div>
            ))}
          </div>

          {/* Mathematical Proof on SAVI & Algerian Soils */}
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/60 text-xs space-y-2">
            <span className="font-bold text-emerald-400 block text-sm">
              لماذا يعتبر مؤشر SAVI حاسماً للتربة الفلاحية الجزائرية؟
            </span>
            <p className="text-slate-300 leading-relaxed">
              في معظم المساحات الزراعية بالهضاب العليا (سطيف، باتنة، تيارت) والصحراء (الوادي، بسكرة)، تغطي المحاصيل نسبة 30% إلى 60% فقط من سطح الحقل في المراحل المبكرة، وتظل التربة الرملية أو الكلسية مكشوفة. عاكسية الرمال والطين الجاف تشوه نطاق الضوء الأحمر (Red B4)، مما يجعل مؤشر NDVI التقليدي يظهر قيماً منخفضة كاذبة. عبر إدخال معامل تصحيح التربة $L = 0.5$، يتم إلغاء الانعكاس الرملي وتقديم قراءة نقية لكتلة الكلوروفيل الحقيقية.
            </p>
          </div>
        </div>
      )}

      {selectedSubTab === 'PIPELINE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-emerald-400" />
              <span>معمارية تدفق البيانات في الوقت الفعلي (Real-Time Spatial Data Pipeline)</span>
            </h3>

            <p className="text-slate-300 leading-relaxed">
              تعتمد SolVision على مكدس تقني موزع فائق السرعة يعالج ملايين الهكتارات الزراعية دون أي اختناق:
            </p>

            <div className="p-3 bg-black/60 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed dir-ltr">
              <pre>{`[Flutter Mobile App (DSA/Farmers)]
               │ (Offline Queue / SQLite)
               ▼
[Go Ingestion API (Fiber Gateway <15ms latency)]
               │
               ▼
[Kafka / Redis Stream Ingestion Queue]
               │
      ┌────────┴───────────────────────────┐
      ▼                                    ▼
[Sentinel-2 / Landsat-9 STAC Hub]    [PostgreSQL 16 + PostGIS 3.4 Workers]
      │ (FastAPI + Rasterio / GEE)         │ (GiST Spatial Index / TimescaleDB)
      └────────────────┬───────────────────┘
                       │
                       ▼
    [Autonomous Discrepancy & Fraud Engine]
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   [Verified Compliant]     [Discrepancy / Severe Stress]
          │                         │
   • Auto Release BADR Loan  • Freeze BADR Loan
   • Allocate OAIC Silo      • Trigger Drone / DSA Field Inspection
   • Predict Yield (Q/Ha)    • Send Automated Darija SMS Alert`}</pre>
            </div>
          </div>
        </div>
      )}

      {selectedSubTab === 'POSTGIS_DDL' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>مخطط الجداول المكانية (PostGIS 3.4 & TimescaleDB DDL)</span>
              </span>
              <button
                onClick={handleRunSampleQuery}
                className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                تجربة استعلام ST_Area المكاني
              </button>
            </div>

            <div className="p-3 bg-black/70 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto dir-ltr">
              <pre>{`CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- جدول الحقول الزراعية والمضلعات الجغرافية
CREATE TABLE agricultural_parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_code VARCHAR(32) UNIQUE NOT NULL,
    farmer_id UUID REFERENCES farmers(id),
    wilaya_code INT NOT NULL,
    commune_name VARCHAR(100) NOT NULL,
    declared_crop VARCHAR(80) NOT NULL,
    declared_area_ha NUMERIC(10, 2) NOT NULL,
    declared_sowing_date DATE NOT NULL,
    irrigation_system VARCHAR(50),
    
    -- المضلع الجغرافي المعياري WGS84
    boundary_geom GEOMETRY(Polygon, 4326) NOT NULL,
    centroid_geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_Centroid(boundary_geom)) STORED,
    
    status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء فهرس مكاني مكافئ GiST
CREATE INDEX idx_parcels_spatial_gist ON agricultural_parcels USING GIST (boundary_geom);
CREATE INDEX idx_parcels_wilaya ON agricultural_parcels (wilaya_code);

-- جدول السلاسل الزمنية لمؤشرات الأقمار الصناعية (Hypertable)
CREATE TABLE satellite_spectral_logs (
    parcel_id UUID REFERENCES agricultural_parcels(id),
    observation_time TIMESTAMPTZ NOT NULL,
    satellite_mission VARCHAR(20) NOT NULL,
    ndvi_mean NUMERIC(5, 4),
    ndwi_mean NUMERIC(5, 4),
    evi_mean NUMERIC(5, 4),
    savi_mean NUMERIC(5, 4),
    lst_surface_temp_c NUMERIC(5, 2),
    cloud_cover_pct NUMERIC(5, 2),
    PRIMARY KEY (parcel_id, observation_time)
);

SELECT create_hypertable('satellite_spectral_logs', 'observation_time');`}</pre>
            </div>

            {sqlQueryResult && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 dir-ltr">
                <span className="text-cyan-400 block mb-1">// مخرجات تنفيذ الاستعلام الجغرافي:</span>
                <pre>{sqlQueryResult}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedSubTab === 'ROADMAP' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">المرحلة الأولى: 0 - 6 أشهر</span>
              <h4 className="font-bold text-white text-sm">نموذج الإثبات والمعايرة (MVP)</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                نشر المنظومة في 3 أقطاب متباينة: سطيف (الحبوب والقمح الصلب)، بسكرة (الواحات والنخيل)، والوادي (الرشاش المحوري والبطاطس). تدريب 1,500 مرشد فلاحي وتحقيق دقة مطابقة تتجاوز 93%.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">المرحلة الثانية: 6 - 12 شهراً</span>
              <h4 className="font-bold text-white text-sm">الذكاء التوجيهي وتوقّع المحصول</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                التوسع إلى 12 ولاية فلاحية رئيسية (تيارت، معسكر، البليدة، عين الدفلى، قالمة، باتنة، المنيعة، تقرت). ربط التنبؤ بالإنتاجية مع OAIC وخفض استهلاك المياه الجوفية بنسبة 25%.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">المرحلة الثالثة: 12 - 24 شهراً</span>
              <h4 className="font-bold text-white text-sm">التغطية الوطنية الشاملة والربط</h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                تغطية الـ 58 ولاية كاملة، والربط التلقائي عبر APIs مع بنك BADR، ديوان OAIC، وصندوق CNMA للتأمين الفلاحي، ودمج سواتل الوكالة الفضائية الجزائرية Alsat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
