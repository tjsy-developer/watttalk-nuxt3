// composables/useCanvasInit.ts
import { useDrawingCanvasStore } from "@/stores/drawing";
import { fabric } from "fabric";

export default function initCanvasWithDot() {
	const drawingStore = useDrawingCanvasStore();
    const rect = new fabric.Rect({ left: 1, top: 1, fill: "white", width: 1, height: 1 });
    drawingStore.canvas.add(rect);
    drawingStore.canvas.requestRenderAll();
    const canvasJSON = drawingStore.canvas.toJSON();
    drawingStore.canvasHistory.state.push(canvasJSON);
    drawingStore.setCanvasHistory(drawingStore.canvasHistory);
    drawingStore.setSelectedFileIndex(drawingStore.selectedFileIndex + 1);
}
