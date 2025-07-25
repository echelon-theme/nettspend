// ==UserScript==
// @name			Collabra :: Tabs
// @description 	Tabs
// @author			Travis
// @include			main
// ==/UserScript==

{
    var { waitForElement, PrefUtils } = ChromeUtils.import("chrome://userscripts/content/collabra_utils.uc.js");
    waitForElement = waitForElement.bind(window);

    waitForElement("#tabbrowser-arrowscrollbox").then(e => {
        function hideTabs()
        {
            let numTabs = gBrowser.tabs.length;
            let hideTabsPref = PrefUtils.tryGetBoolPref("collabra.tabbrowser.hideononetab");
            let ifHide = hideTabsPref ? numTabs <= 1 : false;

            document.querySelector("#TabsToolbar").setAttribute("hidden", ifHide ? "true" : "false");
        }

        let observer = new MutationObserver(hideTabs);
        observer.observe(e, { childList: true });

        let documentElementObserver = new MutationObserver(hideTabs);
        documentElementObserver.observe(document.documentElement, { attributes: true });

        hideTabs();
    });
}