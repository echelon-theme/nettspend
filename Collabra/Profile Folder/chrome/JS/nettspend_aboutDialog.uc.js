// ==UserScript==
// @name			 Nettspend :: About Dialog
// @description 	 Replaces normal About Firefox dialog with a custom one
// @author			 Travis
// @include			 main
// ==/UserScript==

window.openAboutDialog = function openAboutDialog()
{
    openTrustedLinkIn("about:", "window");
}