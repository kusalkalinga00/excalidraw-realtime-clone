import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import useBufferedWebSocket from "../hooks/socket";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ExcalidrawImperativeAPI,
  SocketId,
} from "@excalidraw/excalidraw/types";
import {
  BufferEventType,
  ExcalidrawElementChange,
  ExcalidrawElementChangeSchema,
  PointerEvent,
  PointerEventSchema,
} from "../../types/event.schema";

const ExcalidrawComponent = () => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const { drawId } = useParams({
    from: "/excalidraw/$drawId",
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("userId");

    if (storedId) {
      setUserId(storedId);
    } else {
      const id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("userId", id);
      setUserId(id);
    }
  }, []);

  const handleMessage = (event: BufferEventType) => {
    if (event.type === "pointer") {
      handlePointerEvent(event);
    } else if (event.type === "elementChange") {
      handleElementChangeEvent(event);
    }
  };

  const handlePointerEvent = (event: PointerEvent) => {
    if (excalidrawAPI) {
      const allCollaborators = excalidrawAPI.getAppState().collaborators;
      const collaborator = new Map(allCollaborators);
      collaborator.set(event.data.userId as SocketId, {
        pointer: {
          x: event.data.x,
          y: event.data.y,
          tool: "pointer",
        },
        username: event.data.userId,
      });
      if (userId) {
        collaborator.delete(userId as SocketId);
      }
      excalidrawAPI.updateScene({ collaborators: collaborator });
    }
  };

  const handleElementChangeEvent = (event: ExcalidrawElementChange) => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({ elements: event.data });
      console.log("Element change event received:", event);
    }
  };

  const sendEventViaSocket = useBufferedWebSocket(drawId, handleMessage);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Excalidraw
        onPointerUpdate={(payload) => {
          sendEventViaSocket(
            PointerEventSchema.parse({
              type: "pointer",
              data: {
                userId: userId,
                x: payload.pointer.x,
                y: payload.pointer.y,
              },
            })
          );
        }}
        onPointerUp={() => {
          if (excalidrawAPI) {
            sendEventViaSocket(
              ExcalidrawElementChangeSchema.parse({
                type: "elementChange",
                data: excalidrawAPI.getSceneElements(),
              })
            );
          }
        }}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
      />
    </div>
  );
};

export default ExcalidrawComponent;
