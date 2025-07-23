import { useEffect, useState } from "react";

export const useOffsetNow = () => {
  const [now, setNow] = useState(getOffsetNow());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getOffsetNow());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
};

export const getOffsetNow = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const offset = searchParams.get("offset");
  const offsetNumber = (offset && parseInt(offset)) || 0;

  return Date.now() + offsetNumber;
};
