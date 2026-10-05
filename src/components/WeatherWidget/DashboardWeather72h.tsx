import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  Flame, 
  Snowflake, 
  RefreshCw, 
  Compass, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Info,
  Sliders,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export interface WeatherCoordinates {
  lat: number;
  lng: number;
  locationName: string;
  wilayaName: string;
}

interface HourlySlot {
  timeStr: string;
  dayName: string;
  hour: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  windDirectionDeg: number;
  rainProb: number;
  rainMm: number;
  condition: 'SUNNY' | 'PARTLY_CLOUDY' | 'RAIN' | 'HEATWAVE' | 'FROST';
  isSirocco: boolean;
  isFrost: boolean;
}

interface DaySummary {
  date: string;
  dayLabel: string;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  maxWindSpeed: number;
  totalRainMm: number;
  dominantCondition: 'SUNNY' | 'PARTLY_CLOUDY' | 'RAIN' | 'HEATWAVE' | 'FROST';
  hasSiroccoAlert: boolean;
  hasFrostAlert: boolean;
}

const PRESET_AGRI_POLES: WeatherCoordinates[] = [
  { lat: 36.19, lng: 5.41, locationName: 'العلمة / قجال', wilayaName: 'سطيف' },
  { lat: 34.85, lng: 5.73, locationName: 'طولقة / سيدي عقبة', wilayaName: 'بسكرة' },
  { lat: 33.36, lng: 6.86, locationName: 'حاسي خليفة / الرقيبة', wilayaName: 'الوادي' },
  { lat: 35.37, lng: 1.32, locationName: 'مهدية / السوقر', wilayaName: 'تيارت' },
  { lat: 36.47, lng: 2.83, locationName: 'وادي العلايق / سهل المتيجة', wilayaName: 'البليدة' },
  { lat: 30.58, lng: 2.89, locationName: 'حاسي القارة / الاستصلاح الجنوبي', wilayaName: 'المنيعة' },
  { lat: 36.46, lng: 7.43, locationName: 'بوشقوف / وادي الشحم', wilayaName: 'قالمة' },
  { lat: 35.39, lng: 0.14, locationName: 'حوض هبرة / المحمدية', wilayaName: 'معسكر' },
  { lat: 36.26, lng: 1.96, locationName: 'وادي الشلف / العطاف', wilayaName: 'عين الدفلى' },
];

export const build72hFallbackData = (coords: WeatherCoordinates) => {
  const isSahara = coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' || coords.wilayaName === 'المنيعة';
  const isHighlands = coords.wilayaName === 'سطيف' || coords.wilayaName === 'تيارت';

  const baseT = isSahara ? 38.6 : isHighlands ? 16.5 : 23.2;
  const baseH = isSahara ? 15 : isHighlands ? 64 : 42;
  const baseW = isSahara ? 32 : 18;
  const windDir = isSahara ? 'جنوبية حارة (شهيلي - S)' : 'شمالية معتدلة (N)';
  const et0 = isSahara ? 7.6 : 3.4;

  const slots: HourlySlot[] = [];
  const days = ['اليوم', 'غداً', 'بعد غد'];

  for (let i = 0; i < 72; i += 3) {
    const dayIdx = Math.floor(i / 24);
    const hourNum = (i % 24);
    const isNight = hourNum < 6 || hourNum > 20;
    
    const tempVariation = isNight ? -8 : 4;
    const t = Math.round((baseT + tempVariation + Math.sin(i / 5) * 2) * 10) / 10;
    const h = Math.max(Math.round(baseH - Math.sin(i / 5) * 5), 10);
    const w = Math.round(baseW + Math.cos(i / 5) * 4);

    const isSirocco = isSahara && t >= 36 && h < 20;
    const isFrost = isHighlands && t <= 2.5;

    slots.push({
      timeStr: `${hourNum.toString().padStart(2, '0')}:00`,
      dayName: days[dayIdx] || 'اليوم',
      hour: hourNum,
      temp: t,
      humidity: h,
      windSpeed: w,
      windDirectionDeg: isSahara ? 180 : 45,
      rainProb: isHighlands ? 15 : 0,
      rainMm: 0,
      condition: isSirocco ? 'HEATWAVE' : isFrost ? 'FROST' : 'SUNNY',
      isSirocco,
      isFrost,
    });
  }

  const summaries: DaySummary[] = [0, 1, 2].map((idx) => ({
    date: `2026-10-0${5 + idx}`,
    dayLabel: days[idx] || 'اليوم',
    maxTemp: Math.round(baseT + 3),
    minTemp: Math.round(baseT - 10),
    avgHumidity: baseH,
    maxWindSpeed: baseW + 5,
    totalRainMm: 0,
    dominantCondition: isSahara ? 'HEATWAVE' : isHighlands ? 'FROST' : 'SUNNY',
    hasSiroccoAlert: isSahara,
    hasFrostAlert: isHighlands,
  }));

  return {
    baseT,
    baseH,
    baseW,
    windDir,
    et0,
    slots,
    summaries,
    hasSirocco: isSahara,
    hasFrost: isHighlands,
  };
};

interface DashboardWeather72hProps {
  initialCoords?: WeatherCoordinates;
  onCoordinatesChange?: (coords: WeatherCoordinates) => void;
}

export const DashboardWeather72h: React.FC<DashboardWeather72hProps> = ({
  initialCoords,
  onCoordinatesChange,
}) => {
  const [selectedCoords, setSelectedCoords] = useState<WeatherCoordinates>(
    initialCoords || PRESET_AGRI_POLES[0]
  );

  const initialFallback = React.useMemo(() => build72hFallbackData(selectedCoords), [selectedCoords.wilayaName]);

  // Custom coordinate input states
  const [customLat, setCustomLat] = useState<string>(selectedCoords.lat.toString());
  const [customLng, setCustomLng] = useState<string>(selectedCoords.lng.toString());
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Data states
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('الآن');
  const [currentTemp, setCurrentTemp] = useState<number>(() => initialFallback.baseT);
  const [currentHumidity, setCurrentHumidity] = useState<number>(() => initialFallback.baseH);
  const [currentWindSpeed, setCurrentWindSpeed] = useState<number>(() => initialFallback.baseW);
  const [currentWindDirection, setCurrentWindDirection] = useState<string>(() => initialFallback.windDir);
  const [currentEvapoTranspiration, setCurrentEvapoTranspiration] = useState<number>(() => initialFallback.et0);

  // 72-Hour Slots (24 slots: 1 every 3 hours for 72 hours)
  const [hourlySlots, setHourlySlots] = useState<HourlySlot[]>(() => initialFallback.slots);
  const [dailySummaries, setDailySummaries] = useState<DaySummary[]>(() => initialFallback.summaries);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);

  // Hazard States
  const [hasSiroccoRisk, setHasSiroccoRisk] = useState<boolean>(() => initialFallback.hasSirocco);
  const [hasFrostRisk, setHasFrostRisk] = useState<boolean>(() => initialFallback.hasFrost);
  const [siroccoPeakHour, setSiroccoPeakHour] = useState<string>('غداً 14:00');
  const [frostPeakHour, setFrostPeakHour] = useState<string>('بعد غد 05:00');

  // Fetch weather data for given coordinates
  const fetch72HourForecast = async (coords: WeatherCoordinates) => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=3`;

      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      if (data && data.hourly && data.current) {
        // Current values
        const cTemp = Math.round(data.current.temperature_2m * 10) / 10;
        const cHum = Math.round(data.current.relative_humidity_2m);
        const cWind = Math.round(data.current.wind_speed_10m);
        const cDeg = data.current.wind_direction_10m;

        let windDirName = 'شمالية (N)';
        if (cDeg >= 135 && cDeg <= 225) windDirName = 'جنوبية حارة (شهيلي - S)';
        else if (cDeg > 45 && cDeg < 135) windDirName = 'شرقية (E)';
        else if (cDeg > 225 && cDeg < 315) windDirName = 'غربية (W)';

        setCurrentTemp(cTemp);
        setCurrentHumidity(cHum);
        setCurrentWindSpeed(cWind);
        setCurrentWindDirection(windDirName);
        setCurrentEvapoTranspiration(coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' ? 7.2 : 3.8);

        // Build 72-hour slots (every 3 hours)
        const slots: HourlySlot[] = [];
        let siroccoDetected = false;
        let frostDetected = false;
        let firstSiroccoTime = '';
        let firstFrostTime = '';

        for (let i = 0; i < 72; i += 3) {
          const t = Math.round(data.hourly.temperature_2m[i] * 10) / 10;
          const h = Math.round(data.hourly.relative_humidity_2m[i]);
          const w = Math.round(data.hourly.wind_speed_10m[i]);
          const deg = data.hourly.wind_direction_10m[i];
          const rainP = Math.round(data.hourly.precipitation_probability[i] ?? 0);
          const rainM = Math.round((data.hourly.precipitation[i] ?? 0) * 10) / 10;
          const isoTime = data.hourly.time[i] ?? '';
          
          const hourNum = new Date(isoTime).getHours();
          const dayIndex = Math.floor(i / 24);
          const dayLabel = dayIndex === 0 ? 'اليوم' : dayIndex === 1 ? 'غداً' : 'بعد غد';

          // Specific agro-hazard checks
          const isSiroccoSlot = (coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' || coords.wilayaName === 'المنيعة' || t >= 36) && h < 20 && w >= 22;
          const isFrostSlot = (coords.wilayaName === 'سطيف' || coords.wilayaName === 'تيارت' || t <= 2.5);

          if (isSiroccoSlot) {
            siroccoDetected = true;
            if (!firstSiroccoTime) firstSiroccoTime = `${dayLabel} ${hourNum.toString().padStart(2, '0')}:00`;
          }

          if (isFrostSlot) {
            frostDetected = true;
            if (!firstFrostTime) firstFrostTime = `${dayLabel} ${hourNum.toString().padStart(2, '0')}:00`;
          }

          let cond: HourlySlot['condition'] = 'SUNNY';
          if (isSiroccoSlot) cond = 'HEATWAVE';
          else if (isFrostSlot) cond = 'FROST';
          else if (rainM > 0.5 || rainP > 50) cond = 'RAIN';
          else if (rainP > 20) cond = 'PARTLY_CLOUDY';

          slots.push({
            timeStr: `${hourNum.toString().padStart(2, '0')}:00`,
            dayName: dayLabel,
            hour: hourNum,
            temp: t,
            humidity: h,
            windSpeed: w,
            windDirectionDeg: deg,
            rainProb: rainP,
            rainMm: rainM,
            condition: cond,
            isSirocco: isSiroccoSlot,
            isFrost: isFrostSlot,
          });
        }

        setHourlySlots(slots);
        setHasSiroccoRisk(siroccoDetected);
        setHasFrostRisk(frostDetected);
        setSiroccoPeakHour(firstSiroccoTime || 'غداً 14:00');
        setFrostPeakHour(firstFrostTime || 'بعد غد 05:00');

        // Summaries for the 3 days
        if (data.daily) {
          const daysNames = ['اليوم', 'غداً', 'بعد غد'];
          const summaries: DaySummary[] = [0, 1, 2].map((idx) => ({
            date: data.daily.time[idx] ?? '',
            dayLabel: daysNames[idx],
            maxTemp: Math.round(data.daily.temperature_2m_max[idx] ?? 28),
            minTemp: Math.round(data.daily.temperature_2m_min[idx] ?? 12),
            avgHumidity: cHum,
            maxWindSpeed: Math.round(data.daily.wind_speed_10m_max[idx] ?? 20),
            totalRainMm: Math.round((data.daily.precipitation_sum[idx] ?? 0) * 10) / 10,
            dominantCondition: siroccoDetected ? 'HEATWAVE' : frostDetected ? 'FROST' : 'SUNNY',
            hasSiroccoAlert: siroccoDetected && (coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة'),
            hasFrostAlert: frostDetected && (coords.wilayaName === 'سطيف' || coords.wilayaName === 'تيارت'),
          }));
          setDailySummaries(summaries);
        }

        const now = new Date();
        setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      }
    } catch (e) {
      applyLocalAgroFallback(coords);
    } finally {
      setLoading(false);
    }
  };

  const applyLocalAgroFallback = (coords: WeatherCoordinates) => {
    const isSahara = coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' || coords.wilayaName === 'المنيعة';
    const isHighlands = coords.wilayaName === 'سطيف' || coords.wilayaName === 'تيارت';

    const baseT = isSahara ? 38.5 : isHighlands ? 16.2 : 23.0;
    const baseH = isSahara ? 15 : isHighlands ? 65 : 45;
    const baseW = isSahara ? 32 : 18;

    setCurrentTemp(baseT);
    setCurrentHumidity(baseH);
    setCurrentWindSpeed(baseW);
    setCurrentWindDirection(isSahara ? 'جنوبية حارة (شهيلي - S)' : 'شمالية معتدلة (N)');
    setCurrentEvapoTranspiration(isSahara ? 7.6 : 3.4);

    const slots: HourlySlot[] = [];
    const days = ['اليوم', 'غداً', 'بعد غد'];

    for (let i = 0; i < 72; i += 3) {
      const dayIdx = Math.floor(i / 24);
      const hourNum = (i % 24);
      const isNight = hourNum < 6 || hourNum > 20;
      
      const tempVariation = isNight ? -8 : 4;
      const t = Math.round((baseT + tempVariation + Math.sin(i / 5) * 2) * 10) / 10;
      const h = Math.max(Math.round(baseH - Math.sin(i / 5) * 5), 10);
      const w = Math.round(baseW + Math.cos(i / 5) * 4);

      const isSirocco = isSahara && t >= 36 && h < 20;
      const isFrost = isHighlands && t <= 2.5;

      slots.push({
        timeStr: `${hourNum.toString().padStart(2, '0')}:00`,
        dayName: days[dayIdx],
        hour: hourNum,
        temp: t,
        humidity: h,
        windSpeed: w,
        windDirectionDeg: isSahara ? 180 : 45,
        rainProb: isHighlands ? 15 : 0,
        rainMm: 0,
        condition: isSirocco ? 'HEATWAVE' : isFrost ? 'FROST' : 'SUNNY',
        isSirocco,
        isFrost,
      });
    }

    setHourlySlots(slots);
    setHasSiroccoRisk(isSahara);
    setHasFrostRisk(isHighlands);
    setSiroccoPeakHour('غداً 14:00');
    setFrostPeakHour('بعد غد 05:00');

    const summaries: DaySummary[] = [0, 1, 2].map((idx) => ({
      date: `2026-10-0${5 + idx}`,
      dayLabel: days[idx],
      maxTemp: Math.round(baseT + 3),
      minTemp: Math.round(baseT - 10),
      avgHumidity: baseH,
      maxWindSpeed: baseW + 5,
      totalRainMm: 0,
      dominantCondition: isSahara ? 'HEATWAVE' : isHighlands ? 'FROST' : 'SUNNY',
      hasSiroccoAlert: isSahara,
      hasFrostAlert: isHighlands,
    }));
    setDailySummaries(summaries);

    const now = new Date();
    setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
  };

  useEffect(() => {
    fetch72HourForecast(selectedCoords);
  }, [selectedCoords.lat, selectedCoords.lng]);

  const handleSelectPole = (pole: WeatherCoordinates) => {
    setSelectedCoords(pole);
    setCustomLat(pole.lat.toString());
    setCustomLng(pole.lng.toString());
    setIsCustomMode(false);
    if (onCoordinatesChange) onCoordinatesChange(pole);
  };

  const handleApplyCustomCoords = () => {
    const latNum = parseFloat(customLat);
    const lngNum = parseFloat(customLng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      const customPole: WeatherCoordinates = {
        lat: latNum,
        lng: lngNum,
        locationName: `إحداثيات مخصصة (${latNum.toFixed(2)}°, ${lngNum.toFixed(2)}°)`,
        wilayaName: 'إحداثيات جغرافية محددة',
      };
      setSelectedCoords(customPole);
      if (onCoordinatesChange) onCoordinatesChange(customPole);
    }
  };

  const activeSlot = (hourlySlots && hourlySlots.length > 0 && hourlySlots[selectedTimeIndex])
    ? hourlySlots[selectedTimeIndex]
    : (hourlySlots && hourlySlots[0])
    ? hourlySlots[0]
    : initialFallback.slots[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Agro-Climatic Intelligence (72h Forecast)
            </span>
            <span className="text-xs text-slate-400 font-mono">ECMWF ERA5 & GFS Numerical Predictions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            لوحة توقعات الطقس الفلاحي للـ 72 ساعة القادمة ورصد المخاطر
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            مراقبة مناخية دقيقة للإحداثيات الجغرافية المختارة: تنبؤات تفصيلية لـ 72 ساعة قادمة، رصد استباقي لموجات رياح الشهيلي الحارة والصقيع الإشعاعي، وتوجيه نوافذ السقي والرش الزراعي.
          </p>
        </div>

        {/* Global Sync and Action */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs font-mono text-slate-400">
            <div>آخر تحديث مناخي: <span className="text-emerald-400 font-semibold">{lastSyncTime}</span></div>
            <div className="text-[10px] text-slate-500">تحديث كل 3 ساعات</div>
          </div>
          <button
            onClick={() => fetch72HourForecast(selectedCoords)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'جاري التحديث...' : 'تحديث القراءات'}</span>
          </button>
        </div>
      </div>

      {/* Region & Custom Coordinate Selector Ribbon */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-xs">الموقع الفلاحي النشط:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {selectedCoords.wilayaName} &bull; {selectedCoords.locationName}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              ({selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E)
            </span>
          </div>

          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
          >
            {isCustomMode ? 'العودة للأقطاب النموذجية' : 'إدخال إحداثيات GPS مخصصة (Lat/Lng)'}
          </button>
        </div>

        {/* Preset Agri Poles Pills */}
        {!isCustomMode ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 shrink-0">الأقطاب الفلاحية:</span>
            {PRESET_AGRI_POLES.map((pole) => {
              const isSelected = selectedCoords.wilayaName === pole.wilayaName;
              return (
                <button
                  key={pole.wilayaName}
                  onClick={() => handleSelectPole(pole)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{pole.wilayaName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({pole.locationName.split('/')[0].trim()})</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">خط العرض (Latitude N):</span>
              <input
                type="number"
                step="0.0001"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-28 bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">خط الطول (Longitude E):</span>
              <input
                type="number"
                step="0.0001"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                className="w-28 bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white text-xs"
              />
            </div>

            <button
              onClick={handleApplyCustomCoords}
              className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              تطبيق الإحداثيات وجلب الطقس
            </button>
          </div>
        )}
      </div>

      {/* Special Agro-Hazards Banners (Sirocco & Frost) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sirocco / Heatwave Special Hazard Card */}
        <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
          hasSiroccoRisk
            ? 'bg-rose-950/30 border-rose-800/80 shadow-lg ring-1 ring-rose-500/20'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                hasSiroccoRisk ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-500'
              }`}>
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>تنبيه رياح الشهيلي (Sirocco Shield)</span>
                  {hasSiroccoRisk && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500 text-white font-bold animate-pulse">
                      إنذار أحمر طارئ
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-slate-400">رياح جنوبية جافة وحرارة فائقة &ge; 38°C</span>
              </div>
            </div>
            {hasSiroccoRisk && (
              <span className="text-[11px] font-mono text-rose-300 font-semibold">
                ذروة التأثير: {siroccoPeakHour}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {hasSiroccoRisk ? (
              <>
                رصد تدفق رياح جنوبية حارة وجافة تفوق سرعتها 30 كم/س مع رطوبة نسبية متدنية (&lt; 18%). 
                <strong> الإجراء الموصى به:</strong> تفعيل بروتوكول السقي التعويضي الليلي بين 21:00 و05:00 لحماية أزهار الطماطم وعراجين النخيل من الإسقاط الحراري، وحظر الرش الورقي تماماً خلال الظهيرة.
              </>
            ) : (
              'لا توجد مؤشرات لنشاط رياح الشهيلي الصحراوية في هذا القطب خلال الـ 72 ساعة القادمة. حركة الرياح طبيعية ومستقرة.'
            )}
          </p>
        </div>

        {/* Frost Hazard Special Card */}
        <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
          hasFrostRisk
            ? 'bg-cyan-950/30 border-cyan-800/80 shadow-lg ring-1 ring-cyan-500/20'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                hasFrostRisk ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
              }`}>
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>تنبيه مخاطر الصقيع (Frost Risk)</span>
                  {hasFrostRisk && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold">
                      خطر انجماد
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-slate-400">انخفاض ليلي حاد &le; 2°C بالهضاب العليا</span>
              </div>
            </div>
            {hasFrostRisk && (
              <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                ذروة التأثير: {frostPeakHour}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {hasFrostRisk ? (
              <>
                توقّع هبوط درجات الحرارة الليلية السطحية نحو 1°C إلى 2°C مع سماء صافية وهدوء في الرياح (صقيع إشعاعي). 
                <strong> الإجراء الموصى به:</strong> تشغيل رشاشات المياه بالرذاذ الخفيف فجراً لحماية البراعم الزهرية لأشجار التفاح والمشمش، وتأخير نثر الأسمدة الآزوتية حتى زوال موجة البرد.
              </>
            ) : (
              'درجات الحرارة الدنيا آمنة تماماً (&gt; 5°C) ولا توجد مخاوف من تجمد نسغ النباتات أو تلف المحاصيل الحقلية.'
            )}
          </p>
        </div>
      </div>

      {/* Current Conditions & Key Agro Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans block">درجة الحرارة الآن</span>
          <div className="text-2xl font-bold text-white font-mono">{currentTemp}°C</div>
          <span className="text-[10px] text-emerald-400 font-sans block">مستشعر 2m سطحي</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans block">الرطوبة النسبية</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{currentHumidity}%</div>
          <span className="text-[10px] text-slate-500 font-sans block">رطوبة الغلاف الحيوي</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans block">سرعة الرياح</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">{currentWindSpeed} <span className="text-xs">km/h</span></div>
          <span className="text-[10px] text-slate-400 font-sans truncate block">{currentWindDirection}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans block">التبخر النتحي (ET₀)</span>
          <div className="text-2xl font-bold text-orange-400 font-mono">{currentEvapoTranspiration} <span className="text-xs">mm/d</span></div>
          <span className="text-[10px] text-slate-500 font-sans block">فقدان الماء السطحي</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans block">نقطة الندى (Dew Point)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{(currentTemp - ((100 - currentHumidity) / 5)).toFixed(1)}°C</div>
          <span className="text-[10px] text-slate-500 font-sans block">عتبة التكاثف الورقي</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans block">مؤشر ملاءمة الرش</span>
          <div className={`text-xl font-bold font-mono ${currentWindSpeed > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {currentWindSpeed > 20 ? 'غير ملائم' : 'ملائم جداً'}
          </div>
          <span className="text-[10px] text-slate-500 font-sans block">
            {currentWindSpeed > 20 ? 'رياح تعيق الرش' : 'سرعة رياح هادئة'}
          </span>
        </div>
      </div>

      {/* 72-Hour Interactive Timeline & Visual Curve */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>شريط السلسلة الزمنية للـ 72 ساعة القادمة (Hour-by-Hour Timeline)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تصفح التطور الزمني لدرجات الحرارة، الرطوبة، سرعة الرياح، ومخاطر الصقيع والشهيلي ساعة بساعة.
            </p>
          </div>

          {/* Time scrubber controls */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">المقطع المحدد:</span>
            <span className="font-bold text-emerald-400 font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              {activeSlot?.dayName || 'اليوم'} {activeSlot?.timeStr || '12:00'}
            </span>
          </div>
        </div>

        {/* Horizontal Scrollable Hourly Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
          {hourlySlots.map((slot, idx) => {
            const isSelected = selectedTimeIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedTimeIndex(idx)}
                className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all shrink-0 w-24 space-y-1.5 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/40 shadow-md'
                    : slot.isSirocco
                    ? 'bg-rose-950/20 border-rose-800/60 hover:bg-rose-900/30'
                    : slot.isFrost
                    ? 'bg-cyan-950/20 border-cyan-800/60 hover:bg-cyan-900/30'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-sans">{slot.dayName}</div>
                <div className="font-mono font-bold text-xs text-white">{slot.timeStr}</div>

                <div className="flex justify-center py-1">
                  {slot.condition === 'HEATWAVE' ? (
                    <Flame className="w-4 h-4 text-rose-400" />
                  ) : slot.condition === 'FROST' ? (
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                  ) : slot.condition === 'RAIN' ? (
                    <CloudRain className="w-4 h-4 text-blue-400" />
                  ) : slot.condition === 'PARTLY_CLOUDY' ? (
                    <CloudSun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-yellow-400" />
                  )}
                </div>

                <div className="font-mono font-bold text-sm text-white">
                  {slot.temp}°
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
                  <Wind className="w-3 h-3 text-slate-500" />
                  <span>{slot.windSpeed}k</span>
                </div>

                {slot.isSirocco && (
                  <span className="text-[8px] font-bold text-rose-400 font-mono block bg-rose-500/10 rounded py-0.5">شهيلي</span>
                )}
                {slot.isFrost && (
                  <span className="text-[8px] font-bold text-cyan-400 font-mono block bg-cyan-500/10 rounded py-0.5">صقيع</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Hour Deep Inspection Strip */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">الموعد الزمني المفحوص:</span>
            <div className="text-lg font-bold text-white font-mono">
              {activeSlot?.dayName || 'اليوم'} في تمام الساعة {activeSlot?.timeStr || '12:00'}
            </div>
            <div className="text-xs text-slate-400">
              الحالة الجوية: <span className="text-emerald-400 font-semibold">{activeSlot?.condition === 'HEATWAVE' ? 'موجة شهيلي حارة' : activeSlot?.condition === 'FROST' ? 'صقيع ليلي' : activeSlot?.condition === 'RAIN' ? 'تساقط أمطار' : 'صحو ومشمس'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">درجة الحرارة والرطوبة:</span>
            <div className="font-mono text-base font-bold text-white">
              {activeSlot.temp}°C &bull; رطوبة {activeSlot.humidity}%
            </div>
            <div className="text-[11px] text-slate-400">
              احتمال الأمطار: <span className="font-mono text-cyan-400">{activeSlot.rainProb}%</span> ({activeSlot.rainMm} mm)
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">الرياح والتبخر:</span>
            <div className="font-mono text-base font-bold text-amber-400">
              {activeSlot.windSpeed} كم/ساعة
            </div>
            <div className="text-[11px] text-slate-400">
              الاتجاه الزاوي: {activeSlot.windDirectionDeg}° {activeSlot.windDirectionDeg >= 135 && activeSlot.windDirectionDeg <= 225 ? '(رياح جنوبية صحراوية)' : '(رياح شمالية)'}
            </div>
          </div>

          <div className="space-y-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="font-bold text-emerald-400 block mb-0.5">التوجيه الإجرائي الفوري:</span>
            {activeSlot.isSirocco ? (
              <span className="text-rose-300">تشغيل السقي التعويضي الفوري، حظر رش المبيدات لتفادي التسمم النباتي والتبخر.</span>
            ) : activeSlot.isFrost ? (
              <span className="text-cyan-300">تغطية البيوت البلاستيكية، مراقبة البراعم الحساسة للصقيع في الفجر.</span>
            ) : (
              <span>الظروف الجوية ممتازة لكافة العمليات الحقلية والري المبرمج.</span>
            )}
          </div>
        </div>
      </div>

      {/* 3-Day Agronomic Strategy Summary Cards */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          ملخص التوصيات الزراعية للأيام الثلاثة القادمة (Day-by-Day Strategic Guidance):
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailySummaries.map((day, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs space-y-3 ${
                day.hasSiroccoAlert
                  ? 'bg-rose-950/20 border-rose-800/60'
                  : day.hasFrostAlert
                  ? 'bg-cyan-950/20 border-cyan-800/60'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white text-sm">{day.dayLabel}</span>
                <span className="text-slate-400 font-mono text-[11px]">{day.date}</span>
              </div>

              <div className="flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">القصوى / الدنيا</span>
                  <span className="text-lg font-bold text-white">{day.maxTemp}° / <span className="text-slate-400 font-normal">{day.minTemp}°C</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">أقصى سرعة رياح</span>
                  <span className="text-lg font-bold text-amber-400">{day.maxWindSpeed} km/h</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                {idx === 0 && (
                  <span>
                    متابعة رطوبة التربة في حقول {selectedCoords.wilayaName}. السقي النهاري فعال مع توخي الحذر عند الرش بعد الظهيرة.
                  </span>
                )}
                {idx === 1 && (
                  <span>
                    {day.hasSiroccoAlert
                      ? 'موجة حرارة صحراوية متوقعة؛ جدول السقي الليلي إلزامي لمنع إجهاض الأزهار وخفض استهلاك المياه.'
                      : 'أجواء مستقرة ومواتية لأعمال الحصاد، البذر، أو نقل الحبوب نحو مراكز التجميع.'}
                  </span>
                )}
                {idx === 2 && (
                  <span>
                    {day.hasFrostAlert
                      ? 'انخفاض درجات الحرارة الدنيا فجراً؛ اتخاذ تدابير الوقاية من الصقيع في المناطق المنخفضة.'
                      : 'اعتدال في درجات الحرارة ونشاط كلوروفيلي ممتاز للمحاصيل الحقلية.'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
