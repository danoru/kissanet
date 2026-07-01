"use client";

import { createContext, useContext, useMemo, useState } from "react";

type RoomStage = {
  /** true when the viewer has stepped in close — a record is pulled/playing or
   *  a shelf is zoomed. The room shell (side walls + windows) pans out of view. */
  closeUp: boolean;
  setCloseUp: (v: boolean) => void;
};

const RoomStageContext = createContext<RoomStage | null>(null);

/**
 * Ephemeral "where is the camera" state, shared so the room chrome (walls,
 * windows) can react to the shelf stepping in close. Not persisted.
 */
export function RoomStageProvider({ children }: { children: React.ReactNode }) {
  const [closeUp, setCloseUp] = useState(false);
  const value = useMemo(() => ({ closeUp, setCloseUp }), [closeUp]);
  return (
    <RoomStageContext.Provider value={value}>
      {children}
    </RoomStageContext.Provider>
  );
}

export function useRoomStage(): RoomStage {
  const ctx = useContext(RoomStageContext);
  if (!ctx) throw new Error("useRoomStage must be used within RoomStageProvider");
  return ctx;
}
