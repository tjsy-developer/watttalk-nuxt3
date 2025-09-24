<template>
    <div class="callAttachment">
        <div class="col-auto column toolbar" id="drawingtoolbar">
            <div
                class="tool row"
                v-for="(tool, toolKey) in tools"
                :name="tool.tooltip"
                :style="{
                    border: tool.type == nowTool ? '1px solid #D6D6D6' : undefined,
                }"
                :key="toolKey"
                onmouseenter="this.childNodes[1].style.display = 'flex'; this.style.zIndex = '2';"
                onmouseleave="this.childNodes[1].style.display = 'none'; this.style.zIndex = '1';"
                @click="toolClick(tool)"
            >
                <img v-if="tool.img && nowTool != tool.type" :src="tool.img" />
                <img v-else-if="tool.img && nowTool == tool.type" :src="tool.fixImg" />

                <div v-else-if="tool.type == 'color'" class="col-12 colorContainer">
                    <div class="color" :style="{ backgroundColor: tool.selected }"></div>
                </div>

                <div class="column subMenu">
                    <div
                        class="subMenuContainer"
                        v-for="(subMenu, subMenuKey) in tool.subMenu"
                        :key="subMenuKey"
                        @click.stop="subMenuClick(subMenu, tool)"
                    >
                        <div
                            class="row justify-center content-center subMenuContents"
                            :style="{
                                border:
                                    subMenu.value == tool.selected
                                        ? '1px solid white'
                                        : undefined,
                                padding: tool.type == 'color' ? '3px' : undefined,
                            }"
                        >
                            <div
                                class="circle"
                                v-if="subMenu.circle"
                                :style="{
                                    width: subMenu.circle + 'px',
                                    height: subMenu.circle + 'px',
                                }"
                            ></div>
                            <div
                                class="square"
                                v-else-if="subMenu.square"
                                :style="{
                                    width: subMenu.square + 'px',
                                    height: subMenu.square + 'px',
                                }"
                            ></div>
                            <span v-else-if="subMenu.text">{{ subMenu.text }}</span>
                            <img v-else-if="subMenu.img" :src="subMenu.img" />
                            <div
                                class="color"
                                v-else-if="subMenu.color"
                                :style="{ backgroundColor: subMenu.value }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <span class="zoomMagnification" id="mag">{{ `ZOOM ${magnification}%` }}</span>

        <div class="canvas">
            <canvas ref="can" id="pt2Canvas"></canvas>

            <input
                ref="refImgFile"
                id="imgFi"
                type="file"
                @change="drawingImageOnchangeEvent"
                accept="image/jpg, image/jpeg, image/png"
                class="hiddenFileInput"
            />

            <input
                ref="refPdfFile"
                id="pdfFi"
                type="file"
                @change="drawingPdfOnchangeEvent"
                accept=".pdf"
                class="hiddenFileInput"
            />
        </div>
    </div>
</template>

<script setup>
import { fabric } from "fabric";
import _ from "lodash";

import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import { useDrawingCanvasStore } from "@/stores/drawing";
import { setRemoveDuplicates } from "@/utils/common";
import { computed, nextTick, reactive, ref, watch } from "vue";

const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();
const drawingStore = useDrawingCanvasStore();

// 이미지 import
import penImg from "@/assets/images/callAttachment/bt_1_pen.png";
import penFixImg from "@/assets/images/callAttachment/bt_pen_fix.png";

import lineImg from "@/assets/images/callAttachment/bt_2_line.png";
import lineFixImg from "@/assets/images/callAttachment/bt_2_line_fix.png";

import arrowImg from "@/assets/images/callAttachment/bt_3_arrow.png";
import arrowFixImg from "@/assets/images/callAttachment/bt_3_arrow_fix.png";

import squareImg from "@/assets/images/callAttachment/bt_4_square.png";
import squareFixImg from "@/assets/images/callAttachment/bt_4_square_fix.png";

import circleImg from "@/assets/images/callAttachment/bt_5_circle.png";
import circleFixImg from "@/assets/images/callAttachment/ic_drawing_circle_fix.png";

import textImg from "@/assets/images/callAttachment/bt_6_text.png";
import textFixImg from "@/assets/images/callAttachment/bt_6_text_fix.png";

import photoImg from "@/assets/images/callAttachment/bt_7_zoom.png";
import photoFixImg from "@/assets/images/callAttachment/bt_7_zoom_fix.png";

import pdfImg from "@/assets/images/callAttachment/bt_8_pdf.png";

import undoImg from "@/assets/images/callAttachment/bt_9_undo.png";
import undoFixImg from "@/assets/images/callAttachment/bt_11_back_fix.png";

import redoImg from "@/assets/images/callAttachment/bt_10_redo.png";
import redoFixImg from "@/assets/images/callAttachment/bt_11_forward_fix.png";

import moveLayerImg from "@/assets/images/callAttachment/ic_layer_move_fix.png";

import clearImg from "@/assets/images/callAttachment/ic_fresh_34.png";
import clearFixImg from "@/assets/images/callAttachment/ic_fresh_34_2.png";

import groupImg from "@/assets/images/callAttachment/ic_grouping.png";
import groupFixImg from "@/assets/images/callAttachment/ic_grouping_2.png";

import layerImg from "@/assets/images/callAttachment/ic_z-index.png";
import layerFixImg from "@/assets/images/callAttachment/ic_z-index_fix.png";

import bringToFrontImg from "@/assets/images/callAttachment/ic_bring_to_front.png";
import bringForwardImg from "@/assets/images/callAttachment/ic_bring_forward.png";
import sendBackwardImg from "@/assets/images/callAttachment/ic_send_backward.png";
import sendToBackImg from "@/assets/images/callAttachment/ic_send_to_back.png";

import downloadImg from "@/assets/images/callAttachment/ic_save_34.png";
import downloadFixImg from "@/assets/images/callAttachment/ic_save_34_fix.png";

const tools = ref([
    {
        type: "pen",
        img: penImg,
        fixImg: penFixImg,
        subMenu: [1, 3, 6, 10, 13, 16].map((v) => ({ circle: v, value: v })),
        selected: 3,
        tooltip: "연필",
    },
    {
        type: "line",
        img: lineImg,
        fixImg: lineFixImg,
        subMenu: [1, 3, 6, 10, 13, 16].map((v) => ({ circle: v, value: v })),
        selected: 3,
        tooltip: "선",
    },
    {
        type: "arrow",
        img: arrowImg,
        fixImg: arrowFixImg,
        subMenu: [1, 3, 6, 10, 13, 16].map((v) => ({ square: v, value: v })),
        selected: 3,
        tooltip: "화살표",
    },
    {
        type: "square",
        img: squareImg,
        fixImg: squareFixImg,
        subMenu: [1, 3, 6, 10, 13, 16].map((v) => ({ square: v, value: v })),
        selected: 3,
        tooltip: "사각형",
    },
    {
        type: "circle",
        img: circleImg,
        fixImg: circleFixImg,
        subMenu: [1, 3, 6, 10, 13, 16].map((v) => ({ circle: v, value: v })),
        selected: 3,
        tooltip: "원",
    },
    {
        type: "text",
        img: textImg,
        fixImg: textFixImg,
        subMenu: [16, 32, 64, 128, 256, 512].map((v) => ({ text: v, value: v })),
        selected: 32,
        tooltip: "텍스트",
        type: "layer",
        img: layerImg,
        fixImg: layerFixImg,
        selected: "F",
        tooltip: "레이어 정돈",
    },
    {
        type: "photo",
        img: photoImg,
        fixImg: photoFixImg,
        tooltip: "이미지 삽입",
    },
    {
        type: "pdf",
        img: pdfImg,
        fixImg: pdfImg,
        tooltip: "PDF 삽입",
    },
    {
        type: "undo",
        img: undoImg,
        fixImg: undoFixImg,
        tooltip: "되돌리기",
    },
    {
        type: "redo",
        img: redoImg,
        fixImg: redoFixImg,
        tooltip: "다시실행",
    },
    {
        type: "moveLayer",
        img: moveLayerImg,
        fixImg: moveLayerImg,
        tooltip: "레이어 선택",
    },
    {
        type: "clear",
        img: clearImg,
        fixImg: clearFixImg,
        tooltip: "캔버스 초기화",
    },
    {
        type: "group",
        img: groupImg,
        fixImg: groupFixImg,
        tooltip: "레이어 그룹화",
    },
    {
        type: "layer",
        img: layerImg,
        fixImg: layerFixImg,
        subMenu: [
            { img: bringToFrontImg, value: "F" },
            { img: bringForwardImg, value: "f" },
            { img: sendBackwardImg, value: "B" },
            { img: sendToBackImg, value: "b" },
        ],
        selected: "F",
        tooltip: "레이어 정돈",
    },
    {
        type: "color",
        subMenu: [
            "#EE324A",
            "#fe9a2f",
            "#f8e644",
            "#2ced66",
            "#349ced",
            "#ADB5BD",
            "#000000",
        ].map((color) => ({ color, value: color })),
        selected: "#EE324A",
        tooltip: "색상 변경",
    },
    {
        type: "download",
        img: downloadImg,
        fixImg: downloadFixImg,
        tooltip: "캔버스 이미지 저장",
    },
]);

// Primitive values (or objects that will be fully replaced) use `ref`
const can = ref(null);
const canvas = ref(null);
const isDrawing = ref(null);
const nowTool = ref("pen");
const beforeTool = ref("pen");
const line = ref(null);
const arrow = ref(null);
const triangle = ref(null);
const arrowGroup = ref(null);
const deltaX = ref(null);
const deltaY = ref(null);
const rect = ref(null);
const ellipse = ref(null);
const pointer = ref(null);
const origX = ref(null);
const origY = ref(null);
const itext = ref(null);
const objects = ref(null);
const image = ref(null);
const src = ref(null);
const pdf = ref(null);
const refImgFile = ref(null);
const refPdfFile = ref(null);

// `canvasHistory` is an object with nested properties, `reactive` is a good fit,
// or a `ref` holding a plain object, which Vue automatically makes reactive.
// Using `reactive` means you access properties directly without `.value` on `canvasHistory` itself.
const canvasHistory = ref({
    state: [],
    currentStateIndex: -1,
    undoStatus: false,
    redoStatus: false,
    undoFinishedStatus: true,
    redoFinishedStatus: true,
});

const canvasWrapWidth = ref(0);
const allWidth = ref(null);
const allHeight = ref(null);
const data = ref([]); // `data` is a generic name, consider renaming for clarity
const clipboard = ref(null);
const isDragging = ref(false);
const selection = ref(false);
const lastPosX = ref(null);
const lastPosY = ref(null);
const calcCanvasHeight = ref(null);
const magnification = ref("100"); // Note: it's a string "100" in original data
const fileSize = ref(null);
const file = ref(null);
const displayMode = ref("darkmode"); // Initial value 'darkmode' as per original
let pdfjsLib = null;
// Replaces `mounted()`
onMounted(() => {
    // `process.client`는 이 코드가 브라우저(클라이언트)에서만 실행됨을 보장합니다.
    if (process.client) {
        const nuxtApp = useNuxtApp();
        pdfjsLib = nuxtApp.$pdfjsLib; // 플러그인에서 provide한 pdfjsLib를 가져옵니다.

        if (!pdfjsLib) {
            console.error(
                "PDF.js 라이브러리를 로드할 수 없습니다. `plugins/pdfjs.client.ts` 파일을 확인하세요.",
            );
            alert("PDF 기능을 사용할 수 없습니다. 관리자에게 문의하세요.");
        }
    }
    // Set display mode
    displayMode.value = sessionStorage.getItem("displayMode") || "lightmode";
    // setTools(displayMode.value); // Call setTools function

    if (can.value && fabric.Canvas) {
        // Ensure Fabric.js is loaded
        const drawingWidth =
            document.getElementsByClassName("screen-draw")[0].clientWidth - 72;
        const drawingHeight =
            document.getElementsByClassName("screen-draw")[0].clientHeight;
        canvas.value = new fabric.Canvas(can.value, {
            isDrawingMode: true,
            preserveObjectStacking: true,
            backgroundColor: "#ffffff",
            width: drawingWidth,
            height: drawingHeight,
        });

        // Add initial white dot for history management
        const rect = new fabric.Rect({
            left: 1,
            top: 1,
            fill: "white",
            width: 1,
            height: 1,
        });
        canvas.value.add(rect);

        // Set Fabric.js fraction digits
        fabric.Object.NUM_FRACTION_DIGITS = 10;

        drawingStore.setCanvas(canvas.value); // Set canvas instance

        // Attach Fabric.js event listeners
        canvas.value.on("mouse:down", beginDrawing);
        canvas.value.on("mouse:move", keepDrawing);
        canvas.value.on("mouse:up", stopDrawing);
        canvas.value.on("mouse:wheel", canvasZoomWheel);
        canvas.value.on("object:moving", disable);
        canvas.value.on("object:scaling", disable);
        canvas.value.on("object:rotating", disable);
        canvas.value.on("object:added", (e) => {
            if (
                (beforeTool.value !== "line" &&
                    beforeTool.value !== "square" &&
                    beforeTool.value !== "arrow" &&
                    beforeTool.value !== "circle" &&
                    beforeTool.value !== "text") ||
                nowTool.value == "photo" ||
                nowTool.value == "pdf" ||
                thumbnailFileReceive.value
            ) {
                updateHistory();
                drawingStore.setThumbnailFileReceive(false); // Call Vuex mutation
            }
        });
        canvas.value.on("object:selected", (e) => {
            disable();
            updateHistory(4);
        });
        canvas.value.on("object:modified", (e) => {
            disable();
            updateHistory(5);
        });
        canvas.value.on("selection:created", (e) => {
            if (e.target) {
                objects.value = e.target;
            }
            if (nowTool.value !== "text") {
                updateHistory(6);
            }
        });
        canvas.value.on("selection:updated", (e) => {
            if (e.target) {
                objects.value = e.target;
            }
        });

        // Add global event listeners
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey) {
                canvas.value.defaultCursor = "grab";
                canvas.value.hoverCursor = "grab";
                if (nowTool.value == "pen") {
                    disable();
                }
            }
            canvasKeyCode(e);
        });
        window.addEventListener("keyup", (e) => {
            if (e.key == "Control") {
                canvas.value.defaultCursor = "default";
                if (nowTool.value == "pen") {
                    enable();
                }
            }
        });
        window.addEventListener("resize", onResize);

        // Set initial canvas dimensions
        // canvas.value.setWidth(1280);
        // canvas.value.setHeight(720);
        canvas.value.requestRenderAll();

        // Set initial free drawing brush properties (accessing computed 'tools' via store)
        // Ensure tools.value[14] and tools.value[0] are available
        if (tools.value[14]) {
            canvas.value.freeDrawingBrush.color = tools.value[14].selected;
        }
        if (tools.value[0]) {
            canvas.value.freeDrawingBrush.width = tools.value[0].selected;
        }

        canvasWidthHeightChange(); // Initial canvas size adjustment
        allHeight.value = window.innerHeight;

        // Load last canvas JSON if available
        if (lastCanvasJson.value != null) {
            // Check for identical history entry
            if (lastCanvasJson.value === vxCanvasHistory.value.state[0]) {
                const lastHistory =
                    vxCanvasHistory.value.state[vxCanvasHistory.value.currentStateIndex];
                drawingStore.setCanvasJson(lastHistory); // Load JSON
            }

            // Append lastCanvasJson to history if not already present
            const saveLastJson = lastCanvasJson.value;
            if (
                !(
                    vxCanvasHistory.value.state.length === 0 &&
                    vxCanvasHistory.value.state[0] === saveLastJson
                )
            ) {
                updateHistory(7); // updateHistory should add to vxCanvasHistory.state
                // Explicitly push for this specific case if updateHistory doesn't handle it
                // Note: Direct mutation of drawingStore.canvasHistory.state is generally discouraged.
                // It's better to use a mutation: store.commit('drawing/PUSH_HISTORY_STATE', saveLastJson);
                // For now, assuming updateHistory handles this or direct access is permitted.
                vxCanvasHistory.value.state.push(saveLastJson); // Direct push to ref, not ideal for Vuex state
            }

            let lastCanvasIndex = vxCanvasHistory.value.state.length - 1;
            for (let iLoop = 0; iLoop < vxCanvasHistory.value.state.length; ++iLoop) {
                const ele = vxCanvasHistory.value.state[iLoop];
                if (ele === saveLastJson) {
                    lastCanvasIndex = iLoop;
                    break;
                }
            }
            console.log("this.redo() is commented out but originally here");
            // this.redo() // Assuming a redo function exists
            drawingStore.setCanvasHistoryFin(true); // Call Vuex mutation
        } else if (vxCanvasHistory.value.state.length === 0) {
            if (!isGivenThumbnailTransfer.value) {
                updateHistory(8);
                drawingStore.setFirstHistory(vxCanvasHistory.value); // Set initial history
            }
        }

        console.log(
            "mounted vsCanvasHistory state 길이를 찍는다",
            vxCanvasHistory.value.state.length,
        );

        if (vxCanvasHistory.value.state.length === 0) {
            canvas.value.add(rect); // Add the initial white dot
        } else {
            drawingStore.setLoadImageOnCanvasFinished(false); // Call Vuex mutation
            const currentIndex = vxCanvasHistory.value.currentStateIndex;
            if (
                typeof vxCanvasHistory.value.state[currentIndex] !== "undefined" &&
                vxCanvasHistory.value.state[currentIndex] !== null
            ) {
                vxCanvasHistory.value.state[currentIndex] = setRemoveDuplicates(
                    vxCanvasHistory.value.state[currentIndex],
                );
            }
            canvas.value.loadFromJSON(vxCanvasHistory.value.state[currentIndex], () => {
                canvas.value.renderAll.bind(canvas.value);
                drawingStore.setLoadImageOnCanvasFinished(true); // Call Vuex mutation
                console.log("canvas renderAll finished in mounted");
            });
            console.log("this.canvas.renderAll.bind(this.canvas)");
        }
        console.log("여기1");
        drawingStore.setCanvasHistory(vxCanvasHistory.value); // Set overall canvas history
        drawingStore.setIsGivenThumbnailTransfer(false); // Call Vuex mutation
    } else {
        console.error("Canvas element or Fabric.js not found!");
    }
});

const commonToastMessage = (message) => {
    console.log("Toast:", message);
};

// Methods
const enable = () => {
    isDrawing.value = true;
    canvas.value.isDrawingMode = true;
};

const disable = () => {
    isDrawing.value = false;
    canvas.value.isDrawingMode = false;
};

const drawingMode = () => {
    console.log("여기를 탔니");
    if (nowTool.value === "pen") {
        enable();
    } else {
        disable();
    }
};

const selectionMode = (on) => {
    if (!canvas.value) return;

    if (on) {
        canvas.value.set({
            selectionColor: "rgba(100, 100, 255, 0.3)",
            selectionBorderColor: "rgba(255, 255, 255, 0.3)",
            selectionLineWidth: 1,
        });
    } else {
        canvas.value.set({
            selectionColor: "#00000000",
            selectionBorderColor: "#00000000",
            selectionLineWidth: 0,
        });
    }
};

const toolClick = (tool) => {
    console.log(tool.type);
    nowTool.value = tool.type;

    if (tool.type === "layer") {
        if (tools.value[13].selected === "F") {
            canvas.value.bringToFront(canvas.value.getActiveObjects()); // Assuming 'objects' refers to active objects
        } else if (tools.value[13].selected === "f") {
            canvas.value.bringForward(canvas.value.getActiveObjects());
        } else if (tools.value[13].selected === "B") {
            canvas.value.sendToBack(canvas.value.getActiveObjects());
        } else if (tools.value[13].selected === "b") {
            canvas.value.sendBackwards(canvas.value.getActiveObjects(), true);
        }
        return toolClick(tools.value[10]);
    }

    if (
        nowTool.value !== "clear" &&
        nowTool.value !== "color" &&
        nowTool.value !== "undo" &&
        nowTool.value !== "redo" &&
        nowTool.value !== "photo" &&
        nowTool.value !== "pdf" &&
        nowTool.value !== "group" &&
        nowTool.value !== "download"
    ) {
        beforeTool.value = nowTool.value;
    }

    if (nowTool.value === "moveLayer") {
        selectionMode(true);
        canvas.value.forEachObject((object) => {
            object.selectable = true;
        });
        canvas.value.hoverCursor = "grab";
    } else {
        if (nowTool.value === "group") {
            return groupActiveObjects();
        }
        canvas.value.discardActiveObject();
        canvas.value.renderAll();
        canvas.value.forEachObject((object) => {
            object.selectable = false;
        });
    }

    if (nowTool.value === "undo") {
        nowTool.value = beforeTool.value;
        return undo();
    }
    if (nowTool.value === "redo") {
        nowTool.value = beforeTool.value;
        return redo();
    }

    drawingMode(); // Apply drawing mode changes based on nowTool

    if (nowTool.value === "photo") {
        resetDrawingFileForm();
        image.value = null;
        if (canvas.value.isDrawingMode === true && nowTool.value === "moveLayer") {
            nowTool.value = "pen";
        } else if (nowTool.value === "moveLayer") {
            toolClick(tools.value[10]);
        } else if (canvas.value.isDrawingMode === false && nowTool.value === "pen") {
            drawingMode();
        }
        refImgFile.value.click(); // Trigger file input click
        return;
    }

    if (nowTool.value === "pdf") {
        if (isPdfUploading.value) {
            commonToastMessage("uploading PDF");
            return;
        }
        resetrefPdfFileForm();
        pdf.value = null;
        nowTool.value = beforeTool.value;
        if (canvas.value.isDrawingMode === true && nowTool.value === "moveLayer") {
            nowTool.value = "pen";
        } else if (nowTool.value === "moveLayer") {
            toolClick(tools.value[10]);
        } else if (canvas.value.isDrawingMode === false && nowTool.value === "pen") {
            drawingMode();
        }
        refPdfFile.value.click(); // Trigger file input click
        return;
    }

    if (nowTool.value === "clear") {
        return clearCanvas();
    }

    console.log(nowTool.value);
    if (
        nowTool.value === "line" ||
        nowTool.value === "arrow" ||
        nowTool.value === "square" ||
        nowTool.value === "circle" ||
        nowTool.value === "text"
    ) {
        canvas.value.defaultCursor = "crosshair";
    }

    if (nowTool.value === "color") {
        nowTool.value = beforeTool.value;
        if (canvas.value.isDrawingMode === true && nowTool.value === "moveLayer") {
            nowTool.value = "pen";
        } else if (nowTool.value === "moveLayer") {
            toolClick(tools.value[10]);
        }
    }

    if (nowTool.value === "download") {
        nowTool.value = beforeTool.value;
        if (canvas.value.isDrawingMode === true && nowTool.value === "moveLayer") {
            nowTool.value = "pen";
        } else if (nowTool.value === "moveLayer") {
            toolClick(tools.value[10]);
        } else if (canvas.value.isDrawingMode === false && nowTool.value === "pen") {
            drawingMode();
        }
        return canvasSavePng();
    }
    drawingMode(); // Ensure drawing mode is set correctly after all tool logic
};

const subMenuClick = (subMenu, tool) => {
    if (tool.type) {
        nowTool.value = tool.type;
        if (tool.type === "layer") {
            selectionMode(false);
            if (subMenu.value === "F") {
                canvas.value.getActiveObjects().forEach((obj) => {
                    canvas.value.bringToFront(obj);
                });
                // canvas.value.bringToFront(canvas.value.getActiveObjects());
            } else if (subMenu.value === "f") {
                canvas.value.getActiveObjects().forEach((obj) => {
                    canvas.value.bringForward(obj);
                });
                // canvas.value.bringForward(canvas.value.getActiveObjects());
            } else if (subMenu.value === "B") {
                canvas.value.getActiveObjects().forEach((obj) => {
                    canvas.value.sendToBack(obj);
                });
                // canvas.value.sendToBack(canvas.value.getActiveObjects());
            } else if (subMenu.value === "b") {
                canvas.value.getActiveObjects().forEach((obj) => {
                    canvas.value.sendBackwards(obj);
                });
                // canvas.value.sendBackwards(canvas.value.getActiveObjects());
            }
            toolClick(tools.value[10]);
        }

        if (nowTool.value !== "clear" && nowTool.value !== "color") {
            beforeTool.value = nowTool.value;
        }
        if (nowTool.value === "color") {
            nowTool.value = beforeTool.value;
            if (canvas.value.isDrawingMode === true && nowTool.value === "moveLayer") {
                nowTool.value = "pen";
            }
        }
        drawingMode();
        if (
            nowTool.value === "line" ||
            nowTool.value === "arrow" ||
            nowTool.value === "square" ||
            nowTool.value === "circle" ||
            nowTool.value === "text"
        ) {
            drawingMode();
            canvas.value.defaultCursor = "crosshair";
            // The original code calls toolClick again here, which might be redundant
            // if the tool is already set by nowTool.value. Consider if these nested calls are necessary.
            if (nowTool.value === "line") {
                toolClick(tools.value[1]);
            }
            if (nowTool.value === "arrow") {
                toolClick(tools.value[2]);
            }
            if (nowTool.value === "square") {
                toolClick(tools.value[3]);
            }
            if (nowTool.value === "circle") {
                toolClick(tools.value[4]);
            }
            if (nowTool.value === "text") {
                toolClick(tools.value[5]);
            }
        }
    }
    tool.selected = subMenu.value;
};

const drawPen = () => {
    if (!canvas.value) return;
    canvas.value.freeDrawingBrush.color = tools.value[14].selected;
    canvas.value.freeDrawingBrush.width = tools.value[0].selected;
};

const drawLine = (e) => {
    console.log(isDrawing.value);
    if (!canvas.value) return;
    selectionMode(false);
    if (isDrawing.value) {
        if (e) {
            pointer.value = canvas.value.getPointer(e.e);
            line.value.set({
                x2: pointer.value.x,
                y2: pointer.value.y,
            });
            line.value.setCoords();
            canvas.value.renderAll();
        } else {
            disable();
            nowTool.value = "moveLayer";
            drawingMode();
        }
    } else if (e) {
        pointer.value = canvas.value.getPointer(e.e);
        origX.value = pointer.value.x;
        origY.value = pointer.value.y;

        const points = [
            pointer.value.x,
            pointer.value.y,
            pointer.value.x,
            pointer.value.y,
        ];
        console.log(points);
        line.value = new fabric.Line(points, {
            strokeWidth: tools.value[1].selected,
            stroke: tools.value[14].selected,
            fill: tools.value[14].selected,
            originX: "center",
            originY: "center",
            transparentCorners: false,
        });
        canvas.value.add(line.value);
    }
};

const fabricCalcArrowAngle = (x1, y1, x2, y2) => {
    let angle = 0;
    const x = x2 - x1;
    const y = y2 - y1;
    if (x === 0) {
        angle = y === 0 ? 0 : y > 0 ? Math.PI / 2 : (Math.PI * 3) / 2;
    } else if (y === 0) {
        angle = x > 0 ? 0 : Math.PI;
    } else {
        angle =
            x < 0
                ? Math.atan(y / x) + Math.PI
                : y < 0
                  ? Math.atan(y / x) + 2 * Math.PI
                  : Math.atan(y / x);
    }
    return (angle * 180) / Math.PI + 90;
};

const drawArrow = (e) => {
    if (!canvas.value) return;
    selectionMode(false);
    if (isDrawing.value) {
        if (e) {
            pointer.value = canvas.value.getPointer(e.e);
            console.log(line.value, line.value instanceof fabric.Line);
            if (arrow.value) {
                arrow.value.set({
                    x2: pointer.value.x,
                    y2: pointer.value.y,
                });
            }

            if (triangle.value) {
                triangle.value.set({
                    left: pointer.value.x + deltaX.value,
                    top: pointer.value.y + deltaY.value,
                    fill: tools.value[14].selected,
                    angle: fabricCalcArrowAngle(
                        arrow.value.x1,
                        arrow.value.y1,
                        arrow.value.x2,
                        arrow.value.y2,
                    ),
                });
            }

            canvas.value.renderAll();
        } else {
            disable();
            nowTool.value = "moveLayer";
            drawingMode();
        }
    } else if (e) {
        pointer.value = canvas.value.getPointer(e.e);
        origX.value = pointer.value.x;
        origY.value = pointer.value.y;
        const points = [
            pointer.value.x,
            pointer.value.y,
            pointer.value.x,
            pointer.value.y,
        ];
        arrow.value = new fabric.Line(points, {
            strokeWidth: tools.value[2].selected,
            stroke: tools.value[14].selected,
            fill: tools.value[14].selected,
            selectable: false,
            originX: "center",
            originY: "center",
        });
        const centerX = (arrow.value.x1 + arrow.value.x2) / 2;
        const centerY = (arrow.value.y1 + arrow.value.y2) / 2;
        deltaX.value = arrow.value.left - centerX;
        deltaY.value = arrow.value.top - centerY;

        triangle.value = new fabric.Triangle({
            left: arrow.value.get("x1") + deltaX.value,
            top: arrow.value.get("y1") + deltaY.value,
            originX: "center",
            originY: "center",
            selectable: false,
            angle: -45,
            width: tools.value[2].selected + 20,
            height: tools.value[2].selected + 20,
            fill: "#00000000",
        });
        canvas.value.add(arrow.value, triangle.value);
    }
};

const drawSquare = (e) => {
    if (!canvas.value) return;
    selectionMode(false);

    if (isDrawing.value) {
        if (e) {
            pointer.value = canvas.value.getPointer(e.e);
            if (rect.value) {
                // X 좌표가 왼쪽으로 갔을 경우 left 재조정
                if (origX.value > pointer.value.x) {
                    rect.value.set({ left: pointer.value.x });
                }

                // Y 좌표가 위쪽으로 갔을 경우 top 재조정
                if (origY.value > pointer.value.y) {
                    rect.value.set({ top: pointer.value.y });
                }

                // width / height 계산
                rect.value.set({
                    width: Math.abs(origX.value - pointer.value.x),
                    height: Math.abs(origY.value - pointer.value.y),
                });
            }

            canvas.value.renderAll();
        } else {
            disable();
            nowTool.value = "moveLayer";
            drawingMode();
        }
    } else if (e) {
        pointer.value = canvas.value.getPointer(e.e);
        origX.value = pointer.value.x;
        origY.value = pointer.value.y;

        rect.value = new fabric.Rect({
            left: origX.value,
            top: origY.value,
            originX: "left",
            originY: "top",
            width: 0,
            height: 0,
            stroke: tools.value[14].selected, // 선 색상
            strokeWidth: tools.value[3].selected, // 선 두께
            angle: 0,
            transparentCorners: false,
            fill: "#00000000", // 투명 배경
        });

        canvas.value.add(rect.value);
    }
};

const drawCircle = (e) => {
    if (!canvas.value) return;
    selectionMode(false);

    if (isDrawing.value) {
        if (e) {
            pointer.value = canvas.value.getPointer(e.e);

            ellipse.value.set({
                stroke: tools.value[14].selected,
                strokeWidth: tools.value[4].selected,
                rx: Math.abs(origX.value - pointer.value.x) / 2,
                ry: Math.abs(origY.value - pointer.value.y) / 2,
                left: Math.min(origX.value, pointer.value.x),
                top: Math.min(origY.value, pointer.value.y),
                originX: "left",
                originY: "top",
            });

            ellipse.value.setCoords();
            canvas.value.renderAll();
        } else {
            disable();
            nowTool.value = "moveLayer";
            drawingMode();
        }
    } else if (e) {
        pointer.value = canvas.value.getPointer(e.e);
        origX.value = pointer.value.x;
        origY.value = pointer.value.y;

        ellipse.value = new fabric.Ellipse({
            left: origX.value,
            top: origY.value,
            rx: 0,
            ry: 0,
            transparentCorners: false,
            fill: "transparent", // 투명 fill
            stroke: tools.value[14].selected,
            strokeWidth: tools.value[4].selected,
            originX: "left",
            originY: "top",
        });

        canvas.value.add(ellipse.value);
    }
};

const drawText = (e) => {
    if (!canvas.value) return;
    selectionMode(true);
    if (e) {
        pointer.value = canvas.value.getPointer(e.e);
        origX.value = pointer.value.x;
        origY.value = pointer.value.y;
        itext.value = new fabric.IText("", {
            top: origY.value,
            left: origX.value,
            fontSize: tools.value[5].selected,
            fontFamily: "NanumSquare",
            fill: tools.value[14].selected,
            transparentCorners: false,
        });
        canvas.value.add(itext.value).setActiveObject(itext.value);
        itext.value.enterEditing();
        itext.value.hiddenTextarea.focus();
    }
};

const drawingImageOnchangeEvent = (e) => {
    console.log("drawingImageOnchangeEvent start");

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const imgObj = new Image();
        imgObj.src = event.target.result;

        callStore.setDrawingGetFileSrc(event.target.result);
        callStore.setDrawingGetFileObject(refImgFile.value.files);

        imgObj.crossOrigin = "anonymous";

        callStore.setDrawingGetFileChangeFlag(true);

        imgObj.onload = () => {
            image.value = new fabric.Image(imgObj, {
                left: 0,
                top: 0,
                originX: "left",
                originY: "top",
                angle: 0,
            });

            if (
                image.value.width > canvas.value.getWidth() ||
                image.value.height > canvas.value.getHeight()
            ) {
                if (image.value.width > image.value.height) {
                    const imageScaleX = canvas.value.getWidth() / image.value.width;
                    const imageScaleY = canvas.value.getHeight() / image.value.height;

                    image.value.scale(1.0).set({
                        scaleX: imageScaleX,
                        scaleY: imageScaleY,
                    });
                } else {
                    const imageScaleX =
                        canvas.value.getWidth() / (image.value.width * 2.5);
                    const imageScaleY = canvas.value.getHeight() / image.value.height;

                    image.value.scale(1.0).set({
                        scaleX: imageScaleX,
                        scaleY: imageScaleY,
                    });
                }
            } else {
                image.value.scale(1.0).set("flipX", false);
            }
            console.log(image.value, ". canvas.add(image.value)");
            canvas.value.add(image.value);
        };
        drawingStore.setSrc({
            type: "img",
            src: event.target.result,
        });
    };
    reader.readAsDataURL(file);
};

// ---
const drawingPdfOnchangeEvent = async (e) => {
    const file = e.target.files[0];
    const acceptFileType = ["pdf"];
    const fileType = file.name.split(".").pop().toLowerCase();

    if (!acceptFileType.includes(fileType)) {
        alert("pdf 파일만 업로드 가능합니다.");
        return;
    }

    console.log(file);
    if (!file) return;

    const reader = new FileReader();

    try {
        const arrayBuffer = await file.arrayBuffer();
        // PDF.js를 사용하여 PDF 문서를 로드합니다.
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        console.log("PDF 객체 로딩 완료:", pdf); // 여기가 이제 찍힐 겁니다! 🎉

        // 스토어에 PDF 관련 정보 저장 (기존 로직 유지)
        const uploadSrc = new Blob([arrayBuffer], { type: "application/pdf" });
        callStore.setDrawingGetPDFUploadSrc(uploadSrc);
        callStore.setDrawingGetPDFUploadObject(file); // FileList 대신 단일 File 객체 전달

        drawingStore.setTotalPages(pdf.numPages);
        drawingStore.setPdfGroup(pdf.numPages); // 이 함수가 어떤 역할을 하는지 확인 필요

        // 각 페이지를 순회하며 렌더링합니다.
        const pageNums = Array.from({ length: pdf.numPages }, (_, i) => i + 1);

        // 기존의 .reduce() 비동기 루프를 async/await for...of 루프로 변경
        for (const pageNum of pageNums) {
            // isDrawingPage 상태에 따라 로직 실행
            // self.isDrawingPage는 drawingStore.isDrawingPage로 매핑
            if (commonStore.isDrawing) {
                await new Promise((resolve) => setTimeout(resolve, 200)); // 짧은 딜레이

                const page = await pdf.getPage(pageNum);
                const scale = 1.0;
                const viewport = page.getViewport({ scale });

                // PDF 렌더링용 임시 캔버스 생성 및 렌더링
                const renderCanvas = document.createElement("canvas");
                renderCanvas.width = viewport.width;
                renderCanvas.height = viewport.height;
                const context = renderCanvas.getContext("2d");
                // await page.render({
                //     canvasContext: context,
                //     viewport,
                // }).promise;

                const imageData = renderCanvas.toDataURL("image/png");

                // Fabric.js 캔버스 생성 및 DOM에 추가
                const fabricCanvasId = `fabric-canvas-${pageNum}`;
                const fabricCanvasEl = document.createElement("canvas");
                fabricCanvasEl.id = fabricCanvasId;
                can.value.nextSibling.appendChild(fabricCanvasEl);

                const fCanvas = new fabric.Canvas(fabricCanvasId);
                fCanvas.setDimensions({
                    width: viewport.width,
                    height: viewport.height,
                });
                const renderContext = {
                    canvasContext: context,
                    viewport,
                };
                const task = page.render(renderContext);
                task.promise.then(() => {
                    const imageData = fCanvas.upperCanvasEl.toDataURL({
                        format: "png",
                    });
                    fabric.Image.fromURL(imageData, (img) => {
                        img.scaleToHeight(page.view[3]);
                        fCanvas.setHeight(page.view[3]);
                        fCanvas.setWidth(page.view[2]);
                        drawingStore.setSrc({
                            type: "pdf",
                            src: imageData,
                            name: file.name,
                        });
                    });
                });
                canvas.value.renderAll();
            } else if (!drawingStore.escapeDrawingPage) {
                // self.escapeDrawingPage == false -> !drawingStore.escapeDrawingPage
                drawingStore.setEscapeDrawingPage(true);
            }
        }
    } catch (err) {
        console.log(err);
    }

    drawingStore.clearPdfNum();
};

const resetDrawingFileForm = () => {
    const el = refImgFile.value;
    if (!el || !el.parentNode) return;

    const parent = el.parentNode;
    const next = el.nextSibling;

    const tmp = document.createElement("form");
    tmp.appendChild(el); // 임시 폼에 넣고
    tmp.reset(); // 폼 리셋
    parent.insertBefore(el, next); // 다시 원래 위치에 삽입
};

const resetrefPdfFileForm = () => {
    const el = refPdfFile.value;
    if (!el || !el.parentNode) return;

    const parent = el.parentNode;
    const next = el.nextSibling;

    const tmp = document.createElement("form");
    tmp.appendChild(el); // 임시 폼에 넣고
    tmp.reset(); // 폼 리셋
    parent.insertBefore(el, next); // 다시 원래 위치에 삽입
};

const deleteSelectedObjectFromCanvas = () => {
    if (!canvas.value) return;
    canvas.value.getActiveObjects().forEach((obj) => {
        canvas.value.remove(obj);
    });
    canvas.value.discardActiveObject();
    canvas.value.renderAll();
    updateHistory(1);
};

const clearCanvas = () => {
    if (!canvas.value || canvasHistory.value.state.length === 0) return;

    canvas.value.loadFromJSON(
        canvasHistory.value.state[0],
        canvas.value.renderAll.bind(canvas.value),
    );
    canvasHistory.value.currentStateIndex = 0;
    nowTool.value = beforeTool.value;
    drawingMode(); // Ensure drawing mode is set correctly
};

const groupActiveObjects = () => {
    if (!canvas.value || !canvas.value.getActiveObject()) {
        return;
    }
    if (canvas.value.getActiveObject().type !== "activeSelection") {
        canvas.value.getActiveObject().toActiveSelection();
        canvas.value.requestRenderAll();
    } else {
        canvas.value.getActiveObject().toGroup();
        canvas.value.requestRenderAll();
    }
    toolClick(tools.value[10]); // Assuming tools.value[10] is the select/move tool
};

const copyObjects = () => {
    if (!canvas.value || canvas.value.getActiveObject() == null) {
        return;
    }
    canvas.value.getActiveObject().clone((cloned) => {
        clipboard.value = cloned;
    });
};

const pasteObjects = () => {
    console.log("pasteObjects start");

    const handlePaste = (evt) => {
        const dT = evt.clipboardData || window.clipboardData;
        const pastedFile = dT.files[0];

        if (
            pastedFile &&
            (clipboard.value === null || fileSize.value !== pastedFile.size)
        ) {
            file.value = pastedFile;
            fileSize.value = pastedFile.size;
            const acceptFileType = ["png", "jpg", "jpeg"];
            const fileTypeIndex = pastedFile.name.lastIndexOf(".");
            const selectFileType = pastedFile.name
                .substring(fileTypeIndex + 1)
                .toLowerCase();

            if (acceptFileType.includes(selectFileType)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imgObj = new Image();
                    imgObj.src = e.target.result;
                    imgObj.onload = () => {
                        const fabricImage = new fabric.Image(
                            imgObj,
                            {
                                left: 0,
                                top: 0,
                                originX: "left",
                                originY: "top",
                                angle: 0,
                            },
                            {
                                crossOrigin: "anonymous",
                            },
                        );

                        if (
                            fabricImage.width > canvas.value.getWidth() ||
                            fabricImage.height > canvas.value.getHeight()
                        ) {
                            if (fabricImage.width > fabricImage.height) {
                                fabricImage.scale(1.0).set({
                                    scaleX: canvas.value.getWidth() / fabricImage.width,
                                    scaleY: canvas.value.getHeight() / fabricImage.height,
                                });
                            } else {
                                fabricImage.scale(1.0).set({
                                    scaleX:
                                        canvas.value.getWidth() /
                                        (fabricImage.width * 2.5),
                                    scaleY: canvas.value.getHeight() / fabricImage.height,
                                });
                            }
                        } else {
                            fabricImage.scale(1.0).set("flipX", false);
                        }
                        clipboard.value = fabricImage;
                        executePasteCallback();
                    };
                };
                reader.readAsDataURL(pastedFile);
            }
        } else {
            executePasteCallback();
        }
    };

    // Temporarily attach event listener for paste
    document.addEventListener("paste", handlePaste, {
        once: true,
    });

    const executePasteCallback = () => {
        if (!clipboard.value || !canvas.value) {
            console.log("No object in clipboard or canvas not ready.");
            return;
        }

        clipboard.value.clone((clonedObj) => {
            canvas.value.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            if (clonedObj.type === "activeSelection") {
                clonedObj.canvas = canvas.value;
                clonedObj.forEachObject((obj) => {
                    console.log(obj, ". canvas.value.add(obj)");
                    canvas.value.add(obj);
                });
                clonedObj.setCoords();
            } else {
                console.log(clonedObj, ". canvas.value.add(clonedObj)");
                canvas.value.add(clonedObj);
            }
            clipboard.value.top += 10;
            clipboard.value.left += 10;
            canvas.value.setActiveObject(clonedObj);
            canvas.value.requestRenderAll();
            updateHistory(1); // Update history after pasting
        });
    };
};

const multiSelect = () => {
    if (!canvas.value) return;
    canvas.value.discardActiveObject();
    const sel = new fabric.ActiveSelection(canvas.value.getObjects(), {
        canvas: canvas.value,
    });
    canvas.value.setActiveObject(sel);
    canvas.value.requestRenderAll();
    // Assuming toolClick updates nowTool based on tool[10] which might be the selection tool
    toolClick(tools.value[10]);
};

const updateHistory = (type) => {
    if (!canvas.value) return;

    if (
        canvasHistory.value.undoStatus === true ||
        canvasHistory.value.redoStatus === true
    ) {
        // console.log("updateHistory quarter canvasHistory.undoStatus: ".concat(this.canvasHistory.undoStatus, "canvasHistory.redoStatus: ", this.canvasHistory.redoStatus))
        // None
    } else {
        const jsonData = canvas.value.toJSON();
        const canvasAsJson = JSON.stringify(jsonData);

        if (
            canvasHistory.value.currentStateIndex <
                canvasHistory.value.state.length - 1 &&
            canvasHistory.value.state[canvasHistory.value.currentStateIndex] !=
                canvasAsJson &&
            canvasHistory.value.state[canvasHistory.value.currentStateIndex - 1] !=
                canvasAsJson
        ) {
            // console.log("updateHistory quarter fit")
            const indexToBeInserted = canvasHistory.value.currentStateIndex + 1;
            canvasHistory.value.state[indexToBeInserted] = canvasAsJson;
            const elementsToKeep = indexToBeInserted + 1;
            canvasHistory.value.state = canvasHistory.value.state.splice(
                0,
                elementsToKeep,
            );
        } else if (
            canvasHistory.value.state[canvasHistory.value.currentStateIndex] !==
            canvasAsJson
        ) {
            // console.log("updateHistory quarter another fit")
            canvasHistory.value.state.push(canvasAsJson);
        }

        canvasHistory.value.currentStateIndex = canvasHistory.value.state.length - 1;
        drawingStore.setCanvasJson(
            canvasHistory.value.state[canvasHistory.value.currentStateIndex],
        );
    }
};

const undo = () => {
    if (!canvas.value) return;
    console.log("undo", canvasHistory.value.currentStateIndex, canvasHistory.value.state);

    if (canvasHistory.value.currentStateIndex - 1 < 0) {
        return;
    }

    if (canvasHistory.value.undoFinishedStatus) {
        canvasHistory.value.undoFinishedStatus = false;
        canvasHistory.value.undoStatus = true;
        let targetStateIndex = canvasHistory.value.currentStateIndex - 1;
        // Ensure the target state is not undefined or null before processing
        if (
            typeof canvasHistory.value.state[targetStateIndex] !== "undefined" &&
            canvasHistory.value.state[targetStateIndex] !== null
        ) {
            canvasHistory.value.state[targetStateIndex] = setRemoveDuplicates(
                canvasHistory.value.state[targetStateIndex],
            );
        }

        canvas.value.loadFromJSON(canvasHistory.value.state[targetStateIndex], () => {
            canvas.value.renderAll();
            canvasHistory.value.undoStatus = false;
            canvasHistory.value.currentStateIndex--;
            canvasHistory.value.undoFinishedStatus = true;
        });
    }
    // Logic to re-enable drawing mode if a tool was active
    if (
        nowTool.value == "line" ||
        nowTool.value == "arrow" ||
        nowTool.value == "square" ||
        nowTool.value == "circle" ||
        nowTool.value == "text"
    ) {
        drawingMode();
        canvas.value.defaultCursor = "crosshair";
        if (nowTool.value == "line") {
            toolClick(tools.value[1]);
        }
        if (nowTool.value == "arrow") {
            toolClick(tools.value[2]);
        }
        if (nowTool.value == "square") {
            toolClick(tools.value[3]);
        }
        if (nowTool.value == "circle") {
            toolClick(tools.value[4]);
        }
        if (nowTool.value == "text") {
            toolClick(tools.value[5]);
        }
    }
};

const redo = () => {
    if (!canvas.value) return;
    console.log("redo", canvasHistory.value.currentStateIndex, canvasHistory.value.state);

    if (canvasHistory.value.currentStateIndex + 1 >= canvasHistory.value.state.length) {
        console.log("redo #1 - No more states to redo.");
        return;
    }

    if (canvasHistory.value.redoFinishedStatus) {
        console.log("redo() #2 start");
        canvasHistory.value.redoFinishedStatus = false;
        // this.$store.commit("drawing/setLoadImageOnCanvasFinished", false); // Assuming Vuex action
        canvasHistory.value.redoStatus = true;
        let targetStateIndex = canvasHistory.value.currentStateIndex + 1;

        if (
            typeof canvasHistory.value.state[targetStateIndex] !== "undefined" &&
            canvasHistory.value.state[targetStateIndex] !== null
        ) {
            canvasHistory.value.state[targetStateIndex] = setRemoveDuplicates(
                canvasHistory.value.state[targetStateIndex],
            );
        }
        console.log(targetStateIndex, "targetStateIndex");

        canvas.value.loadFromJSON(canvasHistory.value.state[targetStateIndex], () => {
            canvas.value.renderAll();
            canvasHistory.value.redoStatus = false;
            canvasHistory.value.currentStateIndex++;
            canvasHistory.value.redoFinishedStatus = true;
            // this.$store.commit("drawing/setLoadImageOnCanvasFinished", true); // Assuming Vuex action
            console.log("redo() finished");
        });
    }

    // Logic to re-enable drawing mode if a tool was active
    if (
        nowTool.value == "line" ||
        nowTool.value == "arrow" ||
        nowTool.value == "square" ||
        nowTool.value == "circle" ||
        nowTool.value == "text"
    ) {
        console.log("redo #3");
        drawingMode();
        canvas.value.defaultCursor = "crosshair";
        if (nowTool.value == "line") {
            toolClick(tools.value[1]);
        }
        if (nowTool.value == "arrow") {
            toolClick(tools.value[2]);
        }
        if (nowTool.value == "square") {
            toolClick(tools.value[3]);
        }
        if (nowTool.value == "circle") {
            toolClick(tools.value[4]);
        }
        if (nowTool.value == "text") {
            toolClick(tools.value[5]);
        }
    }
};

const canvasKeyCode = (e) => {
    if (!canvas.value) return;

    // Delete
    if (
        e.code === "Delete" &&
        objects.value && // Assuming 'objects' means there are selectable objects
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.altKey
    ) {
        e.preventDefault(); // Prevent default browser behavior
        return deleteSelectedObjectFromCanvas();
    }

    // Alt + Numbers/A
    if (e.altKey && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault(); // Prevent default browser behavior
        if (e.code === "Backquote") {
            return toolClick(tools.value[10]);
        }
        if (e.code === "Digit1") {
            return toolClick(tools.value[0]);
        }
        if (e.code === "Digit2") {
            return toolClick(tools.value[1]);
        }
        if (e.code === "Digit3") {
            return toolClick(tools.value[2]);
        }
        if (e.code === "Digit4") {
            return toolClick(tools.value[3]);
        }
        if (e.code === "Digit5") {
            return toolClick(tools.value[4]);
        }
        if (e.code === "Digit6") {
            return toolClick(tools.value[5]);
        }
        if (e.code === "Digit0") {
            return groupActiveObjects();
        }
        if (e.key === "a" || e.key === "A") {
            toolClick(tools.value[10]);
            return multiSelect();
        }
    }

    // Ctrl + C/V/Z
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        // e.preventDefault(); // Might prevent native copy/paste on inputs
        if (e.key === "c" || e.key === "C") {
            return copyObjects();
        }
        if (e.key === "v" || e.key === "V") {
            return pasteObjects();
        }
        if (e.key === "z" || e.key === "Z") {
            return undo();
        }
    }
    // Ctrl + Shift + Z
    else if (e.ctrlKey && e.shiftKey && !e.altKey) {
        // e.preventDefault(); // Might prevent native browser shortcuts
        if (e.key === "Z" || e.key === "z") {
            return redo();
        }
    }
};

// ---
// Drawing Interaction
// ---
const beginDrawing = (e) => {
    console.log("드로잉 시작");
    if (!canvas.value) return;

    if (e && e.e && e.e.ctrlKey === true) {
        canvas.value.hoverCursor = "grab";
        nowTool.value = ""; // No tool active for drawing
        isDrawing.value = false;
        isDragging.value = true; // Enable dragging/panning
        selection.value = false; // Disable selection of objects
        lastPosX.value = e.e.clientX;
        lastPosY.value = e.e.clientY;
        return;
    }
    isDrawing.value = false; // Set drawing flag to true

    if (nowTool.value === "pen") {
        drawPen();
    } else if (nowTool.value === "line") {
        drawLine(e);
    } else if (nowTool.value === "arrow") {
        drawArrow(e);
    } else if (nowTool.value === "square") {
        drawSquare(e);
    } else if (nowTool.value === "circle") {
        drawCircle(e);
    } else if (nowTool.value === "text") {
        drawText(e);
    }
    isDrawing.value = true;
};

const keepDrawing = (e) => {
    console.log("여기타야지");
    if (!canvas.value) return;

    if (isDragging.value) {
        isDrawing.value = false; // No drawing while dragging
        selectionMode(false); // Disable object selection
        const evt = e.e;
        const vpt = canvas.value.viewportTransform;
        vpt[4] += evt.clientX - lastPosX.value; // Update X translation
        vpt[5] += evt.clientY - lastPosY.value; // Update Y translation
        canvas.value.requestRenderAll();
        lastPosX.value = evt.clientX;
        lastPosY.value = evt.clientY;
        return;
    }
    if (isDrawing.value && !isDragging.value) {
        if (nowTool.value === "pen") {
            // Pen drawing is handled by Fabric.js isDrawingMode
        } else if (nowTool.value === "line") {
            if (line.value) {
                drawLine(e); // Update line end point
            }
        } else if (nowTool.value === "arrow") {
            if (arrow.value) {
                drawArrow(e); // Update arrow end point
            }
        } else if (nowTool.value === "square") {
            if (rect.value) {
                drawSquare(e); // Update rectangle dimensions
            }
        } else if (nowTool.value === "circle") {
            if (ellipse.value) {
                drawCircle(e); // Update circle dimensions
            }
        }
    }
};

const stopDrawing = (e) => {
    console.log("stopDrawing");
    if (!canvas.value) return;

    if (isDragging.value) {
        isDrawing.value = true; // Re-enable drawing mode for next action
    }
    canvas.value.setViewportTransform(canvas.value.viewportTransform); // Finalize viewport transform
    isDragging.value = false; // End dragging
    selection.value = true; // Re-enable selection
    nowTool.value = beforeTool.value; // Return to previous tool

    if (isDrawing.value) {
        if (nowTool.value === "pen") {
            drawingMode(); // Ensure pen mode is correctly finalized
        } else if (
            nowTool.value === "line" ||
            nowTool.value === "square" ||
            nowTool.value === "circle"
        ) {
            // These shapes are already added and updated during keepDrawing
            if (nowTool.value === "line") {
                line.value = null;
            } else if (nowTool.value === "square") {
                rect.value = null;
            } else if (nowTool.value === "circle") {
                ellipse.value = null;
            }
            canvas.value.defaultCursor = "default";
        } else if (nowTool.value === "arrow") {
            if (arrow.value != null && triangle.value != null) {
                // Group arrow line and triangle head
                const group = new fabric.Group([arrow.value, triangle.value], {
                    selectable: true,
                });
                console.log("Arrow group height:", group.height);
                canvas.value.add(group).setActiveObject(group);
            }
            arrow.value = null;
            triangle.value = null;
            canvas.value.defaultCursor = "default";
            canvas.value.hoverCursor = "grab";
            canvas.value.forEachObject((object) => {
                object.selectable = true; // Make all objects selectable
            });
        } else if (nowTool.value === "text" || nowTool.value === "photo") {
            if (nowTool.value === "text") {
                itext.value = null;
            } else {
                image.value = null;
            }
            nowTool.value = "moveLayer"; // Switch to selection/move tool
            canvas.value.defaultCursor = "default";
            canvas.value.hoverCursor = "grab";
            canvas.value.forEachObject((object) => {
                object.selectable = true; // Make all objects selectable
            });
        }
        // For tools that don't auto-switch to "moveLayer"
        if (nowTool.value !== "moveLayer") {
            canvas.value.forEachObject((object) => {
                object.selectable = false; // Make objects unselectable if not in moveLayer
            });
        }
        isDrawing.value = false;
        updateHistory(1); // Record the final state after drawing/modifying
    }
};

const canvasZoomWheel = (opt) => {
    // console.log(opt, "wheelZoom")
    if (!canvas.value) {
        console.warn("Canvas instance is not available.");
        return; // canvas 인스턴스가 없으면 함수 종료
    }

    const delta = opt.e.deltaY;
    let zoom = canvas.value.getZoom(); // 현재 캔버스 줌 레벨을 가져옴
    zoom *= 0.999 ** delta; // 휠 방향(delta)에 따라 줌 레벨 조정
    magnification.value = Math.round(zoom * 100); // 확대/축소 배율을 퍼센트로 계산하여 업데이트

    // console.log(zoom, "zoom")
    if (zoom > 20) {
        zoom = 20;
        magnification.value = 2000;
    }
    if (zoom < 1) {
        zoom = 1;
        magnification.value = 100;
    }

    // 마우스 커서 위치를 기준으로 줌 실행
    canvas.value.zoomToPoint(
        {
            x: opt.e.offsetX,
            y: opt.e.offsetY,
        },
        zoom,
    );

    opt.e.preventDefault(); // 기본 스크롤 동작 방지
    opt.e.stopPropagation(); // 이벤트 버블링 중지

    const vpt = canvas.value.viewportTransform; // 현재 뷰포트 변환 행렬
    if (zoom < 1) {
        // 축소 시 캔버스를 중앙에 유지
        vpt[4] = 200 - (canvas.value.getWidth() * zoom) / 2;
        vpt[5] = 200 - (canvas.value.getHeight() * zoom) / 2;
    } else {
        // 확대 시 캔버스가 화면 밖으로 나가지 않도록 경계 조정
        if (vpt[4] >= 0) {
            vpt[4] = 0; // 왼쪽 경계
        } else if (vpt[4] < canvas.value.getWidth() - canvas.value.getWidth() * zoom) {
            vpt[4] = canvas.value.getWidth() - canvas.value.getWidth() * zoom; // 오른쪽 경계
        }
        if (vpt[5] >= 0) {
            vpt[5] = 0; // 위쪽 경계
        } else if (vpt[5] < canvas.value.getHeight() - canvas.value.getHeight() * zoom) {
            vpt[5] = canvas.value.getHeight() - canvas.value.getHeight() * zoom; // 아래쪽 경계
        }
    }
};

const canvasWidthHeightChange = () => {
    if (!canvas.value) {
        console.warn("Canvas instance is not available for resizing.");
        return;
    }

    nextTick(() => {
        // 총 길이
        allWidth.value = window.innerWidth;
        allHeight.value = window.innerHeight; // allHeight도 여기서 업데이트

        // leftSideBar 길이
        const leftSidebarDom = document.getElementById("leftSideBar")
            ? document.getElementById("leftSideBar").clientWidth
            : 0;

        // chattingBar 길이
        let chattingDom = 0;
        if (chattingShow.value) {
            // this.chattingShow -> chattingShow.value
            chattingDom = document.getElementById("chattingBarLayoutContainer")
                ? document.getElementById("chattingBarLayoutContainer").clientWidth
                : 0;
        }

        // drawingToolBar 길이
        let drawingToolbarDom = document.getElementById("drawingtoolbar")
            ? document.getElementById("drawingtoolbar").clientWidth
            : 0;

        // console.log(callingLayoutType.value) // this.callingLayoutType -> callingLayoutType.value
        if (callingLayoutType.value == 3) {
            // 좌측정렬 사용자 리스트 길이 (window 클래스를 가진 16번째 요소를 가정)
            // `window` 클래스가 여러 개일 경우 인덱스 [15]는 불안정할 수 있으니 주의 필요.
            // 실제 프로젝트에서는 특정 ID나 더 견고한 셀렉터 사용을 권장합니다.
            // const rowWindowElement = document.getElementsByClassName("window")[15];
            // let rowWindowWidth = 0;
            // let rowWindowHeight = 0;
            // if (rowWindowElement) {
            //     rowWindowWidth = rowWindowElement.clientWidth;
            //     rowWindowHeight = rowWindowElement.clientHeight;
            // } else {
            //     console.warn("Element with class 'window' at index 15 not found.");
            // }

            // let thumbnailHeight = document.getElementsByClassName("thumbnail")[0]
            //     ? document.getElementsByClassName("thumbnail")[0].clientHeight
            //     : 0;

            // // 영상이 off 인 경우 혹은 간헐적으로 썸네일 높이와 툴바 넓이를 못 가져오는 현상이 있다.
            // // 썸네일 높이와 툴바 넓이는 고정이므로 이 경우만 강제로 지정해준다.
            // if (thumbnailHeight === 0) {
            //     thumbnailHeight = 94; // 강제 지정
            // }
            // if (drawingToolbarDom === 0) {
            //     drawingToolbarDom = 72; // 강제 지정
            // }

            // // row.window 세로길이 - 캔버스 썸네일 Box
            // const cavasCalcHeight = rowWindowHeight - thumbnailHeight - 3;

            // // row.window 가로길이 - 툴바
            // const cavasCalcWidth = rowWindowWidth - drawingToolbarDom - 25;

            const drawingWidth =
                document.getElementsByClassName("screen-draw")[0].clientWidth - 72;
            const drawingHeight =
                document.getElementsByClassName("screen-draw")[0].clientHeight;
            // // 캔버스 크기 설정
            canvas.value.setDimensions(
                {
                    width: "100%",
                    height: '100%',
                },
                {
                    cssOnly: true,
                },
            );

            // // 캔버스 Width setting (외부 스토어/상태에 업데이트하는 함수 호출)
            drawingStore.setCanvasWidth("100%"); // self.setCanvasWidth -> setCanvasWidth
            // 캔버스에 적용 (렌더링 요청)
            canvas.value.requestRenderAll();
        } else if (callingLayoutType.value == 4) {
            // 총 길이 - leftSidebar - chattingBar - drawingToolbar - 170
            // canvasWrapWidth.value =
            //     allWidth.value - leftSidebarDom - chattingDom - drawingToolbarDom - 170;

            // if (allWidth.value > 1080) {
            //     canvas.value.setWidth(canvasWrapWidth.value);
            //     drawingStore.setCanvasWidth(canvasWrapWidth.value);
            // } else {
            //     canvas.value.setWidth(520);
            //     drawingStore.setCanvasWidth(520);
            // }

            // const height = allHeight.value - 279;
            // if (allHeight.value > 746) {
            //     canvas.value.setHeight(height);
            // } else {
            //     canvas.value.setHeight(510);
            // }
            canvas.value.calcOffset(); // 캔버스 내부 객체들의 위치 재계산
        }
    });
};

const handleKeyUp = (e) => {
    // console.log(e, "keyup")
    if (e.key === "Control") {
        this.canvas.defaultCursor = "default";
        if (this.nowTool === "pen") {
            this.enable();
        }
    }
};

const onResize = () => {
    // this.canvasWidthHeightChange() -> canvasWidthHeightChange()
    // 캔버스 크기 변경 로직은 canvasWidthHeightChange에서 처리하므로, 여기서는 관련 변수만 업데이트합니다.
    allWidth.value = window.innerWidth; // this.allWidth -> allWidth.value
    allHeight.value = window.innerHeight; // this.allHeight -> allHeight.value

    // 필요하다면 여기서 canvasWidthHeightChange를 직접 호출할 수도 있습니다.
    // 하지만 onMounted에서 window.addEventListener('resize', canvasWidthHeightChange)로 직접 연결하는 것이 더 효율적일 수 있습니다.
    // 현재 코드에서는 canvasWidthHeightChange가 독립적으로 호출될 수 있도록 분리합니다.
    // canvasWidthHeightChange(); // 캔버스 크기 조정 함수 호출
};

const workerResponseHandler = (event) => {
    // console.log("[WORKER RESPONSE]", event.data)
    // 웹 워커에서 받은 데이터를 처리하는 로직을 여기에 구현합니다.
    console.log("Worker responded with:", event.data);
};

const canvasSavePng = () => {
    if (!canvas.value) {
        console.warn("Canvas instance is not available for saving.");
        return;
    }

    const url = canvas.value.toDataURL("png"); // this.canvas -> canvas.value
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.download = "canvasImage.png"; // 저장될 파일 이름
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // 다운로드 후 링크 엘리먼트 제거
};

const roundToTwo = (num) => {
    return +(Math.round(num + "e+2") + "e-2");
};

const init = () => {
    // 메세지창 접기 및 펼치기를 할 때 캔버스 크기 재조정
    const canvasElement = document.getElementById("pt2Canvas");
    if (canvasElement) {
        // Fabric.js 캔버스의 실제 HTML canvas 요소의 CSS 스타일 너비를 100%로 설정합니다.
        // Fabric.js 캔버스의 내부 너비/높이는 canvas.value.setDimensions로 조절해야 합니다.
        canvasElement.style.width = "100%";
        // canvasElement.style.height = "100%"; // 높이도 필요하면 추가
    }

    // 캔버스 크기가 재조정됨에 따라 해당 함수를 실행하지 않으면 좌표값이 망가짐
    canvasWidthHeightChange(); // this.canvasWidthHeightChange() -> canvasWidthHeightChange()
};

const setTools = (parameter) => {
    if (parameter === "darkmode") {
        return;
    }

    // this.tools -> tools.value 로 변경
    // require('@/assets/images/...') -> '/images/...' 또는 실제 프로젝트의 정적 파일 경로로 변경
    // 여기서는 `/images/`를 사용하며, 실제 프로젝트의 public/assets 구조에 맞게 조정해야 합니다.
    tools.value = [
        {
            type: "pen",
            img: "@/assets/images/lightmode/drawing/bt_1_pen.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_1_pen.svg",
            subMenu: [
                {
                    circle: 1,
                    value: 1,
                },
                {
                    circle: 3,
                    value: 3,
                },
                {
                    circle: 6,
                    value: 6,
                },
                {
                    circle: 10,
                    value: 10,
                },
                {
                    circle: 13,
                    value: 13,
                },
                {
                    circle: 16,
                    value: 16,
                },
            ],
            selected: 3,
            tooltip: "연필",
        },
        {
            type: "line",
            img: "@/assets/images/lightmode/drawing/bt_2_line.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_2_line.svg",
            subMenu: [
                {
                    circle: 1,
                    value: 1,
                },
                {
                    circle: 3,
                    value: 3,
                },
                {
                    circle: 6,
                    value: 6,
                },
                {
                    circle: 10,
                    value: 10,
                },
                {
                    circle: 13,
                    value: 13,
                },
                {
                    circle: 16,
                    value: 16,
                },
            ],
            selected: 3,
            tooltip: "선",
        },
        {
            type: "arrow",
            img: "@/assets/images/lightmode/drawing/bt_3_arrow.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_3_arrow.svg",
            subMenu: [
                {
                    square: 1,
                    value: 1,
                },
                {
                    square: 3,
                    value: 3,
                },
                {
                    square: 6,
                    value: 6,
                },
                {
                    square: 10,
                    value: 10,
                },
                {
                    square: 13,
                    value: 13,
                },
                {
                    square: 16,
                    value: 16,
                },
            ],
            selected: 3,
            tooltip: "화살표",
        },
        {
            type: "square",
            img: "@/assets/images/lightmode/drawing/bt_4_square.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_4_square.svg",
            subMenu: [
                {
                    square: 1,
                    value: 1,
                },
                {
                    square: 3,
                    value: 3,
                },
                {
                    square: 6,
                    value: 6,
                },
                {
                    square: 10,
                    value: 10,
                },
                {
                    square: 13,
                    value: 13,
                },
                {
                    square: 16,
                    value: 16,
                },
            ],
            selected: 3,
            tooltip: "사각형",
        },
        {
            type: "circle",
            img: "@/assets/images/lightmode/drawing/bt_5_circle.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_5_circle.svg",
            subMenu: [
                {
                    circle: 1,
                    value: 1,
                },
                {
                    circle: 3,
                    value: 3,
                },
                {
                    circle: 6,
                    value: 6,
                },
                {
                    circle: 10,
                    value: 10,
                },
                {
                    circle: 13,
                    value: 13,
                },
                {
                    circle: 16,
                    value: 16,
                },
            ],
            selected: 3,
            tooltip: "원",
        },
        {
            type: "text",
            img: "@/assets/images/lightmode/drawing/bt_6_text.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_6_text.svg",
            subMenu: [
                {
                    text: 16,
                    value: 16,
                },
                {
                    text: 32,
                    value: 32,
                },
                {
                    text: 64,
                    value: 64,
                },
                {
                    text: 128,
                    value: 128,
                },
                {
                    text: 256,
                    value: 256,
                },
                {
                    text: 512,
                    value: 512,
                },
            ],
            selected: 32,
            tooltip: "텍스트",
        },
        {
            type: "photo",
            img: "@/assets/images/lightmode/drawing/bt_7_zoom.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_7_zoom.svg",
            tooltip: "이미지 삽입",
        },
        {
            type: "pdf",
            img: "@/assets/images/lightmode/drawing/bt_8_pdf.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_8_pdf.svg",
            tooltip: "PDF 삽입",
        },
        {
            type: "undo",
            img: "@/assets/images/lightmode/drawing/bt_9_undo.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_9_undo.svg",
            tooltip: "되돌리기",
        },
        {
            type: "redo",
            img: "@/assets/images/lightmode/drawing/bt_10_redo.svg",
            fixImg: "@/assets/images/lightmode/drawing/bt_10_redo.svg",
            tooltip: "다시실행",
        },
        {
            type: "moveLayer",
            img: "@/assets/images/lightmode/drawing/ic_layer_move.svg",
            fixImg: "@/assets/images/lightmode/drawing/ic_layer_move.svg",
            tooltip: "레이어 선택",
        },
        {
            type: "clear",
            img: "@/assets/images/lightmode/drawing/ic_fresh_34.svg",
            fixImg: "@/assets/images/lightmode/drawing/ic_fresh_34.svg",
            tooltip: "캔버스 초기화",
        },
        {
            type: "group",
            img: "@/assets/images/lightmode/drawing/ic_grouping.svg",
            fixImg: "@/assets/images/lightmode/drawing/ic_grouping.svg",
            tooltip: "레이어 그룹화",
        },
        {
            type: "layer",
            img: "@/assets/images/lightmode/drawing/ic_z-index.svg",
            fixImg: "@/assets/images/lightmode/drawing/ic_z-index.svg",
            subMenu: [
                {
                    img: "/images/callAttachment/ic_bring_to_front.png",
                    value: "F",
                },
                {
                    img: "/images/callAttachment/ic_bring_forward.png",
                    value: "f",
                },
                {
                    img: "/images/callAttachment/ic_send_backward.png",
                    value: "B",
                },
                {
                    img: "/images/callAttachment/ic_send_to_back.png",
                    value: "b",
                },
            ],
            selected: "F",
            tooltip: "레이어 정돈",
        },
        {
            type: "color",
            subMenu: [
                {
                    color: "#EE324A",
                    value: "#EE324A",
                },
                {
                    color: "#fe9a2f",
                    value: "#fe9a2f",
                },
                {
                    color: "#f8e644",
                    value: "#f8e644",
                },
                {
                    color: "#2ced66",
                    value: "#2ced66",
                },
                {
                    color: "#349ced",
                    value: "#349ced",
                },
                {
                    color: "#ADB5BD",
                    value: "#ADB5BD",
                },
                {
                    color: "#000000",
                    value: "#000000",
                },
            ],
            selected: "#EE324A",
            tooltip: "색상 변경",
        },
        {
            type: "download",
            img: "@/assets/images/lightmode/drawing/ic_save_34.svg",
            fixImg: "@/assets/images/lightmode/drawing/ic_save_34.svg",
            tooltip: "캔버스 이미지 저장",
        },
    ];
};

const color = computed(() => {
    // tools.value가 정의되어 있고, 14번째 인덱스가 존재하는지 확인
    return tools.value[14] ? tools.value[14].selected : "#EE324A"; // 기본값 설정
});

// tools 배열의 0번째 (pen) 툴의 selected 값
const width = computed(() => {
    // tools.value가 정의되어 있고, 0번째 인덱스가 존재하는지 확인
    return tools.value[0] ? tools.value[0].selected : 3; // 기본값 설정
});

// Vuex store의 state에서 isPdfUploading 가져오기
const getisPdfUploading = computed(() => drawingStore.isPdfUploading);

// mapState로 가져오던 Vuex 상태들을 개별 computed로 변환
const files = computed(() => drawingStore.files);
const callingLayoutType = computed(() => commonStore.callingLayoutType);
const callingWindowCount = computed(() => callStore.callingWindowCount);
const lastCanvasJson = computed(() => drawingStore.lastCanvasJson);
const vxCanvasHistory = computed(() => drawingStore.canvasHistory);
const index = computed(() => drawingStore.index);
const selectedFileIndex = computed(() => drawingStore.selectedFileIndex);
const update = computed(() => drawingStore.isUpdate); // isUpdate는 Vuex에서 가져오므로 이름 중복 방지를 위해 update로 변경
const isGivenThumbnailTransfer = computed(() => drawingStore.isGivenThumbnailTransfer);
const isPdfUploading = computed(() => drawingStore.isPdfUploading); // getisPdfUploading과 동일하므로 하나만 사용하거나 필요에 따라 통합
const escapeDrawingPage = computed(() => drawingStore.escapeDrawingPage);
const isDrawingPage = computed(() => commonStore.isDrawing);
const thumbnailFileReceive = computed(() => drawingStore.thumbnailFileReceive);
const loadImageOnCanvasFinished = computed(() => drawingStore.loadImageOnCanvasFinished);
const chattingShow = computed(() => chattingStore.chattingShow); // computed 속성 중복 제거

watch(color, (newVal) => {
    console.log(newVal, "color");
    // console.log(nowTool.value, beforeTool.value); // Accessing refs with .value
    beginDrawing(); // Call helper function
    if (canvas.value) {
        canvas.value.defaultCursor = "default";
    }
    // console.log(nowTool.value, beforeTool.value);
});

// Watch for 'width' changes
watch(width, (newVal) => {
    console.log(newVal, "width");
    beginDrawing(); // Call helper function
});

// Watch for 'allWidth' changes
watch(allWidth, (newVal) => {
    console.log(newVal, "watch newval canvas width");
    canvasWidthHeightChange(); // Call helper function
});

// Watch for 'allHeight' changes
watch(allHeight, (newVal) => {
    console.log(newVal, "watch newval canvas height");
    canvasWidthHeightChange(); // Call helper function
});

// Watch for 'vxCanvasHistory' changes (from Vuex)
watch(vxCanvasHistory, (newVal) => {
    canvasHistory.value = newVal; // Update local ref
    console.log(newVal, "vxCanvasHistory");
});

// Watch for 'update' changes (from Vuex)
watch(update, (newVal) => {
    console.log("update Start", newVal);
    if (newVal === true) {
        updateHistory(2);
        drawingStore.setUpdate(false); // false로 되돌리기
    }
});

// Watch for 'getisPdfUploading' changes (from Vuex)
watch(getisPdfUploading, (newVal, oldVal) => {
    console.log("*** watch : Web Pdf Upload");
    console.log("newValue", newVal, " && ", "oldValue", oldVal);
    // true -> false로 바뀔 때만 실행
    if (!newVal && oldVal) {
        callStore.setDrawingGetPDFUploadFlag(true); // Call helper function (likely a Vuex action/mutation)
        callStore.setPDFUploading(true); // Call helper function (likely a Vuex action/mutation)
    }
});

// Watch for 'magnification' changes
watch(
    magnification,
    (newVal) => {
        if (newVal) {
            const notification = document.getElementById("mag");
            if (notification) {
                // Ensure the DOM element exists
                const showNotification = () => {
                    notification.classList.add("show");
                    if (newVal === 100) {
                        setTimeout(() => {
                            notification.classList.remove("show");
                        }, 2000);
                    }
                };
                showNotification();
            } else {
                console.warn(
                    "Element with ID 'mag' not found for magnification notification.",
                );
            }
        }
    },
    {
        immediate: true,
    },
); // `immediate: true` will run the watcher immediately on component mount

// Watch for 'setChattingShow' (which is now 'chattingShow' from Vuex state)
watch(chattingShow, (res) => {
    console.log("chattingShow changed:", res);
    // 메세지창 접기 및 펼치기를 할 때 캔버스 크기 재조정
    const canvasElement = document.getElementById("pt2Canvas");
    if (canvasElement) {
        canvasElement.style.width = "100%";
    }
    // 캔버스 크기가 재조정됨에 따라 해당 함수를 실행하지 않으면 좌표값이 망가짐
    canvasWidthHeightChange(); // Call helper function
});

onBeforeUnmount(() => {
    // 1. 전역 이벤트 리스너 제거
    // 주의: addEventListener와 removeEventListener는 정확히 동일한 함수 참조를 사용해야 합니다.
    // 익명 함수를 사용하면 제거가 불가능합니다. 따라서, 별도의 명명된 함수로 추출했습니다.
    window.removeEventListener("keydown", (e) => {
        canvasKeyCode(e);
        if (e.ctrlKey == true) {
            canvas.value.defaultCursor = "grab";
            canvas.value.hoverCursor = "grab";
            if (nowTool.value == "pen") {
                disable();
            }
        }
    });
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("resize", onResize);

    // 2. Fabric.js 캔버스 리소스 정리
    if (canvas.value) {
        // Fabric.js 캔버스와 관련된 모든 이벤트 리스너를 제거합니다.
        // `off()` 메서드에 인자를 전달하지 않으면 해당 이벤트 타입의 모든 리스너를 제거합니다.
        canvas.value.off("mouse:down");
        canvas.value.off("mouse:move");
        canvas.value.off("mouse:up");
        canvas.value.off("mouse:wheel");
        canvas.value.off("object:moving");
        canvas.value.off("object:scaling");
        canvas.value.off("object:rotating");
        canvas.value.off("object:added");
        canvas.value.off("object:selected");
        canvas.value.off("object:modified");
        canvas.value.off("selection:created");
        canvas.value.off("selection:updated");

        // 캔버스 인스턴스를 dispose하여 메모리 누수를 방지합니다.
        canvas.value.dispose();
        canvas.value = null; // 참조를 null로 설정하여 가비지 컬렉션 대상이 되도록 합니다.
    }

    // 3. 미디어 디바이스 접근 관련 로직
    // Vuex 상태는 computed 속성을 통해 접근하고, actions/mutations를 통해 변경해야 합니다.
    // 여기서는 `callStore.onlyVoiceID` 등을 직접 참조합니다.
    const onlyVoiceIDs = callStore.onlyVoiceID;
    const localDeviceID = sessionStorage.getItem("m_local_deviceid");
    const cameraNotAllowed = callStore.cameraNotAllowed;

    if ((onlyVoiceIDs && onlyVoiceIDs.includes(localDeviceID)) || cameraNotAllowed) {
        // `getUserMedia`는 보통 스트림을 시작할 때 사용되며,
        // 언마운트 시점에 다시 호출하는 것이 의도된 동작인지 확인이 필요합니다.
        // 일반적인 경우, 언마운트 시에는 스트림을 `stop()`하거나 관련 리소스를 해제합니다.
        // 현재 로직은 스트림을 재시도하는 것처럼 보이므로, 애플리케이션의 특정 요구사항에 따라 달라질 수 있습니다.
        navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .then((stream) => {
                // 스트림을 얻었을 때의 처리 (여기서는 특별한 동작 없음)
                console.log(
                    "Re-acquired audio stream before unmount (as per original logic).",
                );
                // 보통은 여기서 스트림 트랙을 정지시킵니다:
                // stream.getTracks().forEach(track => track.stop());
            })
            .catch((error) => {
                console.error("Error re-acquiring media devices on unmount:", error);
            });
    }
});
</script>
<style lang="scss" scoped>
#pt2Canvas {
    border: 1px solid gray;
    // background-color: #ffffff;
}

.callAttachment {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    // height: $contentsContainerHeight;
    // max-height: calc(100vh - $contentsContainerHeight);
}

.toolbar {
    align-self: flex-start;
    padding: 0px 24px 0px 12px;
    z-index: 2;
    max-height: calc(100vh - 80px);

    @media screen and (max-height: 700px) {
        padding: 0px 40px 0px 6px !important;
    }

    @media screen and (max-height: 400px) {
        padding: 0px 76px 0px 0px !important;
    }

    // overflow: scroll;
    // display: grid;
}

.tool {
    border: 1px solid rgba(0, 0, 0, 0);
    background-color: #3b3b3b;
    z-index: 1;
    position: relative;

    &:nth-child(14) {
        margin-top: 25px;
    }

    &:nth-child(16) {
        margin-top: 10px;
    }

    &:hover {
        border: 1px solid #fff;
    }

    &[name]:hover::before {
        content: attr(name);
        position: absolute;
        right: 40px;
        z-index: 50;
        width: max-content;
        padding: 5px 7px;
        border-radius: 3px;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.7);
        border: 1px solid #fff;
    }
}

// 변수
$toolSize: 36px;
$toolPaddingSize: 1px;

.colorContainer {
    height: 33px;
    padding: 3px;
}

.color {
    width: 100%;
    height: 100%;
}

.subMenu {
    display: none;
    position: absolute;
    left: $toolSize + 12;
    height: $toolSize;
    display: none;
}

.subMenuContainer {
    width: $toolSize;
    height: 100%;
    padding-left: $toolPaddingSize;
    z-index: 2;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    > div > div {
        background-color: #fff;
    }
}

.subMenuContents {
    width: 100%;
    height: 100%;
    z-index: 2;

    > span {
        cursor: default;
    }
}

.circle,
.square {
    // 공유 스타일이 있다면 여기에 추가
}

.circle {
    border-radius: 8px;
}

.canvas {
    width: calc(100% - 72px);
    height: inherit;

    > img {
        width: 100%;
        height: 100%;
        object-position: top left;
    }
}

.hiddenFileInput {
    width: 0px;
    height: 0px;
}

.canvasSavePng {
    position: absolute;
    width: 85px;
    height: 32px;
    left: 0;
    top: -5px;
    border-radius: 20px;
}

.zoomMagnification {
    position: absolute;
    top: 10px;
    right: 10px;
    display: none;
    z-index: 3;

    &.show {
        display: flex;
    }
}
</style>
