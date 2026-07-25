import { PrefCalls } from "chrome://modules/content/NSUtils.sys.mjs";

// Common defaults for all browsers
const COMMON_DEFAULTS = {
    "browser.chrome.favicons": true,
    "nettspend.appearance.mozilla": false,
    "nettspend.status-bar.enabled": true,
    "nettspend.tabbrowser.hideononetab": true,
    "nettspend.toolbar.states": "{}",

    "browser.tabs.hoverPreview.enabled": false,
    "browser.theme.dark-private-windows": false,
    "browser.urlbar.trimURLs": false,
    "browser.urlbar.formatting.enabled": false,
    "browser.display.windows.non_native_menus": 0,
    "browser.startup.blankWindow": false,

    "toolkit.legacyUserProfileCustomizations.stylesheets": true,

    "widget.native-controls.scrollbar-style": 0,
    "widget.non-native-theme.enabled": false,

    "userChromeJS.firstRunShown": true,
    "userChromeJS.persistent_domcontent_callback": true,
};

// Fork-specific overrides — keys match Services.appinfo.name
const FORK_DEFAULTS = {
    "Nocturne": {
        "nocturne.backgrounds.enabled": false,
        "security.sandbox.content.level": 7,
    },
    "Marble": {
        // Erizur gotta go for this bruh
        "browser.proton.enabled": true,
    },
};

// Channel-specific overrides — keys match Services.appinfo.defaultUpdateChannel
const CHANNEL_DEFAULTS = {
};

export function applyDefaults() {
    for (let [pref, value] of Object.entries(COMMON_DEFAULTS)) {
        PrefCalls.defaultPref(pref, value);
    }

    let appName = Services.appinfo.name;
    let forkDefaults = FORK_DEFAULTS[appName];
    if (forkDefaults) {
        for (let [pref, value] of Object.entries(forkDefaults)) {
            PrefCalls.defaultPref(pref, value);
        }
    }

    let channel = Services.appinfo.defaultUpdateChannel;
    let channelDefaults = CHANNEL_DEFAULTS[channel];
    if (channelDefaults) {
        for (let [pref, value] of Object.entries(channelDefaults)) {
            PrefCalls.defaultPref(pref, value);
        }
    }
}
