/**
 * Application Constants
 * Centralized configuration values
 */

// localStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PROFILE: 'userProfile',
  DARK_MODE: 'DarkMode',
  ADS: 'Ads',
  WATCHED_ADS: 'watchedAds',
  UTM_CAMPAIGN: 'utm_campaign',
};

// API Endpoints
export const API_ENDPOINTS = {
  PROXY: '/api/proxy',
};

// API Actions
export const API_ACTIONS = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  PROFILE: 'profile',
  CREATE_AD: 'create_ad',
  DELETE_AD: 'delete_ad',
  GET_ADS: 'get_ads',
  WITHDRAW: 'withdraw',
};

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VIDEOS: '/videos',
  MARKETS: '/markets',
  RADIO: '/radio',
  STREAM: '/stream',
  VR: '/vr',
  BILLBOARD: '/billboard',
  CHANNELS: '/channels',
  METAVERSE: '/metaverse',
  GAMES: '/games',
  DUET: '/duet',
  CONNECT: '/connect',
  TOS: '/tos',
  PRIVACY: '/privacy',
  ABOUT: '/about',
};

// Default Values
export const DEFAULTS = {
  BALANCE: 0,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export default {
  STORAGE_KEYS,
  API_ENDPOINTS,
  API_ACTIONS,
  ROUTES,
  DEFAULTS,
};
