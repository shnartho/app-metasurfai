// Regional data organized by continent/region
export const REGIONS = {
  'North America': {
    'CA': 'Canada',
    'MX': 'Mexico',
    'US': 'United States'
  },
  'Europe': {
    'AT': 'Austria',
    'BE': 'Belgium',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'EE': 'Estonia',
    'FI': 'Finland',
    'FR': 'France',
    'DE': 'Germany',
    'GR': 'Greece',
    'HU': 'Hungary',
    'IE': 'Ireland',
    'IT': 'Italy',
    'LV': 'Latvia',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'ES': 'Spain',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'UK': 'United Kingdom'
  },
  'Asia-Pacific': {
    'AU': 'Australia',
    'BD': 'Bangladesh',
    'CN': 'China',
    'HK': 'Hong Kong',
    'IN': 'India',
    'ID': 'Indonesia',
    'JP': 'Japan',
    'MY': 'Malaysia',
    'NZ': 'New Zealand',
    'PK': 'Pakistan',
    'PH': 'Philippines',
    'SG': 'Singapore',
    'KR': 'South Korea',
    'LK': 'Sri Lanka',
    'TW': 'Taiwan',
    'TH': 'Thailand',
    'VN': 'Vietnam'
  },
  'Middle East & Africa': {
    'BH': 'Bahrain',
    'EG': 'Egypt',
    'ET': 'Ethiopia',
    'GH': 'Ghana',
    'IL': 'Israel',
    'KE': 'Kenya',
    'KW': 'Kuwait',
    'MA': 'Morocco',
    'NG': 'Nigeria',
    'OM': 'Oman',
    'QA': 'Qatar',
    'SA': 'Saudi Arabia',
    'ZA': 'South Africa',
    'TZ': 'Tanzania',
    'TN': 'Tunisia',
    'TR': 'Turkey',
    'UG': 'Uganda',
    'AE': 'United Arab Emirates'
  },
  'Latin America': {
    'AR': 'Argentina',
    'BO': 'Bolivia',
    'BR': 'Brazil',
    'CL': 'Chile',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'CU': 'Cuba',
    'DO': 'Dominican Republic',
    'EC': 'Ecuador',
    'SV': 'El Salvador',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'JM': 'Jamaica',
    'NI': 'Nicaragua',
    'PA': 'Panama',
    'PY': 'Paraguay',
    'PE': 'Peru',
    'UY': 'Uruguay',
    'VE': 'Venezuela'
  },
  'Global': {
    'GLOBAL': 'Global (All Regions)',
    'MULTI': 'Multi-Regional'
  }
};

// Get all regions as a flat list for easy searching
export const getAllRegions = () => {
  const allRegions = [];
  Object.entries(REGIONS).forEach(([continent, countries]) => {
    Object.entries(countries).forEach(([code, name]) => {
      allRegions.push({ code, name, continent });
    });
  });
  return allRegions;
};

// Get regions by continent
export const getRegionsByContinent = (continent) => {
  const countries = REGIONS[continent] || {};
  return Object.entries(countries)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get continent list
export const getContinents = () => {
  return Object.keys(REGIONS) || [];
};

// Find region by code
export const getRegionByCode = (code) => {
  for (const continent in REGIONS) {
    if (REGIONS[continent][code]) {
      return {
        code,
        name: REGIONS[continent][code],
        continent
      };
    }
  }
  return null;
};

// Get formatted display name (e.g., "US - United States")
export const getFormattedRegionName = (code) => {
  const region = getRegionByCode(code);
  return region ? `${code} - ${region.name}` : code;
};
