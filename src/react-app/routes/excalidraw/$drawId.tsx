import { createFileRoute } from "@tanstack/react-router";
import ExcalidrawComponent from "../../components/ExcalidrawComponent";

export const Route = createFileRoute("/excalidraw/$drawId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ExcalidrawComponent />;
}
