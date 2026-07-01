"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "kissa-light";

type RoomLightState = { on: boolean; toggle: () => void };

const RoomLightContext = createContext<RoomLightState | null>(null);

/**
 * Owns whether the room's lamp is on, persisted across visits. Lifted into
 * context so both the lamp/darkness (RoomLight) and the city windows
 * (RoomShell) can respond — the windows glow through when the lamp goes out.
 */
export function RoomLightProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "off") setOn(false);
  }, []);

  const toggle = useCallback(() => {
    setOn((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      return next;
    });
  }, []);

  const value = useMemo(() => ({ on, toggle }), [on, toggle]);
  return (
    <RoomLightContext.Provider value={value}>
      {children}
    </RoomLightContext.Provider>
  );
}

export function useRoomLight(): RoomLightState {
  const ctx = useContext(RoomLightContext);
  if (!ctx) throw new Error("useRoomLight must be used within RoomLightProvider");
  return ctx;
}
