"use client";

import { useEffect, useRef } from "react";
import { useAmbient } from "./AmbientProvider";
import { createAmbientEngine, type AmbientEngine } from "./audioEngine";

/**
 * Bridges the ambient context to the Web Audio engine. Renders no DOM — it
 * just lives high in the tree (in Providers) so the sound persists across every
 * view and route change. Handles the browser autoplay rule: the AudioContext
 * only starts once the user has interacted, so we resume on the first gesture.
 */
export default function AmbientAudio() {
  const { soundOn, volume, weather } = useAmbient();
  const engineRef = useRef<AmbientEngine | null>(null);

  // lifecycle: create + resume when sound is on, park it when off
  useEffect(() => {
    if (!soundOn) {
      engineRef.current?.suspend();
      return;
    }
    if (!engineRef.current) engineRef.current = createAmbientEngine();
    const eng = engineRef.current;
    if (!eng) return;
    eng.setMaster(volume);
    eng.setRain(weather === "rain");
    void eng.resume();
    // volume/weather intentionally excluded — handled by the params effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  // params: react to volume + weather while sound is on
  useEffect(() => {
    if (!soundOn) return;
    engineRef.current?.setMaster(volume);
    engineRef.current?.setRain(weather === "rain");
  }, [soundOn, volume, weather]);

  // autoplay policy: a real gesture may be needed before audio can start
  useEffect(() => {
    const onGesture = () => {
      if (soundOn) void engineRef.current?.resume();
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [soundOn]);

  // tear down the audio graph on unmount
  useEffect(() => () => engineRef.current?.dispose(), []);

  return null;
}
