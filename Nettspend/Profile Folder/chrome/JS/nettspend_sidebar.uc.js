// ==UserScript==
// @name			Nettspend :: Sidebar
// @description 	Jackass the movie
// @author			Travis
// @include         main
// ==/UserScript==

var g_NettspendSidebarUI;

{
    let MozSidebarUI = versionFlags["is126newer"] ? SidebarController : SidebarUI;

    class NettspendSidebarUI
    {

    }

    g_NettspendSidebarUI = new NettspendSidebarUI;
}