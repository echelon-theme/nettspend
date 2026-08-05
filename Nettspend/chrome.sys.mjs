{
    let {
        classes: Cc,
        interfaces: Ci,
        manager: Cm,
        utils: Cu
    } = Components;

    // Branding: Registration of content
    let prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    let ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    let registry = Cc["@mozilla.org/chrome/chrome-registry;1"].getService(Ci.nsIChromeRegistry);

	let mozilla = prefs.getBoolPref("nettspend.appearance.mozilla", false);
    let branding = mozilla ? "mozilla" : "default";
    if (branding != "")
    {
        let brandingPath = `chrome://nettspend/content/branding/${branding}/chrome.manifest`;
        let brandingFileURI = registry.convertChromeURL(ios.newURI(brandingPath)).QueryInterface(Ci.nsIFileURL);
        let brandingManifest = brandingFileURI.file;
        if (brandingManifest.exists())
        {
            Cm.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(brandingManifest);
        }
    }

    // Registration of classic or modern theme
    let theme = prefs.getBoolPref("nettspend.appearance.modern", false) ? "modern" : "classic";
    if (theme != "")
    {
        let themePath = `chrome://userchrome/content/nettspend/${theme}/chrome.manifest`;
        let themeFileURI = registry.convertChromeURL(ios.newURI(themePath)).QueryInterface(Ci.nsIFileURL);
        let themeManifest = themeFileURI.file;
        if (themeManifest.exists())
        {
            Cm.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(themeManifest);
        }
    }
}