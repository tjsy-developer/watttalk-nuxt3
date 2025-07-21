// stores/userList.ts (suggested filename)

import { defineStore } from "pinia";

export const useUserListStore = defineStore("userList", {
    state: () => ({
        // It's often more idiomatic in Pinia (and general JS) to store an array of objects
        // rather than an object of arrays, as it makes iterating and managing individual
        // user data easier. However, I'll keep the original structure for a direct conversion.
        userListAll: {
            deviceid: [],
            nickname: [],
            devicetype: [],
            status: [],
            connectingstatus: [],
            new_notification_count: [],
            institution: [],
            headquarters: [],
            branch: [],
            email: [],
            en_nickname: [],
        },
        organizationList: [],
        recentCallList: [],
    }),

    actions: {
        init() {
            // Clear all arrays
            this.userListAll.deviceid = [];
            this.userListAll.nickname = [];
            this.userListAll.devicetype = [];
            this.userListAll.status = [];
            this.userListAll.connectingstatus = [];
            this.userListAll.new_notification_count = [];
            this.userListAll.institution = [];
            this.userListAll.headquarters = [];
            this.userListAll.branch = [];
            this.userListAll.email = [];
            this.userListAll.en_nickname = [];
        },
        add(payload) {
            // Added type hint for payload
            this.userListAll.deviceid[payload.idx] = payload.json.deviceid;
            this.userListAll.nickname[payload.idx] = payload.json.nickname;
            this.userListAll.devicetype[payload.idx] = payload.json.devicetype;
            this.userListAll.status[payload.idx] = payload.json.status;
            this.userListAll.connectingstatus[payload.idx] =
                payload.json.connectingstatus;
            this.userListAll.new_notification_count[payload.idx] = 0; // Always initialize to 0 on add
            this.userListAll.institution[payload.idx] = payload.json.institution;
            this.userListAll.headquarters[payload.idx] = payload.json.headquarters;
            this.userListAll.branch[payload.idx] = payload.json.branch;
            this.userListAll.email[payload.idx] = payload.json.email;
            this.userListAll.en_nickname[payload.idx] = payload.json.en_nickname;
        },
        setNotification(payload) {
            // Added type hint for payload
            if (payload.type === 1) {
                this.userListAll.new_notification_count[payload.idx]++;
            } else if (payload.type === 2) {
                this.userListAll.new_notification_count[payload.idx]--;
            } else {
                this.userListAll.new_notification_count[payload.idx] = 0;
            }
        },
        setOrganizationList(payload) {
            this.organizationList = [];
            this.organizationList = [...payload];
        },
        setRecentCallList(payload) {
            console.log(payload)
            this.recentCallList = [];
            this.recentCallList = [...payload];
        },
        
    },
});
