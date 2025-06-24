"use client";

import { useState, useEffect } from "react";
import {
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface PromocaoStatusProps {
  dataInicio?: string;
  dataFim?: string;
  duracaoDias?: number;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PromocaoStatus({
  dataInicio,
  dataFim,
  duracaoDias,
  className = "",
}: PromocaoStatusProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!dataFim) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(dataFim).getTime();
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
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [dataFim]);

  if (!dataInicio || !dataFim) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  return (
    <div
      className={`p-4 rounded-lg border ${className} ${
        isExpired ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon
          className={`h-5 w-5 ${isExpired ? "text-red-600" : "text-blue-600"}`}
        />
        <h3
          className={`font-semibold ${
            isExpired ? "text-red-900" : "text-blue-900"
          }`}
        >
          {isExpired ? "Promoção Expirada" : "Promoção Ativa"}
        </h3>
      </div>

      {/* Informações da promoção */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            <strong>Início:</strong> {formatDate(dataInicio)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            <strong>Fim:</strong> {formatDate(dataFim)}
          </span>
        </div>

        {duracaoDias && (
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">
              <strong>Duração:</strong> {duracaoDias} dia
              {duracaoDias !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Contador regressivo ou status expirado */}
      <div className="mt-4 p-3 rounded-lg bg-white border">
        {isExpired ? (
          <div className="text-center">
            <div className="text-red-600 font-semibold">Promoção Encerrada</div>
            <div className="text-red-500 text-xs mt-1">
              Encerrou em {formatDateTime(dataFim)}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-600 text-xs mb-2">Tempo Restante:</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-blue-100 rounded p-2">
                <div className="text-lg font-bold text-blue-800">
                  {timeLeft.days}
                </div>
                <div className="text-xs text-blue-600">Dias</div>
              </div>
              <div className="bg-blue-100 rounded p-2">
                <div className="text-lg font-bold text-blue-800">
                  {timeLeft.hours}
                </div>
                <div className="text-xs text-blue-600">Horas</div>
              </div>
              <div className="bg-blue-100 rounded p-2">
                <div className="text-lg font-bold text-blue-800">
                  {timeLeft.minutes}
                </div>
                <div className="text-xs text-blue-600">Min</div>
              </div>
              <div className="bg-blue-100 rounded p-2">
                <div className="text-lg font-bold text-blue-800">
                  {timeLeft.seconds}
                </div>
                <div className="text-xs text-blue-600">Seg</div>
              </div>
            </div>

            {/* Barra de progresso */}
            {duracaoDias && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">
                  Progresso da Promoção
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((duracaoDias * 24 * 60 * 60 * 1000 -
                            (timeLeft.days * 24 * 60 * 60 * 1000 +
                              timeLeft.hours * 60 * 60 * 1000 +
                              timeLeft.minutes * 60 * 1000 +
                              timeLeft.seconds * 1000)) /
                            (duracaoDias * 24 * 60 * 60 * 1000)) *
                            100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round(
                    ((duracaoDias * 24 * 60 * 60 * 1000 -
                      (timeLeft.days * 24 * 60 * 60 * 1000 +
                        timeLeft.hours * 60 * 60 * 1000 +
                        timeLeft.minutes * 60 * 1000 +
                        timeLeft.seconds * 1000)) /
                      (duracaoDias * 24 * 60 * 60 * 1000)) *
                      100
                  )}
                  % completo
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
