// stores/drawingCanvas.ts
import { defineStore } from "pinia";
import { fabric } from "fabric";

// deepClone 유틸리티 함수 (스토어 내부 또는 별도 유틸리티 파일에 정의)
const deepClone = (obj) => {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    const result = Array.isArray(obj) ? [] : {};

    for (const key of Object.keys(obj)) {
        result[key] = deepClone(obj[key]);
    }
    return result;
};

export const useDrawingCanvasStore = defineStore("drawingCanvas", {
    state: () => ({
        // State (상태)
        canvas: null, // fabric.Canvas 타입
        canvasWidth: null,
        src: null, // 이미지/PDF 소스 정보 객체
        lastCanvasJson: null, // 캔버스 JSON 데이터
        firstFiles: [], // 초기 파일 목록
        files: [], // 현재 활성 파일 목록 (이미지, PDF, 캔버스 등)
        pdfNum: 0,
        pdfGroup: -1,
        beforeSelectedFileIndex: -1,
        selectedFileIndex: 0,
        selectCount: 0,
        index: 0, // 전체 파일 인덱스 (img, pdf 페이지, canvas 포함)
        totalPages: null, // 현재 로드된 PDF의 총 페이지 수
        firstHistory: null, // 첫 파일의 초기 히스토리 상태
        canvasHistory: {
            // 현재 캔버스의 히스토리
            state: [],
            currentStateIndex: 0,
            undoStatus: false,
            redoStatus: false,
            undoFinishedStatus: true,
            redoFinishedStatus: true,
        },
        isUpdate: false,
        pdfPushIndex: 0,
        canvasNumber: 1, // 캔버스 번호 (총 캔버스 수 또는 유사)
        pdfNumber: 0, // 업로드된 PDF 파일 수
        thumbnailWidth: null,
        pdfIndex: 0, // 현재 PDF 페이지 인덱스
        isPdfUploading: false,
        saveThumbnailImg: null, // 썸네일 이미지 데이터 (객체 또는 배열)
        isOpenSaveThumbnail: false, // 썸네일 저장이 열려있는지 여부
        lastPDFGroupIndex: null,
        pdfUrlSaveArrays: [], // PDF URL 저장 배열
        isThumbnailTransfer: false, // 썸네일 전송 중인지 여부
        beforeThumbnailTransfer: false,
        isGivenThumbnailTransfer: false, // 썸네일 이관을 하는 경우라면 true
        beforeCloseCanvas: false,
        escapeDrawingPage: false,
        drawingVideo: true,
        thumbnailFileReceive: false, // 썸네일 파일 수신 여부
        beforeSelectedState: false, // 이전 선택 상태 여부
        loadImageOnCanvasFinished: true, // 캔버스에 이미지 로드 완료 여부
        lastCanvasSeted: false, // 마지막 캔버스 설정 여부
        changedHost: false, // 호스트 변경 여부
        beforeHostIndex: 0, // 이전 호스트 인덱스
        readyStatus: false, // 준비 상태 여부
    }),

    // Getters (현재 비어있으므로 선택 사항)
    getters: {},

    // Actions (액션) - 상태를 변경하는 모든 로직을 여기에 정의합니다.
    actions: {
        setCanvas(payload) {
            this.canvas = payload;
        },
        setCanvasWidth(payload) {
            this.canvasWidth = payload;
        },
        setCanvasJson(payload) {
            this.lastCanvasJson = payload;
            // console.log("###>>>>> lastCanvasJson:", payload)
        },
        setFirstFiles(payload) {
            this.firstFiles.unshift({
                img: payload.src,
                type: payload.type,
                index: this.files.length,
                history: deepClone(this.firstHistory),
            });
        },
        setFiles(payload) {
            if (payload === undefined) {
                return;
            }
            if (payload.type === "img") {
                this.files.push({
                    img: payload.src,
                    type: payload.type,
                    index: this.files.length,
                    history: deepClone(this.firstHistory),
                });
                this.canvasNumber++;
            } else if (payload.type === "pdf") {
                if (this.pdfNum === 0) {
                    this.files.push({
                        type: payload.type,
                        group: this.pdfGroup,
                        pdf: [],
                    });
                    this.pdfPushIndex = this.files.length - 1;
                    this.pdfNumber++;
                }
                if (this.files[this.pdfPushIndex] === undefined) {
                    return;
                }
                this.files[this.pdfPushIndex].pdf.push({
                    name: payload.name,
                    img: payload.src,
                    index: this.index,
                    idx: this.pdfNum + 1,
                    lastPage: this.totalPages,
                    history: {
                        // PDF 히스토리 초기 currentStateIndex를 -1로 통일
                        state: [],
                        currentStateIndex: -1,
                        undoStatus: false,
                        redoStatus: false,
                        undoFinishedStatus: true,
                        redoFinishedStatus: true,
                    },
                });
                this.pdfNum++;
                if (this.files[this.pdfPushIndex].pdf.length === this.totalPages) {
                    // 업로드하고 있는 pdf group의 index 저장
                    this.lastPDFGroupIndex = this.files[this.pdfPushIndex].group;
                    this.isPdfUploading = false;
                }
            } else if (payload.type === "canvas") {
                this.files.push({
                    img: payload.src,
                    type: payload.type,
                    index: this.files.length,
                    history: deepClone(this.firstHistory),
                });
                this.canvasNumber++;
            }
            this.src = null;
            this.index++;
            this.setSelectedFileIndex(this.files.length - 1);
        },
        setFilesHistory({ num, history }) {
            console.log(num, history)
            for (let i = 0; i < this.files.length; i++) {
                if (num === this.files[i].index) {
                    this.files[i].history = deepClone(history);
                    console.log("not pdf", num, history, this.files[i].index, i);
                    return;
                }
                if (this.files[i].pdf) {
                    // console.log("pdf 인덱스를 확인한다", num, history)
                    for (let j = 0; j < this.files[i].pdf.length; j++) {
                        if (num === this.files[i].pdf[j].index) {
                            this.files[i].pdf[j].history = deepClone(history);
                            // console.log("pdf")
                            return;
                        }
                    }
                }
            }
        },
        setFilesHistoryState({ num, historyState }) {
            this.files[num].history.state = deepClone(historyState);
        },
        clearFiles() {
            this.canvasHistory = {
                state: [],
                currentStateIndex: 0,
                undoStatus: false,
                redoStatus: false,
                undoFinishedStatus: true,
                redoFinishedStatus: true,
            };
        },
        initCanvasAdd() {
            // 1) 배경만 있는 비어있는 JSON 생성
            const emptyBackgroundJSON = {
                version: fabric.version,
                objects: [],
                background: "white",
            };

            // 2) 그 JSON으로 캔버스 초기화
            this.canvas.loadFromJSON(emptyBackgroundJSON, () => {
                this.canvas.renderAll();

                // 3) JSON 문자열로 저장
                const canvasJSON = JSON.stringify(emptyBackgroundJSON);

                this.canvasHistory.state = [canvasJSON];
                this.canvasHistory.currentStateIndex = 0;

                this.setCanvasHistory(this.canvasHistory);
                this.setFirstHistory(this.canvasHistory);

                // 4) 이미지 형태도 저장
                this.setSrc({
                    type: "canvas",
                    src: this.canvas.toDataURL("png"),
                });
            });
        },
        setFilesImgChange({ num, pdfNum, image }) {
            // console.log("setFilesImgChange")
            if (pdfNum !== undefined) {
                // console.log("setFilesImgChange", num, pdfNum, image)
                this.files[num].pdf[pdfNum].img = image;
            } else {
                // console.log("setFilesImgChange num:", num, "image:", image)
                if (this.files[num]) this.files[num].img = image;
            }
        },
        clearPdfNum() {
            this.pdfNum = 0;
        },
        setTotalPages(payload) {
            this.totalPages = payload;
        },
        setCanvasHistory(payload) {
            console.log(payload);
            this.canvasHistory = deepClone(payload);
        },
        setFirstHistory(payload) {
            this.firstHistory = deepClone(payload);
        },
        setSuperIndex(payload) {
            this.index = payload;
        },
        setFilesDelete(payload) {
            for (let i = 0; i < this.files.length; i++) {
                if (this.files[i].pdf) {
                    if (payload === this.files[i].pdf[0].index) {
                        // PDF 그룹의 첫 번째 인덱스만 체크하는 로직
                        this.files.splice(i, 1);
                        this.index--;
                        this.canvasNumber--;
                        return;
                    }
                } else {
                    this.files.splice(payload, 1);
                }
            }
        },
        setBeforeSelectedFileIndex(payload) {
            this.beforeSelectedFileIndex = payload;
        },
        setSelectedFileIndex(payload) {
            this.beforeSelectedFileIndex = this.selectedFileIndex;
            this.selectedFileIndex = payload;
        },
        setPdfFirstHistoryState(payload) {
            for (let i = 0; i < this.files.length; i++) {
                if (this.files[i].type === "pdf") {
                    for (let j = 0; j < this.files[i].pdf.length; j++) {
                        if (payload.superIndex === this.files[i].pdf[j].index) {
                            this.files[i].pdf[j].history.state.unshift(
                                payload.firstState,
                            );
                            return;
                        }
                    }
                }
            }
        },
        setUpdate(payload) {
            this.isUpdate = payload;
        },
        setPdfGroup() {
            this.pdfGroup++;
        },
        setThumbnailWidth(payload) {
            this.thumbnailWidth = payload;
        },
        setPdfIndex(payload) {
            this.pdfIndex = payload;
        },
        setIsPdfUploading(payload) {
            this.isPdfUploading = payload;
        },
        // saveThumbnailImg
        setSaveThumbnailImg(payload) {
            if (this.saveThumbnailImg === null) {
                this.saveThumbnailImg = [];
            }
            this.saveThumbnailImg.push(payload);
        },
        async setSaveThumbnailImgInCanvas(payload) {
            if (!this.canvas) {
                console.warn("Canvas is not initialized. Cannot load thumbnail image.");
                return;
            }

            if (!payload) return;
            else {
                try {
                    const fabricModule = await import("fabric");

                    fabricModule.fabric.Image.fromURL(
                        payload,
                        (img) => {
                            // 스케일링
                            const canvasWidth = this.canvas.getWidth();
                            const canvasHeight = this.canvas.getHeight();

                            const scaleX = canvasWidth / img.width;
                            const scaleY = canvasHeight / img.height;
                            const scale = Math.min(scaleX, scaleY, 1); // 캔버스보다 작으면 원본 크기 유지

                            img.set({
                                left: 0,
                                top: 0,
                                originX: "left",
                                originY: "top",
                                angle: 0,
                                scaleX: scale,
                                scaleY: scale,
                                flipX: false,
                            });

                            this.canvas.add(img);
                            this.canvas.renderAll();
                            console.log("Image successfully added to canvas:", payload);
                        },
                        { crossOrigin: "anonymous" }, // 외부 이미지일 경우
                    );
                } catch (err) {
                    console.error("Failed to load image for canvas:", err);
                }
            }
        },
        // state.src 에 드로잉 관련된 객체 타입, 객체 경로, 파일 이름을 입력
        setSrc({ type, src, name, status }) {
            console.log("setSrc input:", { type, src, name, status });

            const result = { type, src };

            if (name != null) {
                console.log("setSrc: using name:", name);
                result.name = name;
            } else if (status != null) {
                console.log("setSrc: using status:", status);
                result.status = status;
            } else {
                console.log("setSrc: neither name nor status provided");
            }

            this.src = result;
        },
        // state.isOpenSaveThumbnail 에 true 또는 false 를 입력하고, true 면 state.saveThumbnailImg 를 null 처리
        setIsOpenSaveThumbnail(payload) {
            this.isOpenSaveThumbnail = payload;
            if (payload) {
                this.saveThumbnailImg = null;
            }
        },
        // state.thumbnailFileReceive 에 true 또는 false 를 입력
        setThumbnailFileReceive(payload) {
            this.thumbnailFileReceive = payload;
        },
        setPdfUrlSaveArrays(payload) {
            this.pdfUrlSaveArrays.push(payload);
        },
        setThumbnailPdfUrlSaveArrays(payload) {
            this.pdfUrlSaveArrays = deepClone(payload);
        },
        setAllFiles(payload) {
            this.files = []; // 원본 코드와 동일하게 일단 초기화
            this.files = deepClone(payload);
            console.log("썸네일을 이관하고 files를 받아왔다", this.files);
        },
        setIndexes({ group, index }) {
            this.index = index;
            this.pdfGroup = group;
        },
        setIsThumbnailTransfer(payload) {
            this.isThumbnailTransfer = payload;
        },
        setBeforeThumbnailTransfer(payload) {
            this.beforeThumbnailTransfer = payload;
        },
        setNewFirstFiles(payload) {
            this.firstFiles = deepClone(payload);
        },
        setIsGivenThumbnailTransfer(payload) {
            this.isGivenThumbnailTransfer = payload;
            // console.log("setIsGivenThumbnailTransfer in", payload)
        },
        setBeforeCloseCanvas(payload) {
            this.beforeCloseCanvas = payload;
        },
        setHistorySplice(payload) {
            // payload는 files 배열의 인덱스로 가정
            if (
                this.files[payload] &&
                this.files[payload].history &&
                this.files[payload].history.state
            ) {
                this.files[payload].history.state.splice(0, 1);
            } else {
                console.warn(
                    "setHistorySplice: Invalid payload or history state not found.",
                    payload,
                );
            }
        },
        setEscapeDrawingPage(payload) {
            this.escapeDrawingPage = payload;
        },
        setDrawingVideo(payload) {
            this.drawingVideo = payload;
        },
        setSelectCount(payload) {
            if (payload) {
                this.selectCount++;
            } else {
                this.selectCount = 0;
            }
        },
        setBeforeIndexInitialized(payload) {
            // console.log("setBeforeIndexInitialized", payload)
            this.beforeSelectedState = payload;
        },
        setLoadImageOnCanvasFinished(payload) {
            this.loadImageOnCanvasFinished = payload;
        },
        setCanvasHistoryFin(payload) {
            this.lastCanvasSeted = payload;
        },
        setChangedHost(payload) {
            this.changedHost = payload;
        },
        initDrawing() {
            this.canvasWidth = null;
            this.src = null;
            this.lastCanvasJson = null;
            this.firstFiles = [];
            this.files = [];
            this.pdfNum = 0;
            this.pdfGroup = -1;
            this.beforeSelectedFileIndex = -1;
            this.selectedFileIndex = 0;
            this.selectCount = 0;
            this.index = 0;
            this.totalPages = null;
            this.firstHistory = null;
            this.canvasHistory = {
                state: [],
                currentStateIndex: 0,
                undoStatus: false,
                redoStatus: false,
                undoFinishedStatus: true,
                redoFinishedStatus: true,
            };
            this.isUpdate = false;
            this.pdfPushIndex = 0;
            this.canvasNumber = 1;
            this.pdfNumber = 0;
            this.thumbnailWidth = null;
            this.pdfIndex = 0;
            this.isPdfUploading = false;
            this.saveThumbnailImg = null;
            this.isOpenSaveThumbnail = false;
            this.lastPDFGroupIndex = null;
            this.pdfUrlSaveArrays = [];
            this.isThumbnailTransfer = false;
            this.beforeThumbnailTransfer = false;
            this.isGivenThumbnailTransfer = false;
            this.beforeCloseCanvas = false;
            this.escapeDrawingPage = false;
            this.drawingVideo = true;
            this.thumbnailFileReceive = false;
            this.beforeSelectedState = false;
            this.loadImageOnCanvasFinished = true;
            this.lastCanvasSeted = false;
            this.changedHost = false;
            this.beforeHostIndex = 0;
            this.readyStatus = false;
        },
        setBeforeHostIndex(payload) {
            this.beforeHostIndex = payload;
        },
        setReadyStatus(payload) {
            this.readyStatus = payload;
        },
        addFirstInFiles() {
            const params = {
                img: this.firstFiles[0]?.img,
                type: "canvas",
                index: 0,
                history: deepClone(this.firstHistory),
            };
            this.files.unshift(params);
        },
        deleteFirstInFiles() {
            this.files.splice(0, 1);
        },
        init() {
            this.$reset();
        },
        updateThumbnail(idx) {
            console.log(idx);
            if (!this.files[idx]) return;
            if (this.files[idx].type !== "pdf") {
                console.log("fileClick", this.selectedFileIndex, idx);
                this.setFilesHistory({
                    num: this.selectedFileIndex,
                    history: this.canvasHistory,
                });
                this.setFilesImgChange({
                    num: this.selectedFileIndex,
                    image: this.canvas.toDataURL("png"),
                });
            }
            this.setBeforeIndexInitialized(false);
        },
    },
});
