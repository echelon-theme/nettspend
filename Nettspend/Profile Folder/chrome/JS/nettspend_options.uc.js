// ==UserScript==
// @name			Nettspend :: Options
// @description 	Adds the menu item to launch Nettspend's Options window
// @author			aubymori
// @include			main
// ==/UserScript==

{
    var { LocaleUtils, waitForElement } = ChromeUtils.importESModule("chrome://userscripts/content/nettspend_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    let menusBundle = "chrome://nettspend/locale/properties/menus.properties";

    function onPopupShowing()
    {
        let item = document.querySelectorAll("#menu_nettspendOptions");
        if (item)
        {
            item.forEach(elem => {
                elem.label = LocaleUtils.str(menusBundle, "nettspend_options_label");
                elem.accessKey = LocaleUtils.str(menusBundle, "nettspend_options_accesskey");
            });
        }
        item = document.querySelectorAll("#toolbar-context-nettspendOptions");
        if (item) {
            item.forEach(elem => {
                elem.label = LocaleUtils.str(menusBundle, "nettspend_options_label");
                elem.accessKey = LocaleUtils.str(menusBundle, "nettspend_options_accesskey");
            });
        }
    }

    function launchNettspendOptions()
    {
        window.openDialog(
            "chrome://userchrome/content/windows/nettspend-options/options.xhtml",
            LocaleUtils.str(menusBundle, "nettspend_options_label"),
            "chrome,centerscreen,resizeable=no,dependent"
        ); 
    }

    nettspendPrefsItem = window.MozXULElement.parseXULToFragment(`
        <menuitem oncommand="launchNettspendOptions();" />
    `).firstChild;

    waitForElement("#menu_ToolsPopup").then((menu) => {
        nettspendPrefsItem.id = "menu_nettspendOptions";
        menu.append(nettspendPrefsItem.cloneNode());
        menu.addEventListener("popupshowing", onPopupShowing);
    });
    waitForElement("#toolbar-context-menu").then((menu) => {
        nettspendPrefsItem.id = "toolbar-context-nettspendOptions";
        menu.insertBefore(nettspendPrefsItem.cloneNode(), document.querySelector(".viewCustomizeToolbar"));
        menu.addEventListener("popupshowing", onPopupShowing);
    });
    // Compact Menu Reloaded Support
    waitForElement("#compact-menu-popup").then((menu) => {
        menu.addEventListener("popupshowing", onPopupShowing);
    });
}