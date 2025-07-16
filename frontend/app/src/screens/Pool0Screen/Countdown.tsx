import { useEffect, useState } from "react";
import { getOffsetNow } from "./useOffsetNow";

const getTimeDiff = (date: Date) => {
  return Math.max(0, date.getTime() - getOffsetNow());
};

const formatTimeStr = (num: number) => {
  const numStr = num.toString();
  if (numStr.length < 2) {
    const paddedNumStr = "00" + numStr;
    return paddedNumStr.substring(paddedNumStr.length - 2);
  }
  return numStr;
};

interface CountdownProps {
  date: Date;
}

export const Countdown = ({ date }: CountdownProps) => {
  const [diff, setDiff] = useState(getTimeDiff(date));

  useEffect(() => {
    const id = setInterval(() => {
      const newDiff = getTimeDiff(date);
      if (newDiff <= 0) {
        setDiff(0);
        clearInterval(id);
      } else {
        setDiff(newDiff);
      }
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [date.getTime()]);

  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const seconds = formatTimeStr(totalSeconds % 60);
  const minutes = formatTimeStr(totalMinutes % 60);
  const hours = formatTimeStr(totalHours % 24);

  if (totalDays > 0) {
    return `${totalDays} day${totalDays > 1 ? "s" : ""} ${hours}:${minutes}:${seconds}`;
  }


  return `${hours}:${minutes}:${seconds}`;
};
