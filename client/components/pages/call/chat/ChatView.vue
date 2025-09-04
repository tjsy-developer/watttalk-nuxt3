<template>
    <div class="row content-start messageBox">
        <div
            class=""
            v-if="compData.emergencyIcon || compData.moveIcon || compData.directionIcon"
        >
            <span class="messageBoxNickname"
                >{{ compData.nickname }} → {{ compData.mainVideoName }}</span
            >
            <span class="messageBoxDate">{{ compData.chattingDate }}</span>
        </div>
        <div class="row" v-else>
            <div class="col-auto">
                <span v-if="compData.isReceived" class="receiver messageBoxNickname">{{
                    compData.nickname
                }}</span>
            </div>
            <div class="col">
                <span
                    class="messageBoxDate"
                    :class="[compData.isReceived ? 'receptionTime' : 'outgoingTime']"
                    >{{ getTime(compData.chattingDate) }}</span
                >
            </div>
            <div class="col-auto">
                <span v-if="!compData.isReceived" class="caller messageBoxNickname">{{
                    compData.nickname
                }}</span>
            </div>
        </div>

        <div
            class="messageContainer emergencyIcons"
            v-if="compData.emergencyIcon"
            :class="[
                compData.isReceived ? 'bubblyLeft' : 'bubblyRight',
                { emergencyIconsWarnColor: compData.emergencyIcon > 3 },
            ]"
        >
            <img :src="emergencyIcons[compData.emergencyIcon - 1].img" />
            <span class="text-center">{{
                emergencyIcons[compData.emergencyIcon - 1].text
            }}</span>
        </div>
        <div
            class="messageContainer arrowMoveIcons"
            v-else-if="compData.moveIcon"
            :class="[compData.isReceived ? 'bubblyLeft' : 'bubblyRight']"
        >
            <img :src="moveIcons[compData.moveIcon - 1].img" />
            <span
                class="text-center arrowIconMoveText"
                :style="{ lineHeight: locale == 'ko' ? '50px' : '50px' }"
                >{{ moveIcons[compData.moveIcon - 1].text }}</span
            >
        </div>
        <div
            class="messageContainer arrowIcons"
            v-else-if="compData.directionIcon"
            :class="[compData.isReceived ? 'bubblyLeft' : 'bubblyRight']"
        >
            <img :src="directionIcons[compData.directionIcon - 1].img" />
            <span class="text-center arrowIconDirectionText">{{
                directionIcons[compData.directionIcon - 1].text
            }}</span>
        </div>
        <div class="receivebubblyLeft" v-else-if="compData.calling">
            <div class="row justify-center content-center receiveBackground">
                <img
                    src="@/assets/images/calling/ic_call-send-2.png"
                    :style="{ paddingTop: '10px' }"
                />
                <div class="control-buttons" :style="{ paddingTop: '10px' }">
                    <button @click="setMultiCalling(1)" class="accept-btn">
                        {{ t("accept") }}
                    </button>
                    <button @click="setMultiCalling(0)" class="decline-btn">
                        {{ t("decline") }}
                    </button>
                </div>
            </div>
        </div>
        <div class="bubblyLeft messageContainer" v-else-if="compData.fileSend">
            <div class="row" style="text-align: center">
                <p class="fileReceiveText1" style="margin: 0">
                    {{ compData.nickname }} {{ t("fileSending text7") }}
                    {{ t("fileSending text8") }}
                </p>
                <div class="control-buttons" :style="{ paddingTop: '10px' }">
                    <button
                        @click="fileReceiveAccept(compData.nickname)"
                        class="accept-btn"
                    >
                        {{ t("accept") }}
                    </button>
                    <button
                        @click="fileReceiveDecline(compData.nickname)"
                        class="decline-btn"
                    >
                        {{ t("decline") }}
                    </button>
                </div>
            </div>
        </div>
        <div
            class="messageContainer"
            v-else
            :class="[
                compData.isReceived ? 'bubblyLeft' : 'bubblyRight',
                { emergencyColor: compData.isEmergency },
            ]"
        >
            <span v-html="makeNewLine(compData.message)"></span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useChattingStore } from "@/stores/chatting";
import { useCommonStore } from "@/stores";
import { useCallStore } from "@/stores/call";
import { useNuxtApp } from "nuxt/app";
const { locale } = useI18n();
const { t } = useI18n();

const callStore = useCallStore();
const commonStore = useCommonStore();
const props = defineProps({
    compData: {
        type: Object,
        required: true,
    },
});

// Reactive data (formerly 'data()' in Options API)
const emergencyIcons = ref([
    {
        img: new URL("@/assets/images/messageBox/ic_fire-2.png", import.meta.url).href,
        text: t("fire"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_emergency-2.png", import.meta.url)
            .href,
        text: t("emergencies"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_ax-2.png", import.meta.url).href,
        text: t("accident"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_car-2.png", import.meta.url).href,
        text: t("patient transportation"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_hand-2.png", import.meta.url).href,
        text: t("work order"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_check-2.png", import.meta.url).href,
        text: t("on-site confirmation"),
    },
]);

const directionIcons = ref([
    {
        img: new URL("@/assets/images/messageBox/ic_direction_up.png", import.meta.url)
            .href,
        text: t("chatting direction up text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_left.png", import.meta.url)
            .href,
        text: t("chatting direction left text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_front.png", import.meta.url)
            .href,
        text: t("chatting direction front text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_down.png", import.meta.url)
            .href,
        text: t("chatting direction down text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_right.png", import.meta.url)
            .href,
        text: t("chatting direction right text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_direction_back.png", import.meta.url)
            .href,
        text: t("chatting direction back text"),
    },
]);

const moveIcons = ref([
    {
        img: new URL("@/assets/images/messageBox/ic_move_up.png", import.meta.url).href,
        text: t("chatting up text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_left.png", import.meta.url).href,
        text: t("chatting left text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_front.png", import.meta.url)
            .href,
        text: t("chatting front text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_down.png", import.meta.url).href,
        text: t("chatting down text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_right.png", import.meta.url)
            .href,
        text: t("chatting right text"),
    },
    {
        img: new URL("@/assets/images/messageBox/ic_move_back.png", import.meta.url).href,
        text: t("chatting back text"),
    },
]);

const mainVideoNickName = ref(""); // Not used in template or logic, so consider removing if unnecessary.

// Methods
const setMultiCalling = (multiCallingResult) => {
    callStore.multiCallingResult();
};

// Textarea newline conversion
const makeNewLine = (messageText) => {
    return String(messageText).replace(/(?:\r\n|\r|\n)/g, "</br>");
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

const getTime = (time) => {
    const arr = time.split(":");
    let result;
    if (Number(arr[1]) < 10) {
        arr[1] = "0" + Number(arr[1]);
    } else {
        arr[1] = Number(arr[1]);
    }
    if (arr[0] > 11) {
        if (arr[0] == 12) {
            result = t("meetingPm") + " " + Number(arr[0]) + ":" + arr[1];
        } else {
            result = t("meetingPm") + " " + (arr[0] % 12) + ":" + arr[1];
        }
    } else {
        result = t("meetingAm") + " " + Number(arr[0]) + ":" + arr[1];
    }
    return result;
};

// Computed properties (if you had any that derive from props or other reactive data)
// Example: If you needed to compute something based on `compData`, you'd do it here.

// Lifecycle Hooks
onMounted(() => {
    // Dynamic SASS/CSS import using `require` is not typically how you handle styles in Nuxt 3.
    // Styles are usually imported directly via `<style lang="scss" scoped>` or globally.
    // If you need dynamic themes, consider CSS variables or Nuxt's module system for themes.
    // For now, this line is commented out as it's not a standard Nuxt 3 practice for styling.
    // require(`@/assets/styles/${sessionStorage.getItem("displayMode")}/components/call/chattingBar/messageBox.sass`);
    // If you need to access global elements on mount:
    // mainVideoNickName.value = document.getElementById("videoMainCaption")?.textContent || "";
});
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-thumb {
    // Add styles for the scrollbar thumb here if needed
}

.messageBox {
    width: 100%;
    display: flex;
    flex-direction: column;

    &:not(:first-child) {
        margin-top: 20px;
    }

    > span {
        // Assuming +ellipsis is a mixin defined elsewhere
        // If not, you'll need to define the ellipsis styles directly
        /* Example: */
        /*
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    */
        font-size: 14px;
        font-weight: bold;
        color: white;
    }
}

.messageContainer {
    font-size: 14px;
    border-radius: 6px;
    padding: 10px;
    color: #fff;
    background-color: #474b4e;
    border: 1px solid #5d5d5d;
}

$bubblyWidth: 16px;
$bubblyHeight: 10px;

.bubblyLeft:before {
    content: "";
    position: absolute;
    bottom: -$bubblyHeight;
    left: 6%;
    border-right: $bubblyWidth solid transparent;
}

.bubblyRight:before {
    content: "";
    position: absolute;
    bottom: -$bubblyHeight;
    right: 6%;
    border-left: $bubblyWidth solid transparent;
}

.emergencyColor {
    // Styles for emergency color if needed
}

.sent {
    > .date {
        > span {
            &:first-child {
                padding-right: 6px;
            }
            &:last-child {
                margin-right: 6px; // Corrected typo from `margin-rightL`
            }
        }
    }
}

.date {
    text-align: right !important;
    margin-left: 6px;
    > span {
        font-size: 11px;
        padding-top: 4px;

        &:first-child {
            // Styles for first child span if needed
        }
        &:last-child {
            font-weight: bold;
        }
    }
}

.emergencyIcons {
    font-size: 20px;
    letter-spacing: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: rgb(235, 49, 73);

    &.emergencyIconsWarnColor {
        background-color: rgb(255, 153, 15);
    }
    > img {
        width: 76px;
        height: 76px;
    }
    > span {
        margin-top: 3px;
    }
}

.arrowIcons,
.arrowMoveIcons {
    font-size: 17px;
    letter-spacing: 4px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    background-color: #242424;
}

.arrowIconMoveText {
    width: auto;
    margin-left: 13px;
}

.arrowIconDirectionText {
    width: auto;
    margin-left: 15px;
}

.commands {
    font-size: 20px;
    font-weight: bold;
    padding: 48px 0;

    &:before {
        // Styles for before pseudo-element if needed
    }

    > span {
        padding-left: 13px;
    }
}

$windowInfoBarHeight: 30px;

.windowInfoBar {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: $windowInfoBarHeight;
    padding: 0 15px;
}

.receivebubblyLeft:before {
    content: "";
    position: absolute;
    bottom: -$bubblyHeight;
    left: 6%;
    border-right: $bubblyWidth solid transparent;
}

.receiveBackground {
    width: 100%;
    height: 100%;
    padding-bottom: 10px;
    border-radius: 5px;

    > .receiveImg {
        width: 60px;
    }

    > .receiveSpan {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 12px;
    }
}

.buttonsLayout1 {
    > button {
        width: 70px;
        height: 28px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold; // Corrected typo from `font-wegith`

        &:first-child {
            // Styles for first child button if needed
        }
        &:last-child {
            margin-left: 15px;
        }
    }
}

.buttonsLayout2 {
    > button {
        width: 70px;
        height: 28px;
        border-radius: 20px;
        font-size: 14px;

        &:first-child {
            // Styles for first child button if needed
        }
        &:last-child {
            margin-left: 15px;
        }
    }
}

.messageBoxNickname {
    width: auto;
}

.messageBoxDate {
    margin-left: 10px;
    font-size: 13px;
    line-height: 23px;
}

.receptionTime {
    float: left;
    margin-left: 10px;
    font-size: 13px;
    line-height: 23px;
    color: #bcbcbc;
}

.outgoingTime {
    float: right;
    margin-right: 10px;
    font-size: 13px;
    line-height: 23px;
    color: #bcbcbc;
}

.bubblyRight,
.bubblyLeft {
    > span {
        word-break: break-word;
    }
}

// 해상도 (~1023px 일때 반응형)
@media all and (max-width: 1023px) {
    .messageBoxNickname,
    .messageBoxDate {
        font-size: 12px;
    }

    .receptionTime {
        font-size: 11px;
    }

    .outgoingTime {
        font-size: 11px;
    }

    .messageContainer {
        padding: 4px 8px;
    }

    .arrowIcons,
    .arrowMoveIcons {
        letter-spacing: 4px;
        height: auto;
        > img {
            width: 30px;
        }
        > span {
            font-size: 14px !important;
        }
    }

    .emergencyIcons {
        letter-spacing: 4px;
        padding: 5px;
        > img {
            width: 30px;
            height: 31px;
            margin-right: 5px;
        }
        > span {
            width: 50%;
            font-size: 14px !important;
        }
    }

    .bubblyRight,
    .bubblyLeft {
        > span {
            width: auto;
            font-size: 12px;
            word-break: break-word;
        }
    }

    .emergencyIconsWarnColor {
        &:before {
            // Styles for before pseudo-element if needed
        }
    }

    .receiveBackground {
        align-items: center;
        > img {
            width: 40px;
        }
    }

    .buttonsLayout1 {
        width: 60%;
        justify-content: flex-end; // Use flex-end instead of `end` for cross-browser compatibility
        > button {
            width: 57px;
            height: 25px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold; // Corrected typo from `font-wegith`

            &:first-child {
                // Styles for first child button if needed
            }
            &:last-child {
                margin-left: 5px;
            }
        }
    }

    .buttonsLayout2 {
        padding-top: initial; // Use `initial` or `unset` instead of `inherit` if you want to reset
    }

    .fileReceiveMessageContainer {
        > p {
            font-size: 12px;
        }
        > .buttonsLayout2 {
            padding-top: initial; // Use `initial` or `unset` instead of `initial`
            > button {
                width: 53px;
                height: 23px;
                font-size: 11px;
            }
        }
    }
}

.control-buttons {
    margin-top: auto;
    text-align: center;
    width: 100%;
    button + button {
        margin-left: 10px;
    }
    .accept-btn {
        color: white;
        padding: 6px 22px;
        font-size: 13px;
        border-radius: 15px;
        background-color: #1c8eff;
    }
    .decline-btn {
        color: white;
        padding: 6px 22px;
        font-size: 13px;
        border-radius: 15px;
        background-color: #575757;
    }
}
</style>
