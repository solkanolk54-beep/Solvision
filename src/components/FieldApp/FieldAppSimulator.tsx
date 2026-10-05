import React, { useState } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Mic, 
  MapPin, 
  Check, 
  RefreshCw, 
  Satellite, 
  Volume2, 
  Layers, 
  Database,
  ArrowRight,
  Clock,
  Play
} from 'lucide-react';

interface QueuedItem {
  id: string;
  parcelCode: string;
  farmerName: string;
  crop: string;
  pointsCaptured: number;
  audioNoteText: string;
  timestamp: string;
  synced: boolean;
}

export const FieldAppSimulator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [gpsPoints, setGpsPoints] = useState<number>(4);
  const [activeScreen, setActiveScreen] = useState<'SURVEY' | 'QUEUE' | 'VERIFY'>('SURVEY');

  const [farmerName, setFarmerName] = useState<string>('لخضر بن مسعود');
  const [wilaya, setWilaya] = useState<string>('سطيف - العلمة');
  const [crop, setCrop] = useState<string>('قمح صلب (سيميتو)');
  const [audioTranscript, setAudioTranscript] = useState<string>(
    'رانا زرعنا 45 قنطار قمح سيميتو في 15 نوفمبر، البئر راه يدير 25 لتر في الثانية والرشاش المحوري راه يمشي مليح بدون مشاكل.'
  );

  const [queue, setQueue] = useState<QueuedItem[]>([
    {
      id: 'sync-01',
      parcelCode: 'DZ-19-SET-9912',
      farmerName: 'لخضر بن مسعود',
      crop: 'قمح صلب (سيميتو)',
      pointsCaptured: 6,
      audioNoteText: 'حقل قمح سيميتو بالعلمة، حالة النمو ممتازة والماء متوفر.',
      timestamp: 'منذ 14 دقيقة',
      synced: true,
    },
    {
      id: 'sync-02',
      parcelCode: 'DZ-39-ELO-1140',
      farmerName: 'سعداوي بلقاسم',
      crop: 'بطاطس شتوية (سبونتا)',
      pointsCaptured: 8,
      audioNoteText: 'تسجيل عطل في مضخة المحور رقم 2، انخفاض في ضغط السقي.',
      timestamp: 'منذ ساعتين (محلياً)',
      synced: false,
    },
  ]);

  const handleCapturePoint = () => {
    setGpsPoints(prev => prev + 1);
  };

  const handleSaveToLocalQueue = () => {
    const newItem: QueuedItem = {
      id: `sync-${Date.now()}`,
      parcelCode: `DZ-${Math.floor(10 + Math.random() * 80)}-${Date.now().toString().slice(-4)}`,
      farmerName: farmerName || 'مستغل ميداني جديد',
      crop: crop,
      pointsCaptured: gpsPoints,
      audioNoteText: audioTranscript,
      timestamp: 'الآن',
      synced: isOnline,
    };
    setQueue([newItem, ...queue]);
    setActiveScreen('QUEUE');
  };

  const handleSyncAll = () => {
    if (!isOnline) return;
    setIsSyncing(true);
    setTimeout(() => {
      setQueue(queue.map(item => ({ ...item, synced: true })));
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-slate-100">
      {/* Header and Context */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Flutter Offline-First Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">SQLite Local Sync & Geofencing</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            محاكي تطبيق الميدان للهواتف الذكية (SolVision Field Agent)
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            مخصص للمهندسين الزراعيين ومرشدي الغرف الفلاحية (DSA): رسم مضلعات الحقول بالـ GPS خطوة بخطوة، التسجيل الصوتي بالدارجة الجزائرية، والعمل الكامل دون شبكة إنترنت مع المزامنة التلقائية فور توفر التغطية.
          </p>
        </div>

        {/* Network Toggle Simulator */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">محاكاة شبكة الهاتف 4G:</span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition-colors ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'متصل بالإنترنت (Online)' : 'منعدم التغطية (Offline)'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Mobile Device Frame & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mobile Phone Mockup (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[340px] h-[660px] bg-slate-950 rounded-[40px] border-4 border-slate-700 shadow-2xl p-3 flex flex-col relative overflow-hidden ring-8 ring-slate-900">
            {/* Phone Speaker & Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-30"></div>

            {/* In-App Header */}
            <div className="pt-5 pb-3 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">SolVision Field</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <Wifi className="w-3 h-3" /> متصل
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <WifiOff className="w-3 h-3" /> وضع دون إنترنت
                  </span>
                )}
              </div>
            </div>

            {/* In-App Screen Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs bg-slate-950">
              {activeScreen === 'SURVEY' && (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-white block">
                      1. التتبع الجغرافي للمضلع (GNSS Geofencing)
                    </span>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">النقاط الملتقطة:</span>
                      <span className="font-mono font-bold text-emerald-400">{gpsPoints} نقاط GPS</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCapturePoint}
                        className="flex-1 py-1.5 px-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>التقاط نقطة ركن الحقل</span>
                      </button>
                      <button
                        onClick={() => setGpsPoints(4)}
                        className="py-1.5 px-2 rounded bg-slate-800 text-slate-300 text-[11px]"
                      >
                        تصفير
                      </button>
                    </div>
                  </div>

                  {/* Farmer Declaration Inputs */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
                    <span className="font-bold text-white block">2. معطيات الفلاح والمحصول</span>
                    <div>
                      <span className="text-slate-400 block mb-0.5">اسم المستغل:</span>
                      <input
                        type="text"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">المحصول المصرح:</span>
                      <input
                        type="text"
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                  </div>

                  {/* Darija Audio Note Recorder */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>3. تسجيل صوتي بالدارجة (Speech-to-Text)</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`w-full py-2 rounded flex items-center justify-center gap-2 font-bold text-xs transition-colors ${
                        isRecording
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isRecording ? 'جاري التسجيل الصوتي... اضغط للإيقاف' : 'اضغط للتسجيل الصوتي بالدارجة'}</span>
                    </button>

                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-slate-300 leading-relaxed italic">
                      &quot;{audioTranscript}&quot;
                    </div>
                  </div>

                  <button
                    onClick={handleSaveToLocalQueue}
                    className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    حفظ في قاعدة البيانات المحلية (Offline Save)
                  </button>
                </div>
              )}

              {activeScreen === 'QUEUE' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[11px]">
                    <span className="font-bold text-white">طابور المزامنة المحلي (SQLite Queue)</span>
                    <span className="font-mono text-slate-400">{queue.length} سجلات</span>
                  </div>

                  <div className="space-y-2">
                    {queue.map((item) => (
                      <div key={item.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white">{item.parcelCode}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            item.synced ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {item.synced ? 'تمت المزامنة' : 'في الانتظار (محلي)'}
                          </span>
                        </div>
                        <div className="text-slate-300 font-medium">{item.farmerName}</div>
                        <div className="text-[10px] text-slate-400">{item.crop} &bull; {item.pointsCaptured} نقاط GPS</div>
                        <div className="text-[10px] text-slate-500 italic truncate">&quot;{item.audioNoteText}&quot;</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSyncAll}
                    disabled={!isOnline || isSyncing}
                    className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'جاري مزامنة الدفعة مع السيرفر...' : 'مزامنة السجلات الآن مع PostGIS'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* In-App Bottom Navigation */}
            <div className="p-2 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-1 text-[11px]">
              <button
                onClick={() => setActiveScreen('SURVEY')}
                className={`py-1.5 rounded text-center font-medium ${
                  activeScreen === 'SURVEY' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                مسح حقلي جديد
              </button>
              <button
                onClick={() => setActiveScreen('QUEUE')}
                className={`py-1.5 rounded text-center font-medium ${
                  activeScreen === 'QUEUE' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                طابور المزامنة ({queue.filter(q => !q.synced).length})
              </button>
            </div>
          </div>
        </div>

        {/* Technical Architecture Specs (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>معمارية المزامنة في البيئات المنعدمة التغطية (Offline-First Architecture)</span>
            </h3>

            <p className="text-slate-300 leading-relaxed">
              في الحقول المعزولة في صحراء وادي سوف، أو قمم الهضاب العليا في تيارت وسطيف حيث تنقطع شبكة الجيل الرابع، يضمن محرك SolVision عدم ضياع أي بيان أو مضلع عبر الآلية الهندسية التالية:
            </p>

            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-0.5">1. التخزين المحلي المشفر (SQLite / Drift):</span>
                <p className="text-[11px] text-slate-400">
                  تخزين إحداثيات خطوط الطول والعرض، بصمات التوقيت من شريحة GNSS، والملفات الصوتية في قاعدة بيانات هاتفية آمنة مع إنشاء مفتاح تجزئة (SHA-256) لكل عملية مسح لمنع التلاعب بالتاريخ.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-0.5">2. بروتوكول حل النزاعات المتطابق (Last-Write-Wins with Signature):</span>
                <p className="text-[11px] text-slate-400">
                  عند عودة اتصال الهاتف بالشبكة، يتم إرسال حزم مجمعة إلى `/api/v1/sync/batch`، حيث يتحقق خادم Go من عدم تراكب المضلعات الجديدة مع مضلعات قائمة عبر دالة `ST_Intersects` في PostGIS.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-0.5">3. دعم الدارجة الجزائرية لكسر الأمية الرقمية:</span>
                <p className="text-[11px] text-slate-400">
                  تحويل الصوت إلى نص محلياً بالدارجة، مما يمكن كبار السن والمستغلين التقليديين من تدوين ملاحظات الري والبذور دون الحاجة للكتابة بالفرنسية أو لغات معقدة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
