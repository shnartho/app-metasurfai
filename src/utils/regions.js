// Regional data organized by continent/region
export const REGIONS = {
  'North America': {
    'US': 'United States',
    'CA': 'Canada',
    'MX': 'Mexico'
  },
  'Europe': {
    'UK': 'United Kingdom',
    'FR': 'France',
    'DE': 'Germany',
    'ES': 'Spain',
    'IT': 'Italy',
    'PT': 'Portugal',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'IE': 'Ireland',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'GR': 'Greece',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'EE': 'Estonia',
    'LV': 'Latvia',
    'LT': 'Lithuania'
  },
  'Asia-Pacific': {
    'JP': 'Japan',
    'CN': 'China',
    'KR': 'South Korea',
    'IN': 'India',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'PH': 'Philippines',
    'ID': 'Indonesia',
    'VN': 'Vietnam',
    'BD': 'Bangladesh',
    'PK': 'Pakistan',
    'LK': 'Sri Lanka'
  },
  'Middle East & Africa': {
    'QA': 'Qatar',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'KW': 'Kuwait',
    'BH': 'Bahrain',
    'OM': 'Oman',
    'IL': 'Israel',
    'TR': 'Turkey',
    'EG': 'Egypt',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'MA': 'Morocco',
    'TN': 'Tunisia',
    'GH': 'Ghana',
    'ET': 'Ethiopia',
    'UG': 'Uganda',
    'TZ': 'Tanzania'
  },
  'Latin America': {
    'BR': 'Brazil',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'NI': 'Nicaragua',
    'SV': 'El Salvador',
    'DO': 'Dominican Republic',
    'CU': 'Cuba',
    'JM': 'Jamaica'
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
  return REGIONS[continent] || {};
};

// Get continent list
export const getContinents = () => {
  return Object.keys(REGIONS);
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
