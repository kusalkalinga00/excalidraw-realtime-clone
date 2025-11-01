import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import useBufferedWebSocket from "../hooks/socket";
import { useParams } from "@tanstack/react-router";

const ExcalidrawComponent = () => {
  const { userId } = useParams({
    from: "/excalidraw/$userId",
  });

  const sendEvent = useBufferedWebSocket(userId);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Excalidraw
        onPointerUpdate={(payload) => {
          sendEvent(payload);
        }}
      />
    </div>
  );
};

export default ExcalidrawComponent;
