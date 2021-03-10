
export default {
    /**
     * The URL with extra information about the app / service.
     */
    aboutURL: 'https://github.com/xaviergmail/Q-Jitsi-Electron',

    /**
     * The URL to the source code repository.
     */
    sourceURL: 'https://github.com/xaviergmail/Q-Jitsi-Electron',

    /**
     * Application name.
     */
    appName: 'CowBellClub',

    /**
    * The prefix for application protocol.
    * You will also need to replace this in package.json.
    */
    appProtocolPrefix: 'cowbell',

    /**
     * The default server URL of Jitsi Meet Deployment that will be used.
     */
    defaultServerURL: process.env.ELECTRON_WEBPACK_APP_JITSI_URL || 'https://cowbell.club',

    /**
     * The default server Timeout in seconds.
     */
    defaultServerTimeout: 30,

    /**
     * URL to send feedback.
     */
    feedbackURL: 'https://github.com/jitsi/jitsi-meet-electron/issues',

    /**
     * The URL of Privacy Policy Page.
     */
    privacyPolicyURL: 'https://jitsi.org/meet/privacy',

    /**
     * The URL of Terms and Conditions Page.
     */
    termsAndConditionsURL: 'https://jitsi.org/meet/terms'
};
