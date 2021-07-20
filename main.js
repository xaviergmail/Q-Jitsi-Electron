/* global __dirname, process */
console.log(process.env, 'penguin')
const {
    BrowserWindow,
    Menu,
    app,
    ipcMain,
    nativeImage, Tray
} = require('electron');

const Badge = require('electron-windows-badge');


// const { app, BrowserWindow, Menu, nativeImage, Tray } = require('electron')

const contextMenu = require('electron-context-menu');
const debug = require('electron-debug');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const windowStateKeeper = require('electron-window-state');
const {
    initPopupsConfigurationMain,
    getPopupTarget,
    setupAlwaysOnTopMain,
    setupPowerMonitorMain,
    setupScreenSharingMain
} = require('jitsi-meet-electron-utils');
const path = require('path');
const URL = require('url');
const config = require('./app/features/config');
const { openExternalLink } = require('./app/features/utils/openExternalLink');
const pkgJson = require('./package.json');

const showDevTools = Boolean(process.env.SHOW_DEV_TOOLS) || (process.argv.indexOf('--show-dev-tools') > -1);

const _env = require('dotenv').config();


const io = require('socket.io-client')
const notifier = require('node-notifier');

//Make connection to server just once on page load.
const baseURL = require('./frontend/src/api/config')

//Yourconst { token } = localStorage;


const sound = require("sound-play");




ipcMain.on('get-env', event => {
    event.sender.send('get-env-reply', _env);
});

// We need this because of https://github.com/electron/electron/issues/18214
app.commandLine.appendSwitch('disable-site-isolation-trials');

// We need to disable hardware acceleration because its causes the screenshare to flicker.
app.commandLine.appendSwitch('disable-gpu');

// Needed until robot.js is fixed: https://github.com/octalmage/robotjs/issues/580
app.allowRendererProcessReuse = false;

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// Enable context menu so things like copy and paste work in input fields.
contextMenu({
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
    showCopyImageAddress: false,
    showSaveImage: false,
    showSaveImageAs: false,
    showInspectElement: true,
    showServices: false
});

// Enable DevTools also on release builds to help troubleshoot issues. Don't
// show them automatically though.
debug({
    isEnabled: true,
    showDevTools
});

/**
 * When in development mode:
 * - Enable automatic reloads
 */
if (isDev) {
    require('electron-reload')(path.join(__dirname, 'build'));
}

/**
 * The window object that will load the iframe with Jitsi Meet.
 * IMPORTANT: Must be defined as global in order to not be garbage collected
 * acidentally.
 */
let mainWindow = null;

let webrtcInternalsWindow = null;

let winBadge = null;

/**
 * Add protocol data
 */
const appProtocolSurplus = `${config.default.appProtocolPrefix}://`;
let rendererReady = false;
let protocolDataForFrontApp = null;


/**
 * Sets the application menu. It is hidden on all platforms except macOS because
 * otherwise copy and paste functionality is not available.
 */
function setApplicationMenu() {
    if (process.platform === 'darwin') {
        const template = [{
            label: app.name,
            submenu: [
                {
                    role: 'services',
                    submenu: []
                },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }, {
            label: 'Edit',
            submenu: [{
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                selector: 'undo:'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                selector: 'redo:'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                selector: 'cut:'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                selector: 'copy:'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                selector: 'paste:'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                selector: 'selectAll:'
            }]
        }, {
            label: '&Window',
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }];

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }
}

/**
 * Opens new window with index.html(Jitsi Meet is loaded in iframe there).
 */
function createJitsiMeetWindow() {
    // Application menu.
    setApplicationMenu();

    // Check for Updates.
    autoUpdater.checkForUpdatesAndNotify();

    // Load the previous window state with fallback to defaults.
    const windowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });



    // Path to root directory.
    const basePath = isDev ? __dirname : app.getAppPath();

    // URL for index.html which will be our entry point.
    const indexURL = URL.format({
        pathname: path.resolve(basePath, './build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    /* Enable only if you desperately need react / redux devtools
    if (process.env.NODE_ENV !== 'production') {
        const host = 'local.cowbell.club'; // process.env.ELECTRON_WEBPACK_WDS_HOST;
        const port = process.env.ELECTRON_WEBPACK_WDS_PORT || 8080;

        indexURL = `https://${host}:${port}/index.html`;

        console.log('opening indexurl', indexURL);
    }
    */

    // Options used when creating the main Jitsi Meet window.
    // Use a preload script in order to provide node specific functionality
    // to a isolated BrowserWindow in accordance with electron security
    // guideline.
    const options = {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        icon: path.resolve(basePath, './resources/icon.png'),
        minWidth: 800,
        minHeight: 800,
        show: false,
        webPreferences: {
            enableBlinkFeatures: 'RTCInsertableStreams,WebAssemblySimd',
            enableRemoteModule: true,
            nativeWindowOpen: true,
            nodeIntegration: true,
            plugins: true,
            webSecurity: true,
            preload: path.resolve(basePath, './build/preload.js')
        },
        // frame: false
    };

    mainWindow = new BrowserWindow(options);
    windowState.manage(mainWindow);
    mainWindow.loadURL(indexURL);

    initPopupsConfigurationMain(mainWindow);
    setupAlwaysOnTopMain(mainWindow);
    setupPowerMonitorMain(mainWindow);
    setupScreenSharingMain(mainWindow, config.default.appName, pkgJson.build.appId);

    mainWindow.webContents.on('new-window', (event, url, frameName) => {
        const target = getPopupTarget(url, frameName);

        if (!target || target === 'browser') {
            event.preventDefault();
            openExternalLink(url);
        }
    });


    // let i = 0;
    winBadge = new Badge(mainWindow, { color: 'red' });
    // setInterval(() => {
    //     i++
    //     winBadge.update(i)
    // }, 10000)

    //Lets see
    //mainWindow.webContents.openDevTools() 

    //NOTIFIICATIONS 
    mainWindow.webContents
        .executeJavaScript('({...localStorage});', true)
        .then(localStorage => {
            console.log(localStorage, 'storage mo fo');
            // let token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InBvc3RzIjpbXSwicG9pbnRzIjo5MywiY29uZmlybWVkRW1haWwiOmZhbHNlLCJub3RpZmljYXRpb25DaGFubmVscyI6W10sImF2YXRhcnMiOlsiaHR0cHM6Ly9hdmF0YXJzLmRpY2ViZWFyLmNvbS80LjUvYXBpL2F2YXRhYWFycy8wLjIyMjgwMDUyOTQyNjg5OTMyLnN2ZyIsImh0dHBzOi8vYXZhdGFycy5kaWNlYmVhci5jb20vNC41L2FwaS9hdmF0YWFhcnMvMC40MzA5MjM1NTcwMTY1MDg0LnN2ZyIsImh0dHBzOi8vYXZhdGFycy5kaWNlYmVhci5jb20vNC41L2FwaS9hdmF0YWFhcnMvMC43MzQ2NzE4NjQ0MDExMjcyLnN2ZyIsImh0dHBzOi8vYXZhdGFycy5kaWNlYmVhci5jb20vNC41L2FwaS9hdmF0YWFhcnMvMC40MTQ5NjU5NjUzOTMwODMwNi5zdmciXSwiX2lkIjoiNjBhYmY4ZWQ1YmVmY2RmMzE3MmFjMmNkIiwiZW1haWwiOiJzcXVpcnJlbHE4ODg4QGdtYWlsLmNvbSIsIm5hbWUiOiJTcXVpcnJlbCBRIiwiYXZhdGFyIjoiaHR0cHM6Ly9hdmF0YXJzLmRpY2ViZWFyLmNvbS80LjUvYXBpL2F2YXRhYWFycy8wLjIyMjgwMDUyOTQyNjg5OTMyLnN2ZyIsInBvc3RJZCI6IjYwYWJmOGVkNWJlZmNkZjMxNzJhYzJjYyIsImNyZWF0ZWRBdCI6IjIwMjEtMDUtMjRUMTk6MDU6MTcuMjQ5WiIsInVwZGF0ZWRBdCI6IjIwMjEtMDUtMjRUMTk6NDU6NDQuMTQzWiJ9LCJjb250ZXh0Ijp7InVzZXIiOnsibmFtZSI6IlNxdWlycmVsIFEiLCJlbWFpbCI6InNxdWlycmVscTg4ODhAZ21haWwuY29tIiwiYXZhdGFyIjoiaHR0cHM6Ly9hdmF0YXJzLmRpY2ViZWFyLmNvbS80LjUvYXBpL2F2YXRhYWFycy8wLjIyMjgwMDUyOTQyNjg5OTMyLnN2ZyJ9fSwicm9vbSI6IioiLCJpYXQiOjE2MjI4MzM4NDUsImV4cCI6MTYyMzQzODY0NSwiYXVkIjoicGxzaGVscC1saXZlIiwiaXNzIjoicGxzaGVscC1saXZlIn0.M33NDyUDUCIJLJpe8SU-InfCmAkCQtYuFnn2G60er7g`
            const socket = io(baseURL.default, {
                query: { token: localStorage.token }
            });


            socket.on('post', ({ post }) => {
                // if (!isMounted) {
                //   return
                // }
                console.log(post, ' i love u?')

                if (mainWindow) { //Only run if app is "closed"
                    return
                }
                app.setBadgeCount(app.getBadgeCount() + 1)
                sound.play(path.join(__dirname, "resources/cowbell.wav"))
                // new Badge(mainWindow, { color: 'blue' });

                console.log(app.getBadgeCount(), ' does badger have it?')

                //winBadge.update(111)


                //New Room
                console.log(path.join(__dirname), 'souuuuunnnndd')

                if (post.messageIds.length === 0) {


                    return notifier.notify({
                        title: `🏡 ${post.user.name}`,
                        message: post.message,
                        // icon: post.user.avatar,
                        // sound: true,
                        // wait: true
                    }, (err, response, metadata) => {
                        // console.log("callback", post._id, err, response, metadata, response.activationType, metadata.activationType)
                        //history.push(`/chat/${post._id}`)
                    }
                    );
                } else if (post && post.members) { //Not New Room
                    let icon = post.userChannel ? `🧐` : post.dmChannel ? `💬` : `🏡`
                    const last = post.messageIds[post.messageIds.length - 1]
                    //console.log(last, 'samruai')

                    // path.join(__dirname, 'coulson.jpg')
                    //last.userId.avatar.replace('svg', 'png'),
                    //icon:


                    return notifier.notify({
                        title: `${icon} ${last.userId.name}`,
                        message: last.message,
                        // icon: path.resolve(basePath, './resources/icon.png'),
                        // sound: true,
                        // wait: true
                    }, (err, response, metadata) => {
                        //console.log("callback", post._id, err, response, metadata, response.activationType, metadata.activationType)
                        //history.push(`/chat/${post._id}`)
                        //if (metadata.activationType === 'contentsClicked') {
                            console.log(post._id, 'redirect')
                            //createWindow()
                            if (!mainWindow) {
                                createJitsiMeetWindow()
                            }
                        //}
                    })


                } else {
                    console.log("NOt sure")
                }

                console.log('post', post, ' kiwi')
            })


            console.log(baseURL, ' no way', baseURL.default)


        });


    mainWindow.on('closed', (event) => {

        mainWindow = null;

        // event.preventDefault(); //this prevents it from closing. The `closed` event will not fire now
        // mainWindow.hide();


    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    /**
     * When someone tries to enter something like jitsi-meet://test
     *  while app is closed
     * it will trigger this event below
     */
    handleProtocolCall(process.argv.pop());
}

/**
 * Opens new window with WebRTC internals.
 */
function createWebRTCInternalsWindow() {
    const options = {
        minWidth: 800,
        minHeight: 600,
        show: true
    };

    webrtcInternalsWindow = new BrowserWindow(options);
    webrtcInternalsWindow.loadURL('chrome://webrtc-internals');
}

/**
 * Handler for application protocol links to initiate a conference.
 */
function handleProtocolCall(fullProtocolCall) {
    // don't touch when something is bad
    if (
        !fullProtocolCall
        || fullProtocolCall.trim() === ''
        || fullProtocolCall.indexOf(appProtocolSurplus) !== 0
    ) {
        return;
    }

    const inputURL = fullProtocolCall.replace(appProtocolSurplus, '');

    if (app.isReady() && mainWindow === null) {
        createJitsiMeetWindow();
    }

    protocolDataForFrontApp = inputURL;

    if (rendererReady) {
        mainWindow
            .webContents
            .send('protocol-data-msg', inputURL);
    }
}

/**
 * Force Single Instance Application.
 */
const gotInstanceLock = app.requestSingleInstanceLock();

if (!gotInstanceLock) {
    app.quit();
    process.exit(0);
}

/**
 * Run the application.
 */

app.on('activate', () => {
    if (mainWindow === null) {
        createJitsiMeetWindow();

    }
    console.log("ACTIVATE Penguin !!! ", mainWindow);
    mainWindow.show()
});

app.on('certificate-error',
    // eslint-disable-next-line max-params
    (event, webContents, url, error, certificate, callback) => {
        if (isDev) {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    }
);

app.on('ready', createJitsiMeetWindow);

if (isDev) {
    // app.on('ready', createWebRTCInternalsWindow);
}

app.on('second-instance', (event, commandLine) => {
    /**
     * If someone creates second instance of the application, set focus on
     * existing window.
     */
    if (mainWindow) {
        mainWindow.isMinimized() && mainWindow.restore();
        mainWindow.focus();

        /**
         * This is for windows [win32]
         * so when someone tries to enter something like jitsi-meet://test
         * while app is opened it will trigger protocol handler.
         */
        handleProtocolCall(commandLine.pop());
    }
});

app.on('window-all-closed', () => {
    // Don't quit the application on macOS.
    console.log('process.platform', process.platform)
    // if (process.platform !== 'darwin') {
    //     app.quit();
    // }
});
// app.on('window-all-closed', () => {
//     app.dock.hide() // for macOS
//     // use same logic for other OSes you want
// })

// global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')

let tray = null
function createTray() {
    // console.log('create Tray ', __dirname, ' no directoyrrt name?', __static)

    const icon = path.join(__dirname, './resources/icon.png') // required.
    // const icon = path.resolve(__static, 'icon.png') /// path.join(__dirname, 'resources', 'icon.png')
    const trayicon = nativeImage.createFromPath(icon)
    tray = new Tray(trayicon.resize({ width: 22 }))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                createWindow()
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.quit() // actually quit the app.
            }
        },
    ])

    tray.setContextMenu(contextMenu)
}

// let mainWindow
function createWindow() {
    if (!tray) { // if tray hasn't been created already.
        createTray()
    }

    // mainWindow = new BrowserWindow({
    //     width: 800,
    //     height: 600,
    //     webPreferences: {
    //         nodeIntegration: true // not cool. I'm sorry.
    //     }
    // })

    // mainWindow.loadFile('index.html')
    // mainWindow.on('closed', function () {
    //     mainWindow = null
    // })
}

app.on('ready', createTray)


// remove so we can register each time as we run the app.
app.removeAsDefaultProtocolClient(config.default.appProtocolPrefix);

// If we are running a non-packaged version of the app && on windows
if (isDev && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    app.setAsDefaultProtocolClient(
        config.default.appProtocolPrefix,
        process.execPath,
        [path.resolve(process.argv[1])]
    );
} else {
    app.setAsDefaultProtocolClient(config.default.appProtocolPrefix);
}

/**
 * This is for mac [darwin]
 * so when someone tries to enter something like jitsi-meet://test
 * it will trigger this event below
 */
app.on('open-url', (event, data) => {
    event.preventDefault();
    handleProtocolCall(data);
});

/**
 * This is to notify main.js [this] that front app is ready to receive messages.
 */
ipcMain.on('renderer-ready', () => {
    rendererReady = true;
    if (protocolDataForFrontApp) {
        mainWindow
            .webContents
            .send('protocol-data-msg', protocolDataForFrontApp);
    }
});

app.on('ready', () => {

    mainWindow.webContents.on("did-frame-finish-load", async () => {
        if (process.env.NODE_ENV === 'development') {
            await installExtensions();
        }
    });
});

import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
async function installExtensions() {
    // const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
    // installExtension(REACT_DEVELOPER_TOOLS)
    //     .then(name => console.log(`[REACT_DEVELOPER_TOOLS] Added Extension:  ${name}`))
    //     .catch(err => console.log('[REACT_DEVELOPER_TOOLS] An error occurred: ', err));

    // installExtension(REDUX_DEVTOOLS)
    //     .then(name => console.log(`[REDUX_DEVTOOLS] Added Extension:  ${name}`))
    //     .catch(err => console.log('[REDUX_DEVTOOLS] An error occurred: ', err));
}
import ElectronGoogleOAuth2 from '@getstation/electron-google-oauth2';

const myApiOauth = new ElectronGoogleOAuth2(
    process.env.ELECTRON_WEBPACK_APP_GOOGLEID,
    process.env.ELECTRON_WEBPACK_APP_GOOGLEID2,
    ['profile email'],
    {
        successRedirectURL: ''
    }
);


let curToken = null;

ipcMain.on('gauth-clear', () => {
    console.log('here')
    curToken = null
})

ipcMain.on('gauth-rq', () => {
    console.log('got google auth request!!!!!!!!!!');
    if (curToken) {
        mainWindow
            .webContents
            .send('gauth-tk', JSON.stringify(curToken));

        return;
    }

    myApiOauth.openAuthWindowAndGetTokens()

        .then(token => {
            console.log('got token!!', token);
            curToken = token;
            setTimeout(() => curToken = null, 30 * 60 * 1000)
            mainWindow
                .webContents
                .send('gauth-tk', JSON.stringify(token));
        })
        .catch(err => {
            console.log('err in promise', err);
        });
});


ipcMain.on('set-counter', function (count, data) {
    console.log('bullwinkle', data.count, ' lets go')
    winBadge.update(data.count)
    app.setBadgeCount(data.count)

})




console.log('Wooooo we loaded!!!');
