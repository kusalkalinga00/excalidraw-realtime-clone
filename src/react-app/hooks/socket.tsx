import { useEffect, useRef } from "react";
import { BufferEvent, BufferEventType } from "../../types/event.schema";

const useBufferedWebSocket = (
  id: string,
  handleMessage: (event: BufferEventType) => void,
  bufferTime = 10
) => {
  const bufferedEvents = useRef<Record<string, BufferEventType>>({});
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://localhost:5173/api/ws/${id}`);
    const socket = socketRef.current;

    console.log("useBufferedWebSocket effect", socket);

    if (socket) {
      socket.onmessage = (event) => {
        handleMessage(BufferEvent.parse(JSON.parse(event.data)));
        console.log("received event:", event);
      };

      socket.onopen = () => {
        console.log("WebSocket connected");
        socket.send("setup");
      };
    }

    const interval = setInterval(() => {
      if (
        socket &&
        socket.readyState === WebSocket.OPEN &&
        Object.keys(bufferedEvents.current).length > 0
      ) {
        for (const key in bufferedEvents.current) {
          console.log("Sending buffered event", bufferedEvents.current[key]);
          socket.send(JSON.stringify(bufferedEvents.current[key]));
        }

        bufferedEvents.current = {}; // Clear buffer after sending
      }
    }, bufferTime);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.close();
      }
    };
  });

  const sendEvent = (event: BufferEventType) => {
    if (event.type === "pointer") {
      bufferedEvents.current[event.data.userId] = event;
    } else if (event.type === "elementChange") {
      bufferedEvents.current["all-elements"] = event;
    }
  };

  return sendEvent;
};

export default useBufferedWebSocket;
