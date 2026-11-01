import { LMS_API_URL } from "./config";

export interface DistrictItem {
  id: string;
  name_en: string;
  name_si: string;
  name_ta: string;
}

export interface CityItem {
  id: string;
  district_id?: string;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  district?: string;
}

export const DISTRICT_MAP: Record<string, string> = {
  "1": "Ampara",
  "2": "Anuradhapura",
  "3": "Badulla",
  "4": "Batticaloa",
  "5": "Colombo",
  "6": "Galle",
  "7": "Gampaha",
  "8": "Hambantota",
  "9": "Jaffna",
  "10": "Kalutara",
  "11": "Kandy",
  "12": "Kegalle",
  "13": "Kilinochchi",
  "14": "Kurunegala",
  "15": "Mannar",
  "16": "Matale",
  "17": "Matara",
  "18": "Monaragala",
  "19": "Mullaitivu",
  "20": "Nuwara Eliya",
  "21": "Polonnaruwa",
  "22": "Puttalam",
  "23": "Ratnapura",
  "24": "Trincomalee",
  "25": "Vavuniya",
};

export const SRI_LANKA_DISTRICTS: DistrictItem[] = [
  { id: "5", name_en: "Colombo", name_si: "කොළඹ", name_ta: "கொழும்பு" },
  { id: "7", name_en: "Gampaha", name_si: "ගම්පහ", name_ta: "கம்பஹா" },
  { id: "10", name_en: "Kalutara", name_si: "කළුතර", name_ta: "களுத்துறை" },
  { id: "11", name_en: "Kandy", name_si: "මහනුවර", name_ta: "கண்டி" },
  { id: "16", name_en: "Matale", name_si: "මාතලේ", name_ta: "மாத்தளை" },
  { id: "20", name_en: "Nuwara Eliya", name_si: "නුවරඑළිය", name_ta: "நுவரெலியா" },
  { id: "6", name_en: "Galle", name_si: "ගාල්ල", name_ta: "காலி" },
  { id: "17", name_en: "Matara", name_si: "මාතර", name_ta: "மாத்தறை" },
  { id: "8", name_en: "Hambantota", name_si: "හම්බන්තොට", name_ta: "அம்பாந்தோட்டை" },
  { id: "14", name_en: "Kurunegala", name_si: "කුරුණෑගල", name_ta: "குருணாகல்" },
  { id: "22", name_en: "Puttalam", name_si: "පුත්තලම", name_ta: "புத்தளம்" },
  { id: "2", name_en: "Anuradhapura", name_si: "අනුරාධපුරය", name_ta: "அனுராதபுரம்" },
  { id: "21", name_en: "Polonnaruwa", name_si: "පොළොන්නරුව", name_ta: "பொலன்னறுவை" },
  { id: "3", name_en: "Badulla", name_si: "බදුල්ල", name_ta: "பதுளை" },
  { id: "18", name_en: "Monaragala", name_si: "මොනරාගල", name_ta: "மொனராகலை" },
  { id: "23", name_en: "Ratnapura", name_si: "රත්නපුර", name_ta: "இரத்தினபுரி" },
  { id: "12", name_en: "Kegalle", name_si: "කෑගල්ල", name_ta: "கேகாலை" },
  { id: "9", name_en: "Jaffna", name_si: "යාපනය", name_ta: "யாழ்ப்பாணம்" },
  { id: "13", name_en: "Kilinochchi", name_si: "කිලිනොච්චිය", name_ta: "கிளிநொச்சி" },
  { id: "15", name_en: "Mannar", name_si: "මන්නාරම", name_ta: "மன்னார்" },
  { id: "25", name_en: "Vavuniya", name_si: "වවුනියාව", name_ta: "வவுனியா" },
  { id: "19", name_en: "Mullaitivu", name_si: "මුලතිව්", name_ta: "முல்லைத்தீவு" },
  { id: "4", name_en: "Batticaloa", name_si: "මඩකලපුව", name_ta: "மட்டக்களப்பு" },
  { id: "1", name_en: "Ampara", name_si: "අම්පාර", name_ta: "அம்பாறை" },
  { id: "24", name_en: "Trincomalee", name_si: "ත්‍රිකුණාමලය", name_ta: "திருகோணமலை" },
];

export const FALLBACK_CITIES: CityItem[] = [
  // Colombo District (id: 5)
  { id: "501", district_id: "5", name_en: "Colombo 01 - Fort", district: "Colombo" },
  { id: "502", district_id: "5", name_en: "Colombo 02 - Slave Island", district: "Colombo" },
  { id: "503", district_id: "5", name_en: "Colombo 03 - Kollupitiya", district: "Colombo" },
  { id: "504", district_id: "5", name_en: "Colombo 04 - Bambalapitiya", district: "Colombo" },
  { id: "505", district_id: "5", name_en: "Colombo 05 - Havelock Town", district: "Colombo" },
  { id: "506", district_id: "5", name_en: "Colombo 06 - Wellawatte", district: "Colombo" },
  { id: "507", district_id: "5", name_en: "Colombo 07 - Cinnamon Gardens", district: "Colombo" },
  { id: "508", district_id: "5", name_en: "Dehiwala", district: "Colombo" },
  { id: "509", district_id: "5", name_en: "Mount Lavinia", district: "Colombo" },
  { id: "510", district_id: "5", name_en: "Moratuwa", district: "Colombo" },
  { id: "511", district_id: "5", name_en: "Nugegoda", district: "Colombo" },
  { id: "512", district_id: "5", name_en: "Maharagama", district: "Colombo" },
  { id: "513", district_id: "5", name_en: "Kottawa", district: "Colombo" },
  { id: "514", district_id: "5", name_en: "Kotte", district: "Colombo" },
  { id: "515", district_id: "5", name_en: "Battaramulla", district: "Colombo" },
  { id: "516", district_id: "5", name_en: "Malabe", district: "Colombo" },
  { id: "517", district_id: "5", name_en: "Kaduwela", district: "Colombo" },
  { id: "518", district_id: "5", name_en: "Homagama", district: "Colombo" },
  { id: "519", district_id: "5", name_en: "Piliyandala", district: "Colombo" },
  { id: "520", district_id: "5", name_en: "Kesbewa", district: "Colombo" },
  { id: "521", district_id: "5", name_en: "Athurugiriya", district: "Colombo" },
  { id: "522", district_id: "5", name_en: "Avissawella", district: "Colombo" },

  // Gampaha District (id: 7)
  { id: "701", district_id: "7", name_en: "Gampaha", district: "Gampaha" },
  { id: "702", district_id: "7", name_en: "Negombo", district: "Gampaha" },
  { id: "703", district_id: "7", name_en: "Kelaniya", district: "Gampaha" },
  { id: "704", district_id: "7", name_en: "Kiribathgoda", district: "Gampaha" },
  { id: "705", district_id: "7", name_en: "Kadawatha", district: "Gampaha" },
  { id: "706", district_id: "7", name_en: "Wattala", district: "Gampaha" },
  { id: "707", district_id: "7", name_en: "Ja-Ela", district: "Gampaha" },
  { id: "708", district_id: "7", name_en: "Kandana", district: "Gampaha" },
  { id: "709", district_id: "7", name_en: "Ragama", district: "Gampaha" },
  { id: "710", district_id: "7", name_en: "Minuwangoda", district: "Gampaha" },
  { id: "711", district_id: "7", name_en: "Mirigama", district: "Gampaha" },
  { id: "712", district_id: "7", name_en: "Nittambuwa", district: "Gampaha" },
  { id: "713", district_id: "7", name_en: "Veyangoda", district: "Gampaha" },

  // Kalutara District (id: 10)
  { id: "1001", district_id: "10", name_en: "Kalutara", district: "Kalutara" },
  { id: "1002", district_id: "10", name_en: "Panadura", district: "Kalutara" },
  { id: "1003", district_id: "10", name_en: "Horana", district: "Kalutara" },
  { id: "1004", district_id: "10", name_en: "Beruwala", district: "Kalutara" },
  { id: "1005", district_id: "10", name_en: "Aluthgama", district: "Kalutara" },
  { id: "1006", district_id: "10", name_en: "Matugama", district: "Kalutara" },
  { id: "1007", district_id: "10", name_en: "Bandaragama", district: "Kalutara" },

  // Kandy District (id: 11)
  { id: "1101", district_id: "11", name_en: "Kandy", district: "Kandy" },
  { id: "1102", district_id: "11", name_en: "Peradeniya", district: "Kandy" },
  { id: "1103", district_id: "11", name_en: "Katugastota", district: "Kandy" },
  { id: "1104", district_id: "11", name_en: "Gampola", district: "Kandy" },
  { id: "1105", district_id: "11", name_en: "Kundasale", district: "Kandy" },
  { id: "1106", district_id: "11", name_en: "Nawalapitiya", district: "Kandy" },
  { id: "1107", district_id: "11", name_en: "Pilimathalawa", district: "Kandy" },

  // Galle District (id: 6)
  { id: "601", district_id: "6", name_en: "Galle", district: "Galle" },
  { id: "602", district_id: "6", name_en: "Karapitiya", district: "Galle" },
  { id: "603", district_id: "6", name_en: "Ambalangoda", district: "Galle" },
  { id: "604", district_id: "6", name_en: "Hikkaduwa", district: "Galle" },
  { id: "605", district_id: "6", name_en: "Elpitiya", district: "Galle" },
  { id: "606", district_id: "6", name_en: "Baddegama", district: "Galle" },

  // Matara District (id: 17)
  { id: "1701", district_id: "17", name_en: "Matara", district: "Matara" },
  { id: "1702", district_id: "17", name_en: "Weligama", district: "Matara" },
  { id: "1703", district_id: "17", name_en: "Akuressa", district: "Matara" },
  { id: "1704", district_id: "17", name_en: "Dikwella", district: "Matara" },

  // Kurunegala District (id: 14)
  { id: "1401", district_id: "14", name_en: "Kurunegala", district: "Kurunegala" },
  { id: "1402", district_id: "14", name_en: "Kuliyapitiya", district: "Kurunegala" },
  { id: "1403", district_id: "14", name_en: "Pannala", district: "Kurunegala" },
  { id: "1404", district_id: "14", name_en: "Narammala", district: "Kurunegala" },
  { id: "1405", district_id: "14", name_en: "Wariyapola", district: "Kurunegala" },

  // Ratnapura District (id: 23)
  { id: "2301", district_id: "23", name_en: "Ratnapura", district: "Ratnapura" },
  { id: "2302", district_id: "23", name_en: "Pelmadulla", district: "Ratnapura" },
  { id: "2303", district_id: "23", name_en: "Balangoda", district: "Ratnapura" },
  { id: "2304", district_id: "23", name_en: "Embilipitiya", district: "Ratnapura" },
  { id: "2305", district_id: "23", name_en: "Kuruwita", district: "Ratnapura" },

  // Kegalle District (id: 12)
  { id: "1201", district_id: "12", name_en: "Kegalle", district: "Kegalle" },
  { id: "1202", district_id: "12", name_en: "Mawanella", district: "Kegalle" },
  { id: "1203", district_id: "12", name_en: "Warakapola", district: "Kegalle" },

  // Anuradhapura District (id: 2)
  { id: "201", district_id: "2", name_en: "Anuradhapura", district: "Anuradhapura" },
  { id: "202", district_id: "2", name_en: "Kekirawa", district: "Anuradhapura" },
  { id: "203", district_id: "2", name_en: "Medawachchiya", district: "Anuradhapura" },

  // Badulla District (id: 3)
  { id: "301", district_id: "3", name_en: "Badulla", district: "Badulla" },
  { id: "302", district_id: "3", name_en: "Bandarawela", district: "Badulla" },
  { id: "303", district_id: "3", name_en: "Hali-Ela", district: "Badulla" },
  { id: "304", district_id: "3", name_en: "Welimada", district: "Badulla" },

  // Hambantota District (id: 8)
  { id: "801", district_id: "8", name_en: "Hambantota", district: "Hambantota" },
  { id: "802", district_id: "8", name_en: "Tangalle", district: "Hambantota" },
  { id: "803", district_id: "8", name_en: "Beliatta", district: "Hambantota" },

  // Jaffna District (id: 9)
  { id: "901", district_id: "9", name_en: "Jaffna", district: "Jaffna" },
  { id: "902", district_id: "9", name_en: "Chavakachcheri", district: "Jaffna" },
  { id: "903", district_id: "9", name_en: "Nallur", district: "Jaffna" },

  // Ampara District (id: 1)
  { id: "101", district_id: "1", name_en: "Ampara", district: "Ampara" },
  { id: "102", district_id: "1", name_en: "Akkaraipattu", district: "Ampara" },
  { id: "103", district_id: "1", name_en: "Kalmunai", district: "Ampara" },
  { id: "104", district_id: "1", name_en: "Sammanthurai", district: "Ampara" },
];

export function findMatchingCity(cityName: string, citiesList: CityItem[]): CityItem | undefined {
  if (!cityName) return undefined;
  const clean = cityName.trim().toLowerCase();
  if (!clean) return undefined;

  const pool = citiesList && citiesList.length > 0 ? citiesList : FALLBACK_CITIES;

  // 1. Exact case-insensitive match on English, Sinhala, or Tamil name
  const exact = pool.find(
    c => c.name_en.toLowerCase() === clean || 
         (c.name_si && c.name_si.toLowerCase() === clean) ||
         (c.name_ta && c.name_ta.toLowerCase() === clean)
  );
  if (exact) return exact;

  // 2. Starts with match (e.g. "pelmad" -> "Pelmadulla")
  if (clean.length >= 3) {
    const startsWithMatches = pool.filter(c => c.name_en.toLowerCase().startsWith(clean));
    if (startsWithMatches.length > 0) {
      return startsWithMatches[0];
    }
  }

  return undefined;
}

export function getDistrictForCity(cityName: string, citiesList: CityItem[]): string {
  if (!cityName) return "Colombo";
  const clean = cityName.trim().toLowerCase();

  const pool = citiesList && citiesList.length > 0 ? citiesList : FALLBACK_CITIES;
  const match = pool.find(c => c.name_en.toLowerCase() === clean || (c.name_si && c.name_si.toLowerCase() === clean));
  if (match) {
    if (match.district) return match.district;
    if (match.district_id && DISTRICT_MAP[match.district_id]) {
      return DISTRICT_MAP[match.district_id];
    }
  }

  // Prefix match fallback if length >= 3
  if (clean.length >= 3) {
    const prefixMatch = pool.find(c => c.name_en.toLowerCase().startsWith(clean));
    if (prefixMatch) {
      if (prefixMatch.district) return prefixMatch.district;
      if (prefixMatch.district_id && DISTRICT_MAP[prefixMatch.district_id]) {
        return DISTRICT_MAP[prefixMatch.district_id];
      }
    }
  }

  return "Sri Lanka";
}

export async function fetchDistrictsList(): Promise<DistrictItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${LMS_API_URL}/districts`, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((d: any) => ({
          id: String(d.id),
          name_en: d.name_en || d.name || "",
          name_si: d.name_si || d.name_en || "",
          name_ta: d.name_ta || d.name_en || "",
        }));
      }
    }
  } catch {
    // Fallback to static district list
  }
  return SRI_LANKA_DISTRICTS;
}

export async function fetchCitiesList(): Promise<CityItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${LMS_API_URL}/cities`, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache for 24h
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawList = Object.values(data) as any[];
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((c: any) => {
          const dId = c.district_id ? String(c.district_id) : undefined;
          const dName = c.district_name || (dId ? DISTRICT_MAP[dId] : undefined) || "Sri Lanka";
          return {
            id: String(c.id || Math.random()),
            district_id: dId,
            name_en: c.name_en || c.name || "Unknown",
            name_si: c.name_si,
            name_ta: c.name_ta,
            district: dName,
          };
        });
      }
    }
  } catch {
    // Fallback to static city list
  }
  return FALLBACK_CITIES;
}
