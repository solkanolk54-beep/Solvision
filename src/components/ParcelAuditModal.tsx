import React, { useState } from 'react';
import { Parcel, CropType, IrrigationType } from '../types';
import { X, Satellite, CheckCircle, AlertTriangle, Plus, MapPin } from 'lucide-react';

interface ParcelAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParcel: (newParcel: Parcel) => void;
}

export const ParcelAuditModal: React.FC<ParcelAuditModalProps> = ({
  isOpen,
  onClose,
  onAddParcel,
}) => {
  const [farmerName, setFarmerName] = useState<string>('مستثمرة الفجر الذهبي');
  const [wilaya, setWilaya] = useState<string>('سطيف');
  const [commune, setCommune] = useState<string>('قجال');
  const [crop, setCrop] = useState<CropType>('WHEAT_DURUM');
  const [declaredArea, setDeclaredArea] = useState<number>(55);
  const [calculatedArea, setCalculatedArea] = useState<number>(38); // simulate difference
  const [irrigation, setIrrigation] = useState<IrrigationType>('COMPLEMENTARY');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const areaDelta = Math.abs(declaredArea - calculatedArea) / declaredArea;
    const isOverestimated = areaDelta > 0.15;

    const newParcel: Parcel = {
      id: `p-${Date.now()}`,
      code: `DZ-${Math.floor(10 + Math.random() * 80)}-${Date.now().toString().slice(-4)}`,
      farmerName,
      farmerNationalId: `1985${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      phone: '0661 ' + Math.floor(10 + Math.random() * 89) + ' ' + Math.floor(10 + Math.random() * 89) + ' ' + Math.floor(10 + Math.random() * 89),
      wilayaCode: 19,
      wilayaNameAr: wilaya,
      wilayaNameFr: wilaya,
      commune,
      zoneType: 'HIGHLANDS',
      declaredCrop: crop,
      cropNameAr: crop === 'WHEAT_DURUM' ? 'قمح صلب (سيميتو)' : crop === 'POTATO' ? 'بطاطس شتوية' : 'محصول مدعوم',
      declaredAreaHa: declaredArea,
      calculatedAreaHa: calculatedArea,
      sowingDate: '2025-11-25',
      harvestEstimatedDate: '2026-06-25',
      irrigationSystem: irrigation,
      centerLat: 36.12,
      centerLng: 5.55,
      polygonSvgPath: 'M 350 210 L 400 200 L 415 250 L 360 260 Z',
      soilTypeAr: 'طميية كلسية للهضاب العليا',
      soilPh: 7.8,
      soilSalinityEce: 1.4,
      organicMatterPct: 1.8,
      wellDepthM: 70,
      waterSalinityGL: 0.9,
      spectral: {
        ndviCurrent: isOverestimated ? 0.35 : 0.74,
        ndwiCurrent: 0.18,
        eviCurrent: 0.68,
        saviCurrent: 0.71,
        lstSurfaceTempC: 25.4,
        cloudCoverPct: 1.1,
        lastObservationTime: 'الآن (Sentinel-2B Pass)',
        satelliteMission: 'Sentinel-2B',
      },
      verificationStatus: isOverestimated ? 'SURFACE_OVERESTIMATION' : 'VERIFIED_COMPLIANT',
      verificationFlagText: isOverestimated
        ? `تضخيم في المساحة بنسبة ${(areaDelta * 100).toFixed(1)}%: مصرح ${declaredArea}ha بينما مساحة المضلع الفعلي ${calculatedArea}ha`
        : 'المحصول والمساحة متطابقان تماماً مع قياسات Sentinel-2',
      discrepancySeverity: isOverestimated ? 'HIGH' : 'NONE',
      areaDeltaPct: Number((areaDelta * 100).toFixed(1)),
      spectralCorrelation: isOverestimated ? 0.61 : 0.95,
      badrLoanStatus: isOverestimated ? 'UNDER_REVIEW' : 'RELEASED_AUTOMATIC',
      subsidiesSavedDzd: isOverestimated ? 950000 : 0,
      oaicSiloAllocated: 'صومعة العلمة المركزية (OAIC)',
      predictedYieldQHa: isOverestimated ? 18.0 : 48.0,
      predictedTotalProductionTons: isOverestimated ? 68.4 : 182.4,
      confidenceInterval95: isOverestimated ? [15.0, 21.0] : [45.0, 51.0],
      timeseries: [
        { date: 'Nov', ndvi: 0.12, ndwi: -0.22, savi: 0.13, expectedNdvi: 0.12 },
        { date: 'Dec', ndvi: 0.24, ndwi: -0.10, savi: 0.25, expectedNdvi: 0.22 },
        { date: 'Jan', ndvi: 0.42, ndwi: 0.05, savi: 0.43, expectedNdvi: 0.40 },
        { date: 'Feb', ndvi: isOverestimated ? 0.44 : 0.62, ndwi: 0.12, savi: 0.59, expectedNdvi: 0.60 },
        { date: 'Mar', ndvi: isOverestimated ? 0.38 : 0.74, ndwi: 0.18, savi: 0.71, expectedNdvi: 0.74 },
      ],
    };

    onAddParcel(newParcel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 text-slate-100 text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Satellite className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">إدخال وتدقيق مستثمرة فلاحية جديدة</h3>
              <p className="text-[11px] text-slate-400">المطابقة اللحظية بين التصريح ومضلع الأقمار الصناعية PostGIS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">اسم المستغل / الشركة:</label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">الولاية:</label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              >
                <option value="سطيف">سطيف</option>
                <option value="الوادي">الوادي</option>
                <option value="بسكرة">بسكرة</option>
                <option value="تيارت">تيارت</option>
                <option value="البليدة">البليدة</option>
                <option value="المنيعة">المنيعة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">المحصول المصرح به:</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              >
                <option value="WHEAT_DURUM">قمح صلب (سيميتو)</option>
                <option value="POTATO">بطاطس شتوية</option>
                <option value="BARLEY">شعير علفي</option>
                <option value="CANOLA">سلجم زيتي (كولزا)</option>
                <option value="DATE_PALM">نخيل دقلة نور</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">نظام الري:</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value as IrrigationType)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              >
                <option value="COMPLEMENTARY">سقي تكميلي</option>
                <option value="CENTER_PIVOT">رشاش محوري</option>
                <option value="DRIP">تقطير</option>
                <option value="RAINFED">بعلي مطري</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">المساحة المصرح بها (هكتار):</label>
              <input
                type="number"
                value={declaredArea}
                onChange={(e) => setDeclaredArea(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 font-mono text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">المساحة المحسوبة من المضلع (PostGIS):</label>
              <input
                type="number"
                value={calculatedArea}
                onChange={(e) => setCalculatedArea(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 font-mono text-emerald-400 font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            سيقوم محرك SolVision فورياً باقتطاع مشهد قمر Sentinel-2 ومقارنة المنحنى الفينولوجي وحساب نسبة التفاوت لتحديث استحقاق قروض بنك BADR وصوامع OAIC.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md"
            >
              تشغيل المطابقة وإضافة الحقل للخريطة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
