import { useState, useEffect, useRef } from "react";

interface UseResendCodeOptions {
  onResend: () => Promise<void>;
  isLoaded?: boolean;
  cooldownSeconds?: number;
}

export function useResendCode({ 
  onResend, 
  isLoaded = true,
  cooldownSeconds = 30 
}: UseResendCodeOptions) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleResend = async () => {
    if (!isLoaded || cooldownRemaining > 0) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await onResend();
      setError("");
      
      // start cooldown timer
      setCooldownRemaining(cooldownSeconds);
      
      timerRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    handleResend,
    cooldownRemaining,
    canResend: cooldownRemaining === 0,
  };
}

