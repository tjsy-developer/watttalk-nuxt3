// composables/useAxiosRequest.js (또는 plugins/axiosRequest.js 등 원하는 위치에)

import axios from "axios";
import CryptoJS from "crypto-js";
import * as jwtDecode from "jwt-decode";
const refreshTokenApi = process.env.refreshTokenUrl;
const key = process.env.skey;

export async function request(type, params) {
    // const nuxtApp = useNuxtApp();
    // const store = useStore();

    let jwt = sessionStorage.getItem("jwt");
    let response;

    // try {
    //     response = await sendAxios(type, params, jwt, store, nuxtApp);
    // } catch (e) {
    //     console.log("axiosRequestFunc err", e);
    // }
    return response;
}

async function sendAxios(type, params, jwt, store, nuxtApp) {
    let result = null;
    let requestAgain = false;

    // try {
    //     const res = await axios({
    //         url: params.api,
    //         method: type,
    //         data: params.data ?? "",
    //         headers: params.headers ?? { jwt },
    //         responseType: params.responseType ?? undefined,
    //         timeout: 4000,
    //     });
    //     console.log(`axios ${params.api} send success`);
    //     result = res;
    // } catch (error) {
    //     console.log(`axios send fail. err: ${error}`);
    //     const err = error.response;
    //     if (err?.status === 401) {
    //         if (err.data === "none" || err.data === "mutated") {
    //             store.commit("login/checkTokenMutation", 2);
    //             return;
    //         } else if (err.data === "expired") {
    //             requestAgain = true;
    //         } else {
    //             result = err;
    //         }
    //     }
    // }

    // if (requestAgain) {
    //     result = await requestNewJwt(type, params, store, nuxtApp);
    // }

    return result;
}

export async function requestNewJwt(type, params, store, nuxtApp) {
    console.log(`func request Token`);

    const rTokenEncrypted = store.state.token.enRToken;
    const decRToken = await decryptData(rTokenEncrypted);

    if (!decRToken) {
        store.commit("login/checkTokenMutation", 2);
        return false;
    }

    const tokenType = store.state.token.tokenType === 1 ? "talk" : "";

    let errState = false;
    let newJwt = null;
    let newRTokenEncrypted = null;

    try {
        const res = await axios.post(refreshTokenApi, {
            refreshToken: decRToken,
            deviceType: tokenType,
        });
        newJwt = res.data[0];
        newRTokenEncrypted = encryptData(res.data[1]);

        sessionStorage.setItem("jwt", newJwt);
        store.commit("token/setRToken", newRTokenEncrypted);
        store.commit("token/setRequestToken", true);
    } catch (error) {
        errState = true;
        console.log(`request new jwt err: ${error}`);
        const err = error.response;
        if (err?.status === 401) {
            if (err.data === "none" || err.data === "mutated" || err.data === "expired") {
                store.commit("login/checkTokenMutation", 2);
            }
        }
    }

    if (errState) return false;

    // type, params가 없는 경우 (영상통화 입장/퇴장) 요청 안함
    if (!type && !params) return true;

    // 요청 params.data 내 jwt가 있으면 새로 받은 토큰으로 교체
    if (params?.data?.jwt) {
        params.data.jwt = newJwt;
    }

    console.log("resend axios");
    return await sendAxios(type, params, newJwt, store, nuxtApp);
}

export function encryptData(data) {
    console.log("function encrypt");
    return CryptoJS.AES.encrypt(data, key).toString();
}

export async function decryptData(data) {
    console.log("function decrypt");
    try {
        const decryptBytes = CryptoJS.AES.decrypt(data, key);
        const decryptData = decryptBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptData) return false;
        return decryptData;
    } catch (err) {
        console.log(`decrypt error: ${err.message}`);
        return false;
    }
}

export async function verifyToken(jwt_token) {
    // const store = useStore();
    let jwt = sessionStorage.getItem("jwt");
    let result = false;
    // const decodeResult = decodeToken(jwt);
    // if (decodeResult === true) {
    //     result = true;
    // } else if (decodeResult === "expired") {
    //     const requestResult = await requestNewJwt();
    //     if (requestResult) {
    //         store.commit("token/setTokenDecodeState", true);
    //         result = true;
    //     } else {
    //         store.commit("token/setTokenDecodeState", "expired");
    //     }
    // } else if (decodeResult === "mutated") {
    //     store.commit("token/setTokenDecodeState", "mutated");
    // }
    return result;
}

function decodeToken(jwt) {
    let result = false;
    try {
        const decodeJwt = jwtDecode(jwt);
        const expireTime = decodeJwt.exp;
        const unixTime = Math.floor(Date.now() / 1000);

        if (expireTime > unixTime) {
            result = true;
        } else {
            result = "expired";
        }
    } catch {
        console.log("decode fail");
        result = "mutated";
    }
    return result;
}
