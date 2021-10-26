/* global process */

const createElectronStorage = require('redux-persist-electron-storage');
const { ipcRenderer } = require('electron');
const os = require('os');
const jitsiMeetElectronUtils = require('jitsi-meet-electron-utils');
const { openExternalLink } = require('../features/utils/openExternalLink');


const whitelistedIpcChannels = ['protocol-data-msg', 'renderer-ready', 'gauth-rq', 'gauth-tk', 'gauth-clear', 'set-counter', 'notification-clicked'];

window.jitsiNodeAPI = {
    createElectronStorage,
    osUserInfo: os.userInfo,
    openExternalLink,
    platform: process.platform,
    jitsiMeetElectronUtils,
    electronStoreExists: ipcRenderer.sendSync('electron-store-exists'),
    ipc: {
        on: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.on(channel, listener);
        },
        send: (channel, data) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.send(channel, data);
        },
        removeListener: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.removeListener(channel, listener);
        }
    }
};
