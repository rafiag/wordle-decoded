import ReactGA from 'react-ga4';
import { BaseEventProperties } from './types';

const isDevelopment = import.meta.env.MODE === 'development';
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;

/**
 * Initialize Google Analytics
 * Respects Do Not Track headers and only initializes if measurement ID is provided
 */
export const initGA = (): void => {
  // Check if measurement ID is provided
  if (!measurementId) {
    console.log('[GA] No measurement ID provided - tracking disabled');
    return;
  }

  // Respect Do Not Track
  const dntEnabled = navigator.doNotTrack === '1' || (window as any).doNotTrack === '1';

  if (dntEnabled) {
    console.log('[GA] Tracking disabled: Do Not Track enabled');
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      testMode: isDevelopment,
      gaOptions: {
        anonymizeIp: true,
      },
    });

    isInitialized = true;

    if (isDevelopment) {
      console.log('[GA] Initialized in test mode with ID:', measurementId);
    }
  } catch (error) {
    console.error('[GA] Initialization failed:', error);
  }
};

/**
 * Check if GA is initialized
 */
export const isGAInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Track a custom event
 */
export const trackEvent = (eventName: string, properties?: BaseEventProperties): void => {
  if (isDevelopment) {
    console.log('[GA Event]', eventName, properties);
  }

  if (!isGAInitialized()) {
    if (isDevelopment) {
      console.warn('[GA] Not initialized - event not sent:', eventName);
    }
    return;
  }

  try {
    ReactGA.event(eventName, properties);
  } catch (error) {
    console.error('[GA] Event tracking failed:', error);
  }
};

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string): void => {
  if (isDevelopment) {
    console.log('[GA PageView]', path, title);
  }

  if (!isGAInitialized()) {
    return;
  }

  try {
    ReactGA.send({ hitType: 'pageview', page: path, title });
  } catch (error) {
    console.error('[GA] Page view tracking failed:', error);
  }
};

/**
 * Set a user property
 */
export const setUserProperty = (propertyName: string, value: string): void => {
  if (isDevelopment) {
    console.log('[GA User Property]', propertyName, value);
  }

  if (!isGAInitialized()) {
    return;
  }

  try {
    ReactGA.set({ [propertyName]: value });
  } catch (error) {
    console.error('[GA] User property setting failed:', error);
  }
};
