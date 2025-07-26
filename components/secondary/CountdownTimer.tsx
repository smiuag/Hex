import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { menuStyles } from "../../src/styles/menuStyles";
import { formatDuration } from "../../utils/generalUtils";

interface CountdownTimerProps {
  startedAt?: number;
  duration: number;
  onComplete?: () => void;
}

export function CountdownTimer({
  startedAt,
  duration,
  onComplete,
}: CountdownTimerProps) {
  const safeStartedAt = startedAt ?? Date.now();

  const [timeRemaining, setTimeRemaining] = useState(
    Math.max(0, duration - (Date.now() - safeStartedAt))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, duration - (Date.now() - safeStartedAt));
      setTimeRemaining(remaining);

      if (remaining === 0 && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, safeStartedAt, onComplete]);

  return (
    <Text style={menuStyles.processTime}> {formatDuration(timeRemaining)}</Text>
  );
}
