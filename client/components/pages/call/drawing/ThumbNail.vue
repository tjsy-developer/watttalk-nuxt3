<template>
    <div
        class="thumbnail row justify-start"
        style="width: 100%; display: flex; justify-content: flex-end; right: 27px"
    >
        <div id="thumbBody" class="thumbBody row items-center no-wrap">
            <div
                v-if="files.length === 0"
                class="emptyFile row justify-center items-center"
            >
                <img
                    src="@/assets/images/callAttachment/ic_file_24.png"
                    alt="No file icon"
                />
                <span>{{ t("noFileReceived") }}</span>
            </div>

            <div v-else id="filesBox" class="filesBox no-wrap row items-center">
                <div
                    v-for="(file, fileKey) in files"
                    :key="fileKey"
                    class="row items-center canvasPageBtn"
                    :style="{
                        border:
                            selectedFileIndex === fileKey && file.type !== 'pdf'
                                ? '3px solid #EE324A'
                                : displayMode === 'darkmode'
                                  ? '2px solid #3E3E3E'
                                  : '2px solid #396AFF',
                    }"
                >
                    <button
                        v-if="file.type !== 'pdf'"
                        :class="{ selectedThumbnail: fileKey === selectedFileIndex }"
                        class="filesList row items-center"
                        @click.stop="fileClick(fileKey)"
                    >
                        <img :src="file.img" alt="Thumbnail image" class="thumbnailImg" />
                        <img
                            v-if="file.type === 'img'"
                            src="@/assets/images/callAttachment/img.png"
                            alt="Image type"
                            class="thumbnailType"
                        />
                        <div
                            v-if="file.index !== 0"
                            class="eachDeleteBtn"
                            @click.stop="eachCanvasDelete(fileKey)"
                        >
                            <img
                                src="@/assets/images/callAttachment/ic_close_14.png"
                                alt="Delete icon"
                            />
                        </div>
                    </button>

                    <div v-else-if="file.type === 'pdf'" class="row items-center no-wrap">
                        <div
                            :id="`pdfCanvasPage${file.group}`"
                            class="pdfCanvasPage row items-center"
                            style="width: max-content !important"
                        >
                            <img
                                src="@/assets/images/callAttachment/ic_pdf_22.png"
                                alt="PDF icon"
                                class="row items-center"
                            />
                            <div
                                :id="`pdfCanvasWrap${file.group}`"
                                class="row items-center no-wrap"
                                style="display: none"
                            >
                                <div
                                    v-for="(pdf, pdfKey) in file.pdf"
                                    :key="pdfKey"
                                    class="pdfCanvasWrap row items-center"
                                    :style="{
                                        border:
                                            selectedFileIndex === fileKey &&
                                            pdfIndex === pdfKey
                                                ? '3px solid #EE324A'
                                                : '2px solid #4E4E4E',
                                    }"
                                >
                                    <button
                                        :class="{
                                            selectedThumbnail:
                                                fileKey === selectedFileIndex &&
                                                pdfKey === pdfIndex,
                                        }"
                                        class="row pdfList"
                                        @click.stop="pdfClick(fileKey, pdfKey)"
                                    >
                                        <img
                                            :src="pdf.img"
                                            alt="PDF thumbnail"
                                            class="pdfImg row"
                                        />
                                        <div
                                            v-if="pdf.idx === 1"
                                            class="eachDeleteBtn"
                                            @click.stop="
                                                eachCanvasDelete(
                                                    fileKey,
                                                    pdfKey,
                                                    file.group,
                                                )
                                            "
                                        >
                                            <img
                                                src="@/assets/images/callAttachment/ic_close_14.png"
                                                alt="Delete icon"
                                            />
                                        </div>
                                    </button>
                                    <div
                                        v-if="pdf.name"
                                        class="pdfPagesInfo row items-center justify-between"
                                    >
                                        <span class="pdfName row items-center">{{
                                            pdf.name
                                        }}</span>
                                        <span class="pdfPageNum row items-center">{{
                                            `${pdf.idx}/${pdf.lastPage}`
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            class="pdfOpenClose"
                            @click="openPdfBox(fileKey, file.group)"
                        >
                            <img
                                :id="`openCloseImg${file.group}`"
                                src="@/assets/images/callAttachment/bt_14_12.png"
                                alt="Open/Close PDF button"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="clearThumb row items-center">
            <div class="column thumbnailOptions">
                <button
                    class="column col-6 items-center justify-center addCanvas"
                    @click="newCanvasAdd"
                >
                    <img
                        src="@/assets/images/callAttachment/ic_add.png"
                        alt="Add new canvas"
                    />
                </button>
                <button
                    class="column col-6 items-center justify-center clearThumbnail"
                    @click="clearThumbnail"
                >
                    <img
                        src="@/assets/images/callAttachment/ic_all_delete.png"
                        alt="Clear all thumbnails"
                    />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const superIndex = ref(0);
const beforeSuperIndex = ref(0);
const filesNumCount = ref(null);
const isDelete = ref(false);
const pdfNumCount = ref(null);
const isPdfOpen = ref(false);
const pdfNum = ref(0);
const isEscape = ref(false);
const displayMode = ref("darkmode");
const { t, locale: $i18nLocale } = useI18n();
const fileClick = (e, type) => {
    // 원본 console.log("fileClick type", this.files[this.selectedFileIndex].type)
    // 시도 console.log("fileClick Enter => type: ".concat(this.files[e].type, ", files index: ", e, ", lastCanvasJson: ", this.$store.state.drawing.lastCanvasJson))
    // 최종 console.log("fileClick Enter => type: ".concat(files.value[selectedFileIndex.value].type, ", files index: ", e, ", lastCanvasJson: ", store.state.drawing.lastCanvasJson))
    // console.log(files.value[selectedFileIndex.value].type)
    // console.log("fileClick e:", e)
    // console.log("*****##****** fileClick lastJSON", store.state.drawing.lastCanvasJson)

    if (files.value[e].type == "pdf") {
        console.log("fileClick return because pdf");
        // console.log("*******##** fileClick Test: #1")
        return;
    }

    if (isDelete.value) {
        isDelete.value = false;
        console.log("fileClick return because isDelete = true");
        // console.log("*******##** fileClick Test: #2")
        return;
    } else {
        // 최종 console.log("fileClick pass because isDelete = false")

        // 원본
        // if (this.files[this.selectedFileIndex].type != "pdf") {
        // if (files.value[e].type != "pdf") {
        // this.beforeSuperIndex = this.files[this.selectedFileIndex].index
        // beforeSuperIndex.value = files.value[e].index
        // console.log("fileClick set beforeSuperIndex = ", files.value[e].index)
        // } else {
        // this.beforeSuperIndex = this.files[this.selectedFileIndex].pdf[this.pdfIndex].index
        // beforeSuperIndex.value = files.value[e].pdf[pdfIndex.value].index
        // console.log("fileClick set beforeSuperIndex = ", files.value[e].pdf[pdfIndex.value].index)
        // }

        // 시도 위에서 type이 pdf 인 경우 return 하였으므로 아래와 같이 코드 변경
        // beforeSuperIndex.value = files.value[e].index
        // console.log("fileClick set beforeSuperIndex = ", files.value[e].index)

        if (files.value[selectedFileIndex.value].type != "pdf") {
            beforeSuperIndex.value = files.value[selectedFileIndex.value].index;
            // console.log("fileClick set beforeSuperIndex =", files.value[selectedFileIndex.value].index)
            // console.log("*******##** fileClick Test: #3", files.value[selectedFileIndex.value].index)
        } else {
            beforeSuperIndex.value =
                files.value[selectedFileIndex.value].pdf[pdfIndex.value].index;
            // console.log("fileClick set beforeSuperIndex =", files.value[selectedFileIndex.value].pdf[pdfIndex.value].index)
            // console.log("*******##** fileClick Test: #4")
        }

        // beforeSelectedState : 호스트 변경으로 인한 썸네일 이관 시
        // beforeSuperIndex가 0으로 초기화 되는 현상 발생으로 인해 false일 경우에만 적용
        // moveThumbnail 소켓이벤트를 받았을 때 true 로 변경 (calling.vue)
        // 최종 console.log("fileClick related values => beforeSelectedState: ".concat(beforeSelectedState.value, ", selectedFileIndex: ", selectedFileIndex.value, ", beforeSuperIndex: ", beforeSuperIndex.value))
        // console.log(beforeSelectedState.value, selectedFileIndex.value, beforeSuperIndex.value)
        if (beforeSelectedState.value == false) {
            // 최종 console.log("fileClick quarter beforeSelectedState == false")
            // console.log("beforeSelectedState is false", selectedFileIndex.value, beforeSuperIndex.value, files.value[selectedFileIndex.value].type)
            canvasImgChange(
                selectedFileIndex.value,
                // files.value.length - 1,
                beforeSuperIndex.value,
                files.value[selectedFileIndex.value].type,
                // files.value[files.value.length - 1].type
            );
        } else {
            // 최종 console.log("fileClick quarter beforeSelectedState == true")
            console.log("beforeSelectedState is true");
            canvasImgChange(
                selectedFileIndex.value,
                selectedFileIndex.value,
                files.value[selectedFileIndex.value].type,
            );
        }
        // console.log("*******##** fileClick Test: #5")
    }

    setSelectedFileIndex(e);
    // console.log("####test3")
    setFilesHistory({
        num: beforeSuperIndex.value,
        history: canvasHistory.value,
    });

    superIndex.value = files.value[e].index;
    const lodash = require("lodash"); // You might use an ES module import like `import lodash from 'lodash';` in a modern setup
    const cloneFileHistory = lodash.cloneDeep(files.value);
    // 최종 console.log("fileClick canvasHistory.currentStateIndex = ", canvasHistory.value.currentStateIndex)
    // console.log("files.value History", canvasHistory.value.currentStateIndex)
    if (files.value[e].type == "img") {
        console.log("fileClick start, file.type == img");

        setCanvasHistory(files.value[e].history);

        if (canvasHistory.value.state.length > 0) {
            // console.log("canvasHistory.value.currentStateIndex:", canvasHistory.value.currentStateIndex)
            if (
                canvasHistory.value.state.length <= canvasHistory.value.currentStateIndex
            ) {
                canvasHistory.value.currentStateIndex =
                    canvasHistory.value.state.length - 1;
                console.log(
                    "canvasHistory.value.currentStateIndex:",
                    canvasHistory.value.currentStateIndex,
                );
            }
            // console.log("canvasHistory.value.state[canvasHistory.value.currentStateIndex]:", canvasHistory.value.state[canvasHistory.value.currentStateIndex])
            // console.log("canvasHistory.value.state:", canvasHistory.value.state)
            canvasHistory.value.state[canvasHistory.value.currentStateIndex] =
                setRemoveDuplicates(
                    canvasHistory.value.state[canvasHistory.value.currentStateIndex],
                );
        }

        canvas.value.loadFromJSON(
            canvasHistory.value.state[canvasHistory.value.state.length - 1],
            () => {
                canvas.value.renderAll.bind(canvas.value);
                console.log("fileClick finished, file.type == img");
            },
        );
        // console.log("*******##** fileClick Test: #6")

        // console.log("*******##** files.value[e].history.state[0]".concat(files.value[e].history.state[0]))
        // console.log("*******##** firstFiles.value[0].history.state[0]".concat(firstFiles.value[0].history.state[0]))

        // console.log("files.value after splice History", cloneFileHistory, files.value)

        // 기존에 주석처리된것을 드로잉 썸네일 문제로 인해 meet 소스와 동일하게 수정 ->
        if (
            files.value[e].history.state[0] == firstFiles.value[0].history.state[0] &&
            files.value[e].history.length > 1
        ) {
            setHistorySplice(e);
        }
        // <-

        setCanvasHistory(files.value[e].history);
        // 최종 console.log("fileClick setCanvasHistory = ", files.value[e].history)

        // console.log("img FileClick", files.value[e].history)
        // console.log("*******##** fileClick Test: #8")
    } else if (files.value[e].type == "canvas") {
        // 최종 console.log("fileClick quarter file.type == canvas")

        setCanvasHistory(files.value[e].history);
        if (canvasHistory.value.state.length > 0) {
            canvasHistory.value.state[canvasHistory.value.currentStateIndex] =
                setRemoveDuplicates(
                    canvasHistory.value.state[canvasHistory.value.currentStateIndex],
                );
        }

        canvas.value.loadFromJSON(
            canvasHistory.value.state[canvasHistory.value.currentStateIndex],
            () => {
                canvas.value.renderAll.bind(canvas.value);
                console.log("fileClick finished, file.type == canvas");
            },
        );

        // console.log("canvas FileClick", files.value[e].history)
    }

    // 최종 console.log("fileClick finish")
    // console.log("files.value after History", files.value)

    store.commit("drawing/setBeforeIndexInitialized", false);
};

// --- Other Methods Conversion ---

const openPdf = (e, group) => {
    // console.log(e, group)
    if (group == files.value[e].group) {
        const pdfNumCount = files.value[e].pdf[0].lastPage;
        const pdfWidth = pdfNumCount * 148 + 36;
        // console.log("#1", thumbnailWidth.value + pdfWidth)
        setThumbnailWidth(thumbnailWidth.value + pdfWidth);
        // document.getElementById("pdfCanvasPage" + group).style.width =
        //  pdfWidth + "px"
        document.getElementById("openCloseImg" + group).style.transform =
            "rotate(180deg)";
        document.getElementById("pdfCanvasWrap" + group).style.display = "flex";
    }
};

const openPdfBox = (e, group) => {
    const width = document.getElementById(`pdfCanvasPage${group}`).offsetWidth;
    // console.log(width, "OPEN width")
    const showCanvasThumnail = document.getElementById("pdfCanvasWrap" + group).style
        .display;
    if (group == files.value[e].group && showCanvasThumnail == "none") {
        const pdfNumCount = files.value[e].pdf[0].lastPage;
        const pdfWidth = pdfNumCount * 148 + 36;
        // console.log("#2", thumbnailWidth.value + pdfWidth)
        setThumbnailWidth(thumbnailWidth.value + pdfWidth);
        // document.getElementById("pdfCanvasPage" + group).style.width =
        //  pdfWidth + "px"
        document.getElementById("openCloseImg" + group).style.transform =
            "rotate(180deg)";
        document.getElementById("pdfCanvasWrap" + group).style.display = "flex";
    } else {
        document.getElementById("openCloseImg" + group).style.transform = "";
        document.getElementById("pdfCanvasWrap" + group).style.display = "none";
    }
    // ... (rest of the commented-out original logic for openPdfBox)
};

const pdfClick = (fileKey, pdfKey) => {
    // console.log("pdfClick start", fileKey, pdfKey,files.value, selectedFileIndex.value, beforeSuperIndex.value)

    if (files.value[selectedFileIndex.value].type != "pdf") {
        beforeSuperIndex.value = files.value[selectedFileIndex.value].index;
    } else {
        beforeSuperIndex.value =
            files.value[selectedFileIndex.value].pdf[pdfIndex.value].index;
    }
    if (isDelete.value) {
        isDelete.value = false;
        return;
    } else {
        if (beforeSelectedState.value == false) {
            // console.log("####test5")
            canvasImgChange(
                selectedFileIndex.value,
                beforeSuperIndex.value,
                files.value[selectedFileIndex.value].type,
            );
        } else {
            // console.log("####test6")
            canvasImgChange(
                selectedFileIndex.value,
                beforeSuperIndex.value,
                files.value[selectedFileIndex.value].type,
            );
        }
    }
    setPdfIndex(pdfKey);
    setSelectedFileIndex(fileKey);
    // 20221122 - 수정해야할 부분
    setFilesHistory({
        num: beforeSuperIndex.value,
        history: canvasHistory.value,
    });

    superIndex.value = files.value[fileKey].pdf[pdfKey].index;
    if (files.value[fileKey].pdf[pdfKey].history.state.length == 0) {
        canvas.value.clear();
        canvas.value.backgroundColor = "#ffffff";
        const imgObj = new Image();
        imgObj.src = files.value[fileKey].pdf[pdfKey].img;
        imgObj.crossOrigin = "anonymous";
        imgObj.onload = () => {
            const image = new fabric.Image(
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
            if (image.width > image.height) {
                if (image.width > canvas.value.getWidth()) {
                    image.set({
                        scaleX: canvas.value.getWidth() / image.width,
                        scaleY: canvas.value.getHeight() / image.height,
                    });
                } else {
                    image.scale(1.0).set({});
                }
            } else if (image.width < image.height) {
                if (image.width > canvas.value.getWidth()) {
                    image.set({
                        scaleX: canvas.value.getWidth() / image.width,
                        scaleY: (canvas.value.getHeight() * 2.5) / image.height,
                    });
                } else {
                    image.scale(1.0).set({});
                }
            }
            console.log(image, "canvas.value.add(image)");
            canvas.value.add(image);
            const jsonData = canvas.value.toJSON();
            const canvasAsJson = JSON.stringify(jsonData);
            setPdfFirstHistoryState({
                superIndex: superIndex.value,
                firstState: canvasAsJson,
            });
            // console.log("pdfClick if 문", files.value[fileKey].pdf[pdfKey].history)
            setCanvasHistory(files.value[fileKey].pdf[pdfKey].history);
            canvasHistory.value.state[canvasHistory.value.currentStateIndex] =
                setRemoveDuplicates(
                    canvasHistory.value.state[canvasHistory.value.currentStateIndex],
                );
            canvas.value.loadFromJSON(
                canvasHistory.value.state[canvasHistory.value.currentStateIndex],
                () => {
                    canvas.value.renderAll.bind(canvas.value);
                    console.log("fileClick finished, file.type == pdf:history");
                },
            );
            setUpdate(true);
        };
    } else {
        // console.log("pdfClick else 문", files.value[fileKey].pdf[pdfKey].history, canvasHistory.value.currentStateIndex)
        // console.log(files.value[fileKey].pdf[pdfKey].history)
        setCanvasHistory(files.value[fileKey].pdf[pdfKey].history);
        // console.log(canvasHistory.value.state[canvasHistory.value.currentStateIndex])
        canvasHistory.value.state[canvasHistory.value.currentStateIndex] =
            setRemoveDuplicates(
                canvasHistory.value.state[canvasHistory.value.currentStateIndex],
            );
        canvas.value.loadFromJSON(
            canvasHistory.value.state[canvasHistory.value.currentStateIndex],
            () => {
                canvas.value.renderAll.bind(canvas.value);
                console.log("fileClick finished, file.type == pdf:currentStateIndex");
            },
        );
    }

    if (beforeSelectedState.value) {
        openPdf(fileKey, files.value[selectedFileIndex.value].group);
        store.commit("drawing/setBeforeIndexInitialized", false);
    }
    // console.log(canvasHistory.value)
};

const newCanvasAdd = () => {
    if (!isPdfUploading.value) {
        setSrc({
            type: "canvas",
            src: firstFiles.value[0].img,
        });
    } else {
        commonToastMessage("uploading PDF");
    }
};

const canvasImgChange = (num, beforeSuperIndex, type) => {
    if (type != "pdf") {
        // console.log("canvasImgChange", num, canvas.value.toDataURL("png"))
        // console.log("canvasImgChange num:", num, ", type:", type)
        setFilesImgChange({
            num,
            image: canvas.value.toDataURL("png"),
        });
    } else {
        let pdfNum = null;
        for (let i = 0; i < files.value.length; i++) {
            if (files.value[i].pdf) {
                for (let j = 0; j < files.value[i].pdf.length; j++) {
                    if (files.value[i].pdf[j].index == beforeSuperIndex) {
                        pdfNum = j;
                    }
                }
            }
        }
        // console.log("canvasImgChange num값을 확인한다", num, pdfNum)
        if (pdfNum !== null) {
            setFilesImgChange({
                num,
                pdfNum,
                image: canvas.value.toDataURL("png"),
            });
        }
    }
};

const eachCanvasDelete = (e, pdfKey, group) => {
    if (!isPdfUploading.value) {
        if (files.value[e - 1].type != "pdf") {
            fileClick(e - 1);
            isDelete.value = true;
            let deleteIndex = null;
            let deleteWidth = 0;
            if (files.value[e].type == "pdf") {
                deleteIndex = files.value[e].pdf[pdfKey].index;
                const pdfNumCount = files.value[e].pdf[0].lastPage;
                deleteWidth = pdfNumCount * 148 + 36;

                for (let i = 0; i < pdfUploadQueArray.value.length; i++) {
                    if (pdfUploadQueArray.value[i].groupIndex == group) {
                        if (i == 0 && pdfUploading.value == true) {
                            setPDFcancelUploadFlag(true);
                            break;
                        } else {
                            pdfUploadQueArray.value.splice(i, 1);
                            break;
                        }
                    }
                }
            } else {
                deleteIndex = files.value[e].index;
                deleteWidth = 148;
            }
            setFilesDelete(deleteIndex);
            setUpdate(true);
            setThumbnailWidth(thumbnailWidth.value - deleteWidth);
        } else {
            pdfClick(e - 1, 0);
            let deleteIndex = null;
            let deleteWidth = 0;
            if (files.value[e].type == "pdf") {
                deleteIndex = files.value[e].pdf[pdfKey].index;
                const pdfNumCount = files.value[e].pdf[0].lastPage;
                deleteWidth = pdfNumCount * 148 + 36;

                for (let i = 0; i < pdfUploadQueArray.value.length; i++) {
                    if (pdfUploadQueArray.value[i].groupIndex == group) {
                        if (i == 0 && pdfUploading.value == true) {
                            setPDFcancelUploadFlag(true);
                            break;
                        } else {
                            pdfUploadQueArray.value.splice(i, 1);
                            break;
                        }
                    }
                }
            } else {
                deleteIndex = files.value[e].index;
                deleteWidth = 148;
            }
            setFilesDelete(deleteIndex);
            setUpdate(true);
            setThumbnailWidth(thumbnailWidth.value - deleteWidth);
        }
    } else {
        commonToastMessage("uploading PDF");
    }
};

const clearThumbnail = () => {
    if (!isPdfUploading.value) {
        clearFiles();
        setSuperIndex(1);
        canvas.value.loadFromJSON(
            canvasHistory.value.state[0],
            canvas.value.renderAll.bind(canvas.value),
        );
        canvasImgChange(0, beforeSuperIndex.value, files.value[0].type);
        setSelectedFileIndex(0);
        beforeSuperIndex.value = 0;
        setCanvasJson(null);
        setUpdate(true);

        for (let i = 1; i < pdfUploadQueArray.value.length; i++) {
            if (pdfUploading.value == true) {
                pdfUploadQueArray.value.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < pdfUploadQueArray.value.length; i++) {
            if (i == 0 && pdfUploading.value == true) {
                setPDFcancelUploadFlag(true);
            } else {
                pdfUploadQueArray.value.splice(i, 1);
                i--;
            }
        }
    } else {
        commonToastMessage("uploading PDF");
    }
};

// sleep 헬퍼 함수
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// inputPreviewImageWork 함수
const inputPreviewImageWork = (index, thumb) => {
    return new Promise((resolve, reject) => {
        console.log(index, ". drawingStore.setSrc");
        drawingStore.setSrc(thumb);

        const imgObj = new Image();
        // saveThumbnailImg는 drawingStore에 있다고 가정
        imgObj.src = drawingStore.saveThumbnailImg[index].src;

        imgObj.crossOrigin = "anonymous";
        imgObj.onload = () => {
            console.log(index, ". imgObj.onload");

            const image = new fabric.Image(
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
                image.width > canvas.value.getWidth() ||
                image.height > canvas.value.getHeight()
            ) {
                if (image.width > image.height) {
                    image.scale(1.0).set({
                        scaleX: canvas.value.getWidth() / image.width,
                        scaleY: canvas.value.getHeight() / image.height,
                    });
                } else {
                    image.scale(1.0).set({
                        scaleX: canvas.value.getWidth() / (image.width * 2.5),
                        scaleY: canvas.value.getHeight() / image.height,
                    });
                }
            } else {
                image.scale(1.0).set("flipX", false);
            }
            console.log(index, ". canvas.value.add(image)");
            canvas.value.add(image);
            canvas.value.renderAll();

            console.log(index, ". resolve()");
            resolve();
        };
        imgObj.onerror = reject;
    });
};

// inputPreviewImage 함수
const inputPreviewImage = async (time) => {
    await sleep(500);

    while (true) {
        if (loadImageOnCanvasFinished.value == true) {
            // 반응형 변수 접근 시 .value
            break;
        }
        await sleep(200);
    }
    // Nuxt 3에서는 `useNuxtApp().$nextTick` 또는 Vue의 `nextTick`을 직접 임포트하여 사용합니다.
    // Vue 3의 Composition API에서는 일반적으로 DOM 업데이트를 기다릴 필요가 없는 경우가 많지만,
    // 기존 로직과 동일하게 유지하려면 `nextTick`을 사용할 수 있습니다.
    await nextTick(() => {
        // `import { nextTick } from 'vue'` 필요
        setTimeout(async () => {
            // `async` 추가
            if (!drawingStore.isOpenSaveThumbnail) {
                if (drawingStore.saveThumbnailImg != null) {
                    const stiArr = [];
                    for (let i = 0; i < drawingStore.saveThumbnailImg.length; i++) {
                        stiArr.push(drawingStore.saveThumbnailImg[i]);
                    }

                    const works = (sti) => {
                        return inputPreviewImageWork(stiArr.indexOf(sti), sti);
                    };

                    const delay = (ms) =>
                        new Promise((resolve) => setTimeout(resolve, ms));
                    const result = stiArr.reduce((prework, sti) => {
                        return prework.then(() => {
                            return Promise.all([delay(100), works(sti)]);
                        });
                    }, Promise.resolve());

                    result.then(() => {
                        drawingStore.setIsOpenSaveThumbnail(true);
                        canvas.value.renderAll();
                    });
                }
            }
        }, time);
    });
};

// horizontalScroll 함수
const horizontalScroll = (e) => {
    const id = document.getElementById("thumbBody");
    if (id) {
        // id가 존재하는지 확인
        id.scrollLeft += e.deltaY;
    }
};

// getPreviousUserCanvas 함수
const getPreviousUserCanvas = () => {
    // newCanvasAdd() 함수는 별도로 정의해야 합니다.
    // 여기서는 스토어 액션으로 가정하고 호출합니다.
    // drawingStore.newCanvasAdd()

    setTimeout(() => {
        const num = drawingStore.files.length - 1;
        drawingStore.setFilesImgChange({
            num,
            image: canvas.value.toDataURL("png"),
        });
        // eachCanvasDelete() 함수도 별도로 정의해야 합니다.
        // drawingStore.eachCanvasDelete(drawingStore.files.length - 1)

        drawingStore.setChangedHost(false);
        drawingStore.setBeforeHostIndex(0);
        drawingStore.deleteFirstInFiles();
    }, 200);
};

const {
    canvas,
    canvasWidth,
    src,
    files,
    canvasHistory,
    index,
    firstFiles,
    selectedFileIndex,
    canvasNumber,
    pdfNumber,
    totalPages,
    thumbnailWidth,
    pdfIndex,
    saveThumbnailImg,
    isOpenSaveThumbnail,
    isDrawing, // Assuming this is also in drawingStore, or adjust if it's in a different store
    isPdfUploading,
    pdfPushIndex,
    isThumbnailTransfer,
    isGivenThumbnailTransfer,
    beforeThumbnailTransfer,
    beforeCloseCanvas,
    escapeDrawingPage,
    pdfUrlSaveArrays,
    selectCount,
    beforeSelectedState,
    loadImageOnCanvasFinished,
    lastCanvasSeted, // getLastCanvasInfo에서 사용되는 속성
} = storeToRefs(drawingStore);

// callStore의 state 속성들을 반응형으로 추출
const { pdfUploadQueArray, pdfUploading } = storeToRefs(callStore);

const getLastCanvasInfo = computed(() => {
    return lastCanvasSeted.value; // storeToRefs로 추출된 ref이므로 .value로 접근
});

// canvasWidth 감시
watch(canvasWidth, (newVal) => {
    const thumbBody = document.getElementById("thumbBody");
    if (thumbBody) {
        thumbBody.style.width = newVal - 30 + "px";
    }
});

// files 감시 (배열 전체 변경 감지)
watch(
    files,
    (newFiles) => {
        const beforeCount = filesNumCount.value; // ref 접근 시 .value
        filesNumCount.value = newFiles.length; // ref 접근 시 .value
        const beforeWidth = thumbnailWidth.value; // ref 접근 시 .value

        if (filesNumCount.value == 1) {
            setThumbnailWidth(148);
        }

        for (let i = 0; i < newFiles.length; i++) {
            // superIndex는 drawingStore.index로 가정합니다.
            if (index.value == newFiles[i].index) {
                // ref 접근 시 .value
                setSelectedFileIndex(i);
                break;
            }
        }

        if (canvas.value != null) {
            // ref 접근 시 .value
            let fileType = "canvas";

            if (beforeSelectedState.value) {
                // ref 접근 시 .value
                fileType = newFiles[selectedFileIndex.value].type; // ref 접근 시 .value
            } else {
                fileType = newFiles[newFiles.length - 1].type;
            }

            if (fileType != "pdf") {
                setThumbnailWidth(thumbnailWidth.value + 148); // ref 접근 시 .value
                if (!isGivenThumbnailTransfer.value && !beforeCloseCanvas.value) {
                    // ref 접근 시 .value
                    fileClick(newFiles.length - 1);
                }
                const scrollElement = document.getElementById("thumbBody");
                if (scrollElement) {
                    setTimeout(() => {
                        scrollElement.scrollLeft = scrollElement.scrollWidth;
                    }, 50);
                }
            } else {
                setThumbnailWidth(thumbnailWidth.value + 32); // ref 접근 시 .value
                nextTick(() => {
                    // $nextTick 대신 nextTick 사용
                    // this.pdfClick(this.files.length - 1, 0)
                    // isDelete는 어디서 오는지 불분명하여 추정해서 추가하거나 제거해야 합니다.
                    // if (!isDelete.value && beforeCount < filesNumCount.value) {
                    //   // console.log("OPEN PDF", newFiles.length - 1, newFiles[newFiles.length - 1].group)
                    //   // None
                    // }
                });
            }
        }
    },
    { deep: true },
); // files 배열 내부의 변경도 감지하기 위해 deep 옵션 추가

// src 감시
watch(src, (newVal) => {
    if (newVal != null) {
        if (files.value.length == 0) {
            // ref 접근 시 .value
            console.log("setFirstFiles");
            setFirstFiles(newVal);
        }
        console.log("setFiles");
        setFiles(newVal);
    }
});

// canvas 감시
watch(canvas, (newVal) => {
    if (files.value.length == 0) {
        // ref 접근 시 .value
        setSrc({
            type: "canvas",
            src: newVal.toDataURL("png"),
        });
    }
});

// selectedFileIndex 감시
watch(selectedFileIndex, (newVal) => {
    let idx = newVal;
    if (idx > files.value.length - 1) {
        // ref 접근 시 .value
        idx = files.value.length - 1;
    }
    setSelectCount(true);
    if (files.value[idx].type == "pdf") {
        // ref 접근 시 .value
        openPdf(idx, files.value[idx].group); // ref 접근 시 .value
    }
});

// isDrawing 감시
watch(isDrawing, (newVal) => {
    console.log("*** methods: isDrawing. newVal:", newVal);

    if (newVal == false) {
        if (selectCount.value == 0) {
            // ref 접근 시 .value
            setSelectedFileIndex(files.value.length - 1); // ref 접근 시 .value
        }
        if (files.value[selectedFileIndex.value].type != "pdf") {
            // ref 접근 시 .value
            fileClick(selectedFileIndex.value); // ref 접근 시 .value
        }
        setSelectCount(false);
    }

    //#region PDF logic
    let pdfN = 0;
    const length = files.value.length - pdfN; // ref 접근 시 .value
    for (let i = 0; i < files.value.length; i++) {
        // ref 접근 시 .value
        if (
            files.value[i].type == "pdf" &&
            i !== selectedFileIndex.value &&
            beforeSelectedState.value
        ) {
            // ref 접근 시 .value
            const group = files.value[i].group; // ref 접근 시 .value
            const pdfWidth = 32;
            const openCloseImg = document.getElementById("openCloseImg" + group);
            if (openCloseImg) openCloseImg.style.transform = "";
            const pdfCanvasWrap = document.getElementById("pdfCanvasWrap" + group);
            if (pdfCanvasWrap) pdfCanvasWrap.style.display = "none";
            pdfN++;
        }
    }
    // PDF 로컬 업로드 중 드로잉 껐을 시 PDF 중단 및 삭제
    if (escapeDrawingPage.value) {
        // ref 접근 시 .value
        setIsPdfUploading(false);
        if (isEscape.value) {
            // ref 접근 시 .value
            isEscape.value = false; // ref 접근 시 .value
            return;
        }
        isEscape.value = true; // ref 접근 시 .value
        if (files.value[files.value.length - 1].type == "pdf") {
            // ref 접근 시 .value
            eachCanvasDelete(
                files.value.length - 1, // ref 접근 시 .value
                pdfIndex.value, // ref 접근 시 .value
                files.value[files.value.length - 1].group, // ref 접근 시 .value
            );
        }
        setEscapeDrawingPage(false);
    }
    // PDF 서버 업로드 중 드로잉 껐을 시 PDF 중단 및 삭제
    // filesList는 deep copy가 필요할 수 있으므로 map을 사용합니다.
    const filesList = files.value.map((b) => Object.assign({}, b)); // ref 접근 시 .value, 깊은 복사
    if (pdfUrlSaveArrays.value.length > 0 && newVal) {
        // ref 접근 시 .value
        for (let i = 0; i < pdfUrlSaveArrays.value.length; i++) {
            // ref 접근 시 .value
            for (let j = 0; j < filesList.length; j++) {
                if (filesList[j].type == "pdf") {
                    if (
                        filesList[j].group == pdfUrlSaveArrays.value[i].groupIndex && // ref 접근 시 .value
                        pdfUrlSaveArrays.value[i].pages != null // ref 접근 시 .value
                    ) {
                        filesList.splice(j, 1);
                        j--;
                    }
                } else if (
                    filesList[j].group == pdfUrlSaveArrays.value[i].groupIndex && // ref 접근 시 .value
                    pdfUrlSaveArrays.value[i].pages == null // ref 접근 시 .value
                ) {
                    // No action
                } else {
                    filesList.splice(j, 1);
                    j--;
                }
            }
        }
        if (filesList.length > 0) {
            let e = null;
            for (let i = 0; i < files.value.length; i++) {
                // ref 접근 시 .value
                if (files.value[i].type == "pdf") {
                    // ref 접근 시 .value
                    if (files.value[i].group == filesList[0].group) {
                        // ref 접근 시 .value
                        e = i;
                    }
                }
            }
            eachCanvasDelete(e, pdfIndex.value, filesList[0].group); // ref 접근 시 .value
        }
    } else if (pdfUrlSaveArrays.value.length == 0 && newVal) {
        // ref 접근 시 .value
        for (let i = 0; i < filesList.length; i++) {
            if (filesList[i].type == "pdf") {
                eachCanvasDelete(i, pdfIndex.value, filesList[i].group); // ref 접근 시 .value
            }
        }
    }
    //#endregion

    setThumbnailWidth(pdfN * 32 + length * 148);

    console.log(
        "drawing in 파일타입 확인",
        beforeSelectedState.value,
        files.value[selectedFileIndex.value].type,
    ); // ref 접근 시 .value
    let scrollPosition = 0;
    if (files.value[selectedFileIndex.value].type == "pdf") {
        // ref 접근 시 .value
        const selectedPdfFile = files.value[selectedFileIndex.value].pdf[pdfIndex.value]; // ref 접근 시 .value
        const selectedFileIdx = selectedPdfFile ? selectedPdfFile.index : 0; // null 체크
        const fileListLength = document.getElementsByClassName("filesList").length;
        const changedScrollIndex = selectedFileIdx - fileListLength;

        for (let i = 0; i < selectedFileIndex.value; i++) {
            // ref 접근 시 .value
            const canvasPageBtn = document.getElementsByClassName("canvasPageBtn")[i];
            const filesWidth = canvasPageBtn ? canvasPageBtn.clientWidth : 0; // null 체크
            scrollPosition += filesWidth;
        }

        setTimeout(() => {
            if (beforeSelectedState.value) {
                // ref 접근 시 .value
                pdfClick(selectedFileIndex.value, pdfIndex.value); // ref 접근 시 .value
            }
            const pdfCanvasWraps = document.getElementsByClassName("pdfCanvasWrap");
            const selectedThumbnailPosition = pdfCanvasWraps[changedScrollIndex]
                ? pdfCanvasWraps[changedScrollIndex].offsetLeft
                : 0; // null 체크
            const movePosition = scrollPosition + selectedThumbnailPosition;
            const thumbBody = document.getElementById("thumbBody");
            if (thumbBody)
                thumbBody.scrollTo({ left: movePosition, top: 0, behavior: "smooth" });
        }, 300);
    } else {
        for (let i = 0; i < selectedFileIndex.value; i++) {
            // ref 접근 시 .value
            const canvasPageBtn = document.getElementsByClassName("canvasPageBtn")[i];
            const filesWidth = canvasPageBtn ? canvasPageBtn.clientWidth : 0; // null 체크
            scrollPosition += filesWidth;
        }

        setTimeout(() => {
            console.log("beforeSelectedState:", beforeSelectedState.value); // ref 접근 시 .value
            if (beforeSelectedState.value) {
                // ref 접근 시 .value
                fileClick(selectedFileIndex.value); // ref 접근 시 .value
                console.log(
                    "this.fileClick(this.selectedFileIndex) - isDrawing type image",
                );
            }
            const thumbBody = document.getElementById("thumbBody");
            if (thumbBody)
                thumbBody.scrollTo({ left: scrollPosition, top: 0, behavior: "smooth" });
        }, 300);
    }

    console.log("inputPreviewImage 가 isDrawing 에서 실행");
    inputPreviewImage(500);
});

// isThumbnailTransfer 감시
watch(isThumbnailTransfer, (newVal) => {
    if (newVal) {
        if (canvas.value != null) {
            // ref 접근 시 .value
            clearThumbnail();
            setIsThumbnailTransfer(false);
        }
    }
});

// beforeThumbnailTransfer 감시
watch(beforeThumbnailTransfer, async (newVal) => {
    if (newVal) {
        if (canvas.value != null) {
            // ref 접근 시 .value
            if (files.value[selectedFileIndex.value].type != "pdf") {
                // ref 접근 시 .value
                await fileClick(selectedFileIndex.value); // ref 접근 시 .value
                setBeforeThumbnailTransfer(false);
            } else {
                await pdfClick(selectedFileIndex.value, pdfIndex.value); // ref 접근 시 .value
                setBeforeThumbnailTransfer(false);
            }
        }
    }
});

// beforeCloseCanvas 감시
watch(beforeCloseCanvas, (newVal) => {
    // alert(selectedFileIndex.value) // alert 사용 시 주의 (브라우저 동작을 멈춤)
    if (newVal) {
        if (canvas.value != null) {
            // ref 접근 시 .value
            setSelectedFileIndex(files.value.length - 1); // ref 접근 시 .value
            if (files.value[selectedFileIndex.value].type != "pdf") {
                // ref 접근 시 .value
                fileClick(selectedFileIndex.value); // ref 접근 시 .value
            } else {
                pdfClick(selectedFileIndex.value, pdfIndex.value); // ref 접근 시 .value
            }
            setBeforeCloseCanvas(false);
        }
    }
});

// escapeDrawingPage 감시 (isDrawing의 중복 로직을 제거하고 여기서만 실행되도록 분리)
// 기존 isDrawing watch에 escapeDrawingPage와 관련된 로직이 중복되어 있었으므로
// 이 부분을 독립적인 watch로 분리하여 코드의 가독성과 유지보수성을 높였습니다.
watch(escapeDrawingPage, (newVal) => {
    // PDF PDF 로컬 업로드 중 드로잉 껐을 시 PDF 중단 및 삭제
    if (newVal) {
        setIsPdfUploading(false);
        if (isEscape.value) {
            // ref 접근 시 .value
            isEscape.value = false; // ref 접근 시 .value
            return;
        }
        isEscape.value = true; // ref 접근 시 .value
        if (files.value[files.value.length - 1].type == "pdf") {
            // ref 접근 시 .value
            eachCanvasDelete(
                files.value.length - 1, // ref 접근 시 .value
                pdfIndex.value, // ref 접근 시 .value
                files.value[files.value.length - 1].group, // ref 접근 시 .value
            );
        }
        setEscapeDrawingPage(false);
    }
});

// getLastCanvasInfo 감시 (이전 computed에서 watch로 변경된 것으로 보임)
watch(lastCanvasSeted, async (res) => {
    // computed의 getLastCanvasInfo가 아닌, state의 lastCanvasSeted를 직접 감시하는 것으로 가정
    if (res) {
        setCanvasHistoryFin(false);
        await fileClick(selectedFileIndex.value); // ref 접근 시 .value
        await fileClick(selectedFileIndex.value); // 두 번 호출되는 이유가 명확하지 않으나, 기존 로직 유지
    }
});

onMounted(() => {
    // 1. 스타일 동적 로드 (Node.js 환경에서는 require 대신 import()를 비동기적으로 사용해야 할 수 있습니다.)
    // Nuxt는 빌드 시 CSS를 처리하므로, 직접 require를 사용하는 대신
    // `<style lang="sass" :src="dynamicStylePath"></style>`와 같이 동적 바인딩을 고려하거나,
    // CSS 변수를 통해 테마를 변경하는 것이 일반적입니다.
    // 이 `require` 구문은 Nuxt의 빌드 시스템에서 동작하지 않을 수 있습니다.
    // 실제 Nuxt 앱에서는 테마 전환을 위한 더 적합한 방법이 필요합니다.
    // 예시를 위해 주석 처리합니다.
    // require(`@/assets/styles/${sessionStorage.getItem("displayMode")}/components/call/drawings/thumbnail.sass`)

    // 2. displayMode 설정
    displayMode.value = sessionStorage.getItem("displayMode") || "default"; // 기본값 설정

    // 3. thumbBody 너비 설정
    const thumbBody = document.getElementById("thumbBody");
    if (thumbBody) {
        // null 체크
        thumbBody.style.width = canvasWidth.value - 32 + "px"; // .value로 접근
    }

    // 4. PDF 관련 초기화 로직
    let pdfN = 0;
    // files는 ref이므로 .value로 접근해야 합니다.
    const initialFilesLength = files.value ? files.value.length : 0;
    const length = initialFilesLength - pdfN;

    if (files.value) {
        // files가 null이 아닌지 확인
        for (let i = 0; i < files.value.length; i++) {
            if (files.value[i].type == "pdf" && beforeSelectedState.value) {
                // .value로 접근
                const group = files.value[i].group;
                const openCloseImg = document.getElementById("openCloseImg" + group);
                if (openCloseImg) openCloseImg.style.transform = "";
                const pdfCanvasWrap = document.getElementById("pdfCanvasWrap" + group);
                if (pdfCanvasWrap) pdfCanvasWrap.style.display = "none";
                pdfN++;
            }
        }
    }

    // 5. 썸네일 너비 설정
    setThumbnailWidth(pdfN * 32 + length * 148);

    // 6. inputPreviewImage 호출
    inputPreviewImage(500);

    // 7. 휠 이벤트 리스너 등록
    // 이벤트 리스너는 onUnmounted에서 제거하는 것이 중요합니다!
    document.addEventListener("wheel", horizontalScroll, { passive: false }); // passive: false로 설정하여 preventDefault()가 동작하도록 함

    // 8. changedHost 조건부 로직
    // changedHost는 drawingStore의 상태이므로 .value로 접근
    if (changedHost.value === true) {
        getPreviousUserCanvas();
    }
});

onUnmounted(() => {
    if (readyStatus.value) {
        // ref 접근 시 .value
        // 호스트 이관 시
        drawingStore.setReadyStatus(false); // Pinia 스토어 뮤테이션/액션 호출
        console.log("onUnmounted: Host transfer detected, readyStatus set to false.");
    } else {
        // 호스트 이관 아닌 경우 마지막 canvas 상태 저장
        // files 배열이 비어있지 않은지 확인
        if (files.value && files.value.length > 0) {
            // selectedFileIndex가 유효한 범위 내에 있는지 확인
            const currentSelectedFileIndex = selectedFileIndex.value;
            if (
                currentSelectedFileIndex >= 0 &&
                currentSelectedFileIndex < files.value.length
            ) {
                if (files.value[currentSelectedFileIndex].type !== "pdf") {
                    // superIndex.value는 현재 활성화된 파일의 index를 나타낸다고 가정
                    fileClick(superIndex.value); // ref 접근 시 .value
                    console.log(
                        `onUnmounted: Saving non-PDF canvas state for index ${superIndex.value}.`,
                    );
                } else {
                    pdfClick(currentSelectedFileIndex, pdfIndex.value); // ref 접근 시 .value
                    console.log(
                        `onUnmounted: Saving PDF canvas state for file index ${currentSelectedFileIndex}, pdf index ${pdfIndex.value}.`,
                    );
                }
            } else {
                console.warn(
                    "onUnmounted: selectedFileIndex is out of bounds or files array is empty. Skipping canvas state save.",
                );
            }
        } else {
            console.log("onUnmounted: No files to save canvas state for.");
        }
    }

    // 휠 이벤트 리스너 제거
    // `addEventListener`에 전달했던 함수와 동일한 함수 참조를 `removeEventListener`에 전달해야 합니다.
    document.removeEventListener("wheel", horizontalScroll);
    console.log("onUnmounted: Wheel event listener removed.");
});
</script>
