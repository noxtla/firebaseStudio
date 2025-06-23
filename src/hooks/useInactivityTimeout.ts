"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

// 5 minutes for inactivity timeout
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; 
// 1 minute for the warning grace period
const GRACE_PERIOD_MS = 1 * 60 * 1000;

/**
 * A custom hook to manage session timeout due to user inactivity.
 * @param onTimeout - The function to call when the session finally expires.
 */
export const useInactivityTimeout = (onTimeout: () => void) => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(GRACE_PERIOD_MS / 1000);
  const pathname = usePathname();

  // --- FIX START: Use ReturnType to get the correct timer ID type ---
  const inactivityTimer = useRef<ReturnType<typeof setTimeout>>();
  const warningTimer = useRef<ReturnType<typeof setTimeout>>();
  const countdownInterval = useRef<ReturnType<typeof setInterval>>();
  // --- FIX END ---

  const isLoginPage = pathname === '/';

  // Function to start the warning countdown and show the modal
  const startWarningCountdown = useCallback(() => {
    setCountdown(GRACE_PERIOD_MS / 1000); // Reset countdown
    setShowWarning(true);
    
    // Start the visual countdown timer
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Set the final timeout to log the user out
    warningTimer.current = setTimeout(() => {
      onTimeout();
    }, GRACE_PERIOD_MS);
  }, [onTimeout]);

  // Function to reset all timers, called on user activity
  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    setShowWarning(false);
    
    // Do not start a new timer on the login page
    if (isLoginPage) return;

    // Start the main inactivity timer
    inactivityTimer.current = setTimeout(startWarningCountdown, INACTIVITY_TIMEOUT_MS);
  }, [startWarningCountdown, isLoginPage]);

  // Public function to be called from the dialog to extend the session
  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const events = [
      'mousemove', 'keydown', 'mousedown',
      'touchstart', 'scroll',
    ];

    const eventHandler = () => resetTimer();

    // Set up event listeners for user activity
    events.forEach((event) => window.addEventListener(event, eventHandler));
    
    // Start the timer when the hook mounts
    resetTimer();

    // Cleanup function to remove listeners and timers
    return () => {
      events.forEach((event) => window.removeEventListener(event, eventHandler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [resetTimer]);

  return { showWarning, countdown, extendSession };
};