import { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ className }: { className?: string }) {
  // Target date: September 1, 2026
  const targetDate = new Date('2026-09-01T00:00:00Z');

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const difference = +targetDate - +new Date();
    let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className={cn("flex space-x-4 md:space-x-8 justify-center", className)}>
      {timeUnits.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="text-3xl md:text-5xl font-mono font-medium text-teal-800">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs md:text-sm text-teal-600 uppercase tracking-widest mt-1">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
