// ==UserScript==
// @name			Nettspend :: Options
// @description 	Adds the menu item to launch Nettspend's Options window
// @author			aubymori
// @github          https://github.com/aubymori
// @include			main
// ==/UserScript==

{
    var { LocaleUtils, waitForElement } = ChromeUtils.importESModule("chrome://modules/content/NSUtils.sys.mjs");
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
            "chrome://nettspend/content/windows/nettspend-options/options.xhtml",
            LocaleUtils.str(menusBundle, "nettspend_options_label"),
            "chrome,centerscreen,resizeable=no,dependent"
        ); 
    }
  
    waitForElement("#menu_ToolsPopup").then((menu) => {
        let nettspendPrefsItem = document.createXULElement("menuitem");
        nettspendPrefsItem.id = "menu_nettspendOptions";
        nettspendPrefsItem.addEventListener("command", launchNettspendOptions);

        menu.append(nettspendPrefsItem);
        menu.addEventListener("popupshowing", onPopupShowing);
    });

    waitForElement("#toolbar-context-menu").then((menu) => {
        let nettspendPrefsItem = document.createXULElement("menuitem");
        nettspendPrefsItem.id = "toolbar-context-nettspendOptions";
        nettspendPrefsItem.addEventListener("command", launchNettspendOptions);

        menu.insertBefore(nettspendPrefsItem, document.querySelector(".viewCustomizeToolbar"));
        menu.addEventListener("popupshowing", onPopupShowing);
    });
}