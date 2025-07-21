<template>
    <div class="row content-start callAttachment">
        <div class="col-auto column toolbar" id="drawingtoolbar">
            <div
                class="tool row"
                v-for="(tool, toolKey) in tools"
                :name="tool.tooltip"
                :style="{
                    border:
                        tool.type == nowTool && displayMode == 'darkmode'
                            ? '1px solid #D6D6D6'
                            : tool.type == nowTool && displayMode == 'lightmode'
                            ? '1px solid #1C8EFF'
                            : undefined,
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
                        class="col-12 subMenuContainer"
                        v-for="(subMenu, subMenuKey) in tool.subMenu"
                        :key="subMenuKey"
                        @click.stop="subMenuClick(subMenu, tool)"
                    >
                        <div
                            class="row justify-center content-center subMenuContents"
                            :style="{
                                border:
                                    subMenu.value == tool.selected &&
                                    displayMode == 'darkmode'
                                        ? '1px solid white'
                                        : subMenu.value == tool.selected &&
                                          displayMode == 'lightmode'
                                        ? '1px solid #1C8EFF'
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

        <div class="col canvas">
            <canvas ref="can" id="pt2Canvas"></canvas>

            <input
                ref="imgFile"
                id="imgFi"
                type="file"
                @change="drawingImageOnchangeEvent"
                accept="image/jpg, image/jpeg, image/png"
                class="hiddenFileInput"
            />

            <input
                ref="pdfFile"
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
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import { useDrawingCanvasStore } from "@/stores/drawing";
import { computed, nextTick, reactive, ref, watch } from "vue";

const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();
const drawingStore = useDrawingCanvasStore();

const tools = ref([
    {
        type: "pen",
        img: require("@/assets/images/callAttachment/bt_1_pen.png"),
        fixImg: require("@/assets/images/callAttachment/bt_pen_fix.png"),
        subMenu: [
            { circle: 1, value: 1 },
            { circle: 3, value: 3 },
            { circle: 6, value: 6 },
            { circle: 10, value: 10 },
            { circle: 13, value: 13 },
            { circle: 16, value: 16 }
        ],
        selected: 3,
        tooltip: "연필"
    },
    {
        type: "line",
        img: require("@/assets/images/callAttachment/bt_2_line.png"),
        fixImg: require("@/assets/images/callAttachment/bt_2_line_fix.png"),
        subMenu: [
            { circle: 1, value: 1 },
            { circle: 3, value: 3 },
            { circle: 6, value: 6 },
            { circle: 10, value: 10 },
            { circle: 13, value: 13 },
            { circle: 16, value: 16 }
        ],
        selected: 3,
        tooltip: "선"
    },
    {
        type: "arrow",
        img: require("@/assets/images/callAttachment/bt_3_arrow.png"),
        fixImg: require("@/assets/images/callAttachment/bt_3_arrow_fix.png"),
        subMenu: [
            { square: 1, value: 1 },
            { square: 3, value: 3 },
            { square: 6, value: 6 },
            { square: 10, value: 10 },
            { square: 13, value: 13 },
            { square: 16, value: 16 }
        ],
        selected: 3,
        tooltip: "화살표"
    },
    {
        type: "square",
        img: require("@/assets/images/callAttachment/bt_4_square.png"),
        fixImg: require("@/assets/images/callAttachment/bt_4_square_fix.png"),
        subMenu: [
            { square: 1, value: 1 },
            { square: 3, value: 3 },
            { square: 6, value: 6 },
            { square: 10, value: 10 },
            { square: 13, value: 13 },
            { square: 16, value: 16 }
        ],
        selected: 3,
        tooltip: "사각형"
    },
    {
        type: "circle",
        img: require("@/assets/images/callAttachment/bt_5_circle.png"),
        fixImg: require("@/assets/images/callAttachment/ic_drawing_circle_fix.png"),
        subMenu: [
            { circle: 1, value: 1 },
            { circle: 3, value: 3 },
            { circle: 6, value: 6 },
            { circle: 10, value: 10 },
            { circle: 13, value: 13 },
            { circle: 16, value: 16 }
        ],
        selected: 3,
        tooltip: "원"
    },
    {
        type: "text",
        img: require("@/assets/images/callAttachment/bt_6_text.png"),
        fixImg: require("@/assets/images/callAttachment/bt_6_text_fix.png"),
        subMenu: [
            { text: 16, value: 16 },
            { text: 32, value: 32 },
            { text: 64, value: 64 },
            { text: 128, value: 128 },
            { text: 256, value: 256 },
            { text: 512, value: 512 }
        ],
        selected: 32,
        tooltip: "텍스트"
    },
    {
        type: "photo",
        img: require("@/assets/images/callAttachment/bt_7_zoom.png"),
        fixImg: require("@/assets/images/callAttachment/bt_7_zoom_fix.png"),
        tooltip: "이미지 삽입"
    },
    {
        type: "pdf",
        img: require("@/assets/images/callAttachment/bt_8_pdf.png"),
        fixImg: require("@/assets/images/callAttachment/bt_8_pdf.png"),
        tooltip: "PDF 삽입"
    },
    {
        type: "undo",
        img: require("@/assets/images/callAttachment/bt_9_undo.png"),
        fixImg: require("@/assets/images/callAttachment/bt_11_back_fix.png"),
        tooltip: "되돌리기"
    },
    {
        type: "redo",
        img: require("@/assets/images/callAttachment/bt_10_redo.png"),
        fixImg: require("@/assets/images/callAttachment/bt_11_forward_fix.png"),
        tooltip: "다시실행"
    },
    {
        type: "moveLayer",
        img: require("@/assets/images/callAttachment/ic_layer_move_fix.png"),
        fixImg: require("@/assets/images/callAttachment/ic_layer_move_fix.png"),
        tooltip: "레이어 선택"
    },
    {
        type: "clear",
        img: require("@/assets/images/callAttachment/ic_fresh_34.png"),
        fixImg: require("@/assets/images/callAttachment/ic_fresh_34_2.png"),
        tooltip: "캔버스 초기화"
    },
    {
        type: "group",
        img: require("@/assets/images/callAttachment/ic_grouping.png"),
        fixImg: require("@/assets/images/callAttachment/ic_grouping_2.png"),
        tooltip: "레이어 그룹화"
    },
    {
        type: "layer",
        img: require("@/assets/images/callAttachment/ic_z-index.png"),
        fixImg: require("@/assets/images/callAttachment/ic_z-index_fix.png"),
        subMenu: [
            { img: require("@/assets/images/callAttachment/ic_bring_to_front.png"), value: "F" },
            { img: require("@/assets/images/callAttachment/ic_bring_forward.png"), value: "f" },
            { img: require("@/assets/images/callAttachment/ic_send_backward.png"), value: "B" },
            { img: require("@/assets/images/callAttachment/ic_send_to_back.png"), value: "b" }
        ],
        selected: "F",
        tooltip: "레이어 정돈"
    },
    {
        type: "color",
        subMenu: [
            { color: "#EE324A", value: "#EE324A" },
            { color: "#fe9a2f", value: "#fe9a2f" },
            { color: "#f8e644", value: "#f8e644" },
            { color: "#2ced66", value: "#2ced66" },
            { color: "#349ced", value: "#349ced" },
            { color: "#ADB5BD", value: "#ADB5BD" },
            { color: "#000000", value: "#000000" }
        ],
        selected: "#EE324A",
        tooltip: "색상 변경"
    },
    {
        type: "download",
        img: require("@/assets/images/callAttachment/ic_save_34.png"),
        fixImg: require("@/assets/images/callAttachment/ic_save_34_fix.png"),
        tooltip: "캔버스 이미지 저장"
    }
]);

// Primitive values (or objects that will be fully replaced) use `ref`
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
const canvasHistory = reactive({
    state: [],
    currentStateIndex: -1,
    undoStatus: false,
    redoStatus: false,
    undoFinishedStatus: true,
    redoFinishedStatus: true
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
const displayMode = ref('darkmode'); // Initial value 'darkmode' as per original

if (typeof window !== "undefined") {
    // If you have a custom worker creation logic or a plugin providing `$worker`,
    // you'll need to adapt it. Here's a generic example for a Web Worker.
    // If you're using a specific library for workers, replace this with its API.
    let worker;
    try {
        // Assuming 'worker-loader' or a similar setup for 'pdf.worker.js'
        // Or if you're using Vite, you might do: new Worker(new URL('./pdf.worker.js', import.meta.url))
        // For demonstration, let's assume a direct path if the worker is in public/
        worker = new Worker("/pdf.worker.js"); // Adjust path as per your build setup
        if (typeof pdfjsLib !== "undefined") {
            pdfjsLib.GlobalWorkerOptions.workerPort = worker;
        } else {
            console.warn(
                "pdfjsLib is not defined. Ensure it's imported or globally available.",
            );
        }
        worker.addEventListener("message", workerResponseHandler);
        worker.postMessage("Message sent to worker from Vue 3 setup");
    } catch (e) {
        console.error("Failed to create Web Worker:", e);
    }
}

// Replaces `mounted()`
onMounted(() => {
    // Load styles dynamically (adjust path for Vite/Webpack setup)
    // In Vite, `require` is not available for dynamic imports like this for CSS.
    // You might need to import all modes at compile time or use a different CSS loading strategy.
    // For demonstration, commenting out or assuming a global import.
    // require(`@/assets/styles/${sessionStorage.getItem("displayMode")}/components/call/drawings/drawing.sass`)

    // Set display mode
    displayMode.value = sessionStorage.getItem("displayMode") || "lightmode";
    setTools(displayMode.value); // Call setTools function

    // Access template refs using .value
    // Make sure you have <canvas ref="can">, <input type="file" ref="imgFile"> etc. in your template
    // const refCan = document.getElementById('pt2Canvas'); // Assuming 'pt2Canvas' is the ID for the canvas
    const refCan = document.querySelector('canvas[ref="can"]'); // Or by id if you prefer

    if (refCan && fabric.Canvas) {
        // Ensure Fabric.js is loaded
        canvas.value = new fabric.Canvas(refCan, {
            isDrawingMode: true,
            preserveObjectStacking: true,
            backgroundColor: "#ffffff",
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

        setCanvas(canvas.value); // Set canvas instance

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
                setThumbnailFileReceive(false); // Call Vuex mutation
            }
        });
        canvas.value.on("object:selected", (e) => {
            disable(e);
            updateHistory(4);
        });
        canvas.value.on("object:modified", (e) => {
            disable(e);
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
        canvas.value.setWidth(1280);
        canvas.value.setHeight(720);
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
                setCanvasJson(lastHistory); // Load JSON
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
            store.commit("drawing/setCanvasHistoryFin", true); // Call Vuex mutation
        } else if (vxCanvasHistory.value.state.length === 0) {
            if (!isGivenThumbnailTransfer.value) {
                updateHistory(8);
                setFirstHistory(vxCanvasHistory.value); // Set initial history
            }
        }

        console.log(
            "mounted vsCanvasHistory state 길이를 찍는다",
            vxCanvasHistory.value.state.length,
        );

        if (vxCanvasHistory.value.state.length === 0) {
            canvas.value.add(rect); // Add the initial white dot
        } else {
            setLoadImageOnCanvasFinished(false); // Call Vuex mutation
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
                setLoadImageOnCanvasFinished(true); // Call Vuex mutation
                console.log("canvas renderAll finished in mounted");
            });
            console.log("this.canvas.renderAll.bind(this.canvas)");
        }
        setCanvasHistory(vxCanvasHistory.value); // Set overall canvas history
        setIsGivenThumbnailTransfer(false); // Call Vuex mutation
    } else {
        console.error("Canvas element or Fabric.js not found!");
    }
});

const commonToastMessage = (message) => {
    console.log("Toast:", message);
};

// Assuming these are Vuex mutations or similar state updates
const setDrawingGetFileSrc = (src) => {
    console.log("Setting drawing file src:", src);
    // Example: useStore().commit('drawing/setSrc', src);
};
const setDrawingGetFileObject = (fileObject) => {
    console.log("Setting drawing file object:", fileObject);
    // Example: useStore().commit('drawing/setFileObject', fileObject);
};
const setDrawingGetFileChangeFlag = (flag) => {
    console.log("Setting drawing file change flag:", flag);
    // Example: useStore().commit('drawing/setFileChangeFlag', flag);
};
const setSrc = (payload) => {
    console.log("Setting src:", payload);
    // Example: useStore().commit('drawing/setSrc', payload);
};

// Methods
const enable = () => {
    isDrawing.value = true;
    if (canvas.value) {
        canvas.value.isDrawingMode = true;
    }
};

const disable = () => {
    isDrawing.value = false;
    if (canvas.value) {
        canvas.value.isDrawingMode = false;
    }
};

const drawingMode = () => {
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
        canvas.value.discardActiveObject().renderAll();
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
        imgFile.value.click(); // Trigger file input click
        return;
    }

    if (nowTool.value === "pdf") {
        if (isPdfUploading.value) {
            commonToastMessage("uploading PDF");
            return;
        }
        resetPdfFileForm();
        pdf.value = null;
        nowTool.value = beforeTool.value;
        if (canvas.value.isDrawingMode === true && nowTool.value === "moveLayer") {
            nowTool.value = "pen";
        } else if (nowTool.value === "moveLayer") {
            toolClick(tools.value[10]);
        } else if (canvas.value.isDrawingMode === false && nowTool.value === "pen") {
            drawingMode();
        }
        pdfFile.value.click(); // Trigger file input click
        return;
    }

    if (nowTool.value === "clear") {
        return clearCanvas();
    }

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
                canvas.value.bringToFront(canvas.value.getActiveObjects());
            } else if (subMenu.value === "f") {
                canvas.value.bringForward(canvas.value.getActiveObjects());
            } else if (subMenu.value === "B") {
                canvas.value.sendToBack(canvas.value.getActiveObjects());
            } else if (subMenu.value === "b") {
                canvas.value.sendBackwards(canvas.value.getActiveObjects());
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
            arrow.value.set({
                x2: pointer.value.x,
                y2: pointer.value.y,
            });
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
            if (origX.value > pointer.value.x) {
                rect.value.set({
                    left: Math.abs(pointer.value.x),
                });
            }
            if (origY.value > pointer.value.y) {
                rect.value.set({
                    top: Math.abs(pointer.value.y),
                });
            }
            rect.value.set({
                width: Math.abs(origX.value - pointer.value.x),
            });
            rect.value.set({
                height: Math.abs(origY.value - pointer.value.y),
            });
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
            width: pointer.value.x - origX.value,
            height: pointer.value.y - origY.value,
            stroke: tools.value[14].selected,
            strokeWidth: tools.value[3].selected,
            angle: 0,
            transparentCorners: false,
            fill: "#00000000",
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
            ellipse.value.stroke = tools.value[14].selected;
            ellipse.value.strokeWidth = tools.value[4].selected;
            if (origX.value > pointer.value.x) {
                ellipse.value.set({
                    left: Math.abs(pointer.value.x),
                });
            }
            if (origY.value > pointer.value.y) {
                ellipse.value.set({
                    top: Math.abs(pointer.value.y),
                });
            }
            ellipse.value.set({
                rx: Math.abs(origX.value - pointer.value.x) / 2,
            });
            ellipse.value.set({
                ry: Math.abs(origY.value - pointer.value.y) / 2,
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
            top: origY.value,
            left: origX.value,
            rx: 0,
            ry: 0,
            transparentCorners: false,
            fill: "#00000000",
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

        setDrawingGetFileSrc(event.target.result);
        setDrawingGetFileObject(imgFile.value.files);

        imgObj.crossOrigin = "anonymous";

        setDrawingGetFileChangeFlag(true);

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
        setSrc({
            type: "img",
            src: event.target.result,
        });
    };
    reader.readAsDataURL(file);
};

// ---
const drawingPdfOnchangeEvent = async (e) => {
    const localFile = e.target.files[0];
    if (!localFile) return;

    const acceptFileType = ["pdf"];
    const fileTypeIndex = localFile.name.lastIndexOf(".");
    const selectFileType = localFile.name.substring(fileTypeIndex + 1).toLowerCase();

    if (acceptFileType.includes(selectFileType)) {
        isPdfUploading.value = true;
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                // Configure PDF.js worker (important for production)
                // pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
                pdfjsLib.disableWorker = true; // For simple use, disable worker

                const loadingTask = pdfjsLib.getDocument(reader.result);
                const pdf = await loadingTask.promise;

                // Set PDF upload source and object
                drawingGetPDFUploadSrc.value = new Blob([event.target.result], {
                    type: "application/pdf",
                });
                drawingGetPDFUploadObject.value = pdfFileInput.value.files; // Assuming pdfFileInput is correctly ref'd

                // Update total pages
                totalPages.value = pdf.numPages;
                // Assuming setPdfGroup and clearPdfNum are methods that manage UI/state
                // setPdfGroup();
                // clearPdfNum(); // You might want to call this after all pages are rendered

                const pageNums = Array.from(
                    {
                        length: pdf.numPages,
                    },
                    (_, i) => i + 1,
                );

                const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

                // Process each page
                for (const pageNum of pageNums) {
                    if (!isDrawingPage.value && !escapeDrawingPage.value) {
                        // Allows for an external mechanism to stop PDF processing
                        setEscapeDrawingPage(true);
                        break;
                    }

                    await delay(200); // Small delay to prevent UI freezing
                    const page = await pdf.getPage(pageNum);
                    const scale = 1.0;
                    const viewport = page.getViewport({
                        scale,
                    });

                    // Create a new canvas for each PDF page rendering
                    const canvasElement = document.createElement("canvas");
                    if (canvasContainer.value) {
                        canvasContainer.value.appendChild(canvasElement);
                    }

                    const fCanvas = new fabric.Canvas(canvasElement);
                    const canvasContext = fCanvas.getContext("2d"); // Use native context for rendering PDF

                    fCanvas.setDimensions({
                        width: viewport.width,
                        height: viewport.height,
                    });

                    const renderContext = {
                        canvasContext,
                        viewport,
                    };
                    const renderTask = page.render(renderContext);
                    await renderTask.promise;

                    // Convert rendered canvas to image data for Fabric.js
                    // Note: Fabric.js upperCanvasEl might not be present if not fully initialized or if rendering isn't on main canvas
                    const imageData = fCanvas.getElement().toDataURL({
                        format: "png",
                    });

                    // Add the image to the main Fabric canvas, or manage as thumbnails
                    // This logic might need adjustment based on how 'self.setSrc' is intended to work.
                    // If it's for the main drawing canvas, you'd add to 'canvas.value'
                    if (canvas.value) {
                        fabric.Image.fromURL(imageData, (img) => {
                            // Scale image to fit drawing area or maintain aspect ratio
                            if (
                                img.width > viewport.width ||
                                img.height > viewport.height
                            ) {
                                img.scaleToHeight(viewport.height); // Or scaleToWidth
                            }
                            // Add to the main Fabric.js canvas
                            canvas.value.add(img);
                            canvas.value.renderAll();
                            updateHistory(1); // Update history after adding
                        });
                    }
                    // For thumbnails or other uses, 'setSrc' might store the image data differently
                    // setSrc({
                    //     type: "pdf",
                    //     src: imageData,
                    //     name: localFile.name
                    // });

                    fCanvas.dispose(); // Clean up the temporary canvas
                }
            } catch (error) {
                console.error("Error loading PDF:", error);
                isPdfUploading.value = false;
                if (
                    error.name === "PasswordException" ||
                    error.message.includes("password")
                ) {
                    commonToastMessage(t("drawingPDF password"));
                } else {
                    commonToastMessage(`Error loading PDF: ${error.message}`);
                }
            } finally {
                isPdfUploading.value = false; // Ensure loading state is reset
            }
        };
        reader.readAsArrayBuffer(localFile);
    } else {
        alert("pdf," + t("fileSend extension")[0]); // Using t() for translation
        return false;
    }
};

const resetDrawingFileForm = () => {
    // Assuming 'refImgFile' is now 'imgFileInput.value'
    const parent = imgFileInput.value.parentNode;
    const next = imgFileInput.value.nextSibling;
    const tmp = document.createElement("form");
    tmp.appendChild(imgFileInput.value);
    tmp.reset();
    parent.insertBefore(imgFileInput.value, next);
};

const resetPdfFileForm = () => {
    const parent = pdfFileInput.value.parentNode;
    const next = pdfFileInput.value.nextSibling;
    const tmp = document.createElement("form");
    tmp.appendChild(pdfFileInput.value);
    tmp.reset();
    parent.insertBefore(pdfFileInput.value, next);
};

const deleteSelectedObjectFromCanvas = () => {
    if (!canvas.value) return;
    canvas.value.getActiveObjects().forEach((obj) => {
        canvas.value.remove(obj);
    });
    canvas.value.discardActiveObject().renderAll();
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
    toolClick(tools[10]); // Assuming tools[10] is the select/move tool
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
    toolClick(tools[10]);
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
        setCanvasJson(canvasHistory.value.state[canvasHistory.value.currentStateIndex]);
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
            toolClick(tools[1]);
        }
        if (nowTool.value == "arrow") {
            toolClick(tools[2]);
        }
        if (nowTool.value == "square") {
            toolClick(tools[3]);
        }
        if (nowTool.value == "circle") {
            toolClick(tools[4]);
        }
        if (nowTool.value == "text") {
            toolClick(tools[5]);
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
            toolClick(tools[1]);
        }
        if (nowTool.value == "arrow") {
            toolClick(tools[2]);
        }
        if (nowTool.value == "square") {
            toolClick(tools[3]);
        }
        if (nowTool.value == "circle") {
            toolClick(tools[4]);
        }
        if (nowTool.value == "text") {
            toolClick(tools[5]);
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
            return toolClick(tools[10]);
        }
        if (e.code === "Digit1") {
            return toolClick(tools[0]);
        }
        if (e.code === "Digit2") {
            return toolClick(tools[1]);
        }
        if (e.code === "Digit3") {
            return toolClick(tools[2]);
        }
        if (e.code === "Digit4") {
            return toolClick(tools[3]);
        }
        if (e.code === "Digit5") {
            return toolClick(tools[4]);
        }
        if (e.code === "Digit6") {
            return toolClick(tools[5]);
        }
        if (e.code === "Digit0") {
            return groupActiveObjects();
        }
        if (e.key === "a" || e.key === "A") {
            toolClick(tools[10]);
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
    isDrawing.value = true; // Set drawing flag to true

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
};

const keepDrawing = (e) => {
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
            const rowWindowElement = document.getElementsByClassName("window")[15];
            let rowWindowWidth = 0;
            let rowWindowHeight = 0;
            if (rowWindowElement) {
                rowWindowWidth = rowWindowElement.clientWidth;
                rowWindowHeight = rowWindowElement.clientHeight;
            } else {
                console.warn("Element with class 'window' at index 15 not found.");
            }

            let thumbnailHeight = document.getElementsByClassName("thumbnail")[0]
                ? document.getElementsByClassName("thumbnail")[0].clientHeight
                : 0;

            // 영상이 off 인 경우 혹은 간헐적으로 썸네일 높이와 툴바 넓이를 못 가져오는 현상이 있다.
            // 썸네일 높이와 툴바 넓이는 고정이므로 이 경우만 강제로 지정해준다.
            if (thumbnailHeight === 0) {
                thumbnailHeight = 94; // 강제 지정
            }
            if (drawingToolbarDom === 0) {
                drawingToolbarDom = 72; // 강제 지정
            }

            // row.window 세로길이 - 캔버스 썸네일 Box
            const cavasCalcHeight = rowWindowHeight - thumbnailHeight - 3;

            // row.window 가로길이 - 툴바
            const cavasCalcWidth = rowWindowWidth - drawingToolbarDom - 25;

            // 캔버스 크기 설정
            canvas.value.setDimensions(
                {
                    width: cavasCalcWidth + "px",
                    height: cavasCalcHeight + "px",
                },
                {
                    cssOnly: true,
                },
            );

            // 캔버스 Width setting (외부 스토어/상태에 업데이트하는 함수 호출)
            setCanvasWidth(cavasCalcWidth); // self.setCanvasWidth -> setCanvasWidth

            // 캔버스에 적용 (렌더링 요청)
            canvas.value.requestRenderAll();
        } else if (callingLayoutType.value == 4) {
            // 총 길이 - leftSidebar - chattingBar - drawingToolbar - 170
            canvasWrapWidth.value =
                allWidth.value - leftSidebarDom - chattingDom - drawingToolbarDom - 170;

            if (allWidth.value > 1080) {
                canvas.value.setWidth(canvasWrapWidth.value);
                setCanvasWidth(canvasWrapWidth.value);
            } else {
                canvas.value.setWidth(520);
                setCanvasWidth(520);
            }

            const height = allHeight.value - 279;
            if (allHeight.value > 746) {
                canvas.value.setHeight(height);
            } else {
                canvas.value.setHeight(510);
            }
            canvas.value.calcOffset(); // 캔버스 내부 객체들의 위치 재계산
        }
    });
};

const onResize = () => {
    // this.canvasWidthHeightChange() -> canvasWidthHeightChange()
    // 캔버스 크기 변경 로직은 canvasWidthHeightChange에서 처리하므로, 여기서는 관련 변수만 업데이트합니다.
    allWidth.value = window.innerWidth; // this.allWidth -> allWidth.value
    allHeight.value = window.innerHeight; // this.allHeight -> allHeight.value

    // 필요하다면 여기서 canvasWidthHeightChange를 직접 호출할 수도 있습니다.
    // 하지만 onMounted에서 window.addEventListener('resize', canvasWidthHeightChange)로 직접 연결하는 것이 더 효율적일 수 있습니다.
    // 현재 코드에서는 canvasWidthHeightChange가 독립적으로 호출될 수 있도록 분리합니다.
    canvasWidthHeightChange(); // 캔버스 크기 조정 함수 호출
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
            img: "/images/lightmode/drawing/bt_1_pen.svg",
            fixImg: "/images/lightmode/drawing/bt_1_pen.svg",
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
            img: "/images/lightmode/drawing/bt_2_line.svg",
            fixImg: "/images/lightmode/drawing/bt_2_line.svg",
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
            img: "/images/lightmode/drawing/bt_3_arrow.svg",
            fixImg: "/images/lightmode/drawing/bt_3_arrow.svg",
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
            img: "/images/lightmode/drawing/bt_4_square.svg",
            fixImg: "/images/lightmode/drawing/bt_4_square.svg",
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
            img: "/images/lightmode/drawing/bt_5_circle.svg",
            fixImg: "/images/lightmode/drawing/bt_5_circle.svg",
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
            img: "/images/lightmode/drawing/bt_6_text.svg",
            fixImg: "/images/lightmode/drawing/bt_6_text.svg",
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
            img: "/images/lightmode/drawing/bt_7_zoom.svg",
            fixImg: "/images/lightmode/drawing/bt_7_zoom.svg",
            tooltip: "이미지 삽입",
        },
        {
            type: "pdf",
            img: "/images/lightmode/drawing/bt_8_pdf.svg",
            fixImg: "/images/lightmode/drawing/bt_8_pdf.svg",
            tooltip: "PDF 삽입",
        },
        {
            type: "undo",
            img: "/images/lightmode/drawing/bt_9_undo.svg",
            fixImg: "/images/lightmode/drawing/bt_9_undo.svg",
            tooltip: "되돌리기",
        },
        {
            type: "redo",
            img: "/images/lightmode/drawing/bt_10_redo.svg",
            fixImg: "/images/lightmode/drawing/bt_10_redo.svg",
            tooltip: "다시실행",
        },
        {
            type: "moveLayer",
            img: "/images/lightmode/drawing/ic_layer_move.svg",
            fixImg: "/images/lightmode/drawing/ic_layer_move.svg",
            tooltip: "레이어 선택",
        },
        {
            type: "clear",
            img: "/images/lightmode/drawing/ic_fresh_34.svg",
            fixImg: "/images/lightmode/drawing/ic_fresh_34.svg",
            tooltip: "캔버스 초기화",
        },
        {
            type: "group",
            img: "/images/lightmode/drawing/ic_grouping.svg",
            fixImg: "/images/lightmode/drawing/ic_grouping.svg",
            tooltip: "레이어 그룹화",
        },
        {
            type: "layer",
            img: "/images/lightmode/drawing/ic_z-index.svg",
            fixImg: "/images/lightmode/drawing/ic_z-index.svg",
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
            img: "/images/lightmode/drawing/ic_save_34.svg",
            fixImg: "/images/lightmode/drawing/ic_save_34.svg",
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
const callingLayoutType = computed(() => callStore.callingLayoutType);
const callingWindowCount = computed(() => callStore.callingWindowCount);
const lastCanvasJson = computed(() => drawingStore.lastCanvasJson);
const vxCanvasHistory = computed(() => drawingStore.canvasHistory);
const index = computed(() => drawingStore.index);
const selectedFileIndex = computed(() => drawingStore.selectedFileIndex);
const update = computed(() => drawingStore.isUpdate); // isUpdate는 Vuex에서 가져오므로 이름 중복 방지를 위해 update로 변경
const isGivenThumbnailTransfer = computed(
    () => drawingStore.isGivenThumbnailTransfer,
);
const isPdfUploading = computed(() => drawingStore.isPdfUploading); // getisPdfUploading과 동일하므로 하나만 사용하거나 필요에 따라 통합
const escapeDrawingPage = computed(() => drawingStore.escapeDrawingPage);
const isDrawingPage = computed(() => commonStore.isDrawing);
const thumbnailFileReceive = computed(() => drawingStore.thumbnailFileReceive);
const loadImageOnCanvasFinished = computed(
    () => drawingStore.loadImageOnCanvasFinished,
);
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
    if (newVal) {
        updateHistory(2); // Call helper function
        setUpdate(false); // Call helper function (likely a Vuex action/mutation)
    }
});

// Watch for 'getisPdfUploading' changes (from Vuex)
watch(getisPdfUploading, (newVal, oldVal) => {
    console.log("*** watch : Web Pdf Upload");
    console.log("newValue", newVal, " && ", "oldValue", oldVal);
    // true -> false로 바뀔 때만 실행
    if (!newVal && oldVal) {
        setDrawingGetPDFUploadFlag(true); // Call helper function (likely a Vuex action/mutation)
        setPDFUploading(true); // Call helper function (likely a Vuex action/mutation)
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
    window.removeEventListener("keydown", canvasKeyCode);
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