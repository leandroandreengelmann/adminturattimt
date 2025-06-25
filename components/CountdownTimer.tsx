"use client";

import { useState, useEffect, useRef } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface CountdownTimerProps {
  endDate: string;
  promocaoStatus?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  endDate,
  promocaoStatus,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Só atualizar se o componente estiver visível
      if (!isVisibleRef.current) return;

      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        // Parar o timer quando expirar
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Calcular imediatamente
    calculateTimeLeft();

    // Se já expirado, não iniciar timer
    if (isExpired || promocaoStatus === "expirada") {
      return;
    }

    // Atualizar a cada segundo apenas se não expirado
    intervalRef.current = setInterval(calculateTimeLeft, 1000);

    // Detectar visibilidade da página para pausar/retomar timer
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden && !isExpired) {
        calculateTimeLeft(); // Recalcular quando voltar a ser visível
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [endDate, isExpired, promocaoStatus]);

  if (isExpired || promocaoStatus === "expirada") {
    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ${className}`}
      >
        <ClockIcon className="h-3 w-3 mr-1" />
        Expirada
      </div>
    );
  }

  // Formatação compacta para diferentes situações
  const formatTimeCompact = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }
  };

  // Formatação completa
  const formatTimeFull = () => {
    const parts = [];
    if (timeLeft.days > 0)
      parts.push(`${timeLeft.days} dia${timeLeft.days !== 1 ? "s" : ""}`);
    if (timeLeft.hours > 0)
      parts.push(`${timeLeft.hours} hora${timeLeft.hours !== 1 ? "s" : ""}`);
    if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes} min`);
    if (timeLeft.seconds > 0 && timeLeft.days === 0 && timeLeft.hours === 0) {
      parts.push(`${timeLeft.seconds} seg`);
    }
    return parts.join(" ");
  };

  // Cor baseada no tempo restante
  const getColorClass = () => {
    if (timeLeft.days >= 7) {
      return "bg-green-100 text-green-800";
    } else if (timeLeft.days >= 3) {
      return "bg-yellow-100 text-yellow-800";
    } else if (timeLeft.days >= 1) {
      return "bg-orange-100 text-orange-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getColorClass()} ${className}`}
    >
      <ClockIcon className="h-3 w-3 mr-1" />
      <span title={`Tempo restante: ${formatTimeFull()}`}>
        {formatTimeCompact()}
      </span>
    </div>
  );
}
