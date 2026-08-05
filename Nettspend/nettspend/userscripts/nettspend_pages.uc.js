// ==UserScript==
// @name			Nettspend :: About Pages
// @description 	Manages the custom about: pages of Namoroka.
// @author			aubymori, ephemeralViolette
// @github          https://github.com/aubymori
// @github          https://github.com/ephemeralViolette
// @include			main
// ==/UserScript==

{
    const ABOUT_PAGES = {
        "": "chrome://nettspend/content/pages/about/about.xhtml",
        "newtab": "chrome://nettspend/content/pages/home/home.xhtml",
        "home": "chrome://nettspend/content/pages/home/home.xhtml",
    };
    const { AboutPageManager } = ChromeUtils.importESModule("chrome://modules/content/AboutPageManager.sys.mjs");

    for (const page in ABOUT_PAGES)
    {
        AboutPageManager.registerPage(
            page,
            ABOUT_PAGES[page]
        );
    }
}