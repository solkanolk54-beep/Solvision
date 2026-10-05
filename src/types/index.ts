export type CropType = 
  | 'WHEAT_DURUM'     // قمح صلب (سيميتو / بوراك / محمد بن بشير)
  | 'BARLEY'          // شعير علفي
  | 'POTATO'          // بطاطس (سبونتا)
  | 'DATE_PALM'       // نخيل دقلة نور
  | 'CITRUS'          // حمضيات المتيجة
  | 'CANOLA'          // سلجم زيتي (كولزا)
  | 'CHICKPEAS'       // حمص وبقوليات جافة
  | 'MAIZE_FODDER'    // ذرة صفراء علفية
  | 'FALLOW';         // أرض بور

export type VerificationStatus = 
  | 'VERIFIED_COMPLIANT'
  | 'SURFACE_OVERESTIMATION'
  | 'FALLOW_DECLARED_ACTIVE'
  | 'SEVERE_WATER_STRESS'
  | 'CROP_MISMATCH';

export type IrrigationType = 
  | 'CENTER_PIVOT'    // رشاش محوري
  | 'DRIP'            // سقي بالتقطير
  | 'COMPLEMENTARY'   // سقي تكميلي
  | 'RAINFED'         // بعلي مطري
  | 'GRAVITY';        // سقي بالجاذبية (سواقي)

export interface SpectralPoint {
  date: string;
  ndvi: number;
  ndwi: number;
  savi: number;
  expectedNdvi: number;
}

export interface Parcel {
  id: string;
  code: string;
  farmerName: string;
  farmerNationalId: string;
  phone: string;
  wilayaCode: number;
  wilayaNameAr: string;
  wilayaNameFr: string;
  commune: string;
  zoneType: 'HIGHLANDS' | 'SAHARA' | 'COASTAL_PLAINS';
  declaredCrop: CropType;
  cropNameAr: string;
  declaredAreaHa: number;
  calculatedAreaHa: number;
  sowingDate: string;
  harvestEstimatedDate: string;
  irrigationSystem: IrrigationType;
  
  // Coordinates and polygon representation
  centerLat: number;
  centerLng: number;
  polygonSvgPath: string; // for high-res GIS projection
  
  // Soil & Hydrology
  soilTypeAr: string;
  soilPh: number;
  soilSalinityEce: number; // dS/m
  organicMatterPct: number;
  wellDepthM: number;
  waterSalinityGL: number; // g/L
  
  // Satellite Spectral Observation (Sentinel-2 & Landsat-9)
  spectral: {
    ndviCurrent: number;
    ndwiCurrent: number;
    eviCurrent: number;
    saviCurrent: number;
    lstSurfaceTempC: number;
    cloudCoverPct: number;
    lastObservationTime: string;
    satelliteMission: 'Sentinel-2A' | 'Sentinel-2B' | 'Landsat-9';
  };
  
  // Automated Discrepancy & Verification
  verificationStatus: VerificationStatus;
  verificationFlagText: string;
  discrepancySeverity: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL';
  areaDeltaPct: number;
  spectralCorrelation: number; // 0 to 1
  
  // Institutional Impacts
  badrLoanStatus: 'RELEASED_AUTOMATIC' | 'FROZEN_SUSPECTED_FRAUD' | 'UNDER_REVIEW';
  subsidiesSavedDzd: number; // Algerian Dinars
  oaicSiloAllocated: string;
  predictedYieldQHa: number; // Quintals / Hectare
  predictedTotalProductionTons: number;
  confidenceInterval95: [number, number];
  
  timeseries: SpectralPoint[];
}

export interface EarlyWarningAlert {
  id: string;
  title: string;
  hazardType: 'YELLOW_RUST' | 'POTATO_BLIGHT' | 'SIROCCO_HEATWAVE' | 'FROST';
  regionAr: string;
  wilayasAffected: string[];
  severity: 'WARNING' | 'CRITICAL';
  actionDirectiveAr: string;
  timestamp: string;
}

export interface SiloCapacity {
  id: string;
  wilaya: string;
  siloName: string;
  totalCapacityTons: number;
  currentReservedTons: number;
  predictedInflowTons: number;
  status: 'OPTIMAL' | 'NEAR_CAPACITY' | 'CRITICAL_CONGESTION';
}
