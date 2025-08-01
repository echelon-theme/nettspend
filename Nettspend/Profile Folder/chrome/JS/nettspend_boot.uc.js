// ==UserScript==
// @name			Nettspend :: Boot
// @description 	Initializes Nettspend modules for different pages.
// @author			aubymori
// @github          https://github.com/aubymori
// @include			(.*)
// @loadOrder       0
// ==/UserScript==

let NETTSPEND_BOOT_CONFIG = {
	/* Main browser window */
	"chrome://browser/content/browser.xhtml": {
		prefs: [
			"nettspend.unified-extensions.disabled",
			"nettspend.appearance.mozilla",
			"nettspend.tabbrowser.hideononetab"
		],
		nativeControls: true
	},
};

{
	function bootNettspend(context, config)
	{
		if (config?.prefs)
		{
			let { PrefManager } = ChromeUtils.importESModule("chrome://modules/content/PrefManager.sys.mjs");
			context.g_prefManager = new PrefManager(
				context.document.documentElement,
				config.prefs
			);
		}

		if (config?.nativeControls)
		{
			let { NativeControls } = ChromeUtils.importESModule("chrome://modules/content/NativeControls.sys.mjs");
			context.g_nativeControls = new NativeControls(
				context.document.documentElement,
				context.MutationObserver
			);
		}
	}

	(function(context)
	{
		function isCurrentURL(url)
		{
			return context.document.documentURI.split("#")[0].split("?")[0] == url;
		}

		for (const url in NETTSPEND_BOOT_CONFIG)
		{
			if (isCurrentURL(url))
			{
				context.addEventListener("load", function()
				{
					bootNettspend(context, NETTSPEND_BOOT_CONFIG[url]);
				});
				return;
			}
		}
	})(window);
}