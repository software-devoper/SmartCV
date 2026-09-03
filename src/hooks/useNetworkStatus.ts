import { useEffect, useState, useRef } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  isReconnected: boolean;
  lastChanged: number;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(!isOnline);
  const [isReconnected, setIsReconnected] = useState<boolean>(false);
  const [lastChanged, setLastChanged] = useState<number>(Date.now());
  const reconnectedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastChanged(Date.now());
      setIsReconnected(true);

      if (reconnectedTimeoutRef.current) {
        clearTimeout(reconnectedTimeoutRef.current);
      }

      reconnectedTimeoutRef.current = setTimeout(() => {
        setIsReconnected(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setIsReconnected(false);
      setLastChanged(Date.now());

      if (reconnectedTimeoutRef.current) {
        clearTimeout(reconnectedTimeoutRef.current);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectedTimeoutRef.current) {
        clearTimeout(reconnectedTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOnline,
    wasOffline,
    isReconnected,
    lastChanged,
  };
}

export function useOnlineStatus(): boolean {
  const { isOnline } = useNetworkStatus();
  return isOnline;
}
