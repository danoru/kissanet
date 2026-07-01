"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Weather = "rain" | "clear";

type Ambient = {
  /** master switch for all ambient sound (crackle + rain) */
  soundOn: boolean;
  /** 0..1 master volume for the ambient bed */
  volume: number;
  /** drives BOTH the rain sound layer and the rain-on-glass visual */
  weather: Weather;
  toggleSound: () => void;
  setVolume: (v: number) => void;
  toggleWeather: () => void;
};

const AmbientContext = createContext<Ambient | null>(null);

const KEY_SOUND = "kissa-ambient";
const KEY_VOLUME = "kissa-ambient-volume";
const KEY_WEATHER = "kissa-weather";

/**
 * Owns the room's mood state that isn't the light: whether ambient sound is on,
 * its volume, and the weather. Sound starts off (browsers block audio until a
 * gesture, and it's politer to let people opt in); weather defaults to rain —
 * the cozy default. Choices persist across visits, mirroring RoomLight.
 */
export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVol] = useState(0.6);
  const [weather, setWeather] = useState<Weather>("rain");

  // hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    if (localStorage.getItem(KEY_SOUND) === "on") setSoundOn(true);
    const v = Number(localStorage.getItem(KEY_VOLUME));
    if (!Number.isNaN(v) && v > 0) setVol(Math.min(1, v));
    if (localStorage.getItem(KEY_WEATHER) === "clear") setWeather("clear");
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      localStorage.setItem(KEY_SOUND, next ? "on" : "off");
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVol(clamped);
    localStorage.setItem(KEY_VOLUME, String(clamped));
  }, []);

  const toggleWeather = useCallback(() => {
    setWeather((w) => {
      const next: Weather = w === "rain" ? "clear" : "rain";
      localStorage.setItem(KEY_WEATHER, next);
      return next;
    });
  }, []);

  return (
    <AmbientContext.Provider
      value={{
        soundOn,
        volume,
        weather,
        toggleSound,
        setVolume,
        toggleWeather,
      }}
    >
      {children}
    </AmbientContext.Provider>
  );
}

export function useAmbient(): Ambient {
  const ctx = useContext(AmbientContext);
  if (!ctx) throw new Error("useAmbient must be used within AmbientProvider");
  return ctx;
}
