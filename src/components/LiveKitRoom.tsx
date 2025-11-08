"use client";

import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";
import { type ReactNode, useEffect } from "react";
import { useLiveKit } from "@/lib/stores/livekit";

export function LiveKitRoom({ children }: { children: ReactNode }): ReactNode {
  const { room, setRoom, volume } = useLiveKit();

  useEffect(() => {
    if (!room) {
      setRoom(
        new Room({
          dynacast: true,
          adaptiveStream: true,
        }),
      );
    }
  });

  if (!room) {
    return <p>Loading...</p>;
  }

  return (
    <RoomContext.Provider value={room}>
      {children}
      <RoomAudioRenderer volume={volume / 100.0} />
    </RoomContext.Provider>
  );
}
