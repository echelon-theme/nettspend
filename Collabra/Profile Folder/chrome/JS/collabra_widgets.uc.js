// ==UserScript==
// @name			Collabra :: Widget Manager
// @description 	Manages the installation of custom CustomizableUI widgets.
// @author			ephemeralViolette
// @include         main
// ==/UserScript==

{

let { LocaleUtils } = ChromeUtils.import("chrome://userscripts/content/collabra_utils.uc.js");
let throbberBundle = "chrome://Collabra/locale/properties/custom-widgets.properties";

class CollabraWidgetManager
{
    static alreadyRan = false;

    static async queueCustomWidgetInstallation()
    {
        if (this.alreadyRan)
        {
            return;
        }

        await new Promise(resolve => {
            let delayedStartupObserver = (aSubject, aTopic, aData) => {
                Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                resolve();
            };
            Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
        });

        this.createWidget({
            id: "navigator-throbber",
            type: "button",
            removable: true,

            label: LocaleUtils.str(throbberBundle, "navigator_throbber.label"),
            tooltiptext: LocaleUtils.str(throbberBundle, "navigator_throbber.tooltiptext"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(e) {
                if (e.button == "0") {
                    openTrustedLinkIn(getHelpLinkURL("firefox-help"), "tab");
                }
            },
            
            onCreated: function(button) {
                button.classList.remove("toolbarbutton-1"); 
                NavigatorThrober.init();
                return button;
            },
        });
        
        this.createWidget({
            id: "search-button",
            type: "button",
            removable: true,

            label: LocaleUtils.str(throbberBundle, "search_button.label"),
            defaultArea: CustomizableUI.AREA_NAVBAR,

            onClick: function(e) {
                if (e.button == "0") {
                    openTrustedLinkIn(Services.search.getDefaultEngineInfo()?.defaultSearchEngineData.submissionURL, "tab");
                }
            },
            
            onCreated: function(button) {
                return button;
            },
        });

        this.alreadyRan = true;
    }

    static async createWidget(def)
    {
        // I added this while I was chasing down a bug (kept just in case), but it
        // turns out that that bug was actually just Firefox itself and not anything
        // to do with Namoroka:
        while (!CustomizableUI.getWidget)
            await new Promise(r => requestAnimationFrame(r));

        if (!CustomizableUI.getWidget(def.id)?.hasOwnProperty("source"))
        {
            CustomizableUI.createWidget(def);
        }
    }
}

CollabraWidgetManager.queueCustomWidgetInstallation();

}