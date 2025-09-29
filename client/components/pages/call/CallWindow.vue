<template lang="html">
    <div
        :style="{ border: props.compData?.status == 'none' ? '1px dashed #767676' : '' }"
        :class="[
            drawingIframe ? 'draw' : 'video',
            'user-screen',
            `layout${callingLayoutType}`,
        ]"
        @click="getMainVideoIndex"
        class="row window"
        :id="props.id"
    >
        <div class="status-indicators">
            <img
                class="host-icon"
                v-if="props.compData.hostIcon"
                src="@/assets/images/calling/ic_host.png"
            />
            <img
                class="mute-icon"
                v-if="props.compData.mute"
                src="@/assets/images/calling/ic_r_mute.png"
            />
        </div>
        <div class="windowInfoBar" v-if="props.compData?.status !== 'main'">
            <div class="user-name">
                <span>{{ props.compData.text }}</span>
                <div>
                    <img
                        v-if="compData.status == 'calling' && !props.compData.isSounded"
                        @click="soundedClick"
                        @mousedown.stop
                        src="@/assets/images/ic_mic.png"
                    />
                    <img
                        v-else-if="
                            compData.status == 'calling' && props.compData.isSounded
                        "
                        @click="soundedClick"
                        @mousedown.stop
                        src="@/assets/images/ic_mute.png"
                    />
                    <img
                        v-if="
                            compData.status == 'sending' ||
                            compData.status == 'connecting' ||
                            compData.status == 'other'
                        "
                        @click="cancelCallClick"
                        src="@/assets/images/calling/ic_x_blue.png"
                    />
                </div>
            </div>
        </div>
        <button
            v-if="props.compData && props.compData?.status == 'calling'"
            @mousedown="windowClick"
            class="status calling"
        >
            <img :src="props.compData.img" />
        </button>
        <div
            v-else-if="props.compData && props.compData?.status == 'main'"
            id="videoMainDivWrap"
            class="videoMainDivWrap"
        >
            <div
                id="videoMainDiv"
                class="justify-center"
                :class="drawingIframe ? 'drawing' : ''"
            >
                <div
                    :class="[drawingIframe ? 'screen-draw' : 'screen-video']"
                    id="panel-inner-main"
                >
                    <Drawing
                        v-if="drawingIframe && callingLayoutType != 1"
                        id="test11"
                        class="callingWidth"
                    />
                    <video
                        v-show="!drawingIframe"
                        autoplay
                        muted="muted"
                        :style="{ height: !drawingIframe ? '100%' : '', maxHeight: '' }"
                        id="videoMain"
                        style="
                            aspect-ratio: 16 / 9;
                            height: 100%;
                            position: absolute;
                            top: 0px;
                            left: 0px;
                        "
                    ></video>
                    <div
                        v-if="antennaStatus"
                        @click="antennaInfoStatus = !antennaInfoStatus"
                        :title="t('안테나 정보')"
                        id="antennaStauts"
                        class="cursor-pointer"
                    >
                        <img
                            v-if="antennaStep == 1"
                            src="@/assets/images/calling/ic_antenna_1.png"
                        />
                        <img
                            v-else-if="antennaStep == 2"
                            src="@/assets/images/calling/ic_antenna_2.png"
                        />
                        <img
                            v-else-if="antennaStep == 3"
                            src="@/assets/images/calling/ic_antenna_3.png"
                        />
                        <img
                            v-else-if="antennaStep == 4"
                            src="@/assets/images/calling/ic_antenna_4.png"
                        />
                        <img
                            v-else-if="antennaStep == 5"
                            src="@/assets/images/calling/ic_antenna_5.png"
                        />
                    </div>
                    <div
                        v-if="antennaInfoStatus && antennaStatus"
                        class="antennaDetailInfoBox"
                    >
                        <div class="resolutionBox">
                            <span>Resolution :&nbsp;</span>
                            <span class="antennaDetailValue"
                                >{{ calcResolution }} <br
                            /></span>
                        </div>
                        <div class="frameBox">
                            <span>Video Frames :&nbsp;</span>
                            <span class="antennaDetailValue">{{ calcFrame }} <br /></span>
                        </div>
                        <div class="bitrateBox">
                            <span>Video bitrate :&nbsp;</span>
                            <span class="antennaDetailValue">{{ calcBitrate }}</span>
                        </div>
                    </div>
                    <div
                        v-if="streamInfoStatus && isGlassSelected"
                        class="selectBoxDetailInfoBox"
                    >
                        <div
                            @click="changeStreamMode(1)"
                            class="selectBoxDetailInfoBoxHD"
                            :class="{ selected: streamMode == 1 }"
                        >
                            <button class="selectBoxDetailInfoCheckBoxHDPlus">
                                <img
                                    v-if="streamMode == 1"
                                    src="@/assets/images/calling/ic_check_hd.png"
                                />
                                <div
                                    v-else
                                    style="width: 12px; height: 12px"
                                    class="emptySpace"
                                ></div>
                            </button>
                            <button class="selectBoxDetailInfoBoxBtn">
                                <span>1080p</span>
                            </button>
                            <button class="selectBoxDetailInfoBoxBtnHDplusImg">
                                <img src="@/assets/images/calling/ic_hdp.png" />
                            </button>
                        </div>
                        <div
                            @click="changeStreamMode(0)"
                            class="selectBoxDetailInfoBoxHD"
                            :class="{ selected: streamMode == 0 }"
                        >
                            <button class="selectBoxDetailInfoCheckBoxHD">
                                <img
                                    v-if="streamMode == 0"
                                    src="@/assets/images/calling/ic_check_hd.png"
                                />
                                <div
                                    v-else
                                    style="width: 12px; height: 12px"
                                    class="emptySpace"
                                ></div>
                            </button>
                            <button class="selectBoxDetailInfoBoxBtn">
                                <span>720p</span>
                            </button>
                        </div>
                    </div>
                    <div v-if="mainVideoFullScreenText" class="fullScreenGuidance">
                        <img src="@/assets/images/calling/alarm_fullscreen.png" />
                        <div class="guidBox">
                            <img
                                src="@/assets/images/calling/Iic_fullscreen.png"
                                class="fullScreenIcon"
                            />
                            <span class="fullScreenGuidText"
                                >&nbsp; {{ t("전체화면 버튼을 눌러주세요") }}</span
                            >
                        </div>
                    </div>
                    <div v-if="!isDrawing" class="user-name main">
                        {{ userListStatus[getMainVideoIdx].nickname }}
                    </div>
                    <div
                        v-if="pdfUploading"
                        :style="{ right: antennaStatus ? '50px' : '10px' }"
                        id="pdfProgress"
                    >
                        <span class="pdfUploadText">{{ t("서버 업로드 중") }}</span>
                        <div style="width: 92px" class="progressBar">
                            <div
                                :style="{ width: pdfUploadProgrss + '%' }"
                                class="guage"
                            ></div>
                            <p>{{ pdfUploadProgrss }} %</p>
                        </div>
                    </div>
                    <div v-if="isGlassSelected" id="selectBox">
                        <button
                            v-if="streamMode == 0"
                            @click="streamInfoStatus = !streamInfoStatus"
                        >
                            <img
                                v-if="!streamInfoStatus"
                                src="@/assets/images/calling/ic_set.png"
                            />
                            <img
                                v-else="streamInfoStatus"
                                src="@/assets/images/calling/ic_set_2.png"
                            />
                        </button>
                        <button
                            v-else-if="streamMode == 1"
                            @click="streamInfoStatus = !streamInfoStatus"
                        >
                            <img
                                v-if="!streamInfoStatus"
                                src="@/assets/images/calling/ic_set_hd.png"
                            />
                            <img
                                v-else="streamInfoStatus"
                                src="@/assets/images/calling/ic_set_hd_2.png"
                            />
                        </button>
                    </div>
                    <div v-if="drawingIframe" class="drawing-iframe">
                        <slot></slot>
                    </div>
                    <div
                        v-if="mainVideoFullScreen && !drawingIframe"
                        @click="mainVideoFull"
                        style="z-index: 2"
                        class="mainVideoFullScreen"
                    >
                        <img src="@/assets/images/calling/Iic_fullscreen.png" />
                    </div>
                    <div
                        v-show="
                            laserPointerShow &&
                            !drawingIframe &&
                            callingLayoutType != 1 &&
                            !commonStore.isShare
                        "
                        id="laserCircle"
                        class="laserCircle"
                    ></div>
                    <div
                        v-show="
                            laserPointerShow &&
                            !drawingIframe &&
                            callingLayoutType != 1 &&
                            !commonStore.isShare
                        "
                        id="laserPointer"
                        class="laserPointer"
                    ></div>
                </div>
            </div>
            <div
                v-show="(motionFallFlag || motionNoMoveFlag) && mapData.isMapOnOff"
                id="gpsView"
                class="gpsView row justify-center items-center"
            >
                <div class="mapTitleBar row justify-between items-center">
                    <span class="mapTitle">{{ t("사고자 위치 확인") }}</span>
                    <div class="mapTitleImg">
                        <button
                            v-if="accessDeviceCheck != 'Mobile'"
                            @click="mapChange"
                            class="mapSmallBtn"
                        >
                            <img
                                v-if="mapData.isMapBigWindow == true"
                                src="@/assets/images/calling/map/ic_minimize.png"
                            />
                            <img
                                v-else
                                src="@/assets/images/calling/map/ic_fullscreen.png"
                            />
                        </button>
                        <button @click="mapClose" class="mapCloseBtn">
                            <img src="@/assets/images/calling/map/bt_close.png" />
                        </button>
                    </div>
                </div>
                <GpsMapView
                    :isBigWindow="mapData.isMapBigWindow"
                    :isOnOff="mapData.isMapOnOff"
                ></GpsMapView>
            </div>
            <div v-show="motionFallFlag" id="fallAlarm" class="motionAlarm blinking">
                <div>
                    <img
                        src="@/assets/images/calling/ic_fall_76.png"
                        class="emergencyImg"
                    />
                    <span class="emergencyFont boldText"
                        >{{ t("motionAlarm Fall Text1") }}&nbsp;</span
                    >
                    <span class="emergencyFont">{{ t("motionAlarm Fall Text2") }}</span>
                </div>
                <div :key="fallInfoKey" class="userInfoWrap">
                    <div @click="motionFallInfoClick(fallInfoKey)" class="userInfoBtn">
                        <div class="userInfo">{{ fallInfo?.nickname }}</div>
                        <div class="userInfoTime">{{ fallInfo?.datetime }}</div>
                    </div>
                </div>
                <button
                    v-show="myGpsList"
                    @click="mapOpen"
                    class="fallMapButton row items-center justify-center"
                >
                    <img
                        style="padding-right: 4px"
                        src="@/assets/images/calling/map/ic_position.png"
                    />
                    <span>{{ t("사고자 위치") }}</span>
                </button>
                <button @click="motionFallClose" class="emergencyBtn">
                    {{ t("confirm") }}
                </button>
            </div>
            <div v-show="motionNoMoveFlag" id="noMoveAlarm" class="motionAlarm blinking">
                <div>
                    <img
                        src="@/assets/images/calling/ic_moving_70.png"
                        class="emergencyImg"
                    />
                    <span class="emergencyFont boldText"
                        >{{ t("motionAlarm noMove Text1") }}&nbsp;</span
                    >
                    <span class="emergencyFont">{{ t("motionAlarm Fall Text2") }}</span>
                </div>
                <div
                    v-for="(noMoveInfo, noMoveInfoKey) in motionNoMoveInfo"
                    :key="noMoveInfoKey"
                    class="userInfoWrap"
                >
                    <div
                        @click="motionNoMoveInfoClick(noMoveInfoKey)"
                        class="userInfoBtn row justify-between items-center"
                    >
                        <div class="userInfo">{{ noMoveInfo.nickname }}</div>
                        <div class="userInfoTime">{{ noMoveInfo.datetime }}</div>
                    </div>
                </div>
                <button
                    v-show="myGpsList"
                    @click="mapOpen"
                    :style="{ width: locale == 'en' ? '155px' : '130px' }"
                    class="noMoveMapButton row items-center justify-center"
                >
                    <img
                        style="padding-right: 4px"
                        src="@/assets/images/calling/map/ic_position.png"
                    />
                    <span>{{ t("사고자 위치") }}</span>
                </button>
            </div>
            <div v-if="props.compData.type == 'unstable'" :style="{ display: 'block' }">
                <div class="unstableWrap">
                    <img src="@/assets/images/calling/ic_video_send_158.png" />
                </div>
                <div class="unstableText">
                    {{ t("call Unstable1") }}
                </div>
                <div class="unstableText">
                    {{ t("call Unstable2") }}
                </div>
            </div>
            <div v-else-if="props.compData.type == 'videoOFF'" class="status video-off">
                <div>
                    <img src="@/assets/images/calling/ic_photo_140.png" />
                </div>
            </div>
        </div>
        <div v-else-if="props.compData && props.compData?.status == 'my'"></div>
        <div
            v-else-if="props.compData && props.compData?.status == 'sending'"
            class="status sending"
        >
            <div>
                <img
                    src="@/assets/images/calling/ic_call-send-1.png"
                    class="status img"
                />
                <p class="sendingSpan">{{ t("발신 중") }}</p>
            </div>
        </div>
        <div
            v-else-if="props.compData && props.compData?.status == 'receive'"
            class="status receive"
        >
            <div>
                <img
                    src="@/assets/images/calling/ic_call-send-1.png"
                    class="status img"
                />
                <div class="button-container">
                    <button @click="setMultiCalling(1)" class="accept-btn">
                        {{ t("accept") }}
                    </button>
                    <button
                        @click="(setMultiCalling(0), setDeclineStatus())"
                        class="decline-btn"
                    >
                        {{ t("decline") }}
                    </button>
                </div>
                <span class="status-text">{{ t("receiving") }}</span>
            </div>
        </div>
        <div
            v-else-if="props.compData && props.compData?.status == 'fail'"
            class="status fail"
        >
            <div>
                <img src="@/assets/images/calling/ic_popup_cal-3.png" class="big" />
                <div>
                    <p class="sendingSpanCallingLayoutType3">{{ t("fail1") }}</p>
                    <p class="sendingSpanCallingLayoutType3">{{ t("fail2") }}</p>
                </div>
            </div>
        </div>
        <div
            v-else-if="props.compData && props.compData?.status == 'other'"
            class="status other"
        >
            <div>
                <img src="@/assets/images/calling/ic_popup_cal-1.png" class="big" />
                <div>
                    <span class="sendingSpanCallingLayoutType3">{{ t("other1") }}</span>
                    <span class="sendingSpanCallingLayoutType3">{{ t("other2") }}</span>
                </div>
            </div>
        </div>
        <div
            v-else-if="props.compData && props.compData?.status == 'error'"
            class="status error"
        >
            <div>
                <img src="@/assets/images/calling/ic_popup_error-3.png" class="big" />
                <div>
                    <p class="sendingSpanCallingLayoutType3">{{ t("error1") }}</p>
                    <p class="sendingSpanCallingLayoutType3">{{ t("error2") }}</p>
                </div>
            </div>
        </div>
        <div
            v-else-if="props.compData && props.compData?.status == 'attach'"
            class="status attach"
        ></div>
        <div
            v-else-if="props.compData && props.compData?.status == 'connecting'"
            class="status connecting"
        >
            <div>
                <img src="@/assets/images/calling/ic_connect_68.png" class="status img" />
                <p class="sendingSpanCallingLayoutType3">{{ t("통화 연결 중") }}</p>
            </div>
        </div>
        <div
            v-else-if="props.compData && props.compData?.status == 'unstable'"
            class="status unstable"
        >
            <div>
                <img
                    src="@/assets/images/calling/ic_video_send_100.png"
                    class="status img"
                />
                <div>
                    <p class="longTypeText">{{ t("call Unstable1") }}</p>
                    <p class="sendingSpanCallingLayoutType3 longTypeText">
                        {{ t("call Unstable2") }}
                    </p>
                </div>
            </div>
        </div>
        <div
            v-else-if="props.compData && props.compData?.status == 'unpublished'"
            class="status unpublished"
        >
            <div @click="mainVideoImageChange()">
                <img
                    src="@/assets/images/calling/ic_photo_140.png"
                    class="callingLayout1-unpublished"
                />
            </div>
        </div>
        <div v-else-if="props.compData?.status == 2" class="status file">
            <div class="fileReceptionLayout1">
                <div>
                    <p>
                        {{ props.compData.fileReceiveInfo.fileSendNickname }}
                        {{ t("fileReceptionRequest1") }}
                    </p>
                    <p>
                        {{ t("fileReceptionRequest2") }}
                    </p>
                </div>
                <div class="button-container">
                    <button
                        @click="fileReceiveAccept(props.compData.text)"
                        style="background: #1c8eff"
                        class="accept-btn"
                    >
                        {{ t("accept") }}
                    </button>
                    <button
                        @click="fileReceiveDecline(props.compData.text)"
                        style="background: #464646"
                        class="cancel-btn"
                    >
                        {{ t("decline") }}
                    </button>
                </div>
            </div>
        </div>
        <div v-else-if="props.compData?.status == 3" class="status file">
            <div>
                <p class="fileReceivingText">{{ t("receivingFile") }}</p>
                <div class="prog">
                    <div
                        :style="{
                            width:
                                userListStatus[props.compData.userListIndex].rate + '%',
                        }"
                        id="progressing"
                        class="progs"
                    ></div>
                </div>
            </div>
        </div>
        <div v-else-if="props.compData?.status == 5" class="status file">
            <div>
                <img src="@/assets/images/ic_complete_3.png" class="status img" />
                <p>
                    {{ t("fileReceptionComplete") }}
                </p>
            </div>
        </div>
        <div v-else-if="props.compData?.status == 6" class="status file">
            <div>
                <img src="@/assets/images/ic_complete_3.png" class="status img" />
                <div>
                    <p>{{ fileSendNickname }} {{ t("fileCancel text1") }}</p>
                    <p>{{ t("fileCancel text2") }}</p>
                </div>
            </div>
        </div>
        <div v-else class="col-12 row justify-center empty">
            <img
                v-if="callingLayoutType == 1 || callingLayoutType == 2"
                src="@/assets/images/calling/ic_focus_2.png"
            />
            <img v-else src="@/assets/images/calling/ic_focus.png" />
            <slot></slot>
        </div>
        <div :class="props.compData.status == 'main' ? 'name-wrap main' : 'name-wrap'">
            <div
                v-if="
                    antennaStatus &&
                    callingLayoutType == 1 &&
                    getMainVideoIdx == props.compData.userListIndex
                "
                @click="antennaInfoStatus = !antennaInfoStatus"
                :title="t('antennaInfo')"
                id="antennaStauts"
                class="cursor-pointer"
            >
                <img
                    v-if="antennaStep == 1"
                    src="@/assets/images/calling/ic_antenna_1.png"
                />
                <img
                    v-else-if="antennaStep == 2"
                    src="@/assets/images/calling/ic_antenna_2.png"
                />
                <img
                    v-else-if="antennaStep == 3"
                    src="@/assets/images/calling/ic_antenna_3.png"
                />
                <img
                    v-else-if="antennaStep == 4"
                    src="@/assets/images/calling/ic_antenna_4.png"
                />
                <img
                    v-else-if="antennaStep == 5"
                    src="@/assets/images/calling/ic_antenna_5.png"
                />
            </div>
            <div
                v-if="
                    antennaInfoStatus &&
                    antennaStatus &&
                    callingLayoutType == 1 &&
                    getMainVideoIdx == props.compData.userListIndex
                "
                class="antennaDetailInfoBox"
            >
                <div class="resolutionBox">
                    <span>Resolution :&nbsp;</span>
                    <span class="antennaDetailValue">{{ calcResolution }} <br /></span>
                </div>
                <div class="frameBox">
                    <span>Video Frames :&nbsp;</span>
                    <span class="antennaDetailValue">{{ calcFrame }} <br /></span>
                </div>
                <div class="bitrateBox">
                    <span>Video bitrate :&nbsp;</span>
                    <span class="antennaDetailValue">{{ calcBitrate }}</span>
                </div>
            </div>
            <div
                v-if="
                    isGlassSelected &&
                    callingLayoutType == 1 &&
                    getMainVideoIdx == props.compData.userListIndex
                "
                id="selectBox"
            >
                <button
                    v-if="streamMode == 0"
                    @click="streamInfoStatus = !streamInfoStatus"
                >
                    <img
                        v-if="!streamInfoStatus"
                        src="@/assets/images/calling/ic_set.png"
                    />
                    <img
                        v-else="streamInfoStatus"
                        src="@/assets/images/calling/ic_set_2.png"
                    />
                </button>
                <button
                    v-else-if="streamMode == 1"
                    @click="streamInfoStatus = !streamInfoStatus"
                >
                    <img
                        v-if="!streamInfoStatus"
                        src="@/assets/images/calling/ic_set_hd.png"
                    />
                    <img
                        v-else="streamInfoStatus"
                        src="@/assets/images/calling/ic_set_hd_2.png"
                    />
                </button>
            </div>
            <div
                v-if="
                    streamInfoStatus &&
                    isGlassSelected &&
                    callingLayoutType == 1 &&
                    getMainVideoIdx == props.compData.userListIndex
                "
                class="selectBoxDetailInfoBox"
            >
                <div
                    @click.stop="changeStreamMode(1)"
                    class="selectBoxDetailInfoBoxHD"
                    :class="{ selected: streamMode == 1 }"
                >
                    <button class="selectBoxDetailInfoCheckBoxHDPlus">
                        <img
                            v-if="streamMode == 1"
                            src="@/assets/images/calling/ic_check_hd.png"
                        />
                        <div
                            v-else
                            style="width: 12px; height: 12px"
                            class="emptySpace"
                        ></div>
                    </button>
                    <button class="selectBoxDetailInfoBoxBtn">
                        <span>1080p</span>
                    </button>
                    <button class="selectBoxDetailInfoBoxBtnHDplusImg">
                        <img src="@/assets/images/calling/ic_hdp.png" />
                    </button>
                </div>
                <div
                    @click.stop="changeStreamMode(0)"
                    class="selectBoxDetailInfoBoxHD"
                    :class="{ selected: streamMode == 0 }"
                >
                    <button class="selectBoxDetailInfoCheckBoxHD">
                        <img
                            v-if="streamMode == 0"
                            src="@/assets/images/calling/ic_check_hd.png"
                        />
                        <div
                            v-else
                            style="width: 12px; height: 12px"
                            class="emptySpace"
                        ></div>
                    </button>
                    <button class="selectBoxDetailInfoBoxBtn">
                        <span>720p</span>
                    </button>
                </div>
            </div>
        </div>
        {{ props.videoTag }}
    </div>
</template>

<script setup>
import {
    ref,
    reactive,
    computed,
    onMounted,
    onBeforeUnmount,
    watch,
    nextTick,
} from "vue";
// --- Component Imports ---
import Drawing from "@/components/pages/call/drawing/Drawing.vue";
import GpsMapView from "@/components/pages/call/GpsMapView.vue";
import { useCommonStore } from "@/stores";
import { useCached } from "@vueuse/core";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";
import { useNuxtApp } from "nuxt/app";
const { locale, t } = useI18n();

// --- Props Definition ---
const props = defineProps({
    compData: {
        type: Object,
        required: true,
    },
    id: {
        // id 프롭스 정의 시작
        type: String, // 타입은 문자열
        required: true, // 이 프롭스는 필수
    },
});

// --- Reactive Data (replacing Vue 2's data()) ---
const sessionNickname = ref("");
const fileStatus = ref(true);
const fileReceiveStatus = ref(1);
const antennaInfoStatus = ref(false);
const headerHeight = ref(64);
const mapData = reactive({
    isMapBigWindow: true,
    isMapOnOff: false,
    firstEmergency: true,
});
const streamInfoStatus = ref(false);
const fileReceptionRate = ref(0);

// --- Computed Properties (replacing Vue 2's computed) ---
const videoCallHost = computed(() => chattingStore.videoCallHost);
const callingUser = computed(() => commonStore.callingUser);
const callingLayoutType = computed(() => commonStore.callingLayoutType);
const fileSendStatusComputed = computed(() => commonStore.fileSendStatus); // Renamed to avoid conflict with reactive data
const ReceptionRate = computed(() => callStore.ReceptionRate);
const fileSendNickname = computed(() => commonStore.fileSendNickname);
const drawingIframe = computed(() => callStore.drawingIframe);
const antennaStep = computed(() => callStore.antennaStep);
const calcBitrate = computed(() => callStore.calcBitrate);
const calcFrame = computed(() => callStore.calcFrame);
const calcResolution = computed(() => callStore.calcResolution);
const antennaStatus = computed(() => callStore.antennaStatus);
const mainVideoFullScreen = computed(() => callStore.mainVideoFullScreen);
const mainVideoFullScreenText = computed(() => callStore.mainVideoFullScreenText);
const pdfUploading = computed(() => callStore.pdfUploading);
const pdfUploadProgrss = computed(() => callStore.pdfUploadProgrss);
const laserPointerShow = computed(() => callStore.laserPointerShow);
const accessDeviceCheck = computed(() => commonStore.accessDeviceCheck);
const isDrawing = computed(() => commonStore.isDrawing);
const motionFallFlag = computed(() => callStore.motionFallFlag);
const motionFallInfo = computed(() => callStore.motionFallInfo);
const motionNoMoveFlag = computed(() => callStore.motionNoMoveFlag);
const motionNoMoveInfo = computed(() => callStore.motionNoMoveInfo);
const otherGpsList = computed(() => callStore.otherGpsList);
const myGpsList = computed(() => callStore.myGpsList);
const emergencyId = computed(() => callStore.emergencyId);
const streamMode = computed(() => callStore.streamMode);
const isGlassSelected = computed(() => callStore.isGlassSelected);
const enterenceCheck = computed(() => callStore.enterenceCheck);
const onlyVoiceID = computed(() => callStore.onlyVoiceID);
const userListStatus = computed(() => commonStore.userListStatus);

const getChattingShow = computed(() => chattingStore.chattingShow);
const getIsDrawing = computed(() => commonStore.isDrawing);
const getIsShare = computed(() => commonStore.isShare);
const getMainVideoIdx = computed(() => commonStore.mainVideoIndex);

const mainVideoStream = computed(() => callStore.videoStreamArray[getMainVideoIdx.value]);
const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();

const videoResize = () => {
    const mainContent = document.getElementById("mainVideo");
    const target = document.getElementById("videoMainDivWrap");
    if (mainContent && target) {
        const clientHeight = mainContent.clientHeight;
        const clientWidth = mainContent.clientWidth;

        target.style.width = "inherit";
        target.style.height = "auto";
    }
};

const getMainVideoIndex = () => {
    if (!isDrawing.value && !getIsShare.value) {
        // Use .value for refs
        commonStore.setMainVideoInfo(props.compData.userListIndex);
    }
};

const changeMainVideo = (index) => {
    let element;
    if (
        commonStore.userListStatus[index]?.status === "none" ||
        commonStore.userListStatus[index]?.status === "unpublished" ||
        index === ""
    ) {
        element = document.getElementById("myvideo");
    } else {
        element = document.getElementById("remotevideo" + commonStore.mainVideoInfo);
    }
    element?.click();
};

const windowClick = () => {
    props.compData.isClicked = !props.compData.isClicked;
};

const soundedClick = () => {
    props.compData.isSounded = !props.compData.isSounded;
};

const setMultiCalling = (multiCallingResult) => {
    callStore.setMultiCallingResult(multiCallingResult);
};

const cancelCallClick = () => {
    callStore.setCancelCallResult(true);
};

const setErrorClose = () => {
    callStore.setErrorClose(true);
};

const mainVideoImageChange = (event) => {
    if (videoCallHost.value) {
        let elementID = event.target.parentElement?.parentElement?.id;
        let mainIndex = elementID?.split("videoremote");

        if (!elementID) {
            return;
        } else if (elementID === "videolocal") {
            callStore.setVideoMainIndex(0);
        } else {
            callStore.setVideoMainIndex(mainIndex[1]);
        }
        callStore.setMainVideoImage({
            text: props.compData.text,
            type: "OFF",
        });
    }
};

const muteIconClick = (e) => {
    let videoRemoteIndex = "";
    if (e.target.offsetParent?.offsetParent?.attributes[2] === undefined) {
        videoRemoteIndex = e.target.offsetParent?.attributes[2]?.value;
    } else {
        videoRemoteIndex = e.target.offsetParent.offsetParent.attributes[2].value;
    }

    callStore.setForceMicMuteIndex("");
    callStore.setForceMicMuteIndex(videoRemoteIndex);
    callStore.setForceMicMuteBtnClick(true);
};

const forceLeaveClick = (e) => {
    let videoRemoteIndex = "";
    if (e.target.offsetParent?.offsetParent?.attributes[2] === undefined) {
        videoRemoteIndex = e.target.offsetParent?.attributes[2]?.value;
    } else {
        videoRemoteIndex = e.target.offsetParent.offsetParent.attributes[2].value;
    }

    callStore.setForceLeaveIndex("");
    callStore.setForceLeaveIndex(videoRemoteIndex);
    callStore.setForceLeaveBtnClick(true);
};

const fileReceiveAccept = (userName) => {
    commonStore.setReceiveFileResFlag({ flag: true, selectedUserName: userName });
    commonStore.setFileSendStatus(3);
    commonStore.setFileSendFlag(true);
};

const fileReceiveDecline = (userName) => {
    commonStore.setReceiveFileResFlag({ flag: true, selectedUserName: userName });
    commonStore.setFileSendStatus(4);
    commonStore.setFileSendFlag(true);
};

const mainVideoFull = () => {
    const mainVideoElement = document.getElementById("videoMain");
    if (mainVideoElement && mainVideoElement.webkitRequestFullscreen) {
        mainVideoElement.webkitRequestFullscreen();
    }
};

const callingLayout1MainVideoFull = (index) => {
    let mainVideoElement = "";
    if (index === 0) {
        mainVideoElement = document.getElementById("myvideo");
    } else {
        const remoteFeedName = "remotevideo" + index;
        mainVideoElement = document.getElementById(remoteFeedName);
    }
    if (mainVideoElement && mainVideoElement.webkitRequestFullscreen) {
        mainVideoElement.webkitRequestFullscreen();
    }
};

const motionNoMoveInfoClick = (noMoveInfoIndex) => {
    callStore.setMotionNoMoveClickIndex(noMoveInfoIndex);
};

const motionFallInfoClick = (fallInfoIndex) => {
    callStore.setMotionFallClickIndex(fallInfoIndex);
};

const motionFallClose = () => {
    callStore.setMotionFallCloseBtnClick(true);
    mapData.isMapOnOff = false;
};

const mapOpen = () => {
    mapData.isMapOnOff = !mapData.isMapOnOff;
};

const mapClose = () => {
    mapData.isMapOnOff = false;
};

const mapChange = () => {
    const gpsView = document.getElementById("gpsView");
    if (!gpsView) return;

    if (mapData.isMapBigWindow) {
        mapData.isMapBigWindow = false;
        gpsView.style.bottom = "0";
        gpsView.style.right = "0";
        gpsView.style.width = "50%";
        gpsView.style.height = "50%";
    } else {
        mapData.isMapBigWindow = true;
        gpsView.style.bottom = "";
        gpsView.style.right = "";
        gpsView.style.width = "100%";
        gpsView.style.height = "100%";
    }
};

const changeStreamMode = (type) => {
    if (streamMode.value !== type) {
        callStore.setStreamModeFlag(true);
        callStore.setPrepareStreamMode(type);
    }
    streamInfoStatus.value = false;
};

const setDeclineStatus = () => {
    callStore.setDeclineStatus();
};

const changeNickName = (res, event) => {
    const maxLoop = commonStore.roomNumberCount;
    const userList = commonStore.userListStatus;
    let userListIndex;
    for (let iLoop = 0; iLoop < maxLoop; ++iLoop) {
        if (userList[iLoop].text === res.text) {
            userListIndex = iLoop;
            break;
        }
    }
    const params = {
        index: userListIndex,
        nickname: event.target.value,
    };
    commonStore.setUserNickname(params);

    if (userList[userListIndex]?.text === userList[maxLoop - 1]?.text) {
        const mainParams = {
            index: maxLoop - 1,
            nickname: event.target.value,
        };
        commonStore.setUserNickname(mainParams);
    }
};

// --- Lifecycle Hooks (replacing Vue 2's mounted, beforeDestroy) ---
onMounted(() => {
    // Dynamic style import might need a different approach in Nuxt 3 if not directly supported by Webpack/Vite
    // Consider moving this to a global stylesheet or importing statically.
    // require(`@/assets/styles/${sessionStorage.getItem("displayMode")}/components/call/callingLayout/callingWindow.sass`);

    callingLayoutType.value = commonStore.callingLayoutType;
    sessionNickname.value = sessionStorage.getItem("m_nickname");

    const headerElement = document.getElementsByClassName("header")[0];
    if (headerElement) {
        headerHeight.value = headerElement.clientHeight;
    }

    videoResize();

    // const videolocalElement = document.getElementById("videolocal");
    // if (videolocalElement && videolocalElement.childNodes[5]) {
    //     videolocalElement.childNodes[5].style.display = "none"; // Type assertion for TypeScript
    // }

    // Laser Pointer Event Creation
    if (callingLayoutType.value !== 1 && props.compData?.status === "main") {
        const videoMainElement = document.getElementById("videoMain");
        if (videoMainElement) {
            // You'll likely need to replace jQuery usage here with pure JS or a modern library if needed
            // const laserPointerJQuery = $("#laserPointer"); // <-- Replace this

            videoMainElement.addEventListener("click", (e) => {
                if (!videoCallHost.value || getIsShare.value || getIsDrawing.value) {
                    return;
                }

                const laserPointer = document.getElementById("laserPointer");
                const laserCircle = document.getElementById("laserCircle");

                if (!laserPointer || !laserCircle) return; // Ensure elements exist

                const setX = e.offsetX;
                const setY = e.offsetY;

                // This part needs adjustment if you remove jQuery.
                // You'll need to get the width/height of laserPointer using native DOM methods.
                const mainUserZoomLevel =
                    userListStatus.value[callStore.videoMainIndex]?.zoomLevel || 1; // Default to 1

                let offsetX = setX - laserPointer.offsetWidth / mainUserZoomLevel / 2;
                let offsetY = setY - laserPointer.offsetHeight / mainUserZoomLevel / 2;

                const elementWidth = videoMainElement.offsetWidth;
                const elementHeight = videoMainElement.offsetHeight;

                let xLocationPercent = ((offsetX / elementWidth) * 100).toFixed(1);
                let yLocationPercent = ((offsetY / elementHeight) * 100).toFixed(1);

                if (parseFloat(xLocationPercent) >= 50) {
                    xLocationPercent = (
                        (parseFloat(xLocationPercent) - 50) * mainUserZoomLevel +
                        50
                    ).toFixed(1);
                } else {
                    xLocationPercent = (
                        50 -
                        (50 - parseFloat(xLocationPercent)) * mainUserZoomLevel
                    ).toFixed(1);
                }

                if (parseFloat(yLocationPercent) >= 50) {
                    yLocationPercent = (
                        (parseFloat(yLocationPercent) - 50) * mainUserZoomLevel +
                        50
                    ).toFixed(1);
                } else {
                    yLocationPercent = (
                        50 -
                        (50 - parseFloat(yLocationPercent)) * mainUserZoomLevel
                    ).toFixed(1);
                }

                laserPointer.style.left = `${xLocationPercent}%`;
                laserPointer.style.top = `${yLocationPercent}%`;

                laserCircle.style.left = `${xLocationPercent}%`;
                laserCircle.style.top = `${yLocationPercent}%`;

                callStore.setLaserPointerLaction({
                    x: (parseFloat(xLocationPercent) / 100).toFixed(3),
                    y: (parseFloat(yLocationPercent) / 100).toFixed(3),
                });
                callStore.setLaserPointerFlag(true);
                callStore.setLaserPointerShow(true);

                laserCircle.classList.remove("laserCircle");
                laserPointer.classList.remove("laserPointer");

                setTimeout(() => {
                    laserCircle.classList.add("laserCircle");
                    laserPointer.classList.add("laserPointer");
                }, 50);
            });
        }
    }

    window.addEventListener("resize", videoResize);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", videoResize);
    callStore.setEnterenceCheck(0);
});

// --- Watchers (replacing Vue 2's watch) ---
watch(getChattingShow, () => {
    videoResize();
});

watch(
    userListStatus,
    (newVal, beforeVal) => {
        // Original console.logs commented out for clarity
    },
    { deep: true },
);

watch(motionFallInfo, (newVal) => {
    const mql = window.matchMedia("(max-height: 483px)");
    let percent = 20;
    let plus = 5;
    if (mql.matches) {
        percent = 35;
        plus = 6;
    }
    if (motionFallFlag.value && !motionNoMoveFlag.value) {
        if (callingLayoutType.value !== 1) {
            nextTick(() => {
                const fallAlarm = document.getElementById("fallAlarm");
                if (fallAlarm) {
                    fallAlarm.style.height = `${percent + (newVal.length - 1) * plus}%`;
                }
            });
        }
    } else if (motionFallFlag.value && motionNoMoveFlag.value) {
        callStore.setMotionNoMoveFlag(false);
        callStore.setMotionFallFlag(true);
    } else if (!motionFallFlag.value) {
        if (callStore.motionNoMoveInfo.length > 0) {
            callStore.setMotionNoMoveFlag(true);
        } else {
            callStore.setMotionNoMoveFlag(false);
        }
    }
});

watch(motionNoMoveInfo, (newVal) => {
    const mql = window.matchMedia("(max-height: 483px)");
    let percent = 20;
    let plus = 5;
    if (mql.matches) {
        percent = 35;
        plus = 6;
    }
    if (motionNoMoveFlag.value && !motionFallFlag.value) {
        if (callingLayoutType.value !== 1) {
            nextTick(() => {
                const noMoveAlarm = document.getElementById("noMoveAlarm");
                if (noMoveAlarm) {
                    noMoveAlarm.style.height = `${percent + (newVal.length - 1) * plus}%`;
                }
            });
        }
    } else if (motionFallFlag.value && motionNoMoveFlag.value) {
        const fallInfo = callStore.motionFallInfo[callStore.motionFallInfo.length - 1];
        const noMoveInfo =
            callStore.motionNoMoveInfo[callStore.motionNoMoveInfo.length - 1];

        if (fallInfo.datetimeUTC > noMoveInfo.datetimeUTC) {
            callStore.setMotionFallFlag(true);
            callStore.setMotionNoMoveFlag(false);
        } else {
            callStore.setMotionNoMoveFlag(true);
            callStore.setMotionFallFlag(false);
        }
    } else if (!motionNoMoveFlag.value) {
        if (callStore.motionFallInfo.length > 0) {
            callStore.setMotionFallFlag(true);
        } else {
            callStore.setMotionFallFlag(false);
        }
    }
});

watch(emergencyId, (newVal) => {
    if (mapData.firstEmergency) {
        mapData.firstEmergency = false;
        const json = {
            type: 0,
            is: true,
            deviceid: newVal,
        };
        callStore.setGpsListEvent(json);
    }
});

watch(drawingIframe, () => {
    videoResize();
});

watch(getIsDrawing, (res) => {
    if (!res) {
        setTimeout(() => {
            changeMainVideo(commonStore.mainVideoInfo);
        });
    }
});

watch(getIsShare, (res) => {
    if (!res) {
        setTimeout(() => {
            changeMainVideo(commonStore.mainVideoInfo);
        });
    }
});

watch(getMainVideoIdx, (res) => {
    if (commonStore.callingLayoutType === 1 && !isDrawing.value && !getIsShare.value) {
        commonStore.setMainVideoInfo(res);
    }

    if (commonStore.callingLayoutType !== 1) {
        const mainVideoEle = document.getElementById("videoMain");
        console.log(callStore.videoStreamArray[res]);
        mainVideoEle.srcObject = callStore.videoStreamArray[res];
    }
});
</script>

<style lang="scss" scoped>
$windowInfoBarHeight: 30px;

.window {
    width: 100%;
    height: 100%;
    position: relative;
    // align-items: centerb
    // display: table

    > button {
        width: 100%;
        height: 100%;

        > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &.draw {
        overflow: initial;
    }

    &.video {
        overflow: hidden;
    }
}

#videoMainDiv {
    height: -webkit-fill-available;
}
#videoMainDiv.drawing {
    height: calc(100% - 94px);
}
.mainVideoBorder {
    border: 3px solid #fff;
    box-sizing: border-box;
}

.panel-inner {
    overflow: hidden;
    position: relative;
}
.border {
    width: 100%;
    height: 100%;

    > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    > span {
        position: absolute;
        top: 0;
        font-size: 9px;
        padding-left: 3px;
        padding-right: 6px;
    }
}

.sending,
.receive {
    width: 100%;
    height: 100%;
    > .windowInfoBar {
        > span {
            padding-left: 0;
        }
    }
}

.sending > .windowInfoBar {
    padding-right: 1px;
    z-index: 2;
    position: right;
    position: absolute;
    box-sizing: border-box;
    text-align: right;
    bottom: -2px;
}

.receiveBackground {
    background: transparent linear-gradient(119deg, #c623d2 0%, #004cff 100%) 0% 0%
        no-repeat padding-box;
}

.sendingBackground,
.receiveBackground,
.otherBackground {
    width: 100% !important;
    height: calc(100% - 34px);
    /* max-width: inherit !important; */
    /* max-height: inherit; */
    /* padding-bottom: 30px; */
    display: flex;
    flex: column;
    /* flex-direction: column; */
    align-items: center;
    justify-content: center;
    gap: 15px;

    > .buttonsLayout1 {
        margin-top: 35px;
        button + button {
            margin-left: 18px;
        }
    }
    > .buttonsLayout3 {
        margin-top: 5px;
        gap: 10px;
        > img {
            width: 50px;
        }
        button + button {
            margin-left: 18px;
        }
    }

    > .sendingSpan,
    > .receiveSpan {
        color: #fff;
        position: absolute;
        top: 23px;
        right: 23px;
        font-size: 14px;
    }

    > .sendingSpanCallingLayoutType3 {
        font-size: 15px;
        /* padding-left: 20px; */
    }

    > .receiveBtnCallingLayoutType3 {
        width: 60px;
        height: 26px;
        margin-left: 5px;
        font-size: 14px;
        border-radius: 20px;
        color: #fff;
        background-color: #1c8eff;
        > button {
            color: #fff;
        }
    }

    > .receiveBtnCallingLayoutType4 {
        width: 60px;
        height: 26px;
        margin-left: 10px;
        font-size: 14px;
        border-radius: 20px;
        color: #fff;
        background-color: #e600d7;
    }
}

.receiveBackground {
    flex-direction: column;
}

#antennaStauts {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
}

.antennaDetailInfoBox {
    width: auto;
    min-width: 157px;
    height: auto;
    position: absolute;
    right: 10px;
    top: 46px;
    font-size: 14px;
    padding: 9px;
    display: grid;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;

    > div {
        > .antennaDetailValue {
            font-size: 13px;
            opacity: 0.85;
            margin-top: 1px;
        }
    }
}

.videoMainDivWrap {
    width: inherit;
    height: inherit;
    aspect-ratio: 16 / 9;
    .nickname {
        bottom: 3px;
        padding-left: 4px;
    }
}

.videoNameWrap {
    position: absolute;
    bottom: 3px;
    width: 100%;
    height: 30px;
    z-index: 1;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    line-height: 30px;
    padding-left: 10px;
}

.user-name-wrap {
    position: absolute;
    bottom: 0px;
    width: 100%;
    height: 30px;
    z-index: 1;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    line-height: 30px;
    padding-left: 10px;
    box-sizing: border-box;
}

#videoMain {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
}

.videoNameSpan {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 18px;
}

.unstableText {
    font-size: 25px;
    float: none;
    width: 100%;
    line-height: 50px;
}

.unstableWrap {
    width: 100%;
    padding-top: 150px;
    padding-bottom: 15px;
}

.hostIcon {
    position: absolute !important;
    top: 9px !important;
    left: 13px !important;
    z-index: 1 !important;
}

.motionFallIcon {
    position: absolute !important;
    right: 13px !important;
    top: 9px;
    z-index: 1 !important;
}

.motionNoMoveIcon {
    position: absolute !important;
    right: 40px !important;
    top: 9px;
    z-index: 1 !important;
}

.muteIcon {
    width: auto !important;
    height: auto !important;
    position: absolute;
    bottom: 7px;
    right: 32px;
    z-index: 1;
}

.chatMessageIcon {
    width: auto !important;
    height: auto !important;
    position: absolute;
    bottom: 7px;
    right: 68px;
    z-index: 1;
}

.msgMuteBtn {
    margin: auto !important;
}

.forceLeaveIcon {
    // width: auto !important
    // height: auto !important
    position: absolute;
    bottom: -1px;
    right: -2px;
    z-index: 1;
}

.forceLeaveBtn {
    height: 35px;
}

.userMuteIcon {
    position: absolute;
    top: 9px;
    left: 40px;
    z-index: 1;
}

.prog {
    padding: 5px auto !important;
    height: 20px;
    border-radius: 15px;
    width: 80%;
    border: 1px solid #3c3c3c;
}

.progs {
    text-align: center;
    line-height: 50px;
    border-radius: 15px;
    background-color: #1c8eff;
    height: 100%;
}

.receiveStatus {
    width: 100%;
    height: 100%;
    background-color: #151515;
    color: #fff;
}

.fileReceptionLayout1 {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    > p {
        font-size: 18px;
        margin: 0;
        margin-top: 14px;
    }

    img.fileReceptionComplete {
        width: 70px;
        margin: auto;
    }

    p.receptionCompleteText {
        font-size: 18px;
        margin: 0;
        margin-top: 28px;
    }

    p.fileReceivingText {
        font-size: 18px;
        margin: 0px;
    }
}

.fileReceptionLayout3 {
    width: 100%;
    height: 100%;

    img.fileReceptionComplete {
        margin: 0px 10px auto;
        padding-bottom: 10px !important;
    }

    p.receptionCompleteText {
        font-size: 13px !important;
        margin: auto !important;
    }

    p.fileReceivingText {
        font-size: 13px;
        margin: auto;
    }
}

.acceptbuttons {
    > img {
        width: 40px;
    }

    > button {
        color: #fff;
        width: 63px;
        height: 25px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        margin-top: 10px;

        &:nth-child(2) {
            margin-left: 10px;
        }

        &:last-child {
            margin-left: 8px;
        }
    }
}

.guidBox {
    position: absolute;
    top: 24px;
    left: 42px;

    > img {
        margin-top: 1px;
    }
}

.fullScreenGuidance {
    position: absolute;
    bottom: 20px;
    right: -8px;
    z-index: 0;
}

.mainVideoFullScreen {
    position: absolute;
    right: 12px;
    bottom: 4px;
    cursor: pointer;

    > img {
        width: 21px;
    }
}

#pdfProgress {
    position: absolute;
    top: 10px;
    right: 50px;
    height: 30px;
    margin-top: 1px;
    padding: 7px 6px;
    border-radius: 2px;
}

.pdfUploadText {
    font-size: 12px;
    margin-right: 5px;
}

.progressBar {
    width: 92px;
    opacity: 1;
    height: 16px;
    border-radius: 7px;
    padding-left: 1px;
    padding-right: 1px;

    > p {
        font-size: 12px;
        position: absolute;
        width: 100%;
        text-align: center;
    }
}

.guage {
    border-radius: 10px;
    height: 12px;
    margin-top: 2px;
    line-height: 15px;
}

.laserPointer {
    background-color: transparent;
    border: solid 3px #c81515;
    width: 30px;
    height: 30px;
    opacity: 0;
    border-radius: 50%;
    position: absolute;
    animation: blink 0.8s ease 6 reverse;
    animation-fill-mode: backwards;
}

@keyframes blink {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}

.laserCircle {
    position: absolute;
    content: "";
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: #c81515 solid 4px;
    opacity: 0;
    animation: fadeout 0.8s ease-in-out 6 reverse;
    animation-fill-mode: backwards;
}

@keyframes fadeout {
    from {
        width: 70px;
        height: 70px;
        transform: translate(-20px, -20px);
        opacity: 1;
        border: #c81515 solid 2px;
    }
    to {
        width: 30px;
        height: 30px;
        border: #c81515 solid 6px;
        opacity: 0;
    }
}

/* 모바일 가로, 테블릿 세로 (해상도 ~767px)*/
@media all and (max-width: 1023px) {
    .acceptbuttons {
        > img {
            width: 40px;
        }

        > button {
            width: 54px;
            height: 25px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            margin-left: 10px;

            &:nth-child(2) {
                margin-left: 10px;
            }

            &:last-child {
                margin-left: 5px;
            }
        }
    }
    .videoNameSpan {
        font-size: 16px;
    }
    .windowInfoBar {
        > span {
            font-size: 14px;
        }
    }

    .laserPointer {
        background-color: transparent;
        width: 20px;
        height: 20px;
        opacity: 0;
        border-radius: 50%;
        position: absolute;
        animation: blink 0.8s ease 6 reverse;
        animation-fill-mode: backwards;
    }

    @keyframes blink {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    .laserCircle {
        position: absolute;
        content: "";
        display: block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        opacity: 0;
        animation: fadeout 0.8s ease-in-out 6 reverse;
        animation-fill-mode: backwards;
    }

    @keyframes fadeout {
        from {
            width: 40px;
            height: 40px;
            transform: translate(-10px, -10px);
            opacity: 1;
            border: #c81515 solid 2px;
        }
        to {
            width: 20px;
            height: 20px;
            border: #c81515 solid 6px;
            opacity: 0;
        }
    }
}

.name-wrap {
    display: flex;
    justify-content: center;
    z-index: 1;
    width: 100%;
    height: auto;
}

.name-wrap.main {
    position: absolute;
}

.nickname {
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 30px;
    color: white;
    /* z-index: 1; */
    background: rgba(0, 0, 0, 0.3);
}

.nickname-text {
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 18px;
    color: white;
    background: transparent;
    border: none;
}

.mainVideoFullScreenBtn {
    position: absolute;
    right: 60px;
}

.motionAlarm {
    background: #ff1212;
    color: #fff;
    width: 100%;
    height: 20%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0px;
    z-index: 1;
    user-select: none;
    font-size: 24px;
        flex-direction: column;
    > div {
        align-items: center;
        display: flex;
        width: inherit;
        /* margin: auto; */
        justify-content: center;
    }
}

.motionAlarm-ly1 {
    width: inherit;
    height: auto;
    padding: 5px 0px;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0px;
    z-index: 1;
    user-select: none;
}

.blinking {
    -webkit-animation: blink 0.5s ease-in-out infinite alternate;
    -moz-animation: blink 0.5s ease-in-out infinite alternate;
    animation: blink 0.5s ease-in-out infinite alternate;
}

@-webkit-keyframes blink {
    0% {
        opacity: 0.6;
    }
    100% {
        opacity: 1;
    }
}

@-moz-keyframes blink {
    0% {
        opacity: 0.6;
    }
    100% {
        opacity: 1;
    }
}

@keyframes blink {
    0% {
        opacity: 0.6;
    }
    100% {
        opacity: 1;
    }
}

.emergencyImg {
    width: 70px;
    margin-right: 15px;
    height: 61px;
}

.emergencyImg-ly1 {
    max-height: 21px;
    margin-right: 10px;
}

.boldText {
    font-weight: bold;
}

.userInfoBtn {
    cursor: pointer;
    @media (min-height: 438px) {
        width: auto;
    }
    @media (max-height: 437px) {
        width: 41%;
    }
    height: 100%;
    padding-left: 2.192%;
    padding-right: 1.754%;
    border-radius: 12px;
    border: 1px solid #fff;
}

.emergencyBtn {
    position: absolute;
    top: 16px;
    right: 32px;
    border-radius: 20px;
    font: normal normal 800 16px / 21px NanumSquare;
    width: 60px;
    height: 26px;
    color: #fff;
    border: 1px solid #fff;
}

.emergencyBtn-ly1 {
    position: absolute;
    right: 14px;
    border-radius: 20px;
    font: normal normal 800 18px / 21px NanumSquare;
    @media (max-height: 1800px) {
        width: 45px;
        font-size: 16px;
    }
}

.gpsView {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 2;
}

.fallMapButton {
    position: absolute;
    top: 15px;
    right: 90px;
    border-radius: 20px;
    font: normal normal 800 16px / 21px NanumSquare;
    width: 130px;
    height: 26px;
    color: #fff;
}

.noMoveMapButton {
    position: absolute;
    top: 18px;
    right: 14px;
    @media (max-height: 483px) {
        left: 10px;
    }
    border-radius: 20px;
    font: normal normal 800 18px / 21px NanumSquare;
    width: 130px;
    height: 26px;
}

.mapTitleBar {
    width: 100%;
    height: 30px;

    .mapTitle {
        font: normal normal bold 14px / 20px NanumSquare;
        margin-left: 10px;
    }

    .mapSmallBtn {
        margin-right: 11px;
        width: 17px;
        height: 17px;
    }

    .mapCloseBtn {
        margin-right: 6px;
        width: 22px;
        height: 22px;
    }
}

#selectBox {
    position: absolute;
    top: 10px;
    right: 49px;
}

.selectBoxDetailInfoBox {
    position: absolute;
    top: 45px;
    right: 21px;
    width: 104px;
    height: 60px;
}

.selectBoxDetailInfoBoxHDplus,
.selectBoxDetailInfoBoxHD {
    width: 100%;
    height: 50%;
    background-color: #000;
    color: #fff;
}

.selectBoxDetailInfoBoxHD.selected {
    opacity: 0.65;
}

.selectBoxDetailInfoBoxBtnHDplusImg {
    position: absolute;
    top: 5px;
    right: 0px;
}

.selectBoxDetailInfoBoxBtn {
    > span {
        color: #fff;
    }
}

.selectBoxDetailInfoCheckBoxHDPlus {
    padding-left: 8px;
    padding-right: 6px;
}

.selectBoxDetailInfoCheckBoxHD {
    padding-left: 8px;
    padding-right: 14px;
}

#thumbnailTest {
    left: 0px !important;
    bottom: 0px !important;
}

.mode {
    width: 100%;
    height: 100%;
    color: #fff;
    padding-bottom: 10px;
}
.mode.unpublish {
    background: #000;
}
.mode.sending {
    color: #fff;
    background: transparent linear-gradient(119deg, #23d252, #006fff) 0 0 no-repeat
        padding-box;
}
.status-indicators {
    position: absolute;
    z-index: 1;
    left: 10px;
    top: 10px;
    display: flex;
    gap: 8px;
}

.drawing-iframe {
    position: absolute;
    left: 72px !important;
    /* bottom: 0px !important; */
    display: flex;
    width: calc(100% - 72px);
    right: 0px;
}

.windowInfoBar {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: $windowInfoBarHeight;
    z-index: 1;
}

.user-name {
    position: absolute;
    bottom: 0;
    color: #fff;
    background: rgba(0, 0, 0, 0.6);
    width: 100%;
    padding: 5px 0 5px 15px;
    display: flex;
    justify-content: space-between;
    &.main {
        padding: 7px 15px;
    }
    > div {
        display: flex;
        align-items: center;
    }
}
.layout1,
.layout3,
.layout4 {
    font-size: 16px;
}
.layout1 {
    font-size: 20px;
    p {
        margin: 0;
        color: #fff;
    }
    .status.img {
        width: 15%;
        height: 30%;
        max-width: 74px;
        max-height: 74px;
    }
    .status-text {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 14px;
        color: hsla(0, 0%, 100%, 0.50196);
    }
    .button-container {
        margin-top: 12px;
    }
}
.layout3 {
    font-size: 14px;
    p {
        margin: 0;
        color: #fff;
    }
    .status.img {
        width: 35px;
        height: 35px;
    }
    .status-text {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 12px;
        color: hsla(0, 0%, 100%, 0.50196);
    }
}

.layout4 {
    font-size: 14px;
    p {
        margin: 0;
        color: #fff;
    }
    .status.img {
        width: 35px;
        height: 35px;
    }
    .status-text {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 12px;
        color: hsla(0, 0%, 100%, 0.50196);
    }
}

.status {
    width: 100%;
    height: 100%;
    > div {
        height: calc(100% - 30px);
    }
    &.unpublished {
        background-color: #000;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            > img {
                width: 30%;
            }
        }
    }

    &.video-off {
        background-color: #000;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            > img {
                width: 30%;
                max-width: 150px;
            }
        }
    }

    &.unstable {
        background-color: #000;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
    }
    &.error {
        background-color: #000;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
    }
    &.other {
        background-color: #000;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
    }
    &.fail {
        background-color: #000;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
    }
    &.receive {
        background: transparent linear-gradient(119deg, #c623d2 0%, #004cff 100%) 0% 0%
            no-repeat padding-box;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 18px;
        }
    }
    &.sending {
        background: transparent linear-gradient(119deg, #23d252, #006fff) 0 0 no-repeat
            padding-box;
        > div {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 19px;
        }
    }
    &.connecting {
        background: transparent linear-gradient(119deg, #23d252, #006fff) 0 0 no-repeat
            padding-box;
        > div {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 19px;
        }
    }
    &.file {
        background: #000;
        > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 12px;
        }
    }
}

.button-container {
    display: flex;
    gap: 18px;
    button {
        padding: 5px 20px;
        border-radius: 15px;
    }
    button.accept-btn {
        color: #fff;
        background-color: #007bff;
    }
    button.decline-btn {
        color: #fff;
        background-color: #e600d7;
    }
    button.cancel-btn {
        color: #fff;
        background-color: #646464;
    }
}
</style>
