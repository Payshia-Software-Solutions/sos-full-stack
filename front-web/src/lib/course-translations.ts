export interface LocalizedModule {
  number: number;
  title: string;
  desc: string;
  topics: string[];
}

export interface LocalizedCareer {
  role: string;
  field: string;
  desc: string;
}

export interface LocalizedStudyPackItem {
  title: string;
  desc: string;
  iconType: 'book' | 'workbook' | 'chart' | 'truck';
}

export interface LocalizedFaq {
  q: string;
  a: string;
}

export interface CourseTranslation {
  name: string;
  badge: string;
  subtitle: string;
  description: string;
  highlights: { title: string; desc: string }[];
  studyPackTitle: string;
  studyPackSubtitle: string;
  studyPackItems: LocalizedStudyPackItem[];
  curriculumTitle: string;
  curriculumSubtitle: string;
  modules: LocalizedModule[];
  whoCanJoinTitle: string;
  whoCanJoin: { title: string; desc: string }[];
  careerTitle: string;
  careerSubtitle: string;
  careers: LocalizedCareer[];
  learningExperienceTitle: string;
  learningExperience: { title: string; desc: string }[];
  faqsTitle: string;
  faqs: LocalizedFaq[];
}

export const COURSE_TRANSLATIONS: Record<string, Record<'si' | 'ta' | 'en', CourseTranslation>> = {
  'certificate-course-in-pharmacy-practice': {
    si: {
      name: 'ඖෂධවේදී භාවිතය පිළිබඳ සහතික පත්‍ර පාඨමාලාව (CCPP)',
      badge: 'ශ්‍රී ලංකාවේ #1 ප්‍රමුඛතම ඖෂධවේදී සහතික පත්‍රය • ACTD & ISO 9001:2015',
      subtitle: 'ඖෂධවේදය, බෙහෙත් වට්ටෝරු කියවීම, ඖෂධ නිකුත් කිරීම (Dispensing) සහ පාරිභෝගික සත්කාරය පිළිබඳ ප්‍රායෝගික පුහුණුව නිවසේ සිටම ලබාගන්න.',
      description: `ශ්‍රී ලංකාවේ ප්‍රමුඛතම සහ වැඩිම පිරිසක් තෝරාගන්නා මාස 6ක මාර්ගගත (Online) ඖෂධවේදී පාඨමාලාවයි. නවීන ප්‍රජා ඖෂධහලක සහ රෝහල් ඖෂධාගාරයක සේවය කිරීමට අවශ්‍ය මූලික ඖෂධවේදය, ඖෂධ වර්ගීකරණය, වෛද්‍ය බෙහෙත් වට්ටෝරු කියවීම, මාත්‍රා ගණනය සහ සදාචාරාත්මක ඖෂධ නිකුත් කිරීම (Good Dispensing Practice) පිළිබඳ පූර්ණ න්‍යායික සහ ප්‍රායෝගික දැනුම මෙමගින් ලබාදේ.

සාමාන්‍ය පෙළ (O/L) හෝ උසස් පෙළ (A/L) නිමකළ සිසුන්ට, දැනට ෆාමසි සහායකයින් ලෙස සේවය කරන්නන්ට, සහ ඖෂධ ක්ෂේත්‍රයේ රැකියාවක් හෝ තමන්ගේම ඖෂධහලක් ආරම්භ කිරීමට බලාපොරොත්තු වන සැමට මෙම පාඨමාලාව වඩාත් සුදුසු වේ.

ලියාපදිංචි වන සෑම සිසුවෙකුටම සම්පූර්ණ නිල මුද්‍රිත පොත් සහ අත්පොත් කට්ටලය නොමිලේම නිවසටම කුරියර් මගින් ලැබෙන අතර, සජීවී Zoom දේශන වලට අමතරව සියලුම දේශන පටිගත කිරීම් (Recordings) 24/7 ශිෂ්‍ය ද්වාරය (LMS) ඔස්සේ ඕනෑම වේලාවක නැරඹිය හැක.`,
      highlights: [
        {
          title: 'සජීවී Zoom දේශන + 24/7 LMS පටිගත කිරීම්',
          desc: 'ප්‍රවීණ ලියාපදිංචි ඖෂධවේදීන්ගේ මඟපෙන්වීම යටතේ සජීවී සාකච්ඡා සහ ඕනෑම වේලාවක නැරඹිය හැකි HD පටිගත කිරීම්.'
        },
        {
          title: 'නිල මුද්‍රිත පොත් කට්ටලය නිවසටම නොමිලේ',
          desc: 'ඖෂධ භාවිත අත්පොත, වට්ටෝරු අභ්‍යාස පොත සහ ඉක්මන් මඟපෙන්වීම් ඇතුළත් සම්පූර්ණ පොත් කට්ටලය ලංකාවේ ඕනෑම තැනකට නොමිලේ ඩිලිවරි.'
        },
        {
          title: 'අන්තර්ක්‍රියාකාරී ඖෂධ සමාකරණ ක්‍රීඩා (Play • Learn • Grow)',
          desc: 'ඖෂධ නම් සහ බෙහෙත් වට්ටෝරු පහසුවෙන් මතක තබාගැනීම සඳහා විශේෂයෙන් සැකසූ Virtual Dispensing ක්‍රීඩා.'
        },
        {
          title: 'ජාත්‍යන්තරව තහවුරු කළ හැකි ACTD සහතිකය',
          desc: 'ලංකාවේ සියලුම ප්‍රධාන පෞද්ගලික රෝහල් සහ ඖෂධහල් ජාලයන් පිළිගන්නා, QR Code මගින් මාර්ගගතව තහවුරු කළ හැකි නිල සහතිකය.'
        }
      ],
      studyPackTitle: 'නිවසටම නොමිලේ ලැබෙන නිල මුද්‍රිත පොත් කට්ටලය',
      studyPackSubtitle: 'ලියාපදිංචි වූ වහාම දිවයිනේ ඕනෑම ප්‍රදේශයකට Courier සේවාව මගින් නොමිලේම ඔබගේ නිවසටම එවන සම්පූර්ණ මුද්‍රිත අධ්‍යයන කට්ටලය:',
      studyPackItems: [
        {
          title: 'ප්‍රායෝගික ඖෂධවේදය නිල අත්පොත (Main Textbook)',
          desc: 'ඖෂධ වර්ගීකරණය, භාවිතය, මාත්‍රා, අතුරු ආබාධ සහ ක්‍රියාකාරීත්වය අඩංගු සවිස්තරාත්මක වර්ණවත් අධ්‍යයන ග්‍රන්ථය.',
          iconType: 'book'
        },
        {
          title: 'සැබෑ බෙහෙත් වට්ටෝරු කියවීමේ ප්‍රායෝගික අභ්‍යාස පොත',
          desc: 'වෛද්‍යවරුන්ගේ අත්අකුරු (Doctor Handwriting) කියවීම, වෛද්‍ය සංකේත සහ නිරවද්‍ය ඖෂධ නිකුත් කිරීම ප්‍රායෝගිකව පුරුදු කරවන Workbook එක.',
          iconType: 'workbook'
        },
        {
          title: 'ක්ෂණික ඖෂධ වගු සහ OTC Reference Charts',
          desc: 'ෆාමසියක කවුන්ටරයේදී ක්ෂණිකව පරිශීලනය කළ හැකි ලැමිනේට් කරන ලද ඖෂධ අන්තර්ක්‍රියා (Drug Interactions) සහ Cold Chain නීති.',
          iconType: 'chart'
        },
        {
          title: 'දිවයින පුරා නොමිලේම නිවසටම ඩිලිවරි (Free Courier Delivery)',
          desc: 'කොළඹ, මහනුවර, ගාල්ල, කුරුණෑගල, යාපනය ඇතුළු දිවයිනේ ඕනෑම දිස්ත්‍රික්කයකට කිසිදු අමතර ප්‍රවාහන ගාස්තුවකින් තොරව නිවසටම ලැබේ.',
          iconType: 'truck'
        }
      ],
      curriculumTitle: 'සම්පූර්ණ විෂය නිර්දේශය (Course Curriculum)',
      curriculumSubtitle: 'මාස 6 තුළ ආවරණය කෙරෙන ප්‍රධාන මොඩියුල 6 සහ ප්‍රායෝගික නිපුණතා:',
      modules: [
        {
          number: 1,
          title: 'මොඩියුලය 1: ඖෂධවේදය හැඳින්වීම සහ මූලික සංකල්ප',
          desc: 'ඖෂධවේදයේ ඉතිහාසය, ඖෂධයක් ශරීරයට ඇතුළු වන මාර්ග සහ ක්‍රියාකාරීත්වය.',
          topics: [
            'ඖෂධවේදයේ ඉතිහාසය සහ සහායක ඖෂධවේදියාගේ වගකීම්',
            'ඖෂධ ශරීරයට ඇතුළත් කිරීමේ මාර්ග (Oral, Parenteral, Topical, Inhalation)',
            'ඖෂධ චාලක විද්‍යාව (Pharmacokinetics - Absorption, Distribution, Metabolism, Excretion)',
            'ඖෂධ අතුරු ආබාධ සහ අනතුරු ඇඟවීම් හඳුනාගැනීම'
          ]
        },
        {
          number: 2,
          title: 'මොඩියුලය 2: ප්‍රධාන ඖෂධ කාණ්ඩ සහ වර්ගීකරණය',
          desc: 'දෛනිකව භාවිත වන සියලුම ප්‍රධාන ඖෂධ කාණ්ඩ පිළිබඳ ගැඹුරු අධ්‍යයනය.',
          topics: [
            'ප්‍රතිජීවක සහ ප්‍රතික්ෂුද්‍රජීවී ඖෂධ (Antibiotics & Antivirals)',
            'හෘද හා අධික රුධිර පීඩන ඖෂධ (Antihypertensives & Cardiac Drugs)',
            'දියවැඩියා ඖෂධ සහ ඉන්සියුලින් භාවිතය (Antidiabetics & Insulin)',
            'වේදනා නාශක සහ ප්‍රදාහ නාශක (NSAIDs, Analgesics & Antipyretics)',
            'ශ්වසන පද්ධතිය සහ ආමාශයික ඖෂධ (Respiratory & Gastrointestinal)'
          ]
        },
        {
          number: 3,
          title: 'මොඩියුලය 3: වෛද්‍ය බෙහෙත් වට්ටෝරු කියවීම සහ මාත්‍රා ගණනය',
          desc: 'වෛද්‍ය අත්අකුරු, වෛද්‍ය කෙටි යෙදුම් සහ නිරවද්‍ය මාත්‍රා ගණනය කිරීමේ පුහුණුව.',
          topics: [
            'වෛද්‍ය බෙහෙත් වට්ටෝරු වල අංග සහ වෛද්‍ය කෙටි යෙදුම් (Rx, b.i.d., t.i.d., p.r.n., etc.)',
            'ළමා (Paediatric) සහ වැඩිහිටි මාත්‍රා ගණනය කිරීම් සහ ශරීර බර අනුව මාත්‍රා සකස් කිරීම',
            'බෙහෙත් වට්ටෝරුවක දෝෂ (Prescription Errors) හඳුනාගැනීම සහ නිවැරදි කිරීම',
            'බර සහ පරිමා ඒකක පරිවර්තනය (Metric system, Conversions)'
          ]
        },
        {
          number: 4,
          title: 'මොඩියුලය 4: ප්‍රායෝගික ඖෂධ නිකුත් කිරීම සහ රෝගී උපදේශනය',
          desc: 'Good Dispensing Practice (GDP), ඇසුරුම්කරණය සහ රෝගී සන්නිවේදනය.',
          topics: [
            'යහපත් ඖෂධ නිකුත් කිරීමේ පිළිවෙත් (Good Dispensing Practice)',
            'ඖෂධ ලේබල් කිරීම, නිසි ඇසුරුම්කරණය සහ අනතුරු ඇඟවීමේ ලේබල්',
            'OTC (Over-The-Counter) සුළු රෝග සඳහා ඖෂධ සහ ප්‍රථමාධාර උපදෙස්',
            'රෝගීන් සමඟ ඵලදායී සන්නිවේදනය සහ නිවැරදි ඖෂධ භාවිත උපදෙස් දීම'
          ]
        },
        {
          number: 5,
          title: 'මොඩියුලය 5: ඖෂධ ගබඩාකරණය, Cold Chain සහ තොග පාලනය',
          desc: 'උෂ්ණත්ව පාලනය, ශීතකරණ ගබඩා සහ ඖෂධ නීතිමය රෙගුලාසි.',
          topics: [
            'ශීතකරණ ගබඩාකරණය සහ එන්නත් Cold Chain නඩත්තුව (2°C - 8°C)',
            'කල් ඉකුත්වීම් පාලනය සහ FEFO (First Expire First Out) ක්‍රමවේදය',
            'ශ්‍රී ලංකා ජාතික ඖෂධ නියාමන අධිකාරිය (NMRA) රෙගුලාසි',
            'විෂ හා අන්තරායදායක ඖෂධ (Dangerous Drugs / Schedule III & IV) පාලනය'
          ]
        },
        {
          number: 6,
          title: 'මොඩියුලය 6: අධ්‍යාපනික ක්‍රීඩා, LMS සහ ෆාමසි මෘදුකාංග',
          desc: 'පරිගණක මෘදුකාංග (POS), ඩිජිටල් ඉගෙනුම සහ සම්මුඛ පරීක්ෂණ සූදානම.',
          topics: [
            'Virtual Prescription Dispensing පරිගණක සමාකරණ ක්‍රීඩා',
            'ෆාමසි Point of Sale (POS) සහ බිල්පත් මෘදුකාංග හැඳින්වීම',
            'පාරිභෝගික සත්කාරය සහ වෘත්තීය ආචාරධර්ම',
            'ඖෂධවේදී සහායක රැකියා සඳහා සම්මුඛ පරීක්ෂණ (Job Interviews) සාර්ථක කරගැනීම'
          ]
        }
      ],
      whoCanJoinTitle: 'මෙම පාඨමාලාව කා සඳහාද?',
      whoCanJoin: [
        {
          title: 'පාසල් හැරගිය සිසුන් (O/L හෝ A/L)',
          desc: 'සාමාන්‍ය පෙළ හෝ උසස් පෙළ නිම කර, සෞඛ්‍ය ක්ෂේත්‍රයේ ස්ථිර හා ගෞරවනීය වෘත්තියක් අපේක්ෂා කරන තරුණ තරුණියන්.'
        },
        {
          title: 'දැනට සේවය කරන ෆාමසි සහායකයින්',
          desc: 'දැනටමත් ෆාමසි වල සේවය කරන, නිල න්‍යායික දැනුම සහ ජාත්‍යන්තර සහතිකයක් හරහා වැටුප් හා තනතුරු උසස්වීම් බලාපොරොත්තු වන්නන්.'
        },
        {
          title: 'වෛද්‍ය ප්‍රවර්ධන නියෝජිතයින් (Medical Reps)',
          desc: 'ඖෂධ සමාගම් වල වෛද්‍ය නියෝජිත (MPO) තනතුරු සඳහා ඖෂධ සහ රෝග පිළිබඳ ගැඹුරු විද්‍යාත්මක දැනුමක් අවශ්‍ය වන්නන්.'
        },
        {
          title: 'ෆාමසි හිමිකරුවන් සහ නව ආයෝජකයින්',
          desc: 'තමන්ගේම ඖෂධහලක් සාර්ථකව කළමනාකරණය කිරීමට, ඖෂධ තොග පාලනය සහ නීතිමය කරුණු දැනගැනීමට කැමති ව්‍යවසායකයින්.'
        }
      ],
      careerTitle: 'පාඨමාලාවෙන් පසු ඔබට හිමිවන රැකියා අවස්ථා',
      careerSubtitle: 'ලංකාවේ සහ විදේශයන්හි වේගයෙන් වර්ධනය වන ඖෂධ ක්ෂේත්‍රයේ ඉහළ ඉල්ලුමක් ඇති වෘත්තීන්:',
      careers: [
        {
          role: 'පෞද්ගලික රෝහල් ඖෂධවේදී සහායක',
          field: 'Private Hospitals',
          desc: 'Nawaloka, Asiri, Hemas, Durdans, Lanka Hospitals ඇතුළු ප්‍රමුඛ පෙළේ රෝහල් ජාලයන්හි සේවය කිරීමට සුදුසුකම්.'
        },
        {
          role: 'ප්‍රජා ඖෂධහල් සහායක / කළමනාකරු',
          field: 'Retail Community Pharmacies',
          desc: 'දිවයින පුරා පිහිටි Keells Pharmacies, Healthguard, MediCare සහ ප්‍රමුඛ පෙළේ ප්‍රජා ෆාමසි වල ස්ථිර රැකියා අවස්ථා.'
        },
        {
          role: 'වෛද්‍ය ප්‍රවර්ධන නියෝජිත (Medical Rep)',
          field: 'Pharmaceutical Marketing',
          desc: 'ප්‍රමුඛ පෙළේ ඖෂධ ආනයන සමාගම් වල ආකර්ෂණීය දීමනා සහ ඉහළ වැටුප් සහිත අලෙවි සහ ප්‍රවර්ධන ක්ෂේත්‍රය.'
        },
        {
          role: 'ඖෂධ තොග පාලක / Store Executive',
          field: 'Healthcare Supply Chain',
          desc: 'ඖෂධ ආනයන ආයතන, තොග බෙදාහැරීමේ මධ්‍යස්ථාන සහ රෝහල් ඖෂධ ගබඩාවල තොග පාලන නිලධාරී තනතුරු.'
        }
      ],
      learningExperienceTitle: 'සිලෝන් ෆාමා විද්‍යාලයේ සුවිශේෂී ඉගෙනුම් ක්‍රමවේදය',
      learningExperience: [
        {
          title: 'සජීවී අන්තර්ක්‍රියාකාරී Zoom දේශන',
          desc: 'සෑම සතියකම ප්‍රවීණ ලියාපදිංචි ඖෂධවේදීන් සමඟ සජීවීව සම්බන්ධ වී ප්‍රශ්න අසමින් සාකච්ඡා කළ හැක.'
        },
        {
          title: '24/7 Unlimited LMS පටිගත කිරීම්',
          desc: 'සජීවී දේශනයක් මඟහැරුණද ගැටලුවක් නැත — සියලුම HD පටිගත කිරීම් ඕනෑම වේලාවක ඔබේ දුරකථනයෙන් හෝ පරිගණකයෙන් නැරඹිය හැක.'
        },
        {
          title: 'Play • Learn • Grow සමාකරණ ක්‍රීඩා',
          desc: 'ඖෂධ නාම, කාණ්ඩ සහ මාත්‍රා මතක තබාගැනීම සතුටුදායක ක්‍රීඩාවක් බවට පත් කරන ඩිජිටල් ඉගෙනුම් මෙවලම්.'
        },
        {
          title: 'ශිෂ්‍ය සහායක WhatsApp කණ්ඩායම',
          desc: 'දේශකවරුන් සහ අනෙකුත් සිසුන් සමඟ නිරන්තරයෙන් දැනුම බෙදාගැනීමට විශේෂ WhatsApp සමූහයක්.'
        }
      ],
      faqsTitle: 'නිතර අසන ප්‍රශ්න (Frequently Asked Questions)',
      faqs: [
        {
          q: 'පාඨමාලාවට සම්බන්ධ වීමට අවශ්‍ය මූලික සුදුසුකම කුමක්ද?',
          a: 'අපොස සාමාන්‍ය පෙළ (O/L) හෝ උසස් පෙළ (A/L) පෙනී සිටීම ප්‍රමාණවත් වේ. විද්‍යා හෝ කලා ආදී ඕනෑම විෂය ධාරාවක සිසුන්ට අයදුම් කළ හැක.'
        },
        {
          q: 'පාඨමාලා ගාස්තුව වාරික වශයෙන් ගෙවිය හැකිද?',
          a: 'ඔව්, සම්පූර්ණ ගාස්තුව වන LKR 15,000 එකවර හෝ මසකට LKR 2,500 බැගින් මාස 6ක පහසු වාරික ක්‍රමයට ගෙවිය හැක.'
        },
        {
          q: 'මුද්‍රිත පොත් කට්ටලය නිවසටම ලැබෙන්නේ කෙසේද?',
          a: 'ඔබ ලියාපදිංචි වී පළමු ගෙවීම සිදුකළ වහාම, ලංකාවේ ඕනෑම දිස්ත්‍රික්කයක පිහිටි ඔබේ ලිපිනයටම Courier සේවාව මගින් කිසිදු අමතර ගාස්තුවකින් තොරව නිල පොත් කට්ටලය එවනු ලැබේ.'
        },
        {
          q: 'සජීවී දේශනයකට සහභාගී වීමට නොහැකි වුවහොත් කුමක් කළ යුතුද?',
          a: 'කිසිදු ගැටලුවක් නැත. සියලුම දේශන වල HD Recordings පැය 24 පුරාම ශිෂ්‍ය ද්වාරය (LMS) හරහා ඔබට නැවත නැවත නැරඹිය හැක.'
        },
        {
          q: 'මෙම සහතිකය රැකියාවක් ලබාගැනීමට වලංගුද?',
          a: 'ඔව්! මෙම සහතිකය ACTD (USA/UK) ජාත්‍යන්තර ප්‍රතීතනය සහ ISO 9001:2015 තත්ත්ව ප්‍රමිතියෙන් යුක්තය. ලංකාවේ ප්‍රමුඛ පෙළේ පෞද්ගලික රෝහල් සහ ඖෂධහල් ජාලයන් අපගේ සහතික සෘජුවම පිළිගන්නා අතර pharmacollege.lk/certificates හරහා ඕනෑම ආයතනයකට සත්‍යාපනය කරගත හැක.'
        }
      ]
    },
    en: {
      name: 'Certificate Course in Pharmacy Practice (CCPP)',
      badge: 'Sri Lanka’s #1 Most Trusted Pharmacy Training Credential • ACTD & ISO 9001:2015',
      subtitle: 'Master clinical pharmacology, prescription reading, community dispensing, and patient counseling through flexible online learning with doorstep delivery of physical textbooks.',
      description: `Sri Lanka’s premier 6-month online professional qualification designed to equip prospective healthcare professionals with practical and theoretical competencies in modern pharmacy practice, pharmacology, prescription interpretation, dosage calculations, and ethical medicine dispensing.

Tailored for school leavers (G.C.E. O/L or A/L), current pharmacy counter assistants seeking professional credentials, medical promotion representatives, and entrepreneurs planning to operate community pharmacies.

Includes live interactive Zoom lectures by registered pharmacist educators, 24/7 unlimited LMS access to HD recordings, educational simulation games, and an official printed reference study pack delivered directly to your doorstep island-wide with zero delivery charges.`,
      highlights: [
        {
          title: 'Live Zoom Lectures + 24/7 LMS HD Recordings',
          desc: 'Interactive weekend/evening classes led by university-qualified pharmacists, with permanent access to lecture recordings on our LMS.'
        },
        {
          title: 'Official Printed Study Pack Delivered Free',
          desc: 'Comprehensive textbooks, prescription workbooks, and laminated quick-reference charts delivered directly to your doorstep island-wide.'
        },
        {
          title: 'Interactive Dispensing Simulation Games',
          desc: 'Experience real-world prescription scenarios, pharmacology recall quizzes, and dispensing simulations based on our Play • Learn • Grow methodology.'
        },
        {
          title: 'Verifiable ACTD & ISO 9001:2015 Certification',
          desc: 'Globally recognized credential with a 24/7 verifiable QR code trusted by leading private hospitals and retail pharmacy chains.'
        }
      ],
      studyPackTitle: 'Official Printed Study Pack Delivered to Your Doorstep',
      studyPackSubtitle: 'Dispatched immediately upon enrollment via express courier to any district in Sri Lanka — zero extra shipping cost:',
      studyPackItems: [
        {
          title: 'Comprehensive Pharmacy Practice Handbook',
          desc: 'Full-color reference guide detailing drug classifications, pharmacology mechanisms, indications, dosages, and contraindications.',
          iconType: 'book'
        },
        {
          title: 'Prescription Verification & Dispensing Workbook',
          desc: 'Hands-on workbook featuring actual doctor handwriting samples, medical abbreviations, and simulated dispensing exercises.',
          iconType: 'workbook'
        },
        {
          title: 'Drug Interaction & OTC Quick Reference Charts',
          desc: 'Laminated counter charts for over-the-counter advice, dangerous drug-drug interactions, and cold-chain temperature rules.',
          iconType: 'chart'
        },
        {
          title: '100% Free Island-Wide Courier Delivery',
          desc: 'Delivered securely to Colombo, Kandy, Galle, Kurunegala, Jaffna, or any location across Sri Lanka at no additional shipping fee.',
          iconType: 'truck'
        }
      ],
      curriculumTitle: 'Comprehensive 6-Module Curriculum',
      curriculumSubtitle: 'Structured across 6 comprehensive learning modules designed to build job-ready pharmacy proficiency:',
      modules: [
        {
          number: 1,
          title: 'Module 1: Fundamentals of Pharmacy & Pharmacology',
          desc: 'Introduction to pharmaceutical sciences, drug administration routes, and pharmacokinetic principles.',
          topics: [
            'History and scope of pharmacy practice; roles of the assistant pharmacist',
            'Routes of drug administration (Oral, Parenteral, Topical, Inhalation)',
            'Pharmacokinetics (Absorption, Distribution, Metabolism, Excretion)',
            'Adverse drug reactions, side effects, and patient safety precautions'
          ]
        },
        {
          number: 2,
          title: 'Module 2: Major Drug Classifications & Therapeutics',
          desc: 'In-depth study of clinical medications across all major organ systems.',
          topics: [
            'Antibiotics, antifungals, and antiviral chemotherapy',
            'Cardiovascular medications and antihypertensives',
            'Diabetes management, insulin delivery, and endocrine agents',
            'Analgesics, NSAIDs, antipyretics, and pain management therapies',
            'Gastrointestinal and respiratory therapeutic agents'
          ]
        },
        {
          number: 3,
          title: 'Module 3: Medical Prescription Reading & Dosage Calculations',
          desc: 'Interpreting medical abbreviations, calculating safe dosages, and avoiding dispensing errors.',
          topics: [
            'Prescription anatomy and standard medical abbreviations (Rx, Sig, b.i.d., t.i.d., p.r.n.)',
            'Paediatric and geriatric dose calculation according to body weight',
            'Metric conversions and basic pharmaceutical calculations',
            'Error identification, contraindicated combinations, and verification protocols'
          ]
        },
        {
          number: 4,
          title: 'Module 4: Community Pharmacy Dispensing & Patient Counseling',
          desc: 'Good Dispensing Practice (GDP), professional labeling, and OTC healthcare communication.',
          topics: [
            'Good Dispensing Practice (GDP) standards and compliance',
            'Accurate packaging, labeling, and statutory warning instructions',
            'Over-The-Counter (OTC) remedies for minor ailments and first aid',
            'Effective patient communication and medication counseling techniques'
          ]
        },
        {
          number: 5,
          title: 'Module 5: Storage, Cold Chain & Pharmacy Law',
          desc: 'Inventory control, temperature monitoring, and pharmaceutical regulatory requirements in Sri Lanka.',
          topics: [
            'Vaccine storage and cold chain compliance (2°C - 8°C)',
            'Inventory control, FEFO (First Expire, First Out) and FIFO principles',
            'National Medicines Regulatory Authority (NMRA) statutory guidelines',
            'Poisons, Opium and Dangerous Drugs Act (Schedule III & IV narcotic control)'
          ]
        },
        {
          number: 6,
          title: 'Module 6: Educational Simulation Games, LMS & Soft Skills',
          desc: 'Virtual dispensing games, pharmacy billing software overview, and job interview preparation.',
          topics: [
            'Virtual Prescription Dispensing interactive games',
            'Point-of-Sale (POS) and retail pharmacy billing systems',
            'Customer care excellence and healthcare professional ethics',
            'Resume building and interview preparation for pharmacy employment'
          ]
        }
      ],
      whoCanJoinTitle: 'Who Should Enroll in This Course?',
      whoCanJoin: [
        {
          title: 'School Leavers (O/L or A/L)',
          desc: 'Students who completed Ordinary or Advanced Level exams and wish to build a respected, stable healthcare career.'
        },
        {
          title: 'Current Pharmacy Assistants',
          desc: 'Retail counter staff seeking accredited certification, scientific knowledge, and promotion to senior dispenser roles.'
        },
        {
          title: 'Medical Promotion Representatives (MPOs)',
          desc: 'Pharmaceutical marketing and sales professionals needing thorough understanding of medicines and pharmacology.'
        },
        {
          title: 'Entrepreneurs & Future Pharmacy Owners',
          desc: 'Individuals planning to establish, invest in, or manage their own retail pharmacy businesses successfully.'
        }
      ],
      careerTitle: 'Career Pathways & Job Opportunities',
      careerSubtitle: 'High-demand employment pathways across Sri Lanka and overseas healthcare sectors:',
      careers: [
        {
          role: 'Hospital Pharmacy Dispenser',
          field: 'Private Healthcare Hospitals',
          desc: 'Work in leading hospital groups including Nawaloka, Asiri, Hemas, Durdans, and Lanka Hospitals.'
        },
        {
          role: 'Community Pharmacy Assistant / Supervisor',
          field: 'Retail Pharmacy Chains',
          desc: 'Secure career positions in nationwide chains such as Keells Pharmacies, Healthguard, and independent community dispensaries.'
        },
        {
          role: 'Medical Promotion Representative (MPO)',
          field: 'Pharmaceutical Marketing',
          desc: 'Lucrative career opportunities with multinational pharmaceutical distributors offering attractive salary packages and commissions.'
        },
        {
          role: 'Pharmacy Inventory & Store Executive',
          field: 'Pharmaceutical Supply Chain',
          desc: 'Manage warehouse inventories, stock purchasing, and cold-chain logistics for major healthcare distributors.'
        }
      ],
      learningExperienceTitle: 'The Ceylon Pharma College Learning Experience',
      learningExperience: [
        {
          title: 'Live Interactive Zoom Sessions',
          desc: 'Join weekly live lectures hosted by qualified pharmacists with real-time question and answer discussions.'
        },
        {
          title: '24/7 Unlimited LMS Access',
          desc: 'Never miss a class — stream high-definition recorded lessons anytime from your smartphone, tablet, or laptop.'
        },
        {
          title: 'Play • Learn • Grow Methodology',
          desc: 'Engage with our gamified learning tools, drug recall challenges, and virtual dispensing simulations.'
        },
        {
          title: 'Dedicated Student WhatsApp Support',
          desc: 'Collaborate with tutors, mentors, and fellow pharmacy students in an active academic community.'
        }
      ],
      faqsTitle: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'What are the minimum entry requirements?',
          a: 'Completion of G.C.E. O/L or A/L examination (any stream). No previous medical or science background is strictly required as we teach from the fundamentals.'
        },
        {
          q: 'Can I pay the course fee in installments?',
          a: 'Yes, you can pay the full fee of LKR 15,000 upfront or opt for our flexible monthly installment plan starting from LKR 2,500/month across 6 months.'
        },
        {
          q: 'How and when do I receive the printed study pack?',
          a: 'Upon completing your registration and first installment payment, your physical textbooks are dispatched via express courier to your doorstep anywhere in Sri Lanka with zero delivery charges.'
        },
        {
          q: 'What if I miss a live Zoom lecture?',
          a: 'Every single lecture is recorded in high definition and uploaded to your personal Student LMS Portal within 24 hours for unlimited on-demand review.'
        },
        {
          q: 'Is this certificate recognized for jobs in Sri Lanka?',
          a: 'Yes. Our certificates are accredited by ACTD (USA/UK) and ISO 9001:2015 certified. Major private hospital chains and retail pharmacies in Sri Lanka recognize and recruit our graduates.'
        }
      ]
    },
    ta: {
      name: 'மருந்தியல் நடைமுறையில் சான்றிதழ் படிப்பு (CCPP)',
      badge: 'இலங்கையின் #1 நம்பகமான மருந்தியல் சான்றிதழ் • ACTD & ISO 9001:2015',
      subtitle: 'மருந்தியல், மருந்துச்சீட்டு வாசிப்பு, மருந்து விநியோகம் மற்றும் நோயாளி ஆலோசனை ஆகியவற்றில் நிபுணத்துவம் பெறுங்கள் — உங்கள் வீட்டிற்கே இலவசமாக அனுப்பப்படும் உத்தியோகபூர்வ புத்தகங்களுடன்.',
      description: `இலங்கையின் முதன்மை 6 மாத ஆன்லைன் மருந்தியல் படிப்பு. நவீன மருந்தகங்கள் மற்றும் தனியார் மருத்துவமனைகளில் பணியாற்றத் தேவையான மருந்தியல் கோட்பாடுகள், மருந்து வகைப்பாடு, மருந்துச்சீட்டு வாசிப்பு மற்றும் மருந்து விநியோக நுட்பங்களை இந்த படிப்பு வழங்குகிறது.

O/L அல்லது A/L முடித்த மாணவர்கள், தற்போதைய மருந்தக உதவியாளர்கள் மற்றும் மருத்துவ பிரதிநிதிகளுக்கு இது மிகவும் பொருத்தமானது.

நேரடி Zoom வகுப்புகள், 24/7 LMS பதிவுசெய்த பாடங்கள் மற்றும் உங்கள் வீட்டிற்கே இலவசமாக கூரியர் மூலம் அனுப்பப்படும் உத்தியோகபூர்வ அச்சிடப்பட்ட புத்தகத் தொகுப்புடன் உங்கள் மருந்தியல் தொழில் வாழ்க்கையைத் தொடங்குங்கள்.`,
      highlights: [
        {
          title: 'நேரடி Zoom வகுப்புகள் + 24/7 LMS பாடங்கள்',
          desc: 'தகுதிவாய்ந்த மருந்தியலாளர்களுடன் நேரடி கலந்துரையாடல்கள் மற்றும் எந்நேரமும் பார்க்கக்கூடிய HD பதிவுகள்.'
        },
        {
          title: 'அச்சிடப்பட்ட புத்தகத் தொகுப்பு வீட்டுக்கே இலவசம்',
          desc: 'அனைத்து பாடப் புத்தகங்களும் குறிப்பு வழிகாட்டிகளும் இலங்கையின் எந்தப் பகுதிக்கும் இலவச கூரியர் மூலம் அனுப்பப்படும்.'
        },
        {
          title: 'ஊடாடும் கற்றல் விளையாட்டுகள் (Play • Learn • Grow)',
          desc: 'மருந்துப் பெயர்கள் மற்றும் மருந்துச்சீட்டுகளை எளிதில் நினைவில் வைத்திருக்க உதவும் விநியோக உருவகப்படுத்துதல் விளையாட்டுகள்.'
        },
        {
          title: 'சர்வதேச அளவில் சரிபார்க்கக்கூடிய ACTD சான்றிதழ்',
          desc: 'இலங்கையின் முன்னணி மருத்துவமனைகளால் அங்கீகரிக்கப்பட்ட, QR குறியீடு மூலம் ஆன்லைனில் சரிபார்க்கக்கூடிய சான்றிதழ்.'
        }
      ],
      studyPackTitle: 'வீட்டுக்கே இலவசமாக வழங்கப்படும் உத்தியோகபூர்வ புத்தகத் தொகுப்பு',
      studyPackSubtitle: 'பதிவுசெய்தவுடன் இலங்கையின் எந்தவொரு மாவட்டத்திற்கும் இலவச கூரியர் மூலம் வழங்கப்படும் முழுமையான பாடப் புத்தகங்கள்:',
      studyPackItems: [
        {
          title: 'மருந்தியல் நடைமுறை பிரதான பாடநூல் (Handbook)',
          desc: 'மருந்து வகைப்பாடு, பயன்பாடுகள், அளவுகள் மற்றும் பக்கவிளைவுகள் அடங்கிய முழு வண்ண குறிப்பு புத்தகம்.',
          iconType: 'book'
        },
        {
          title: 'மருந்துச்சீட்டு வாசிப்பு பயிற்சிப் புத்தகம் (Workbook)',
          desc: 'மருத்துவர்களின் கையெழுத்தை வாசிப்பதற்கும் பிழையின்றி மருந்துகளை வழங்குவதற்கும் உதவும் நடைமுறை பயிற்சிப் புத்தகம்.',
          iconType: 'workbook'
        },
        {
          title: 'விரைவு மருந்து அட்டவணைகள் (Quick Reference Charts)',
          desc: 'மருந்தக கவுண்ட்டரில் உடனடியாகப் பார்க்கக்கூடிய லேமினேட் செய்யப்பட்ட மருந்து இடைவினை அட்டவணைகள்.',
          iconType: 'chart'
        },
        {
          title: 'இலங்கை முழுவதும் இலவச கூரியர் விநியோகம்',
          desc: 'கொழும்பு, கண்டி, காலி, யாழ்ப்பாணம் உட்பட இலங்கையின் எந்தவொரு முகவரிக்கும் கூடுதல் கட்டணமின்றி இலவச விநியோகம்.',
          iconType: 'truck'
        }
      ],
      curriculumTitle: 'முழுமையான பாடத்திட்டம் (Course Curriculum)',
      curriculumSubtitle: '6 மாதங்களில் கற்றுத்தரப்படும் 6 முக்கிய தொகுதிகள்:',
      modules: [
        {
          number: 1,
          title: 'தொகுதி 1: மருந்தியல் அறிமுகம் மற்றும் அடிப்படைக் கோட்பாடுகள்',
          desc: 'மருந்தியலின் வரலாறு மற்றும் மருந்து உறிஞ்சும் வழிகள்.',
          topics: [
            'மருந்தியலின் வரலாறு மற்றும் மருந்தக உதவியாளரின் கடமைகள்',
            'மருந்து உட்கொள்ளும் வழிகள் (Oral, Injections, Topical)',
            'மருந்தியல் இயக்கவியல் (Pharmacokinetics)',
            'பக்கவிளைவுகள் மற்றும் பாதுகாப்பு முன்னெச்சரிக்கைகள்'
          ]
        },
        {
          number: 2,
          title: 'தொகுதி 2: முக்கிய மருந்து பிரிவுகள் மற்றும் வகைப்பாடு',
          desc: 'அனைத்து முக்கிய மருந்து குழுக்கள் பற்றிய விரிவான ஆய்வு.',
          topics: [
            'நுண்ணுயிர் எதிர்ப்பிகள் (Antibiotics & Antivirals)',
            'இரத்த அழுத்த மற்றும் இதய மருந்துகள்',
            'நீரிழிவு மருந்துகள் மற்றும் இன்சுலின் பயன்பாடு',
            'வலி நிவாரணி மருந்துகள் (Painkillers & NSAIDs)',
            'சுவாச மற்றும் செரிமான மண்டல மருந்துகள்'
          ]
        },
        {
          number: 3,
          title: 'தொகுதி 3: மருந்துச்சீட்டு வாசிப்பு மற்றும் அளவு கணக்கீடுகள்',
          desc: 'மருத்துவ சுருக்கெழுத்துகள் மற்றும் அளவுகளைக் கணக்கிடுதல்.',
          topics: [
            'மருந்துச்சீட்டு பகுப்பாய்வு மற்றும் குறியீடுகள் (Rx, Sig, b.i.d.)',
            'குழந்தைகள் மற்றும் முதியவர்களுக்கான அளவு கணக்கீடுகள்',
            'மருந்து பிழைகளைக் கண்டறிதல் மற்றும் சரிசெய்தல்',
            'அளவீட்டு அலகுகள் மற்றும் மாற்றங்கள்'
          ]
        },
        {
          number: 4,
          title: 'தொகுதி 4: நடைமுறை மருந்து விநியோகம் மற்றும் நோயாளி ஆலோசனை',
          desc: 'நல்ல விநியோக நடைமுறை (GDP) மற்றும் நோயாளி தொடர்பு.',
          topics: [
            'நல்ல மருந்து விநியோக நடைமுறைகள் (GDP)',
            'சரியான லேபிளிங் மற்றும் பேக்கேஜிங் முறைகள்',
            'OTC மருந்துகள் மற்றும் முதலுதவி ஆலோசனைகள்',
            'நோயாளிகளுக்கான சரியான மருந்து உட்கொள்ளல் வழிகாட்டுதல்'
          ]
        },
        {
          number: 5,
          title: 'தொகுதி 5: மருந்து சேமிப்பு, Cold Chain மற்றும் மருந்தக சட்டம்',
          desc: 'வெப்பநிலை கட்டுப்பாடு மற்றும் தேசிய மருந்து ஒழுங்குமுறை சட்டம்.',
          topics: [
            'குளிர்சாதன சேமிப்பு மற்றும் Cold Chain (2°C - 8°C)',
            'காலாவதி கண்காணிப்பு மற்றும் FEFO / FIFO கொள்கை',
            'NMRA வழிகாட்டுதல்கள் மற்றும் சட்ட விதிமுறைகள்',
            'ஆபத்தான மருந்துகள் (Dangerous Drugs / Narcotics) கட்டுப்பாடு'
          ]
        },
        {
          number: 6,
          title: 'தொகுதி 6: உருவகப்படுத்துதல் விளையாட்டுகள், LMS மற்றும் மென்பொருள்',
          desc: 'கணினி மென்பொருள் (POS) மற்றும் நேர்காணல் தயார்படுத்தல்.',
          topics: [
            'Virtual Prescription Dispensing விளையாட்டுகள்',
            'மருந்தக பில்லிங் மற்றும் POS மென்பொருள் அறிமுகம்',
            'வாடிக்கையாளர் சேவை மற்றும் தொழில்சார் ஒழுக்கநெறிகள்',
            'வேலை நேர்காணல் வழிகாட்டுதல்'
          ]
        }
      ],
      whoCanJoinTitle: 'யார் இந்த படிப்பில் சேரலாம்?',
      whoCanJoin: [
        {
          title: 'பள்ளி முடித்த மாணவர்கள் (O/L அல்லது A/L)',
          desc: 'சுகாதாரத் துறையில் நிலையான மற்றும் கெளரவமான வேலையைத் தேடும் இளைஞர்கள்.'
        },
        {
          title: 'தற்போதைய மருந்தக உதவியாளர்கள்',
          desc: 'சான்றிதழ் மற்றும் அறிவியல் அறிவு மூலம் பதவி உயர்வு பெற விரும்பும் மருந்தக ஊழியர்கள்.'
        },
        {
          title: 'மருத்துவ பிரதிநிதிகள் (Medical Reps)',
          desc: 'மருந்தியல் துறையில் விற்பனை மற்றும் மார்க்கெட்டிங் வேலைகளைச் செய்ய விரும்புவோர்.'
        },
        {
          title: 'மருந்தக உரிமையாளர்கள் மற்றும் முதலீட்டாளர்கள்',
          desc: 'சொந்தமாக மருந்தகம் தொடங்கவும் திறம்பட நிர்வகிக்கவும் விரும்பும் தொழில்முனைவோர்.'
        }
      ],
      careerTitle: 'வேலை வாய்ப்புகள் மற்றும் தொழில் பாதைகள்',
      careerSubtitle: 'இலங்கையிலும் வெளிநாடுகளிலும் அதிக தேவையுள்ள வேலை வாய்ப்புகள்:',
      careers: [
        {
          role: 'தனியார் மருத்துவமனை மருந்தக உதவியாளர்',
          field: 'Private Hospitals',
          desc: 'நாவலோக்க, ஆசிரி, ஹேமாஸ், டர்டன்ஸ் போன்ற முன்னணி தனியார் மருத்துவமனைகளில் பணிபுரியும் வாய்ப்பு.'
        },
        {
          role: 'சமூக மருந்தக உதவியாளர் / மேற்பார்வையாளர்',
          field: 'Community Pharmacies',
          desc: 'கீல்ஸ், ஹெல்த்கார்ட் மற்றும் முன்னணி சில்லறை மருந்தகங்களில் வேலை வாய்ப்புகள்.'
        },
        {
          role: 'மருத்துவ பிரதிநிதி (Medical Rep)',
          field: 'Pharmaceutical Marketing',
          desc: 'மருந்து இறக்குமதி நிறுவனங்களில் கவர்ச்சிகரமான ஊதியத்துடன் கூடிய விற்பனைப் பிரிவு.'
        },
        {
          role: 'மருந்து இருப்பு கட்டுப்பாட்டாளர் (Inventory Executive)',
          field: 'Healthcare Supply Chain',
          desc: 'மருந்து சேமிப்பு கிடங்குகள் மற்றும் விநியோக மையங்களில் இருப்பு மேலாண்மை.'
        }
      ],
      learningExperienceTitle: 'சிலோன் பார்மா கல்லூரியின் தனித்துவமான கற்றல் அனுபவம்',
      learningExperience: [
        {
          title: 'நேரடி Zoom வகுப்புகள்',
          desc: 'வாரந்தோறும் தகுதிவாய்ந்த மருந்தியலாளர்களுடன் கலந்துரையாடி சந்தேகங்களைத் தீர்த்துக்கொள்ளலாம்.'
        },
        {
          title: '24/7 வரம்பற்ற LMS பாடங்கள்',
          desc: 'எப்போது வேண்டுமானாலும் உங்கள் ஸ்மார்ட்போனில் HD பதிவுசெய்த பாடங்களைப் பார்க்கலாம்.'
        },
        {
          title: 'Play • Learn • Grow விளையாட்டுகள்',
          desc: 'மருந்துப் பெயர்களை நினைவில் வைத்திருக்க உதவும் நவீன கற்றல் முறைகள்.'
        },
        {
          title: 'மாணவர் உதவி WhatsApp குழு',
          desc: 'ஆசிரியர்களுடனும் பிற மாணவர்களுடனும் தொடர்ந்து தொடர்பு கொள்ள பிரத்யேக குழு.'
        }
      ],
      faqsTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQs)',
      faqs: [
        {
          q: 'சேர்வதற்கான குறைந்தபட்ச தகுதி என்ன?',
          a: 'G.C.E. O/L அல்லது A/L பரீட்சை முடித்திருப்பது போதுமானது. எந்தவொரு பாடப்பிரிவு மாணவர்களும் விண்ணப்பிக்கலாம்.'
        },
        {
          q: 'பாடநெறிக் கட்டணத்தை தவணை முறையில் செலுத்த முடியுமா?',
          a: 'ஆம், LKR 15,000 கட்டணத்தை ஒரே முறையிலோ அல்லது மாதம் LKR 2,500 வீதம் 6 மாத தவணைகளிலோ செலுத்தலாம்.'
        },
        {
          q: 'அச்சிடப்பட்ட புத்தகங்கள் எப்போது கிடைக்கும்?',
          a: 'பதிவுசெய்து முதல் தவணையைச் செலுத்தியவுடன் இலங்கையின் எந்த முகவரிக்கும் இலவச கூரியர் மூலம் புத்தகங்கள் அனுப்பி வைக்கப்படும்.'
        },
        {
          q: 'வகுப்பில் கலந்துகொள்ள முடியாவிட்டால் என்ன செய்வது?',
          a: 'அனைத்து வகுப்புகளும் HD தரத்தில் பதிவுசெய்யப்பட்டு 24 மணி நேரத்திற்குள் LMS தளத்தில் பதிவேற்றப்படும்.'
        },
        {
          q: 'இந்த சான்றிதழ் வேலைவாய்ப்புகளுக்கு செல்லுபடியாகுமா?',
          a: 'ஆம், ACTD (USA/UK) மற்றும் ISO 9001:2015 அங்கீகரிக்கப்பட்ட சான்றிதழ். இலங்கையின் முன்னணி தனியார் மருத்துவமனைகள் மற்றும் மருந்தகங்கள் இதை அங்கீகரிக்கின்றன.'
        }
      ]
    }
  }
};

/**
 * Helper to get course translations with fallback
 */
export function getCourseTranslation(slug: string, lang: 'si' | 'ta' | 'en'): CourseTranslation {
  const courseData = COURSE_TRANSLATIONS[slug];
  if (courseData && courseData[lang]) {
    return courseData[lang];
  }
  // Default to CCPP translation or generic fallback
  if (courseData && courseData.en) {
    return courseData.en;
  }
  return COURSE_TRANSLATIONS['certificate-course-in-pharmacy-practice'][lang] || COURSE_TRANSLATIONS['certificate-course-in-pharmacy-practice'].en;
}
