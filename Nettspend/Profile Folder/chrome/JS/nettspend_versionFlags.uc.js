// ==UserScript==
// @name			Nettspend :: Version Flags
// @description 	HELP THE PAIN IT'S UNBEARABLE
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// @loadOrder       1
// ==/UserScript==

let appVersion = AppConstants.MOZ_APP_VERSION;
let majorVersion = parseInt(appVersion.split(".")[0]);
let checkedVersions = [115, 126, 128];
let versionFlags = {};

checkedVersions.forEach(version => {
    if (majorVersion >= version) {
        let flagName = `is${version}newer`;
        document.documentElement.setAttribute(flagName, true);
        versionFlags[flagName] = true;
    }
});