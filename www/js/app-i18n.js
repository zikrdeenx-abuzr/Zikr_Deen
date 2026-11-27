(function(){'use strict';
const KEY='zdLang';
const LANGS=[
  ['en','English','ltr','en-US'],
  ['ar','العربية','rtl','ar-SA'],
  ['id','Bahasa Indonesia','ltr','id-ID'],
  ['ur','اردو','rtl','ur-PK'],
  ['hi','हिन्दी','ltr','hi-IN'],
  ['hinglish','Hinglish','ltr','en-IN'],
  ['bn','বাংলা','ltr','bn-BD'],
  ['ms','Bahasa Melayu','ltr','ms-MY'],
  ['fa','فارسی','rtl','fa-IR'],
  ['tr','Türkçe','ltr','tr-TR'],
  ['uz','Oʻzbekcha','ltr','uz-UZ'],
  ['fr','Français','ltr','fr-FR'],
  ['ru','Русский','ltr','ru-RU'],
  ['ha','Hausa','ltr','ha-NG'],
  ['sw','Kiswahili','ltr','sw-TZ'],
  ['de','Deutsch','ltr','de-DE'],
  ['es','Español','ltr','es-ES'],
  ['zh','简体中文','ltr','zh-CN'],
  ['ko','한국어','ltr','ko-KR'],
  ['ja','日本語','ltr','ja-JP']
];
const BY_CODE=Object.fromEntries(LANGS.map(x=>[x[0],{code:x[0],name:x[1],dir:x[2],speech:x[3]}]));

const D={
  'Home':{ar:'الرئيسية',id:'Beranda',ur:'ہوم',hi:'होम',hinglish:'Home',bn:'হোম',ms:'Utama',fa:'خانه',tr:'Ana Sayfa',uz:'Bosh sahifa',fr:'Accueil',ru:'Главная',ha:'Gida',sw:'Nyumbani',de:'Start',es:'Inicio',zh:'首页',ko:'홈',ja:'ホーム'},
  'Quran':{ar:'القرآن',id:'Al-Qur’an',ur:'قرآن',hi:'क़ुरआन',hinglish:'Quran',bn:'কুরআন',ms:'Al-Quran',fa:'قرآن',tr:'Kur’an',uz:'Qur’on',fr:'Coran',ru:'Коран',ha:'Al-Qur’ani',sw:'Qur’ani',de:'Koran',es:'Corán',zh:'古兰经',ko:'꾸란',ja:'クルアーン'},
  'Learn':{ar:'تعلّم',id:'Belajar',ur:'سیکھیں',hi:'सीखें',hinglish:'Seekhein',bn:'শিখুন',ms:'Belajar',fa:'آموزش',tr:'Öğren',uz:'O‘rganish',fr:'Apprendre',ru:'Учиться',ha:'Koyo',sw:'Jifunze',de:'Lernen',es:'Aprender',zh:'学习',ko:'학습',ja:'学ぶ'},
  'Al-Mulk':{ar:'سورة الملك',id:'Al-Mulk',ur:'الملک',hi:'अल-मुल्क',hinglish:'Al-Mulk',bn:'আল-মুলক',ms:'Al-Mulk',fa:'الملک',tr:'Mülk',uz:'Mulk',fr:'Al-Mulk',ru:'Аль-Мульк',ha:'Al-Mulk',sw:'Al-Mulk',de:'Al-Mulk',es:'Al-Mulk',zh:'国权章',ko:'알물크',ja:'アル・ムルク'},
  'Ask AI':{ar:'اسأل AI',id:'Tanya AI',ur:'AI سے پوچھیں',hi:'AI से पूछें',hinglish:'Ask AI',bn:'AI জিজ্ঞাসা',ms:'Tanya AI',fa:'پرسش AI',tr:'AI’ya Sor',uz:'AI dan so‘ra',fr:'Demander IA',ru:'Спросить ИИ',ha:'Tambayi AI',sw:'Uliza AI',de:'KI fragen',es:'Preguntar IA',zh:'问AI',ko:'AI 질문',ja:'AIに質問'},
  'More':{ar:'المزيد',id:'Lainnya',ur:'مزید',hi:'और',hinglish:'More',bn:'আরও',ms:'Lagi',fa:'بیشتر',tr:'Diğer',uz:'Ko‘proq',fr:'Plus',ru:'Ещё',ha:'Ƙari',sw:'Zaidi',de:'Mehr',es:'Más',zh:'更多',ko:'더보기',ja:'その他'},

  'Resume reading':{ar:'تابع القراءة',id:'Lanjutkan membaca',ur:'تلاوت جاری رکھیں',hi:'पढ़ना जारी रखें',hinglish:'Padhna jaari rakhein',bn:'পড়া চালিয়ে যান',ms:'Sambung membaca',fa:'ادامه قرائت',tr:'Okumaya devam et',uz:'O‘qishni davom ettirish',fr:'Reprendre la lecture',ru:'Продолжить чтение',ha:'Ci gaba da karatu',sw:'Endelea kusoma',de:'Weiterlesen',es:'Seguir leyendo',zh:'继续阅读',ko:'계속 읽기',ja:'続きを読む'},
  'Start reading':{ar:'ابدأ القراءة',id:'Mulai membaca',ur:'تلاوت شروع کریں',hi:'पढ़ना शुरू करें',hinglish:'Padhna shuru karein',bn:'পড়া শুরু করুন',ms:'Mula membaca',fa:'شروع قرائت',tr:'Okumaya başla',uz:'O‘qishni boshlash',fr:'Commencer à lire',ru:'Начать чтение',ha:'Fara karatu',sw:'Anza kusoma',de:'Lesen starten',es:'Empezar a leer',zh:'开始阅读',ko:'읽기 시작',ja:'読み始める'},
  'Continue':{ar:'متابعة',id:'Lanjut',ur:'جاری رکھیں',hi:'जारी रखें',hinglish:'Jaari rakhein',bn:'চালিয়ে যান',ms:'Teruskan',fa:'ادامه',tr:'Devam et',uz:'Davom etish',fr:'Continuer',ru:'Продолжить',ha:'Ci gaba',sw:'Endelea',de:'Weiter',es:'Continuar',zh:'继续',ko:'계속',ja:'続ける'},
  'Begin':{ar:'ابدأ',id:'Mulai',ur:'شروع کریں',hi:'शुरू करें',hinglish:'Shuru karein',bn:'শুরু',ms:'Mula',fa:'شروع',tr:'Başla',uz:'Boshlash',fr:'Commencer',ru:'Начать',ha:'Fara',sw:'Anza',de:'Starten',es:'Empezar',zh:'开始',ko:'시작',ja:'開始'},
  'The Opening · 7 ayat':{ar:'الفاتحة · ٧ آيات',id:'Pembukaan · 7 ayat',ur:'آغاز · 7 آیات',hi:'शुरुआत · 7 आयतें',hinglish:'Shuruat · 7 ayat',bn:'সূচনা · ৭ আয়াত',ms:'Pembukaan · 7 ayat',fa:'گشایش · ۷ آیه',tr:'Açılış · 7 ayet',uz:'Ochilish · 7 oyat',fr:'L’Ouverture · 7 versets',ru:'Открывающая · 7 аятов',ha:'Buɗewa · ayoyi 7',sw:'Ufunguzi · aya 7',de:'Die Eröffnung · 7 Verse',es:'La Apertura · 7 aleyas',zh:'开端 · 7节',ko:'개막 · 7구절',ja:'開端 · 7節'},
  'Daily goal':{ar:'الهدف اليومي',id:'Target harian',ur:'روزانہ کا ہدف',hi:'रोज़ाना लक्ष्य',hinglish:'Rozana Goal',bn:'দৈনিক লক্ষ্য',ms:'Sasaran harian',fa:'هدف روزانه',tr:'Günlük hedef',uz:'Kunlik maqsad',fr:'Objectif quotidien',ru:'Цель на день',ha:'Manufar yau da kullum',sw:'Lengo la kila siku',de:'Tagesziel',es:'Meta diaria',zh:'每日目标',ko:'일일 목표',ja:'毎日の目標'},
  'day streak':{ar:'أيام متتالية',id:'hari beruntun',ur:'دن کا تسلسل',hi:'दिन की स्ट्रीक',hinglish:'din streak',bn:'দিনের ধারাবাহিকতা',ms:'hari berturut',fa:'روز پیاپی',tr:'günlük seri',uz:'kunlik seriya',fr:'jours de suite',ru:'дней подряд',ha:'kwanaki a jere',sw:'siku mfululizo',de:'Tage in Folge',es:'días seguidos',zh:'连续天数',ko:'연속 일수',ja:'連続日数'},
  'ayat read':{ar:'آيات مقروءة',id:'ayat dibaca',ur:'آیات پڑھی گئیں',hi:'आयतें पढ़ीं',hinglish:'ayat padhi',bn:'আয়াত পড়া হয়েছে',ms:'ayat dibaca',fa:'آیه خوانده‌شده',tr:'ayet okundu',uz:'oyat o‘qildi',fr:'versets lus',ru:'аятов прочитано',ha:'ayoyi da aka karanta',sw:'aya zilizosomwa',de:'Verse gelesen',es:'aleyas leídas',zh:'已读节数',ko:'읽은 구절',ja:'読んだ節'},
  'saved':{ar:'محفوظة',id:'tersimpan',ur:'محفوظ',hi:'सेव की गईं',hinglish:'saved',bn:'সংরক্ষিত',ms:'disimpan',fa:'ذخیره‌شده',tr:'kaydedilen',uz:'saqlangan',fr:'enregistrés',ru:'сохранено',ha:'an ajiye',sw:'zilizohifadhiwa',de:'gespeichert',es:'guardadas',zh:'已收藏',ko:'저장됨',ja:'保存済み'},
  'Saved':{ar:'المحفوظات',id:'Tersimpan',ur:'محفوظ شدہ',hi:'सेव की गई',hinglish:'Saved',bn:'সংরক্ষিত',ms:'Disimpan',fa:'ذخیره‌شده‌ها',tr:'Kaydedilenler',uz:'Saqlanganlar',fr:'Enregistrés',ru:'Сохранённые',ha:'An ajiye',sw:'Zilizohifadhiwa',de:'Gespeichert',es:'Guardados',zh:'收藏夹',ko:'저장됨',ja:'保存済み'},
  'Learning folders':{ar:'مجلدات التعلّم',id:'Folder belajar',ur:'سیکھنے کے فولڈرز',hi:'सीखने के फ़ोल्डर',hinglish:'Learning folders',bn:'শেখার ফোল্ডার',ms:'Folder pembelajaran',fa:'پوشه‌های آموزش',tr:'Öğrenme klasörleri',uz:'O‘rganish bo‘limlari',fr:'Dossiers d’étude',ru:'Разделы обучения',ha:'Manyan darussa',sw:'Folda za kujifunza',de:'Lernordner',es:'Carpetas de estudio',zh:'学习专栏',ko:'학습 폴더',ja:'学習フォルダ'},
  'Go to ayah':{ar:'اذهب إلى آية',id:'Buka ayat',ur:'آیت پر جائیں',hi:'आयत पर जाएँ',hinglish:'Ayah par jaayein',bn:'আয়াতে যান',ms:'Pergi ke ayat',fa:'رفتن به آیه',tr:'Ayete git',uz:'Oyatga o‘tish',fr:'Aller au verset',ru:'Перейти к аяту',ha:'Je zuwa aya',sw:'Nenda kwenye aya',de:'Zum Vers',es:'Ir a la aleya',zh:'跳转经文',ko:'구절 이동',ja:'節へ移動'},
  'Surah Al-Mulk':{ar:'سورة الملك',id:'Surah Al-Mulk',ur:'سورۃ الملک',hi:'सूरह अल-मुल्क',hinglish:'Surah Al-Mulk',bn:'সূরা আল-মুলক',ms:'Surah Al-Mulk',fa:'سوره ملک',tr:'Mülk Suresi',uz:'Mulk surasi',fr:'Sourate Al-Mulk',ru:'Сура Аль-Мульк',ha:'Suratul Mulk',sw:'Surah Al-Mulk',de:'Sure Al-Mulk',es:'Sura Al-Mulk',zh:'国权章 (Al-Mulk)',ko:'수라 알물크',ja:'アル・ムルク章'},
  'Open Hifz hub':{ar:'افتح مركز الحفظ',id:'Buka pusat Hifz',ur:'حفظ ہب کھولیں',hi:'हिफ़्ज़ हब खोलें',hinglish:'Hifz hub kholein',bn:'হিফজ হাব খুলুন',ms:'Buka hab Hifz',fa:'باز کردن مرکز حفظ',tr:'Hıfz merkezini aç',uz:'Hifz bo‘limini ochish',fr:'Ouvrir le hub Hifz',ru:'Открыть центр хифза',ha:'Buɗe cibiyar Hifz',sw:'Fungua kituo cha Hifz',de:'Hifz-Hub öffnen',es:'Abrir centro Hifz',zh:'打开背诵中心',ko:'암기 허브 열기',ja:'暗記ハブを開く'},
  '30-day journey':{ar:'رحلة 30 يومًا',id:'Perjalanan 30 hari',ur:'30 دن کا سفر',hi:'30 दिन की यात्रा',hinglish:'30-day journey',bn:'৩০ দিনের যাত্রা',ms:'Perjalanan 30 hari',fa:'سفر ۳۰ روزه',tr:'30 günlük yolculuk',uz:'30 kunlik sayohat',fr:'Parcours 30 jours',ru:'30-дневный путь',ha:'Tafiyar kwanaki 30',sw:'Safari ya siku 30',de:'30-Tage-Reise',es:'Viaje de 30 días',zh:'30天旅程',ko:'30일 여정',ja:'30日間の旅'},
  'Aaj ki Ayah':{ar:'آية اليوم',id:'Ayat Hari Ini',ur:'آج کی آیت',hi:'आज की आयत',hinglish:'Aaj ki Ayah',bn:'আজকের আয়াত',ms:'Ayat Hari Ini',fa:'آیه امروز',tr:'Günün Ayeti',uz:'Bugungi oyat',fr:'Verset du jour',ru:'Аят дня',ha:'Ayar Yau',sw:'Aya ya Leo',de:'Vers des Tages',es:'Aleya del día',zh:'今日经文',ko:'오늘의 구절',ja:'今日の節'},
  'Suno':{ar:'استمع',id:'Dengar',ur:'سنیں',hi:'सुनें',hinglish:'Suno',bn:'শুনুন',ms:'Dengar',fa:'شنیدن',tr:'Dinle',uz:'Tinglash',fr:'Écouter',ru:'Слушать',ha:'Saurara',sw:'Sikiliza',de:'Anhören',es:'Escuchar',zh:'收听',ko:'듣기',ja:'聴く'},
  'Maine padh li':{ar:'قرأتها',id:'Sudah dibaca',ur:'میں نے پڑھ لی',hi:'मैंने पढ़ ली',hinglish:'Maine padh li',bn:'পড়েছি',ms:'Sudah dibaca',fa:'خواندم',tr:'Okudum',uz:'O‘qidim',fr:'Lu',ru:'Прочитано',ha:'Na karanta',sw:'Nimesoma',de:'Gelesen',es:'Leído',zh:'已读',ko:'읽음',ja:'読了'},
  'Padh li':{ar:'تمت القراءة',id:'Terbaca',ur:'پڑھ لی',hi:'पढ़ ली',hinglish:'Padh li',bn:'পড়া হয়েছে',ms:'Dibaca',fa:'خوانده شد',tr:'Okundu',uz:'O‘qildi',fr:'Lu',ru:'Прочитано',ha:'An karanta',sw:'Imesomwa',de:'Gelesen',es:'Leído',zh:'已读',ko:'완료',ja:'完了'},

  'Ask Zikr Deen':{ar:'اسأل ذكر الدين',id:'Tanya Zikr Deen',ur:'ذکرِ دین سے پوچھیں',hi:'ज़िक्र दीन से पूछें',hinglish:'Ask Zikr Deen',bn:'জিকর দ্বীনকে জিজ্ঞাসা করুন',ms:'Tanya Zikr Deen',fa:'از ذکرالدین بپرسید',tr:'Zikr Deen’e Sor',uz:'Zikr Deen’dan so‘rang',fr:'Demander à Zikr Deen',ru:'Спросить Zikr Deen',ha:'Tambayi Zikr Deen',sw:'Uliza Zikr Deen',de:'Zikr Deen fragen',es:'Preguntar a Zikr Deen',zh:'询问 Zikr Deen',ko:'Zikr Deen에게 질문',ja:'Zikr Deenに質問'},
  'Islam, Quran ya Hadith ka koi bhi sawal — AI se poochein':{ar:'اسأل الذكاء الاصطناعي أي سؤال عن الإسلام أو القرآن أو الحديث',id:'Tanyakan apa saja tentang Islam, Al-Qur’an, atau Hadis ke AI',ur:'اسلام، قرآن یا حدیث کا کوئی بھی سوال AI سے پوچھیں',hi:'इस्लाम, क़ुरआन या हदीस का कोई भी सवाल AI से पूछें',hinglish:'Islam, Quran ya Hadith ka koi bhi sawal — AI se poochein',bn:'ইসলাম, কুরআন বা হাদিস সম্পর্কে যেকোনো প্রশ্ন AI-কে করুন',ms:'Tanya apa sahaja tentang Islam, Al-Quran atau Hadis kepada AI',fa:'هر پرسشی درباره اسلام، قرآن یا حدیث از هوش مصنوعی بپرسید',tr:'İslam, Kur’an veya Hadis hakkında her şeyi yapay zekaya sorun',uz:'Islom, Qur’on yoki Hadis haqida istalgan savolni AI dan so‘rang',fr:'Posez toute question sur l’Islam, le Coran ou les Hadiths à l’IA',ru:'Задайте ИИ любой вопрос об Исламе, Коране или хадисах',ha:'Tambayi AI kowace tambaya kan Musulunci, Al-Qur’ani ko Hadisi',sw:'Uliza AI swali lolote kuhusu Uislamu, Qur’ani au Hadithi',de:'Stelle der KI Fragen zu Islam, Koran oder Hadithen',es:'Pregunta a la IA sobre el Islam, el Corán o los Hadices',zh:'向AI询问有关伊斯兰、古兰经或圣训的任何问题',ko:'이슬람, 꾸란, 하디스에 대해 AI에게 무엇이든 물어보세요',ja:'イスラム・クルアーン・ハディースについてAIに質問'},
  'Everything in one place':{ar:'كل شيء في مكان واحد',id:'Semua di satu tempat',ur:'سب کچھ ایک جگہ',hi:'सब कुछ एक जगह',hinglish:'Sab kuch ek jagah',bn:'সবকিছু এক জায়গায়',ms:'Semuanya di satu tempat',fa:'همه چیز در یک جا',tr:'Her şey tek yerde',uz:'Hammasi bir joyda',fr:'Tout au même endroit',ru:'Всё в одном месте',ha:'Komai a wuri ɗaya',sw:'Kila kitu mahali pamoja',de:'Alles an einem Ort',es:'Todo en un solo lugar',zh:'一站式学习',ko:'모든 학습을 한곳에서',ja:'すべてを1か所に'},
  'Surahs':{ar:'السور',id:'Surah',ur:'سورتیں',hi:'सूरह',hinglish:'Surahs',bn:'সূরাসমূহ',ms:'Surah',fa:'سوره‌ها',tr:'Sureler',uz:'Suralar',fr:'Sourates',ru:'Суры',ha:'Surori',sw:'Sura',de:'Suren',es:'Suras',zh:'章节',ko:'수라 목록',ja:'章一覧'},
  'Surah':{ar:'سورة',id:'Surah',ur:'سورہ',hi:'सूरह',hinglish:'Surah',bn:'সূরা',ms:'Surah',fa:'سوره',tr:'Sure',uz:'Sura',fr:'Sourate',ru:'Сура',ha:'Sura',sw:'Sura',de:'Sure',es:'Sura',zh:'章',ko:'수라',ja:'章'},
  'Juz':{ar:'جزء',id:'Juz',ur:'پارہ',hi:'पारा (जुज़)',hinglish:'Juz',bn:'পারা (জুজ)',ms:'Juzuk',fa:'جزء',tr:'Cüz',uz:'Juz',fr:'Juz',ru:'Джуз',ha:'Juz’i',sw:'Juzu',de:'Dschuz',es:'Yuz',zh:'卷',ko:'주즈',ja:'ジュズ'},
  'Juz Index':{ar:'فهرس الأجزاء',id:'Indeks Juz',ur:'پارہ انڈیکس',hi:'जुज़ इंडेक्स',hinglish:'Juz Index',bn:'জুজ তালিকা',ms:'Indeks Juzuk',fa:'فهرست اجزاء',tr:'Cüz Dizini',uz:'Juzlar ro‘yxati',fr:'Index des Juz',ru:'Список джузов',ha:'Jerin Juz’ai',sw:'Faharasa ya Juzu',de:'Dschuz-Index',es:'Índice de Yuz',zh:'卷目录',ko:'주즈 목차',ja:'ジュズ一覧'},
  'Ayah by Ayah':{ar:'آية بآية',id:'Ayat per Ayat',ur:'آیت بہ آیت',hi:'आयत दर आयत',hinglish:'Ayah by Ayah',bn:'আয়াত ধরে ধরে',ms:'Ayat demi Ayat',fa:'آیه به آیه',tr:'Ayet Ayet',uz:'Oyatma-oyat',fr:'Verset par verset',ru:'Аят за аятом',ha:'Aya bayan Aya',sw:'Aya kwa Aya',de:'Vers für Vers',es:'Aleya por aleya',zh:'逐节学习',ko:'구절별 학습',ja:'節ごとの学習'},
  'Namaz':{ar:'الصلاة',id:'Sholat',ur:'نماز',hi:'नमाज़',hinglish:'Namaz',bn:'নামাজ',ms:'Solat',fa:'نماز',tr:'Namaz',uz:'Namoz',fr:'Prière (Salat)',ru:'Намаз',ha:'Sallah',sw:'Swala',de:'Gebet (Namaz)',es:'Oración (Salat)',zh:'礼拜',ko:'예배 (나마즈)',ja:'礼拝（ナマーズ）'},
  'Mukammal Namaz':{ar:'الصلاة الكاملة',id:'Sholat Lengkap',ur:'مکمل نماز',hi:'मुकम्मल नमाज़',hinglish:'Mukammal Namaz',bn:'সম্পূর্ণ নামাজ',ms:'Solat Lengkap',fa:'نماز کامل',tr:'Tam Namaz Rehberi',uz:'To‘liq Namoz',fr:'Prière complète',ru:'Полный намаз',ha:'Cikakkiyar Sallah',sw:'Swala Kamili',de:'Vollständiges Gebet',es:'Oración completa',zh:'完整礼拜指南',ko:'완전한 예배',ja:'完全な礼拝ガイド'},
  '3D Namaz Guide':{ar:'دليل الصلاة ثلاثي الأبعاد',id:'Panduan Sholat 3D',ur:'3D نماز گائیڈ',hi:'3D नमाज़ गाइड',hinglish:'3D Namaz Guide',bn:'3D নামাজ গাইড',ms:'Panduan Solat 3D',fa:'راهنمای سه‌بعدی نماز',tr:'3D Namaz Rehberi',uz:'3D Namoz qo‘llanmasi',fr:'Guide Salat 3D',ru:'3D Гид по намазу',ha:'Jagoran Sallah 3D',sw:'Mwongozo wa Swala 3D',de:'3D Gebetsführer',es:'Guía Salat 3D',zh:'3D 礼拜指南',ko:'3D 예배 가이드',ja:'3D 礼拝ガイド'},
  '3D Namaz Grid':{ar:'شبكة الصلاة ثلاثية الأبعاد',id:'Grid Sholat 3D',ur:'3D نماز گرڈ',hi:'3D नमाज़ ग्रिड',hinglish:'3D Namaz Grid',bn:'3D নামাজ গ্রিড',ms:'Grid Solat 3D',fa:'شبکه سه‌بعدی نماز',tr:'3D Namaz Izgarası',uz:'3D Namoz tarmog‘i',fr:'Grille Salat 3D',ru:'3D Сетка намаза',ha:'Tsarin Sallah 3D',sw:'Gridi ya Swala 3D',de:'3D Gebetsraster',es:'Cuadrícula Salat 3D',zh:'3D 礼拜网格',ko:'3D 예배 그리드',ja:'3D 礼拝グリッド'},
  'Daily Azkaar':{ar:'الأذكار اليومية',id:'Dzikir Harian',ur:'روزانہ کے اذکار',hi:'रोज़ाना अज़कार',hinglish:'Daily Azkaar',bn:'দৈনিক আজকার',ms:'Zikir Harian',fa:'اذکار روزانه',tr:'Günlük Zikirler',uz:'Kunlik zikrlar',fr:'Adhkar quotidiens',ru:'Ежедневные зикры',ha:'Azkar na kullum',sw:'Adhkar za Kila Siku',de:'Tägliche Adhkar',es:'Adhkar diarios',zh:'每日记主词',ko:'일일 아즈카르',ja:'毎日のズィクル'},
  'Hadith':{ar:'الحديث',id:'Hadis',ur:'حدیث',hi:'हदीस',hinglish:'Hadith',bn:'হাদিস',ms:'Hadis',fa:'حدیث',tr:'Hadis',uz:'Hadis',fr:'Hadith',ru:'Хадисы',ha:'Hadisi',sw:'Hadithi',de:'Hadith',es:'Hadiz',zh:'圣训',ko:'하디스',ja:'ハディース'},
  'Kutub-e-Sitta · offline · Hinglish tarjuma':{ar:'الكتب الستة · دون إنترنت · ترجمة',id:'Kutubus Sittah · offline · terjemahan',ur:'کتبِ ستہ · آف لائن · ترجمہ',hi:'कुतुबे-सित्ता · ऑफ़लाइन · अनुवाद',hinglish:'Kutub-e-Sitta · offline · Hinglish tarjuma',bn:'কুতুব আল-সিত্তাহ · অফলাইন · অনুবাদ',ms:'Kutub al-Sittah · luar talian · terjemahan',fa:'صحاح سته · آفلاین · ترجمه',tr:'Kütüb-i Sitte · çevrimdışı · çeviri',uz:'Kutubi sitta · oflayn · tarjima',fr:'Koutoub as-Sittah · hors ligne · traduction',ru:'Кутуб ас-Ситта · офлайн · перевод',ha:'Littattafai 6 · layi · fassara',sw:'Vitabu 6 · nje ya mtandao · tafsiri',de:'Kutub al-Sitta · offline · Übersetzung',es:'Kutub al-Sittah · sin conexión · traducción',zh:'六大圣训集 · 离线 · 译文',ko:'육대 하디스 · 오프라인 · 번역',ja:'六大ハディース集 · オフライン · 翻訳'},
  'Repeat':{ar:'التكرار',id:'Ulangi',ur:'دہرائیں',hi:'दोहराएँ',hinglish:'Repeat',bn:'পুনরাবৃত্তি',ms:'Ulang',fa:'تکرار',tr:'Tekrar',uz:'Takrorlash',fr:'Répéter',ru:'Повтор',ha:'Maimaita',sw:'Rudia',de:'Wiederholen',es:'Repetir',zh:'重复听读',ko:'반복 학습',ja:'リピート'},
  'Puzzles':{ar:'الألغاز',id:'Teka-teki',ur:'پہیلیاں',hi:'पहेलियाँ',hinglish:'Puzzles',bn:'ধাঁধা',ms:'Teka-teki',fa:'معماها',tr:'Bulmacalar',uz:'Boshqotirmalar',fr:'Puzzles',ru:'Задания',ha:'Wasannin ilimi',sw:'Mafumbo',de:'Rätsel',es:'Acertijos',zh:'经文拼图',ko:'퍼즐',ja:'パズル'},
  'Revision':{ar:'المراجعة',id:'Murajaah',ur:'دہرائی',hi:'रिवीज़न',hinglish:'Revision',bn:'রিভিশন',ms:'Ulang kaji',fa:'مرور',tr:'Tekrar',uz:'Takrorlash',fr:'Révision',ru:'Повторение',ha:'Bita',sw:'Marudio',de:'Wiederholung',es:'Repaso',zh:'复习',ko:'복습',ja:'復習'},
  'Islamic Quiz':{ar:'مسابقة إسلامية',id:'Kuis Islami',ur:'اسلامی کوئز',hi:'इस्लामी क्विज़',hinglish:'Islamic Quiz',bn:'ইসলামিক কুইজ',ms:'Kuiz Islam',fa:'آزمون اسلامی',tr:'İslami Bilgi Yarışması',uz:'Islomiy viktorina',fr:'Quiz Islamique',ru:'Исламская викторина',ha:'Gasar Musulunci',sw:'Maswali ya Kiislamu',de:'Islam-Quiz',es:'Cuestionario Islámico',zh:'伊斯兰问答',ko:'이슬람 퀴즈',ja:'イスラムクイズ'},
  'Start here':{ar:'ابدأ من هنا',id:'Mulai di sini',ur:'یہاں سے شروع کریں',hi:'यहाँ से शुरू करें',hinglish:'Yahan se shuru karein',bn:'এখান থেকে শুরু করুন',ms:'Mula di sini',fa:'از اینجا شروع کنید',tr:'Buradan başla',uz:'Shu yerdan boshlang',fr:'Commencer ici',ru:'Начать здесь',ha:'Fara daga nan',sw:'Anza hapa',de:'Hier starten',es:'Empieza aquí',zh:'从这里开始',ko:'여기서 시작',ja:'ここから始める'},
  'Qibla Direction':{ar:'اتجاه القبلة',id:'Arah Kiblat',ur:'قبلہ کا رخ',hi:'क़िब्ला दिशा',hinglish:'Qibla Direction',bn:'কিবলার দিক',ms:'Arah Kiblat',fa:'جهت قبله',tr:'Kıble Yönü',uz:'Qibla yo‘nalishi',fr:'Direction de la Qibla',ru:'Направление Киблы',ha:'Alƙibla',sw:'Mwelekeo wa Qibla',de:'Qibla-Richtung',es:'Dirección de la Qibla',zh:'朝向 (Qibla)',ko:'키블라 방향',ja:'キブラの方角'},
  'Namaz Timings & Azan':{ar:'مواقيت الصلاة والأذان',id:'Jadwal Sholat & Adzan',ur:'نماز کے اوقات اور اذان',hi:'नमाज़ का समय और अज़ान',hinglish:'Namaz Timings & Azan',bn:'নামাজের সময় ও আজান',ms:'Waktu Solat & Azan',fa:'اوقات شرعی و اذان',tr:'Namaz Vakitleri ve Ezan',uz:'Namoz vaqtlari va Azon',fr:'Horaires de prière & Adhan',ru:'Время намаза и Азан',ha:'Lokutan Sallah da Kira',sw:'Nyakati za Swala na Adhana',de:'Gebetszeiten & Adhan',es:'Horarios de oración y Adhan',zh:'礼拜时间与宣礼',ko:'예배 시간 및 아잔',ja:'礼拝時間とアザーン'},

  'Settings, offline library & backup':{ar:'الإعدادات والمكتبة دون إنترنت والنسخ الاحتياطي',id:'Pengaturan, pustaka offline & cadangan',ur:'سیٹنگز، آف لائن لائبریری اور بیک اپ',hi:'सेटिंग्स, ऑफलाइन लाइब्रेरी और बैकअप',hinglish:'Settings, offline library aur backup',bn:'সেটিংস, অফলাইন লাইব্রেরি ও ব্যাকআপ',ms:'Tetapan, pustaka luar talian & sandaran',fa:'تنظیمات، کتابخانه آفلاین و پشتیبان‌گیری',tr:'Ayarlar, çevrimdışı kütüphane ve yedekleme',uz:'Sozlamalar, oflayn kutubxona va zaxira',fr:'Paramètres, bibliothèque hors ligne et sauvegarde',ru:'Настройки, офлайн-библиотека и резервная копия',ha:'Saituna, ɗakin karatu na layi da ajiya',sw:'Mipangilio, maktaba ya nje ya mtandao na nakala',de:'Einstellungen, Offline-Bibliothek & Backup',es:'Ajustes, biblioteca sin conexión y copia',zh:'设置、离线库与备份',ko:'설정, 오프라인 라이브러리 및 백업',ja:'設定・オフライン・バックアップ'},
  'Appearance':{ar:'المظهر',id:'Tampilan',ur:'ظاہری شکل',hi:'दिखावट',hinglish:'Appearance',bn:'চেহারা ও থিম',ms:'Penampilan',fa:'ظاهر برنامه',tr:'Görünüm',uz:'Ko‘rinish',fr:'Apparence',ru:'Оформление',ha:'Bayyanar',sw:'Mwonekano',de:'Darstellung',es:'Apariencia',zh:'外观',ko:'화면 설정',ja:'外観'},
  'App Language':{ar:'لغة التطبيق',id:'Bahasa Aplikasi',ur:'ایپ کی زبان',hi:'ऐप की भाषा',hinglish:'App Language',bn:'অ্যাপের ভাষা',ms:'Bahasa Aplikasi',fa:'زبان برنامه',tr:'Uygulama Dili',uz:'Ilova tili',fr:'Langue de l’application',ru:'Язык приложения',ha:'Harshen Manhaja',sw:'Lugha ya Programu',de:'App-Sprache',es:'Idioma de la app',zh:'应用语言',ko:'앱 언어',ja:'アプリ言語'},
  'Theme':{ar:'السمة',id:'Tema',ur:'تھیم',hi:'थीम',hinglish:'Theme',bn:'থিম',ms:'Tema',fa:'پوسته',tr:'Tema',uz:'Mavzu',fr:'Thème',ru:'Тема',ha:'Jigo',sw:'Mandhari',de:'Design',es:'Tema',zh:'主题',ko:'테마',ja:'テーマ'},
  'Opening intro':{ar:'مقدمة الفتح',id:'Intro pembuka',ur:'افتتاحی انٹرو',hi:'ओपनिंग इंट्रो',hinglish:'Opening intro',bn:'শুরুর ইন্ট্রো',ms:'Intro pembukaan',fa:'مقدمه ورودی',tr:'Açılış introsu',uz:'Kirish animatsiyasi',fr:'Intro d’ouverture',ru:'Вступительная заставка',ha:'Gabatarwar buɗewa',sw:'Utangulizi wa ufunguzi',de:'Start-Intro',es:'Intro de apertura',zh:'启动开场动画',ko:'시작 인트로',ja:'オープニング'},
  'Intro sound':{ar:'صوت المقدمة',id:'Suara intro',ur:'انٹرو کی آواز',hi:'इंट्रो आवाज़',hinglish:'Intro sound',bn:'ইন্ট্রো সাউন্ড',ms:'Bunyi intro',fa:'صدای مقدمه',tr:'İntro sesi',uz:'Kirish ovozi',fr:'Son de l’intro',ru:'Звук заставки',ha:'Sautin gabatarwa',sw:'Sauti ya utangulizi',de:'Intro-Ton',es:'Sonido de intro',zh:'开场音效',ko:'인트로 소리',ja:'イントロ音声'},
  'Arabic size':{ar:'حجم الخط العربي',id:'Ukuran teks Arab',ur:'عربی خط کا سائز',hi:'अरबी टेक्स्ट साइज़',hinglish:'Arabic size',bn:'আরবি ফন্টের আকার',ms:'Saiz teks Arab',fa:'اندازه خط عربی',tr:'Arapça yazı boyutu',uz:'Arabcha matn hajmi',fr:'Taille de l’arabe',ru:'Размер арабского шрифта',ha:'Girman rubutun Larabci',sw:'Ukubwa wa Kiarabu',de:'Arabische Schriftgröße',es:'Tamaño árabe',zh:'阿拉伯语字号',ko:'아랍어 글자 크기',ja:'アラビア語サイズ'},
  'Translation size':{ar:'حجم الترجمة',id:'Ukuran terjemahan',ur:'ترجمے کا سائز',hi:'अनुवाद टेक्स्ट साइज़',hinglish:'Translation size',bn:'অনুবাদের ফন্টের আকার',ms:'Saiz terjemahan',fa:'اندازه متن ترجمه',tr:'Meal yazı boyutu',uz:'Tarjima matn hajmi',fr:'Taille de la traduction',ru:'Размер перевода',ha:'Girman fassara',sw:'Ukubwa wa tafsiri',de:'Übersetzungsgröße',es:'Tamaño de traducción',zh:'译文字号',ko:'번역 글자 크기',ja:'翻訳サイズ'},
  'Reading & listening':{ar:'القراءة والاستماع',id:'Membaca & mendengarkan',ur:'تلاوت اور سماعت',hi:'पढ़ना और सुनना',hinglish:'Reading & listening',bn:'পড়া ও শোনা',ms:'Bacaan & mendengar',fa:'قرائت و شنیدن',tr:'Okuma ve dinleme',uz:'O‘qish va tinglash',fr:'Lecture et écoute',ru:'Чтение и прослушивание',ha:'Karatu da sauraro',sw:'Kusoma na kusikiliza',de:'Lesen & Hören',es:'Lectura y audio',zh:'阅读与听读',ko:'읽기 및 듣기',ja:'閲覧と音声'},
  'Default reciter':{ar:'القارئ الافتراضي',id:'Qari default',ur:'قاری منتخب کریں',hi:'डिफ़ॉल्ट क़ारी',hinglish:'Default reciter',bn:'ডিফল্ট ক্বারী',ms:'Qari pilihan',fa:'قاری پیش‌فرض',tr:'Varsayılan hafız',uz:'Asosiy qori',fr:'Récitateur par défaut',ru:'Чтец по умолчанию',ha:'Mai karatu',sw:'Msomaji chaguo-msingi',de:'Standard-Rezitator',es:'Recitador predeterminado',zh:'默认诵读者',ko:'기본 암송자',ja:'既定の朗誦者'},
  'Offline library':{ar:'المكتبة دون إنترنت',id:'Pustaka offline',ur:'آف لائن لائبریری',hi:'ऑफलाइन लाइब्रेरी',hinglish:'Offline library',bn:'অফলাইন লাইব্রেরি',ms:'Pustaka luar talian',fa:'کتابخانه آفلاین',tr:'Çevrimdışı kütüphane',uz:'Oflayn kutubxona',fr:'Bibliothèque hors ligne',ru:'Офлайн-библиотека',ha:'Ɗakin karatu na layi',sw:'Maktaba ya nje ya mtandao',de:'Offline-Bibliothek',es:'Biblioteca sin conexión',zh:'离线库',ko:'오프라인 라이브러리',ja:'オフラインライブラリ'},
  'Backup':{ar:'النسخ الاحتياطي',id:'Cadangan',ur:'بیک اپ',hi:'बैकअप',hinglish:'Backup',bn:'ব্যাকআপ',ms:'Sandaran',fa:'پشتیبان‌گیری',tr:'Yedekleme',uz:'Zaxira nusxa',fr:'Sauvegarde',ru:'Резервная копия',ha:'Ajiya',sw:'Nakala rudufu',de:'Sicherung',es:'Copia de seguridad',zh:'备份',ko:'백업',ja:'バックアップ'},
  'About':{ar:'حول التطبيق',id:'Tentang',ur:'تعارف',hi:'ऐप के बारे में',hinglish:'About',bn:'সম্পর্কে',ms:'Perihal',fa:'درباره برنامه',tr:'Hakkında',uz:'Ilova haqida',fr:'À propos',ru:'О приложении',ha:'Game da',sw:'Kuhusu',de:'Über die App',es:'Acerca de',zh:'关于',ko:'정보',ja:'アプリについて'},
  'Try again':{ar:'حاول مرة أخرى',id:'Coba lagi',ur:'دوبارہ کوشش کریں',hi:'फिर से कोशिश करें',hinglish:'Dobara try karein',bn:'আবার চেষ্টা করুন',ms:'Cuba lagi',fa:'تلاش مجدد',tr:'Tekrar dene',uz:'Qayta urinish',fr:'Réessayer',ru:'Повторить',ha:'Sake gwadawa',sw:'Jaribu tena',de:'Erneut versuchen',es:'Intentar de nuevo',zh:'重试',ko:'다시 시도',ja:'再試行'},
  'Copy':{ar:'نسخ',id:'Salin',ur:'کاپی',hi:'कॉपी',hinglish:'Copy',bn:'কপি',ms:'Salin',fa:'کپی',tr:'Kopyala',uz:'Nusxalash',fr:'Copier',ru:'Копировать',ha:'Kwafi',sw:'Nakili',de:'Kopieren',es:'Copiar',zh:'复制',ko:'복사',ja:'コピー'},
  'Search surah':{ar:'ابحث عن سورة',id:'Cari surah',ur:'سورہ تلاش کریں',hi:'सूरह खोजें',hinglish:'Surah dhoondhein',bn:'সূরা খুঁজুন',ms:'Cari surah',fa:'جستجوی سوره',tr:'Sure ara',uz:'Sura qidirish',fr:'Rechercher une sourate',ru:'Поиск суры',ha:'Nemi sura',sw:'Tafuta sura',de:'Sure suchen',es:'Buscar sura',zh:'搜索章节',ko:'수라 검색',ja:'章を検索'},
  'Search by name, number or meaning':{ar:'ابحث بالاسم أو الرقم أو المعنى',id:'Cari berdasarkan nama, nomor, atau arti',ur:'نام، نمبر یا معنی سے تلاش کریں',hi:'नाम, नंबर या अर्थ से खोजें',hinglish:'Naam, number ya matlab se search karein',bn:'নাম, নম্বর বা অর্থ দিয়ে খুঁজুন',ms:'Cari ikut nama, nombor atau makna',fa:'جستجو بر اساس نام، شماره یا معنی',tr:'İsme, numaraya veya anlama göre ara',uz:'Nomi, raqami yoki ma’nosi bo‘yicha qidirish',fr:'Rechercher par nom, numéro ou sens',ru:'Поиск по названию, номеру или значению',ha:'Nemi ta suna, lamba ko ma’ana',sw:'Tafuta kwa jina, namba au maana',de:'Nach Name, Nummer oder Bedeutung suchen',es:'Buscar por nombre, número o significado',zh:'按名称、编号或含义搜索',ko:'이름, 번호 또는 뜻으로 검색',ja:'名前・番号・意味で検索'},
  'Listen to Quran by':{ar:'استمع إلى القرآن بصوت',id:'Dengarkan Al-Qur’an oleh',ur:'قرآن سنیں قاری',hi:'क़ुरआन सुनें (क़ारी)',hinglish:'Quran sunein by',bn:'কুরআন শুনুন (ক্বারী)',ms:'Dengar Al-Quran oleh',fa:'گوش دادن به قرآن با صدای',tr:'Kur’an dinle:',uz:'Qur’onni tinglang:',fr:'Écouter le Coran par',ru:'Слушать Коран в исполнении',ha:'Saurari Al-Qur’ani ta bakin',sw:'Sikiliza Qur’ani kwa sauti ya',de:'Koran hören von',es:'Escuchar el Corán por',zh:'选择诵读者听经',ko:'낭송자 선택 듣기',ja:'朗誦者を選んで聴く'},
  'Full Player →':{ar:'المشغّل الكامل ←',id:'Pemutar Penuh →',ur:'مکمل پلیئر ←',hi:'पूरा प्लेयर →',hinglish:'Full Player →',bn:'সম্পূর্ণ প্লেয়ার →',ms:'Pemain Penuh ←',fa:'پخش‌کننده کامل ←',tr:'Tam Oynatıcı →',uz:'To‘liq pleyer →',fr:'Lecteur complet →',ru:'Полный плеер →',ha:'Cikakken Player →',sw:'Kichezaji Kamili →',de:'Vollständiger Player →',es:'Reproductor completo →',zh:'完整播放器 →',ko:'전체 플레이어 →',ja:'フルプレーヤー →'},
  'Medinan':{ar:'مدنية',id:'Madaniyah',ur:'مدنی',hi:'मदनी',hinglish:'Medinan',bn:'মাদানী',ms:'Madaniyah',fa:'مدنی',tr:'Medenî',uz:'Madaniy',fr:'Médinoise',ru:'Мединская',ha:'Madaniyya',sw:'Ki-Madina',de:'Medinensisch',es:'Medinense',zh:'麦地那章',ko:'메디나 계시',ja:'マディーナ啓示'},
  'Meccan':{ar:'مكية',id:'Makkiyah',ur:'مکی',hi:'मक्की',hinglish:'Meccan',bn:'মাক্কী',ms:'Makkiyah',fa:'مکی',tr:'Mekkî',uz:'Makkiy',fr:'Mecquoise',ru:'Мекканская',ha:'Makkiyya',sw:'Ki-Makka',de:'Mekkanisch',es:'Mequense',zh:'麦加章',ko:'메카 계시',ja:'マッカ啓示'},
  '30 paras':{ar:'٣٠ جزءًا',id:'30 Juz',ur:'30 پارے',hi:'30 पारे',hinglish:'30 paras',bn:'৩০ পারা',ms:'30 Juzuk',fa:'۳۰ جزء',tr:'30 Cüz',uz:'30 pora',fr:'30 Juz',ru:'30 джузов',ha:'Juz’ai 30',sw:'Juzu 30',de:'30 Dschuz',es:'30 Yuz',zh:'30卷',ko:'30주즈',ja:'30ジュズ'},
  'Apna sawal likhein…':{ar:'اكتب سؤالك هنا…',id:'Tulis pertanyaanmu…',ur:'اپنا سوال لکھیں…',hi:'अपना सवाल लिखें…',hinglish:'Apna sawal likhein…',bn:'আপনার প্রশ্ন লিখুন…',ms:'Tulis soalan anda…',fa:'سؤال خود را بنویسید…',tr:'Sorunuzu yazın…',uz:'Savolingizni yozing…',fr:'Écrivez votre question…',ru:'Напишите ваш вопрос…',ha:'Rubuta tambayarka…',sw:'Andika swali lako…',de:'Schreibe deine Frage…',es:'Escribe tu pregunta…',zh:'请输入您的问题…',ko:'질문을 입력하세요…',ja:'質問を入力してください…'},

  'Namaz ka Tareeqa':{ar:'طريقة الصلاة',id:'Tata Cara Sholat',ur:'نماز کا طریقہ',hi:'नमाज़ का तरीका',hinglish:'Namaz ka Tareeqa',bn:'নামাজের নিয়ম',ms:'Cara Solat',fa:'روش نماز خواندن',tr:'Namaz Kılınışı',uz:'Namoz o‘qish tartibi',fr:'Comment faire la Salat',ru:'Порядок намаза',ha:'Yadda ake Sallah',sw:'Namna ya Kuswali',de:'Gebetsanleitung',es:'Cómo hacer la Salat',zh:'礼拜方法',ko:'예배 방법',ja:'礼拝の方法'},
  'Ungli se ghumayein':{ar:'اسحب بإصبعك للتدوير 360°',id:'Geser dengan jari untuk putar 360°',ur:'انگلی سے 360° گھمائیں',hi:'उंगली से 360° घुमाएँ',hinglish:'Ungli se 360° ghumayein',bn:'আঙুল দিয়ে ৩৬০° ঘোরান',ms:'Seret dengan jari untuk putar 360°',fa:'با انگشت ۳۶۰ درجه بچرخانید',tr:'360° döndürmek için parmağınızla kaydırın',uz:'360° aylantirish uchun barmoq bilan suring',fr:'Faites glisser pour pivoter à 360°',ru:'Вращайте пальцем на 360°',ha:'Ja da yatsa don juyawa 360°',sw:'Zungusha 360° kwa kidole',de:'Mit dem Finger 360° drehen',es:'Desliza para girar 360°',zh:'手指滑动360°旋转',ko:'손가락으로 360° 회전',ja:'指で360°回転'},
  '← Pichhla':{ar:'→ السابق',id:'← Sebelumnya',ur:'→ پچھلا',hi:'← पिछला',hinglish:'← Pichhla',bn:'← পূর্ববর্তী',ms:'← Sebelum',fa:'→ قبلی',tr:'← Önceki',uz:'← Oldingi',fr:'← Précédent',ru:'← Назад',ha:'← Baya',sw:'← Iliyopita',de:'← Zurück',es:'← Anterior',zh:'← 上一步',ko:'← 이전',ja:'← 前へ'},
  'Agla →':{ar:'التالي ←',id:'Berikutnya →',ur:'اگلا ←',hi:'अगला →',hinglish:'Agla →',bn:'পরবর্তী →',ms:'Seterusnya →',fa:'بعدی ←',tr:'Sonraki →',uz:'Keyingi →',fr:'Suivant →',ru:'Далее →',ha:'Gaba →',sw:'Ifuatayo →',de:'Weiter →',es:'Siguiente →',zh:'下一步 →',ko:'다음 →',ja:'次へ →'},
  'Dalil':{ar:'الدليل (الحديث)',id:'Dalil (Hadis)',ur:'دلیل (حدیث)',hi:'दलील (हदीस)',hinglish:'Dalil (Hadith)',bn:'দলিল (হাদিস)',ms:'Dalil (Hadis)',fa:'دلیل (حدیث)',tr:'Delil (Hadis)',uz:'Dalil (Hadis)',fr:'Preuves (Hadith)',ru:'Доводы (Хадисы)',ha:'Dalili (Hadisi)',sw:'Dalili (Hadithi)',de:'Belege (Hadith)',es:'Evidencias (Hadiz)',zh:'圣训依据',ko:'근거 (하디스)',ja:'根拠（ハディース）'},
  '▶ Audio Suno':{ar:'▶ استمع للتلاوة',id:'▶ Putar Audio',ur:'▶ آڈیو سنیں',hi:'▶ ऑडियो सुनें',hinglish:'▶ Audio Suno',bn:'▶ অডিও শুনুন',ms:'▶ Main Audio',fa:'▶ پخش صوت',tr:'▶ Sesli Dinle',uz:'▶ Audioni tinglash',fr:'▶ Écouter l’audio',ru:'▶ Слушать аудио',ha:'▶ Ji Sauti',sw:'▶ Sikiliza Sauti',de:'▶ Audio abspielen',es:'▶ Escuchar audio',zh:'▶ 播放音频',ko:'▶ 오디오 듣기',ja:'▶ 音声を聴く'},
  '⏹ Audio Rokein':{ar:'⏹ إيقاف الصوت',id:'⏹ Hentikan Audio',ur:'⏹ آڈیو روکیں',hi:'⏹ ऑडियो रोकें',hinglish:'⏹ Audio Rokein',bn:'⏹ অডিও থামান',ms:'⏹ Henti Audio',fa:'⏹ توقف صوت',tr:'⏹ Sesi Durdur',uz:'⏹ Audioni to‘xtatish',fr:'⏹ Arrêter l’audio',ru:'⏹ Остановить',ha:'⏹ Tsaya da Sauti',sw:'⏹ Simamisha Sauti',de:'⏹ Stopp',es:'⏹ Detener audio',zh:'⏹ 停止播放',ko:'⏹ 정지',ja:'⏹ 停止'},
  '← App':{ar:'→ التطبيق',id:'← Aplikasi',ur:'→ ایپ',hi:'← ऐप',hinglish:'← App',bn:'← অ্যাপ',ms:'← Aplikasi',fa:'→ برنامه',tr:'← Uygulama',uz:'← Ilova',fr:'← Appli',ru:'← Приложение',ha:'← Manhaja',sw:'← Programu',de:'← App',es:'← App',zh:'← 返回应用',ko:'← 앱',ja:'← アプリ'}
};

function norm(code){
  const raw=String(code||'').trim().toLowerCase().replace('_','-');
  if(BY_CODE[raw])return raw;
  const base=raw.split('-')[0];
  return BY_CODE[base]?base:'en';
}
function get(){
  try{const s=localStorage.getItem(KEY);if(s)return norm(s)}catch(e){}
  return 'hi';
}
function phrase(str,lang){
  const l=lang||get();
  if(l==='en')return str;
  const entry=D[str];
  return (entry&&entry[l])?entry[l]:str;
}
function dynPhrase(str,lang){
  const l=lang||get();
  if(l==='en')return str;
  let m;
  m=str.match(/^(\d+)\s+surahs\s*·\s*([\d,]+)\s+ayat$/i);
  if(m){
    if(l==='hi')return m[1]+' सूरह · '+m[2]+' आयतें';
    if(l==='hinglish')return m[1]+' surahs · '+m[2]+' ayat';
    if(l==='ur')return m[1]+' سورتیں · '+m[2]+' آیات';
    if(l==='ar')return m[1]+' سورة · '+m[2]+' آية';
  }
  m=str.match(/^Ayah\s+(\d+)\s+of\s+(\d+)\s*·\s*Juz\s+(\d+)$/i);
  if(m){
    if(l==='hi')return 'आयत '+m[1]+' / '+m[2]+' · पारा '+m[3];
    if(l==='hinglish')return 'Ayah '+m[1]+' of '+m[2]+' · Juz '+m[3];
    if(l==='ur')return 'آیت '+m[1]+' از '+m[2]+' · پارہ '+m[3];
    if(l==='ar')return 'آية '+m[1]+' من '+m[2]+' · جزء '+m[3];
  }
  m=str.match(/^(\d+)\s+of\s+(\d+)\s+ayat\s+memorised$/i);
  if(m){
    if(l==='hi')return m[1]+' / '+m[2]+' आयतें याद';
    if(l==='hinglish')return m[1]+' of '+m[2]+' ayat yaad';
    if(l==='ur')return m[1]+' از '+m[2]+' آیات حفظ';
    if(l==='ar')return m[1]+' من '+m[2]+' آية محفوظة';
  }
  m=str.match(/^(\d+)\s+bookmarks$/i);
  if(m){
    if(l==='hi')return m[1]+' बुकमार्क';
    if(l==='hinglish')return m[1]+' bookmarks';
    if(l==='ur')return m[1]+' بُک مارکس';
    if(l==='ar')return m[1]+' علامات مرجعية';
  }
  m=str.match(/^Kitaab\s+(\d+)$/i);
  if(m){
    if(l==='hi')return 'किताब '+m[1];
    if(l==='hinglish')return 'Kitaab '+m[1];
    if(l==='ur')return 'کتاب '+m[1];
    if(l==='ar')return 'كتاب '+m[1];
  }
  m=str.match(/^(\d+)\s+hadith$/i);
  if(m){
    if(l==='hi')return m[1]+' हदीस';
    if(l==='hinglish')return m[1]+' hadith';
    if(l==='ur')return m[1]+' احادیث';
    if(l==='ar')return m[1]+' حديث';
  }
  m=str.match(/^(\d+)\s+of\s+(\d+)\s+surahs\s+saved\s+for\s+offline\s+reading\.$/i);
  if(m){
    if(l==='hi')return 'ऑफ़लाइन पढ़ने के लिए 114 में से '+m[1]+' सूरह सेव हैं।';
    if(l==='hinglish')return m[1]+' of '+m[2]+' surahs offline reading ke liye save hain.';
    if(l==='ur')return 'آف لائن پڑھنے کے لیے '+m[2]+' میں سے '+m[1]+' سورتیں محفوظ ہیں۔';
  }
  return null;
}
function t(str,lang){
  const l=lang||get();
  if(D[str]&&D[str][l])return D[str][l];
  const dy=dynPhrase(str,l);
  if(dy)return dy;
  return l==='en'?str:phrase(str,l);
}
function applyDocMeta(lang){
  const info=BY_CODE[lang]||BY_CODE.en;
  document.documentElement.lang=lang==='hinglish'?'en-IN':lang;
  document.documentElement.dir=info.dir;
  document.documentElement.dataset.lang=lang;
}

function shouldSkip(el){
  if(!el||el.nodeType!==1)return true;
  if(/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/i.test(el.tagName))return true;
  if(el.id==='sLang'||el.id==='namazLang'||el.classList.contains('no-i18n'))return true;
  if(el.getAttribute('lang')==='ar'||el.classList.contains('ar')||el.classList.contains('ar-text')||el.classList.contains('hd-ar')||el.classList.contains('dy-ar'))return true;
  return false;
}
function applyTree(root,lang){
  lang=lang||get();
  if(!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
    acceptNode(n){
      const p=n.parentElement;
      if(!p||shouldSkip(p))return NodeFilter.FILTER_REJECT;
      const raw=n.nodeValue;if(!raw||!raw.trim())return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while((node=w.nextNode())){
    if(!node._zdOrig){
      const k=node.nodeValue.trim();
      if(D[k]||dynPhrase(k,'hi'))node._zdOrig=node.nodeValue;
    }
    if(node._zdOrig){
      const orig=node._zdOrig,trimmed=orig.trim();
      const tr=t(trimmed,lang);
      const next=orig.replace(trimmed,tr);
      if(node.nodeValue!==next)node.nodeValue=next;
    }
  }
  root.querySelectorAll&&root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
    if(!el.dataset.zdPhOrig&&(D[el.placeholder]||dynPhrase(el.placeholder,'hi')))el.dataset.zdPhOrig=el.placeholder;
    if(el.dataset.zdPhOrig)el.placeholder=t(el.dataset.zdPhOrig,lang);
  });
}

function applyAll(){
  const lang=get();
  applyDocMeta(lang);
  const nav=document.querySelector('.nav');if(nav)applyTree(nav,lang);
  const view=document.getElementById('view');if(view)applyTree(view,lang);
  const hd=document.querySelector('header');if(hd&&!view)applyTree(hd,lang);
  if(!view)applyTree(document.body,lang);
}

let switching=false;
function set(code){
  const l=norm(code);
  try{localStorage.setItem(KEY,l)}catch(e){}
  applyDocMeta(l);
  const info=BY_CODE[l]||BY_CODE.en;
  document.dispatchEvent(new CustomEvent('zikr:languagechange',{detail:{language:l,dir:info.dir}}));
  if(!switching&&window.ZD&&typeof window.ZD.route==='function'){
    switching=true;
    Promise.resolve(window.ZD.route()).then(()=>applyAll()).finally(()=>{switching=false});
  }else{
    applyAll();
  }
  if(window.ZD&&window.ZD.toast)window.ZD.toast(info.name);
}

function openPicker(){
  if(!window.ZD||!window.ZD.openSheet)return;
  const cur=get();
  const html='<h3>🌐 '+window.ZD.esc(t('App Language',cur))+'</h3><div class="no-i18n" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'+
    LANGS.map(x=>'<button type="button" class="btn sm '+(x[0]===cur?'':'ghost')+'" data-setlang="'+x[0]+'" style="justify-content:space-between;padding:0 12px"><span>'+window.ZD.esc(x[1])+'</span>'+(x[0]===cur?'<span>✓</span>':'')+'</button>').join('')+
    '</div>';
  window.ZD.openSheet(html,sh=>{
    sh.addEventListener('click',e=>{
      const b=e.target.closest('[data-setlang]');
      if(b){window.ZD.closeSheet();set(b.dataset.setlang)}
    });
  });
}

const API={KEY,LANGS,BY_CODE,get,set,t,apply:applyAll,applyTree,openPicker,optionsHTML:cur=>LANGS.map(x=>'<option value="'+x[0]+'"'+(x[0]===(cur||get())?' selected':'')+'>'+x[1]+'</option>').join('')};
window.ZD_I18N=API;
if(window.ZD)window.ZD.i18n=API;

applyDocMeta(get());
let obsT=0;
function hook(){
  applyAll();
  const v=document.getElementById('view');
  if(v&&typeof MutationObserver!=='undefined'){
    new MutationObserver(()=>{clearTimeout(obsT);obsT=setTimeout(()=>applyTree(v,get()),20)}).observe(v,{childList:true,subtree:true});
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-act="lang"]');
    if(b){e.preventDefault();openPicker()}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
})();
