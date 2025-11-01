import { useEffect, useRef } from "react";

const useBufferedWebSocket = (id: string) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://localhost:5173/api/ws/${id}`);
    const socket = socketRef.current;

    console.log("useBufferedWebSocket effect", socket);

    if (socket) {
      socket.onmessage = (event) => {
        console.log("received event:", event);
      };

      socket.onopen = () => {
        console.log("WebSocket connected");
      };
    }
  }, []);
};

export default useBufferedWebSocket;
