// ==UserScript==
// @name			 Nettspend :: About Dialog
// @description 	 Replaces normal About Firefox dialog with a custom one
// @author			 travy-patty
// @github           https://github.com/travy-patty
// @include			 main
// ==/UserScript==

window.openAboutDialog = function openAboutDialog()
{
    openTrustedLinkIn("about:", "window");
}