// ==UserScript==
// @name			Nettspend :: Layout
// @description 	Manages Nettspend custom layout stuff.
// @author	        travy-patty
// @github          https://github.com/travy-patty
// @include			main
// ==/UserScript==

var g_nettspendLayoutManager;

{
    var { waitForElement } = ChromeUtils.importESModule("chrome://modules/content/NSUtils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    class LayoutManager
    {
        async init() 
        {
            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });

            let toolboxRoot = await waitForElement("#navigator-toolbox");
            toolboxRoot.addEventListener("customizationchange", this);
			toolboxRoot.addEventListener("aftercustomization", this);

            this.refreshToolboxLayout();
        }

		refreshToolboxLayout()
		{
			// Update reload button
			let searchButtonEl;
			if (searchButtonEl = document.querySelector("#search-button"))
			{
				// We need to figure out what the previous element is as well:
				let previousEl = null;
				
				if (searchButtonEl.parentNode?.nodeName == "toolbarpaletteitem")
				{
					// Customise mode is active, so we need to hack around to resolve
					// the non-wrapped previous element.
					previousEl = searchButtonEl.parentNode.previousSibling?.children[0];
				}
				else
				{
					previousEl = searchButtonEl.previousSibling;
				}
				
				if (previousEl?.id == "urlbar-container")
				{
					previousEl.classList.add("unified-search-button");
					searchButtonEl.classList.add("unified");
					Array.from(searchButtonEl.children).forEach(elm => elm.classList.add("unified"));
					
					this.urlbarEl = previousEl;
				}
				else
				{
					// Previous element is not guaranteed to exist.
					this.urlbarEl?.classList.remove("unified-search-button");
					
					searchButtonEl.classList.remove("unified");
					Array.from(searchButtonEl.children).forEach(elm => elm.classList.remove("unified"));
				}
			}
		}

        handleEvent(event)
        {
            switch (event.type)
            {
				case "aftercustomization":
				case "customizationchange":
					this.refreshToolboxLayout();
					break;
            }
        }
    }

    g_nettspendLayoutManager = new LayoutManager;
    g_nettspendLayoutManager.init();
}