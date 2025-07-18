<template lang="html">
    <div
        :style="{ border: compData.status == 'none' ? '1px dashed #767676' : '' }"
        :class="[drawingIframe ? 'draw' : 'video']"
        @click="getMainVideoIndex"
        class="row window"
    >
        <button
            v-if="compData && compData.status == 'calling'"
            @mousedown="windowClick"
            class="col-12"
        >
            <img :src="compData.img" />
            <div class="row items-center windowInfoBar">
                <span class="col text-left">{{ compData.text }}</span>
                <button v-if="!compData.isSounded" @click="soundedClick" @mousedown.stop>
                    <img src="@/assets/images/ic_mic.png" />
                </button>
                <button
                    v-else-if="compData.isSounded"
                    @click="soundedClick"
                    @mousedown.stop
                >
                    <img src="@/assets/images/ic_mute.png" />
                </button>
            </div>
        </button>
        <div
            v-else-if="compData && compData.status == 'main'"
            :style="[
                accessDeviceCheck == 'Mobile'
                    ? { display: 'flex', 'align-item': 'center' }
                    : '',
                drawingIframe || compData.type == 'videoOFF' ? { height: 'inherit' } : '',
            ]"
            id="videoMainDivWrap"
            class="videoMainDivWrap"
        >
            <span id="videoMainName" style="display: none" class="col text-left">{{
                compData.text
            }}</span>
            <div
                v-if="!drawingIframe && callingLayoutType == 1"
                style="display: none"
                class="row items-center videoNameWrap"
            >
                <span
                    :value="compData.text"
                    id="videoMainCaption"
                    class="col text-left videoNameSpan"
                ></span>
            </div>
            <div
                :style="{ height: drawingIframe ? 'inherit' : '100%' }"
                id="videoMainDiv"
                style="aspect-ratio: 16 / 9.14"
                class="justify-center"
            >
                <div
                    :class="[drawingIframe ? 'screen-draw' : 'screen-video']"
                    id="panel-inner-main"
                >
                    <drawing
                        v-if="
                            this.$commonStore.contentsViewType == '2' &&
                            drawingIframe &&
                            callingLayoutType != 1
                        "
                        id="test11"
                        class="callingWidth"
                    ></drawing>
                    <video
                        v-show="!drawingIframe"
                        autoplay
                        muted="muted"
                        :style="{ height: !drawingIframe ? '100%' : '', maxHeight: '' }"
                        id="videoMain"
                        style="
                            aspect-ratio: 16 / 9.14;
                            background: black;
                            height: 100%;
                            position: absolute;
                            top: 0px;
                            left: 0px;
                        "
                    ></video>
                    <div
                        v-if="antennaStatus"
                        @click="antennaInfoStatus = !antennaInfoStatus"
                        :title="$t('antennaInfo')"
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
                        v-if="!drawingIframe"
                        class="row items-center videoNameWrap"
                    ></div>
                    <div
                        v-if="streamInfoStatus && isGlassSelected"
                        class="selectBoxDetailInfoBox row justify-center items-center"
                    >
                        <div
                            @click="changeStreamMode(1)"
                            :style="{
                                backgroundColor: streamMode == 0 ? '#000000' : '#282828',
                            }"
                            class="selectBoxDetailInfoBoxHDplus row"
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
                            :style="{
                                backgroundColor: streamMode == 1 ? '#000000' : '#282828',
                            }"
                            class="selectBoxDetailInfoBoxHD row"
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
                                >&nbsp; {{ $t("fullScreen guidText") }}</span
                            >
                        </div>
                    </div>
                    <div
                        v-if="pdfUploading"
                        :style="{ right: antennaStatus ? '50px' : '10px' }"
                        id="pdfProgress"
                    >
                        <span class="pdfUploadText">{{ $t("Server uploading") }}</span>
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
                    <div
                        v-if="drawingIframe"
                        style="
                            position: absolute;
                            left: 0px !important;
                            bottom: 0px !important;
                            display: flex;
                            width: 100%;
                            justify-content: flex-end;
                        "
                        class="row"
                    >
                        <slot></slot>
                    </div>
                    <div
                        v-if="mainVideoFullScreen && !drawingIframe"
                        @click="mainVideoFull"
                        :style="{ bottom: callingLayoutType == 4 ? '5px' : '5px' }"
                        style="z-index: 1"
                        class="mainVideoFullScreen"
                    >
                        <img src="@/assets/images/calling/Iic_fullscreen.png" />
                    </div>
                    <div
                        v-show="
                            laserPointerShow &&
                            !drawingIframe &&
                            callingLayoutType != 1 &&
                            !this.$commonStore.isShare
                        "
                        id="laserCircle"
                        class="laserCircle"
                    ></div>
                    <div
                        v-show="
                            laserPointerShow &&
                            !drawingIframe &&
                            callingLayoutType != 1 &&
                            !this.$commonStore.isShare
                        "
                        id="laserPointer"
                        class="laserPointer"
                    ></div>
                    <div
                        v-if="compData.status != 'none' && !isDrawing"
                        style="
                            position: absolute;
                            bottom: 0px;
                            left: 0px;
                            width: 80%;
                            height: 30px;
                            color: white;
                            padding: 0 7px;
                            z-index: 1;
                        "
                        class="nickname row items-center"
                    >
                        <input
                            :value="compData.nickname"
                            @change="changeNickName(compData, $event)"
                            style="
                                text-align: left;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                font-size: 18px;
                                color: white;
                            "
                            class="col"
                        />
                    </div>
                </div>
            </div>
            <div
                v-show="(motionFallFlag || motionNoMoveFlag) && mapData.isMapOnOff"
                id="gpsView"
                class="gpsView row justify-center items-center"
            >
                <div class="mapTitleBar row justify-between items-center">
                    <span class="mapTitle">{{ $t("map")[2] }}</span>
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
                <gpsMapView
                    :isBigWindow="mapData.isMapBigWindow"
                    :isOnOff="mapData.isMapOnOff"
                ></gpsMapView>
            </div>
            <div
                v-show="motionFallFlag"
                id="fallAlarm"
                class="motionAlarm blinking row justify-center items-center"
            >
                <img src="@/assets/images/calling/ic_fall_76.png" class="emergencyImg" />
                <span class="emergencyFont boldText"
                    >{{ $t("motionAlarm Fall Text1") }}&nbsp;</span
                >
                <span class="emergencyFont">{{ $t("motionAlarm Fall Text2") }}</span>
                <div
                    v-for="(fallInfo, fallInfoKey) in motionFallInfo"
                    :key="fallInfoKey"
                    class="userInfoWrap row justify-center items-center"
                >
                    <div
                        @click="motionFallInfoClick(fallInfoKey)"
                        class="userInfoBtn row justify-between items-center"
                    >
                        <div class="userInfo">{{ fallInfo.nickname }}</div>
                        <div class="userInfoTime">{{ fallInfo.datetime }}</div>
                    </div>
                </div>
                <button
                    v-show="myGpsList"
                    @click="mapOpen"
                    :style="{
                        right: $i18n.locale == 'en' ? '120px' : '80px',
                        width: $i18n.locale == 'en' ? '155px' : '130px',
                    }"
                    class="fallMapButton row items-center justify-center"
                >
                    <img
                        style="padding-right: 4px"
                        src="@/assets/images/calling/map/ic_position.png"
                    />
                    <span>{{ $t("map")[1] }}</span>
                </button>
                <button
                    @click="motionFallClose"
                    :style="{ width: $i18n.locale == 'ko' ? '60px' : '100px' }"
                    class="emergencyBtn"
                >
                    {{ $t("confirm") }}
                </button>
            </div>
            <div
                v-show="motionNoMoveFlag"
                id="noMoveAlarm"
                class="motionAlarm blinking row justify-center items-center"
            >
                <img
                    src="@/assets/images/calling/ic_moving_70.png"
                    class="emergencyImg"
                />
                <span class="emergencyFont boldText"
                    >{{ $t("motionAlarm noMove Text1") }}&nbsp;</span
                >
                <span class="emergencyFont">{{ $t("motionAlarm Fall Text2") }}</span>
                <div
                    v-for="(noMoveInfo, noMoveInfoKey) in motionNoMoveInfo"
                    :key="noMoveInfoKey"
                    class="userInfoWrap row justify-center items-center"
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
                    :style="{ width: $i18n.locale == 'en' ? '155px' : '130px' }"
                    class="noMoveMapButton row items-center justify-center"
                >
                    <img
                        style="padding-right: 4px"
                        src="@/assets/images/calling/map/ic_position.png"
                    />
                    <span>{{ $t("map")[1] }}</span>
                </button>
            </div>
            <div
                v-if="compData.type == 'unstable'"
                :style="{ display: 'block' }"
                class="row justify-center items-center otherBackground"
            >
                <div class="row justify-center items-center unstableWrap">
                    <img src="@/assets/images/calling/ic_video_send_158.png" />
                </div>
                <div class="row justify-center items-center unstableText">
                    {{ $t("call Unstable1") }}
                </div>
                <div class="row justify-center items-center unstableText">
                    {{ $t("call Unstable2") }}
                </div>
            </div>
            <div
                v-else-if="compData.type == 'videoOFF'"
                id="otherBackground"
                class="row justify-center items-center otherBackground"
            >
                <div class="row justify-center items-center">
                    <img src="@/assets/images/calling/ic_photo_140.png" />
                </div>
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 100%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                        background: rgba(0, 0, 0, 0.5);
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            width: 100%;
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
            </div>
        </div>
        <div v-else-if="compData && compData.status == 'my'" class="col-12"></div>
        <div v-else-if="compData && compData.status == 'sending'" class="col-12 sending">
            <div
                v-if="callingLayoutType == 1"
                class="row justify-center sendingBackground sendingLayout1"
            >
                <div class="row justify-center items-center">
                    <img src="@/assets/images/calling/ic_call-send-1.png" />
                    <span class="sendingSpan">{{ $t("sending") }}</span>
                </div>
            </div>
            <div
                v-else-if="callingLayoutType == 3"
                class="row justify-center items-center sendingBackground sendingLayout3"
            >
                <img src="@/assets/images/calling/ic_call-send-3.png" class="big" />
                <span class="sendingSpanCallingLayoutType3">{{ $t("sending") }}</span>
            </div>
            <div
                v-else-if="callingLayoutType == 5"
                class="row justify-center items-center sendingBackground sendingLayout3"
            >
                <span class="sendingSpanCallingLayoutType3">{{ $t("sending") }}</span>
                <img src="@/assets/images/calling/ic_call-send-3.png" class="big" />
            </div>
            <div v-else class="row justify-center items-center sendingBackground">
                <img src="@/assets/images/calling/ic_call-send-3.png" class="big" />
                <span class="sendingSpanCallingLayoutType3">{{ $t("sending") }}</span>
            </div>
            <div class="row items-center windowInfoBar">
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
                <button @click="cancelCallClick">
                    <img src="@/assets/images/calling/ic_x_blue.png" />
                </button>
            </div>
        </div>
        <div v-else-if="compData && compData.status == 'receive'" class="col-12 receive">
            <div
                v-if="callingLayoutType == 1"
                class="row justify-center content-center receiveBackground"
            >
                <img src="@/assets/images/calling/ic_call-send-1.png" />
                <div
                    :style="{ paddingTop: compData == 1 ? '37px' : '20px' }"
                    class="col-12 row justify-center buttonsLayout1"
                >
                    <button
                        @click="setMultiCalling(1)"
                        class="receiveBtnCallingLayoutType3"
                    >
                        {{ $t("accept") }}
                    </button>
                    <button
                        @click="(setMultiCalling(0), setDeclineStatus())"
                        class="receiveBtnCallingLayoutType4"
                    >
                        {{ $t("decline") }}
                    </button>
                </div>
                <span class="receiveSpan">{{ $t("receiving") }}</span>
            </div>
            <div
                v-else-if="callingLayoutType == 3 || callingLayoutType == 5"
                class="row justify-center content-center receiveBackground slotLayout3"
            >
                <div
                    v-if="callingLayoutType == 3"
                    class="col-12 row justify-center buttonsLayout3"
                >
                    <img src="@/assets/images/calling/ic_call-send-3.png" class="big" />
                    <button
                        @click="setMultiCalling(1)"
                        class="receiveBtnCallingLayoutType3"
                    >
                        {{ $t("accept") }}
                    </button>
                    <button
                        @click="setMultiCalling(0)"
                        class="receiveBtnCallingLayoutType4"
                    >
                        {{ $t("decline") }}
                    </button>
                </div>
                <div v-if="callingLayoutType == 5" class="justify-center buttonsLayout5">
                    <img src="@/assets/images/calling/ic_call-send-3.png" class="big" />
                    <button
                        @click="setMultiCalling(1)"
                        class="receiveBtnCallingLayoutType3"
                    >
                        {{ $t("accept") }}
                    </button>
                    <button
                        @click="setMultiCalling(0)"
                        class="receiveBtnCallingLayoutType4"
                    >
                        {{ $t("decline") }}
                    </button>
                </div>
            </div>
            <div v-else class="row justify-center items-center receiveBackground">
                <img src="@/assets/images/calling/ic_receive-4.png" class="big" />
                <button @click="setMultiCalling(1)" class="receiveBtnCallingLayoutType3">
                    {{ $t("accept") }}
                </button>
                <button @click="setMultiCalling(0)" class="receiveBtnCallingLayoutType4">
                    {{ $t("decline") }}
                </button>
            </div>
            <div class="row items-center windowInfoBar">
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
            </div>
        </div>
        <div v-else-if="compData && compData.status == 'fail'" class="col-12 sending">
            <div
                v-if="callingLayoutType == 1 || callingLayoutType == 2"
                class="row justify-center otherBackground"
            ></div>
            <div v-else class="row justify-center items-center otherBackground">
                <img src="@/assets/images/calling/ic_popup_cal-3.png" class="big" />
                <div style="width: 55%" class="row justify-center items-center">
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("fail1")
                    }}</span>
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("fail2")
                    }}</span>
                </div>
            </div>
            <div class="row items-center windowInfoBar">
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
                <button>
                    <img src="@/assets/images/calling/ic_x_blue.png" />
                </button>
            </div>
        </div>
        <div v-else-if="compData && compData.status == 'other'" class="col-12 sending">
            <div
                v-if="callingLayoutType == 1 || callingLayoutType == 2"
                class="row justify-center otherBackground"
            ></div>
            <div v-else class="row justify-center items-center otherBackground">
                <img src="@/assets/images/calling/ic_popup_cal-1.png" class="big" />
                <div style="width: 50%" class="row justify-center items-center">
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("other1")
                    }}</span>
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("other2")
                    }}</span>
                </div>
            </div>
            <div class="row items-center windowInfoBar">
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
                <button>
                    <img src="@/assets/images/calling/ic_x_blue.png" />
                </button>
            </div>
        </div>
        <div v-else-if="compData && compData.status == 'error'" class="col-12 sending">
            <div
                v-if="callingLayoutType == 1"
                class="row justify-center items-center otherBackground errorLayout1"
            >
                <div style="width: 60%" class="row justify-center items-center">
                    <img src="@/assets/images/calling/ic_popup_error-2.png" class="big" />
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("error1")
                    }}</span>
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("error2")
                    }}</span>
                </div>
            </div>
            <div
                v-else-if="callingLayoutType == 3"
                class="row justify-center items-center otherBackground errorLayout3"
            >
                <img src="@/assets/images/calling/ic_popup_error-3.png" class="big" />
                <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                    $t("error1")
                }}</span>
                <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                    $t("error2")
                }}</span>
            </div>
            <div v-else class="row justify-center items-center otherBackground">
                <img src="@/assets/images/calling/ic_popup_error-3.png" class="big" />
                <div style="width: 60%" class="row justify-center items-center">
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("error1")
                    }}</span>
                    <span class="sendingSpanCallingLayoutType3 col-12 aligned">{{
                        $t("error2")
                    }}</span>
                </div>
            </div>
            <div class="row items-center windowInfoBar">
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
                <button @click="setErrorClose()">
                    <img src="@/assets/images/calling/ic_x_blue.png" />
                </button>
            </div>
        </div>
        <div
            v-else-if="compData && compData.status == 'attach'"
            class="col-12 sending"
        ></div>
        <div
            v-else-if="compData && compData.status == 'connecting'"
            class="col-12 sending"
        >
            <div
                v-if="callingLayoutType == 1"
                class="row justify-center items-center receiveBackground connectLayout1"
            >
                <img src="@/assets/images/calling/ic_connect_68.png" />
                <span class="sendingSpanCallingLayoutType3">{{
                    $t("call Connecting")
                }}</span>
            </div>
            <div
                v-else-if="callingLayoutType == 5"
                class="row justify-center items-center receiveBackground connectLayout5"
            >
                <span class="sendingSpanCallingLayoutType3">{{
                    $t("call Connecting")
                }}</span>
                <img src="@/assets/images/calling/ic_connect_68.png" />
            </div>
            <div
                v-else
                class="row justify-center items-center receiveBackground connectLayout3"
            >
                <img src="@/assets/images/calling/ic_connect_68.png" />
                <span class="sendingSpanCallingLayoutType3">{{
                    $t("call Connecting")
                }}</span>
            </div>
            <div class="row items-center windowInfoBar">
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
            </div>
        </div>
        <div
            v-else-if="compData && compData.status == 'unstable'"
            style="height: 100%"
            class="col-12 sending"
        >
            <div
                v-if="callingLayoutType == 1"
                class="row justify-center items-center otherBackground unstableLayout1"
            >
                <div style="width: 60%" class="row justify-center items-center">
                    <img src="@/assets/images/calling/ic_video_send_100.png" />
                    <span
                        class="sendingSpanCallingLayoutType3 col-12 aligned longTypeText"
                        >{{ $t("call Unstable1") }}</span
                    >
                    <span
                        class="sendingSpanCallingLayoutType3 col-12 aligned longTypeText"
                        >{{ $t("call Unstable2") }}</span
                    >
                </div>
            </div>
            <div
                v-else-if="callingLayoutType == 3"
                class="row justify-center items-center otherBackground"
            >
                <img
                    style="width: 43px"
                    src="@/assets/images/calling/ic_video_send_68.png"
                    class="col-12"
                />
                <span
                    style="font-size: 10px"
                    class="sendingSpanCallingLayoutType3 col-12 aligned longTypeText"
                    >{{ $t("call Unstable1") }}</span
                >
                <span
                    style="font-size: 10px"
                    class="sendingSpanCallingLayoutType3 col-12 aligned longTypeText"
                    >{{ $t("call Unstable2") }}</span
                >
            </div>
            <div
                v-else
                class="row justify-center items-center otherBackground unstableLayout4"
            >
                <img src="@/assets/images/calling/ic_video_send_68.png" />
                <span class="sendingSpanCallingLayoutType3 col-12 aligned longTypeText">{{
                    $t("call Unstable1")
                }}</span>
                <span class="sendingSpanCallingLayoutType3 col-12 aligned longTypeText">{{
                    $t("call Unstable2")
                }}</span>
            </div>
            <div class="row items-center windowInfoBar">
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
            </div>
        </div>
        <div
            v-else-if="compData && compData.status == 'unpublished'"
            style="height: 100%"
            class="col-12 sending"
        >
            <div
                @click="mainVideoImageChange()"
                class="row justify-center items-center otherBackground"
            >
                <img
                    v-if="callingLayoutType == 1"
                    src="@/assets/images/calling/ic_photo_140.png"
                    class="callingLayout1-unpublished"
                />
                <img v-else src="@/assets/images/calling/ic_photo_52.png" style="" />
            </div>
            <div
                v-if="compData.text != sessionNickname"
                class="items-center windowInfoBar row"
            >
                <div
                    v-if="compData.status != 'none'"
                    style="
                        position: absolute;
                        bottom: 0px;
                        left: 0px;
                        width: 80%;
                        height: 30px;
                        color: white;
                        padding: 0 7px;
                        z-index: 1;
                    "
                    class="nickname row items-center"
                >
                    <input
                        :value="compData.nickname"
                        @change="changeNickName(compData, $event)"
                        style="
                            text-align: left;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 18px;
                            color: white;
                        "
                        class="col"
                    />
                </div>
            </div>
        </div>
        <div v-else-if="fileStatus" class="col-12 receive">
            <div v-if="compData.status == 2" class="col-12 receiveStatus">
                <div
                    v-if="callingLayoutType == 1"
                    style="background: #151515"
                    class="row justify-center content-center fileReceptionLayout1"
                >
                    <div class="row justify-center content-center">
                        <p style="font-size: 20px" class="requestText">
                            {{ compData.fileReceiveInfo.fileSendNickname }}
                            {{ $t("fileReceptionRequest1") }}
                            {{ $t("fileReceptionRequest2") }}
                        </p>
                    </div>
                    <div
                        :style="{ paddingTop: compData == 1 ? '37px' : '20px' }"
                        class="col-12 row justify-center buttonsLayout1"
                    >
                        <button
                            @click="fileReceiveAccept(compData.text)"
                            style="background: #1c8eff"
                            class="receiveBtnCallingLayoutType3"
                        >
                            {{ $t("accept") }}
                        </button>
                        <button
                            @click="fileReceiveDecline(compData.text)"
                            style="background: #464646"
                            class="receiveBtnCallingLayoutType4"
                        >
                            {{ $t("decline") }}
                        </button>
                    </div>
                </div>
                <div
                    v-else
                    style="background: #151515; padding-bottom: 0"
                    class="row justify-center content-center fileReceptionLayout3"
                >
                    <div class="row col-12 justify-center buttonsLayout1">
                        <div style="text-align: center" class="row">
                            <p
                                style="font-size: 12px; margin: auto"
                                class="col-12 requestText"
                            >
                                {{ compData.fileReceiveInfo.fileSendNickname }}
                                {{ $t("fileReceptionRequest1") }}
                            </p>
                            <p style="font-size: 12px; margin: auto" class="requestText">
                                {{ $t("fileReceptionRequest2") }}
                            </p>
                        </div>
                    </div>
                    <div
                        :style="{ paddingTop: compData == 1 ? '37px' : '5px' }"
                        class="col-12 row justify-center acceptbuttons"
                    >
                        <button
                            @click="fileReceiveAccept(compData.text)"
                            style="background: #1c8eff"
                            class="receiveBtnCallingLayoutType3"
                        >
                            {{ $t("accept") }}
                        </button>
                        <button
                            @click="fileReceiveDecline(compData.text)"
                            style="background: #464646"
                            class="receiveBtnCallingLayoutType4"
                        >
                            {{ $t("decline") }}
                        </button>
                    </div>
                </div>
            </div>
            <div v-else-if="compData.status == 3" class="col-12 receiveStatus">
                <div
                    v-if="callingLayoutType == 1"
                    class="row justify-center content-center fileReceptionLayout1"
                >
                    <div class="row col-12 justify-center">
                        <div style="margin-bottom: 15px" class="row col-5 prog">
                            <div
                                :style="{
                                    width:
                                        userListStatus[compData.userListIndex].rate + '%',
                                }"
                                id="progressing"
                                class="progs"
                            ></div>
                        </div>
                    </div>
                    <div class="row justify-center content-center buttonsLayout1">
                        <p class="fileReceivingText">{{ $t("receivingFile") }}</p>
                    </div>
                </div>
                <div
                    v-else
                    class="row justify-center content-center fileReceptionLayout3"
                >
                    <div class="row col-12 justify-center buttonsLayout1">
                        <div style="text-align: center" class="row">
                            <p class="col-12 fileReceivingText">
                                {{ $t("receivingFile") }}
                            </p>
                        </div>
                    </div>
                    <div class="row col-12 justify-center">
                        <div style="height: 8px" class="row col-8 prog">
                            <div
                                :style="{
                                    width:
                                        userListStatus[compData.userListIndex].rate + '%',
                                }"
                                id="progressing"
                                class="progs"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="compData.status == 5" class="col-12 receiveStatus">
                <div
                    v-if="callingLayoutType == 1"
                    class="row justify-center content-center fileReceptionLayout1"
                >
                    <div class="row col-12 justify-center">
                        <img
                            src="@/assets/images/ic_complete_3.png"
                            class="fileReceptionComplete"
                        />
                    </div>
                    <div class="row justify-center content-center">
                        <p class="receptionCompleteText">
                            {{ $t("fileReceptionComplete") }}
                        </p>
                    </div>
                </div>
                <div
                    v-else
                    style="padding-bottom: 0"
                    class="row justify-center content-center fileReceptionLayout3"
                >
                    <div class="row col-12 justify-center">
                        <img
                            :style="{ width: callingLayoutType == 3 ? '30px' : '40px' }"
                            src="@/assets/images/ic_complete_3.png"
                            class="fileReceptionComplete"
                        />
                    </div>
                    <div class="row col-12 justify-center">
                        <div style="text-align: center" class="row">
                            <p class="col-12 receptionCompleteText">
                                {{ $t("fileReceptionComplete") }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="compData.status == 6" class="col-12 receiveStatus">
                <div
                    v-if="callingLayoutType == 1"
                    class="row justify-center content-center fileReceptionLayout1"
                >
                    <div class="row col-12 justify-center">
                        <img
                            src="@/assets/images/ic_complete_3.png"
                            class="fileReceptionComplete"
                        />
                    </div>
                    <div class="row justify-center content-center">
                        <p class="receptionCompleteText">
                            {{ fileSendNickname }} {{ $t("fileCancel text1") }}
                            {{ $t("fileCancel text2") }}
                        </p>
                    </div>
                </div>
                <div
                    v-else
                    style="padding-bottom: 0"
                    class="row justify-center content-center fileReceptionLayout3"
                >
                    <div class="row col-12 justify-center">
                        <img
                            :style="{ width: callingLayoutType == 3 ? '30px' : '40px' }"
                            src="@/assets/images/ic_complete_3.png"
                            class="fileReceptionComplete"
                        />
                    </div>
                    <div class="row col-12 justify-center">
                        <div style="text-align: center" class="row">
                            <p class="col-12 receptionCompleteText">
                                {{ fileSendNickname }} {{ $t("fileCancel text1") }}
                                {{ $t("fileCancel text2") }}
                            </p>
                        </div>
                    </div>
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
        <div
            v-if="
                callingLayoutType == 1 &&
                this.$commonStore.mainVideoIndex === compData.userListIndex
            "
            class="optionWrap"
        >
            <div
                v-if="antennaStatus"
                @click="antennaInfoStatus = !antennaInfoStatus"
                :title="$t('antennaInfo')"
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
            <div v-if="antennaInfoStatus && antennaStatus" class="antennaDetailInfoBox">
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
                v-if="!drawingIframe && callingLayoutType == 1"
                class="row items-center videoNameWrap"
            >
                <span id="videoMainName" class="col text-left videoNameSpan">{{
                    compData.text
                }}</span>
            </div>
            <div
                v-if="!drawingIframe && callingLayoutType == 1"
                style="display: none"
                class="row items-center videoNameWrap"
            >
                <span
                    :value="compData.text"
                    id="videoMainCaption"
                    class="col text-left videoNameSpan"
                ></span>
            </div>
            <div
                v-if="streamInfoStatus && isGlassSelected"
                class="selectBoxDetailInfoBox row justify-center items-center"
            >
                <div
                    @click="changeStreamMode(1)"
                    :style="{ backgroundColor: streamMode == 0 ? '#000000' : '#282828' }"
                    class="selectBoxDetailInfoBoxHDplus row"
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
                    :style="{ backgroundColor: streamMode == 1 ? '#000000' : '#282828' }"
                    class="selectBoxD"
                ></div>
            </div>
        </div>
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
import { useStore } from "vuex"; // Or usePinia for Pinia, if you've migrated

// --- Component Imports ---
import Drawing from "@/components/call/drawings/drawing.vue";
import GpsMapView from "@/components/call/gpsMapView.vue";
import { useCommonStore } from "@/stores";
import { useCached } from "@vueuse/core";
import { useCallStore } from "@/stores/call";
import { useChattingStore } from "@/stores/chatting";

// --- Props Definition ---
const props = defineProps({
    compData: {
        type: Object,
        required: true,
    },
});

// --- State Management (Vuex example, adapt for Pinia if using) ---
const store = useStore(); // Access the Vuex store

// --- Reactive Data (replacing Vue 2's data()) ---
const sessionNickname = ref("");
const callingLayoutType = ref("");
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
const watchMainVideoIndex = computed(() => commonStore.mainVideoIndex);


const commonStore = useCommonStore();
const callStore = useCallStore();
const chattingStore = useChattingStore();
// --- Methods (replacing Vue 2's methods) ---
const videoResize = () => {
    // Define the logic for video resizing here.
    // This was missing in your original code's methods, but called in mounted/watch.
    console.log("videoResize function needs implementation.");
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
    commonStore.fileSendStatus(3);
    commonStore.setFileSendFlag(true);
};

const fileReceiveDecline = (userName) => {
    commonStore.setReceiveFileResFlag({ flag: true, selectedUserName: userName });
    commonStore.fileSendStatus(4);
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

    const videolocalElement = document.getElementById("videolocal");
    if (videolocalElement && videolocalElement.childNodes[5]) {
        videolocalElement.childNodes[5].style.display = "none"; // Type assertion for TypeScript
    }

    // Laser Pointer Event Creation
    if (callingLayoutType.value !== 1 && props.compData.status === "main") {
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
        const fallInfo =
            callStore.motionFallInfo[callStore.motionFallInfo.length - 1];
        const noMoveInfo =
            callStore.motionNoMoveInfo[
                callStore.motionNoMoveInfo.length - 1
            ];

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

watch(watchMainVideoIndex, (res) => {
    if (commonStore.callingLayoutType === 1 && !isDrawing.value && !getIsShare.value) {
        commonStore.setMainVideoInfo(res);
    }
});
</script>

<template>
    <div class="calling-window"></div>
</template>

<style lang="sass">
/* Your SASS styles here */
/* Ensure your path to the sass file is correct within Nuxt 3 project structure */
</style>
