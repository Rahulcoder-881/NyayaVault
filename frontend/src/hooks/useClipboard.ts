import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseClipboardReturn {
  copiedKey: string | null;
  handleCopy: (text: string, key: string) => void;
  isCopied: (key: string) => boolean;
}

/**
 * Reusable clipboard hook providing instant visual feedback and safety timer cleanup
 */
export function useClipboard(timeoutMs: number = 2000): UseClipboardReturn {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        // Fallback for non-secure contexts if needed
      });
    }
    setCopiedKey(key);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setCopiedKey(null);
    }, timeoutMs);
  }, [timeoutMs]);

  const isCopied = useCallback((key: string) => copiedKey === key, [copiedKey]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { copiedKey, handleCopy, isCopied };
}
