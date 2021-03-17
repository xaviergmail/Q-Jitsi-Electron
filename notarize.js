const fs = require ("fs")
require('dotenv').config();

if (fs.existsSync('./env.apple')) {
    require('dotenv').config({ path: '.env.apple' })
}

console.log(process.env, process.env.apple)

const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId: 'club.cowbell',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
    });
};