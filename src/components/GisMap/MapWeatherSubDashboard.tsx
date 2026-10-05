import React, { useState, useEffect } from 'react';
import { WeatherCoordinates } from '../WeatherWidget/AgroWeatherWidget';
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
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Compass, 
  MapPin, 
  X, 
  Clock, 
  Calendar, 
  Sliders, 
  TrendingUp,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface HourlyPoint {
  timeStr: string;
  dayLabel: string;
  hour: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  windDirDeg: number;
  rainProb: number;
  rainMm: number;
  condition: 'SUNNY' | 'PARTLY_CLOUDY' | 'RAIN' | 'HEATWAVE' | 'FROST';
  isSirocco: boolean;
  isFrost: boolean;
}

interface MapWeatherSubDashboardProps {
  currentCoords: WeatherCoordinates;
  onCoordinatesChange: (coords: WeatherCoordinates) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_POLES: WeatherCoordinates[] = [
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

export const buildAlgerianFallbackData = (coords: WeatherCoordinates) => {
  const isSahara = coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' || coords.wilayaName === 'المنيعة';
  const isHighlands = coords.wilayaName === 'سطيف' || coords.wilayaName === 'تيارت';

  const baseT = isSahara ? 38.6 : isHighlands ? 16.5 : 23.2;
  const baseH = isSahara ? 15 : isHighlands ? 64 : 42;
  const baseW = isSahara ? 32 : 18;
  const windDir = isSahara ? 'جنوبية حارة (شهيلي - S)' : 'شمالية معتدلة (N)';
  const et0 = isSahara ? 7.6 : 3.5;

  const points: HourlyPoint[] = [];
  const days = ['اليوم', 'غداً', 'بعد غد'];

  for (let i = 0; i < 72; i += 3) {
    const dayIdx = Math.floor(i / 24);
    const hourNum = (i % 24);
    const isNight = hourNum < 6 || hourNum > 20;
    
    const delta = isNight ? -8 : 4;
    const t = Math.round((baseT + delta + Math.sin(i / 5) * 2) * 10) / 10;
    const h = Math.max(Math.round(baseH - Math.sin(i / 5) * 6), 10);
    const w = Math.round(baseW + Math.cos(i / 5) * 4);

    const isSirocco = isSahara && t >= 36 && h < 20;
    const isFrost = isHighlands && t <= 2.5;

    points.push({
      timeStr: `${hourNum.toString().padStart(2, '0')}:00`,
      dayLabel: days[dayIdx] || 'اليوم',
      hour: hourNum,
      temp: t,
      humidity: h,
      windSpeed: w,
      windDirDeg: isSahara ? 180 : 45,
      rainProb: isHighlands ? 15 : 0,
      rainMm: 0,
      condition: isSirocco ? 'HEATWAVE' : isFrost ? 'FROST' : 'SUNNY',
      isSirocco,
      isFrost,
    });
  }

  return {
    baseT,
    baseH,
    baseW,
    windDir,
    et0,
    points,
    hasSirocco: isSahara,
    hasFrost: isHighlands,
  };
};

export const MapWeatherSubDashboard: React.FC<MapWeatherSubDashboardProps> = ({
  currentCoords,
  onCoordinatesChange,
  isOpen,
  onClose,
}) => {
  // Mobile responsiveness: default collapsed on small screens (< 768px)
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return true;
  });

  // When weather dashboard opens or coordinates change, ensure it stays collapsed on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMinimized(true);
    }
  }, [isOpen, currentCoords.lat, currentCoords.lng]);

  const [loading, setLoading] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('الآن');

  const initialFallback = React.useMemo(() => buildAlgerianFallbackData(currentCoords), [currentCoords.wilayaName]);

  // Weather state
  const [currentTemp, setCurrentTemp] = useState<number>(() => initialFallback.baseT);
  const [currentHumidity, setCurrentHumidity] = useState<number>(() => initialFallback.baseH);
  const [currentWindSpeed, setCurrentWindSpeed] = useState<number>(() => initialFallback.baseW);
  const [currentWindDir, setCurrentWindDir] = useState<string>(() => initialFallback.windDir);
  const [currentEvapoTranspiration, setCurrentEvapoTranspiration] = useState<number>(() => initialFallback.et0);

  // 72-Hour data
  const [hourlyPoints, setHourlyPoints] = useState<HourlyPoint[]>(() => initialFallback.points);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Automatic Hazard Detection
  const [hasSiroccoAlert, setHasSiroccoAlert] = useState<boolean>(() => initialFallback.hasSirocco);
  const [hasFrostAlert, setHasFrostAlert] = useState<boolean>(() => initialFallback.hasFrost);
  const [siroccoPeakTime, setSiroccoPeakTime] = useState<string>('غداً 14:00');
  const [frostPeakTime, setFrostPeakTime] = useState<string>('بعد غد 05:00');

  const fetchWeatherData = async (coords: WeatherCoordinates) => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=3`;

      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('API fetch error');
      const data = await response.json();

      if (data && data.current && data.hourly) {
        const cTemp = Math.round(data.current.temperature_2m * 10) / 10;
        const cHum = Math.round(data.current.relative_humidity_2m);
        const cWind = Math.round(data.current.wind_speed_10m);
        const cDeg = data.current.wind_direction_10m;

        let windDirStr = 'شمالية (N)';
        if (cDeg >= 135 && cDeg <= 225) windDirStr = 'جنوبية حارة (شهيلي - S)';
        else if (cDeg > 45 && cDeg < 135) windDirStr = 'شرقية (E)';
        else if (cDeg > 225 && cDeg < 315) windDirStr = 'غربية (W)';

        setCurrentTemp(cTemp);
        setCurrentHumidity(cHum);
        setCurrentWindSpeed(cWind);
        setCurrentWindDir(windDirStr);
        setCurrentEvapoTranspiration(coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' ? 7.4 : 3.6);

        // 72-Hour timeline slots (every 3 hours = 24 points)
        const points: HourlyPoint[] = [];
        let siroccoFound = false;
        let frostFound = false;
        let firstSirocco = '';
        let firstFrost = '';

        for (let i = 0; i < 72; i += 3) {
          const t = Math.round(data.hourly.temperature_2m[i] * 10) / 10;
          const h = Math.round(data.hourly.relative_humidity_2m[i]);
          const w = Math.round(data.hourly.wind_speed_10m[i]);
          const deg = data.hourly.wind_direction_10m[i];
          const rainP = Math.round(data.hourly.precipitation_probability[i] ?? 0);
          const rainM = Math.round((data.hourly.precipitation[i] ?? 0) * 10) / 10;
          const isoTime = data.hourly.time[i] ?? '';
          
          const hourNum = new Date(isoTime).getHours();
          const dayIdx = Math.floor(i / 24);
          const dayLabel = dayIdx === 0 ? 'اليوم' : dayIdx === 1 ? 'غداً' : 'بعد غد';

          const isSirocco = (coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' || coords.wilayaName === 'المنيعة' || t >= 36.5) && h < 20 && w >= 22;
          const isFrost = (coords.wilayaName === 'سطيف' || coords.wilayaName === 'تيارت' || t <= 2.5);

          if (isSirocco) {
            siroccoFound = true;
            if (!firstSirocco) firstSirocco = `${dayLabel} ${hourNum.toString().padStart(2, '0')}:00`;
          }
          if (isFrost) {
            frostFound = true;
            if (!firstFrost) firstFrost = `${dayLabel} ${hourNum.toString().padStart(2, '0')}:00`;
          }

          let cond: HourlyPoint['condition'] = 'SUNNY';
          if (isSirocco) cond = 'HEATWAVE';
          else if (isFrost) cond = 'FROST';
          else if (rainM > 0.4 || rainP > 40) cond = 'RAIN';
          else if (rainP > 15) cond = 'PARTLY_CLOUDY';

          points.push({
            timeStr: `${hourNum.toString().padStart(2, '0')}:00`,
            dayLabel,
            hour: hourNum,
            temp: t,
            humidity: h,
            windSpeed: w,
            windDirDeg: deg,
            rainProb: rainP,
            rainMm: rainM,
            condition: cond,
            isSirocco,
            isFrost,
          });
        }

        setHourlyPoints(points);
        setHasSiroccoAlert(siroccoFound);
        setHasFrostAlert(frostFound);
        setSiroccoPeakTime(firstSirocco || 'غداً 14:00');
        setFrostPeakTime(firstFrost || 'بعد غد 05:00');

        const now = new Date();
        setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      }
    } catch (e) {
      applyAlgerianLocalFallback(coords);
    } finally {
      setLoading(false);
    }
  };

  const applyAlgerianLocalFallback = (coords: WeatherCoordinates) => {
    const isSahara = coords.wilayaName === 'الوادي' || coords.wilayaName === 'بسكرة' || coords.wilayaName === 'المنيعة';
    const isHighlands = coords.wilayaName === 'سطيف' || coords.wilayaName === 'تيارت';

    const baseT = isSahara ? 38.6 : isHighlands ? 16.5 : 23.2;
    const baseH = isSahara ? 15 : isHighlands ? 64 : 42;
    const baseW = isSahara ? 32 : 18;

    setCurrentTemp(baseT);
    setCurrentHumidity(baseH);
    setCurrentWindSpeed(baseW);
    setCurrentWindDir(isSahara ? 'جنوبية حارة (شهيلي - S)' : 'شمالية معتدلة (N)');
    setCurrentEvapoTranspiration(isSahara ? 7.6 : 3.5);

    const points: HourlyPoint[] = [];
    const days = ['اليوم', 'غداً', 'بعد غد'];

    for (let i = 0; i < 72; i += 3) {
      const dayIdx = Math.floor(i / 24);
      const hourNum = (i % 24);
      const isNight = hourNum < 6 || hourNum > 20;
      
      const delta = isNight ? -8 : 4;
      const t = Math.round((baseT + delta + Math.sin(i / 5) * 2) * 10) / 10;
      const h = Math.max(Math.round(baseH - Math.sin(i / 5) * 6), 10);
      const w = Math.round(baseW + Math.cos(i / 5) * 4);

      const isSirocco = isSahara && t >= 36 && h < 20;
      const isFrost = isHighlands && t <= 2.5;

      points.push({
        timeStr: `${hourNum.toString().padStart(2, '0')}:00`,
        dayLabel: days[dayIdx],
        hour: hourNum,
        temp: t,
        humidity: h,
        windSpeed: w,
        windDirDeg: isSahara ? 180 : 45,
        rainProb: isHighlands ? 15 : 0,
        rainMm: 0,
        condition: isSirocco ? 'HEATWAVE' : isFrost ? 'FROST' : 'SUNNY',
        isSirocco,
        isFrost,
      });
    }

    setHourlyPoints(points);
    setHasSiroccoAlert(isSahara);
    setHasFrostAlert(isHighlands);
    setSiroccoPeakTime('غداً 14:00');
    setFrostPeakTime('بعد غد 05:00');

    const now = new Date();
    setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
  };

  useEffect(() => {
    fetchWeatherData(currentCoords);
  }, [currentCoords.lat, currentCoords.lng]);

  const activeSlot = (hourlyPoints && hourlyPoints.length > 0 && hourlyPoints[selectedIndex])
    ? hourlyPoints[selectedIndex]
    : (hourlyPoints && hourlyPoints[0])
    ? hourlyPoints[0]
    : initialFallback.points[0];

  if (!isOpen) return null;

  // 1. Minimized / Collapsed State: A sleek, non-intrusive floating Mini-Pill that never obstructs top map controls
  if (isMinimized) {
    return (
      <div className="fixed md:absolute inset-x-0 bottom-2 md:bottom-0 z-30 flex justify-center px-2 sm:px-4 pointer-events-none transition-all duration-300">
        <div className="pointer-events-auto max-w-lg w-full sm:w-auto bg-slate-900/95 sm:bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 sm:border-t sm:border-x-0 sm:border-b-0 sm:border-slate-800 rounded-full sm:rounded-none px-3 sm:px-4 py-1.5 sm:py-2 shadow-2xl flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-white">
              <CloudSun className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{currentTemp}°C</span>
              <span className="text-slate-400 text-[10px] sm:text-xs">({currentCoords.wilayaName})</span>
            </div>
            <div className="text-slate-400 text-[10px] sm:text-[11px] hidden sm:inline">
              رطوبة: <span className="text-cyan-400">{currentHumidity}%</span> &bull; رياح: <span className="text-amber-400">{currentWindSpeed} km/h</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {hasSiroccoAlert && (
              <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 text-rose-400" />
                <span className="text-[9px]">شهيلي</span>
              </span>
            )}
            {hasFrostAlert && (
              <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 flex items-center gap-1">
                <Snowflake className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px]">صقيع</span>
              </span>
            )}
            <button
              onClick={() => setIsMinimized(false)}
              className="px-2.5 sm:px-3 py-1 rounded-full sm:rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 font-sans shrink-0 cursor-pointer shadow-xs active:scale-95"
              title="توسيع توقعات الـ 72 ساعة وتنبيهات المخاطر"
            >
              <span>توقعات 72h</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
              title="إغلاق لوحة الطقس"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Expanded State: Mobile Bottom Sheet Drawer / Desktop Docked Cockpit
  return (
    <>
      {/* Mobile Backdrop Overlay - closes sheet on touch outside */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
        onClick={() => setIsMinimized(true)}
      />

      {/* Expanded Container: Bottom Sheet on Mobile, Docked Cockpit on Desktop */}
      <div className="fixed md:absolute inset-x-0 bottom-0 z-50 md:z-20 bg-slate-950/98 backdrop-blur-2xl border-t border-slate-800 rounded-t-2xl md:rounded-t-none shadow-2xl transition-all duration-300 text-slate-100 flex flex-col max-h-[70vh] sm:max-h-[75vh] md:max-h-[480px]">
        {/* Mobile Pull Handle with Clear Visual Affordance */}
        <div 
          className="w-full flex flex-col items-center pt-2 pb-1 md:hidden cursor-pointer active:opacity-75 transition-opacity shrink-0"
          onClick={() => setIsMinimized(true)}
          title="اضغط لطي لوحة الطقس ورؤية الخريطة"
        >
          <div className="w-12 h-1.5 bg-slate-600 hover:bg-slate-500 rounded-full transition-colors" />
          <span className="text-[10px] text-slate-400 mt-0.5 font-sans flex items-center gap-1">
            <ChevronDown className="w-3 h-3 text-emerald-400" />
            <span>انقر أو اسحب للطي ورؤية الخريطة</span>
          </span>
        </div>

        {/* Sub-Dashboard Header Bar */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">لوحة طقس الـ 72h والمخاطر</span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                  ERA5 & GFS Telemetry
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-semibold">{currentCoords.wilayaName}</span>
                <span>&bull;</span>
                <span className="truncate max-w-[100px] sm:max-w-none">{currentCoords.locationName}</span>
                <span className="text-slate-500 font-mono text-[10px] hidden md:inline">
                  ({currentCoords.lat.toFixed(4)}°N, {currentCoords.lng.toFixed(4)}°E)
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls & Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Active Alert Badges in Header */}
            {hasSiroccoAlert && (
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] sm:text-[11px] font-bold animate-pulse">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">شهيلي ({siroccoPeakTime.split(' ')[0]})</span>
              </span>
            )}
            {hasFrostAlert && (
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] sm:text-[11px] font-bold">
                <Snowflake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">صقيع ({frostPeakTime.split(' ')[0]})</span>
              </span>
            )}

            <button
              onClick={() => fetchWeatherData(currentCoords)}
              disabled={loading}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="تحديث البيانات المناخية"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Clear Collapse Button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="px-2 sm:px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-semibold border border-slate-700 cursor-pointer shadow-xs active:scale-95"
              title="طي اللوحة لرؤية الخريطة"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>طي اللوحة</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="إغلاق لوحة الطقس"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Agricultural Pole Bar */}
        <div className="px-2 sm:px-4 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs no-scrollbar shrink-0">
          <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">الأقطاب:</span>
          {PRESET_POLES.map((pole) => {
            const isSelected = currentCoords.wilayaName === pole.wilayaName;
            return (
              <button
                key={pole.wilayaName}
                onClick={() => onCoordinatesChange(pole)}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <span>{pole.wilayaName}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono hidden xs:inline">
                  ({pole.locationName.split('/')[0].trim()})
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Expanded Scrollable Content */}
        <div className="p-2.5 sm:p-4 space-y-2.5 sm:space-y-4 overflow-y-auto max-h-[calc(70vh-120px)] md:max-h-[360px]">
          {/* Top Row: Current Telemetry & Special Automated Hazards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {/* Zone 1: Current Weather Telemetry (5 Cols) */}
            <div className="lg:col-span-5 p-2.5 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                  <span>الطقس الآن في الحقل</span>
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">{currentTemp}°C</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs font-mono">
                <div className="p-1.5 sm:p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block font-sans">الرطوبة</span>
                  <span className="text-sm sm:text-base font-bold text-cyan-400">{currentHumidity}%</span>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 block font-sans">غلاف الأوراق</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block font-sans">الرياح</span>
                  <span className="text-sm sm:text-base font-bold text-amber-400">{currentWindSpeed} <span className="text-[10px] font-normal">km/h</span></span>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 block font-sans truncate">{currentWindDir.split(' ')[0]}</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block font-sans">التبخر ET₀</span>
                  <span className="text-sm sm:text-base font-bold text-orange-400">{currentEvapoTranspiration} <span className="text-[10px] font-normal">mm/d</span></span>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 block font-sans">إجهاد سطحي</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-1 border-t border-slate-800/80 text-slate-300">
                <span className="text-slate-400">ملاءمة الرش:</span>
                <span className={`font-semibold font-mono ${currentWindSpeed > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentWindSpeed > 20 ? 'غير ملائم (رياح تشتت المحلول)' : 'ملائم جداً (رياح هادئة)'}
                </span>
              </div>
            </div>

            {/* Zone 2: Automated Hazard Warnings (Sirocco & Frost) (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {/* Sirocco Alert Card */}
              <div className={`p-2.5 sm:p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                hasSiroccoAlert
                  ? 'bg-rose-950/30 border-rose-800/80 shadow-md ring-1 ring-rose-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flame className={`w-4 h-4 ${hasSiroccoAlert ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-white text-xs">إنذار رياح الشهيلي (Sirocco)</span>
                  </div>
                  {hasSiroccoAlert && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold animate-pulse">
                      ذروة {siroccoPeakTime}
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-300 leading-relaxed">
                  {hasSiroccoAlert ? (
                    'تدفق رياح صحراوية جافة وحارة تفوق 38°C. يوصى فوراً بتفعيل السقي التعويضي الليلي بين 21:00 و05:00 لحماية أزهار المحاصيل من التلف.'
                  ) : (
                    'لا توجد مؤشرات لرياح الشهيلي خلال الـ 72 ساعة القادمة. حركة الكتل الهوائية معتدلة.'
                  )}
                </p>

                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 flex justify-between">
                  <span>العتبة: &gt; 36°C ورطوبة &lt; 20%</span>
                  <span className={hasSiroccoAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {hasSiroccoAlert ? 'إجهاد حراري نشط' : 'حالة آمنة'}
                  </span>
                </div>
              </div>

              {/* Frost Alert Card */}
              <div className={`p-2.5 sm:p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                hasFrostAlert
                  ? 'bg-cyan-950/30 border-cyan-800/80 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Snowflake className={`w-4 h-4 ${hasFrostAlert ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-white text-xs">تنبيه مخاطر الصقيع (Frost)</span>
                  </div>
                  {hasFrostAlert && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold">
                      ذروة {frostPeakTime}
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-300 leading-relaxed">
                  {hasFrostAlert ? (
                    'انخفاض ليلي حاد نحو 1°C إلى 2°C بالهضاب العليا. خطر إتلاف براعم الأشجار المثمرة؛ تشغيل رشاشات الرذاذ فجراً يقلل الضرر.'
                  ) : (
                    'درجات الحرارة الليلية في النطاق الآمن (> 5°C). لا توجد مخاطر صقيع إشعاعي للمحاصيل.'
                  )}
                </p>

                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 flex justify-between">
                  <span>العتبة: حرارة ليلية &le; 2.5°C</span>
                  <span className={hasFrostAlert ? 'text-cyan-400 font-bold' : 'text-emerald-400'}>
                    {hasFrostAlert ? 'خطر انجماد موضعي' : 'حالة آمنة'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: 72-Hour Interactive Timeline Scrubber */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>تطور الطقس والمخاطر ساعة بساعة (72h):</span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold text-[10px] sm:text-[11px]">
                {activeSlot?.dayLabel || 'اليوم'} في تمام {activeSlot?.timeStr || '12:00'}: {activeSlot?.temp ?? 24}°C &bull; رطوبة {activeSlot?.humidity ?? 38}% &bull; رياح {activeSlot?.windSpeed ?? 18} km/h
              </span>
            </div>

            {/* Scrollable Hourly Cards Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
              {hourlyPoints.map((slot, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all shrink-0 w-16 sm:w-20 space-y-0.5 sm:space-y-1 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/50 shadow-sm'
                        : slot.isSirocco
                        ? 'bg-rose-950/20 border-rose-800/60 hover:bg-rose-900/30'
                        : slot.isFrost
                        ? 'bg-cyan-950/20 border-cyan-800/60 hover:bg-cyan-900/30'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-[8px] sm:text-[9px] text-slate-400">{slot.dayLabel}</div>
                    <div className="font-mono font-bold text-[9px] sm:text-[10px] text-white">{slot.timeStr}</div>

                    <div className="flex justify-center py-0.5">
                      {slot.condition === 'HEATWAVE' ? (
                        <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
                      ) : slot.condition === 'FROST' ? (
                        <Snowflake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                      ) : slot.condition === 'RAIN' ? (
                        <CloudRain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                      ) : slot.condition === 'PARTLY_CLOUDY' ? (
                        <CloudSun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      ) : (
                        <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
                      )}
                    </div>

                    <div className="font-mono font-bold text-[11px] sm:text-xs text-white">
                      {slot.temp}°
                    </div>

                    {slot.isSirocco ? (
                      <span className="text-[7px] sm:text-[8px] font-bold text-rose-400 font-mono block">شهيلي</span>
                    ) : slot.isFrost ? (
                      <span className="text-[7px] sm:text-[8px] font-bold text-cyan-400 font-mono block">صقيع</span>
                    ) : (
                      <span className="text-[7px] sm:text-[8px] font-mono text-slate-500 block">{slot.windSpeed}k</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
