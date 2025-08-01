// ==UserScript==
// @name			Nettspend :: Tabs
// @description 	Tabs
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include			main
// ==/UserScript==

{
    var { waitForElement, PrefUtils } = ChromeUtils.importESModule("chrome://userscripts/content/nettspend_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    waitForElement("#tabbrowser-arrowscrollbox").then(e => {
        function hideTabs()
        {
            let numTabs = gBrowser.tabs.length;
            let hideTabsPref = PrefUtils.tryGetBoolPref("nettspend.tabbrowser.hideononetab");
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