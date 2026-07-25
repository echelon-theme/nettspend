// ==UserScript==
// @name			Nettspend :: URLbar
// @description 	Several modifications to the URlBar
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include         main
// ==/UserScript==

var g_NettspendURLBar;

{
    let { XPCOMUtils } = ChromeUtils.importESModule("resource://gre/modules/XPCOMUtils.sys.mjs");

    let throbberBundle = "chrome://nettspend/locale/properties/custom-widgets.properties";

    const lazy = {};
    XPCOMUtils.defineLazyPreferenceGetter(
        lazy,
        "NOCTURNE_OLD_URLBAR",
        "nocturne.ui.oldurlbar",
        false
    );

    let { waitForElement, LocaleUtils } = ChromeUtils.importESModule("chrome://modules/content/NSUtils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    class NettspendURLbar {
        initialized = false;
        identityBox = gIdentityHandler._identityBox;

        get dropmarkerFragment() {
            return window.MozXULElement.parseXULToFragment(`
                <dropmarker id="historydropmarker" class="autocomplete-history-dropmarker urlbar-history-dropmarker"/>
            `).firstChild;
        }

        get pageProxyDeck() {
            return window.MozXULElement.parseXULToFragment(`
                <deck id="page-proxy-deck">
                    <html:img decoding="sync" id="page-proxy-favicon" />
                </deck>
            `).firstChild;
        }

        get urlbarInputContainer() {
            return document.querySelector(".urlbar-input-container") || document.querySelector("#urlbar-input-container");
        }

        async init() {
            if (this.initialized)
                return;

            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });


            // Append page proxy deck
            let pageProxyDeck = this.pageProxyDeck;
            this.urlbarInputContainer.insertBefore(pageProxyDeck, this.urlbarInputContainer.firstChild);
            this._updateIcon();

            // Append dropmarker
            let dropmarker = this.dropmarkerFragment;
            dropmarker.addEventListener("mousedown", this._openBookmarksMenu);

            this.urlbarInputContainer.appendChild(dropmarker);

            this._renderXULElementURLBar();
            this._appendSearchButton();

            // Event listeners
            document.addEventListener("TabAttrModified", this, false);
            document.addEventListener("TabSelect", this, false);
            document.addEventListener("TabOpen", this, false);
            document.addEventListener("TabClose", this, false);
            document.addEventListener("load", this, false);

            this.initialized = true;
        }

        handleEvent(event) {
            switch (event.type) {
                case "TabAttrModified":
                case "TabSelect":
                case "TabOpen":
                case "TabClose":
                case "load":
                    this._updateIcon();
                    break;
            }
        }

        _updateIcon() {
            try {
                const pageProxyIcon = document.querySelector("#page-proxy-favicon");
                if (!pageProxyIcon)
                    return;

                const selectedTab = window.gBrowser?.selectedTab;
                const favicon = selectedTab?.image
                    || selectedTab?.getAttribute?.("image")
                    || selectedTab?.iconImage?.src
                    || "";

                if (favicon) {
                    pageProxyIcon.setAttribute("src", favicon);
                } else {
                    pageProxyIcon.removeAttribute("src");
                }
            } catch (e) {}
        }

        _openBookmarksMenu(event) {
            if (event.button !== 0)
                return;

            event.preventDefault();
            PlacesCommandHook.searchBookmarks();
        }

        _renderXULElementURLBar() {
            // Ignore if user has old URLBar option on Nocturne
            if (lazy.NOCTURNE_OLD_URLBAR)
                return;

            let oldUrlbar = document.getElementById("urlbar");
            let urlbarContainer = document.getElementById("urlbar-container");

            if (!oldUrlbar || 
                oldUrlbar.localName !== "div" ||
                !urlbarContainer)
                return;
            
            // Construct a new hbox element to replace the div URLbar.
            let urlbar = document.createXULElement("hbox");
            urlbar.id = "urlbar";
            urlbar.setAttribute("flex", "1");
            urlbar.setAttribute("context", "");
            urlbar.setAttribute("focused", "true");
            urlbar.setAttribute("pageproxystate", "invalid");
            
            // Duplicate all old urlbar attributes to the new hbox element EXCEPT for inline styles, as it is no longer needed
            // for positioning.
            for (let attr of oldUrlbar.attributes) {
                if (attr.name !== "popover" && attr.name !== "id" && !urlbar.hasAttribute(attr.name)) {
                    urlbar.setAttribute(attr.name, attr.value);
                }
            }

            // Move all child nodes from the old URLbar to the new hbox element.
            while (oldUrlbar.firstChild) {
                urlbar.appendChild(oldUrlbar.firstChild);
            }
            
            // Replace the old URLbar with the new hbox element.
            urlbarContainer.replaceChild(urlbar, oldUrlbar);

            // gURLBar keeps cached references to internals from the original
            // element. Refresh known refs so it points at the new subtree.
            this._rebindURLBarReferences(urlbar);
        }

        _rebindURLBarReferences(urlbar) {
            try {
                const inputContainer = urlbar.querySelector(".urlbar-input-container")
                    || urlbar.querySelector("#urlbar-input-container");
                const textbox = urlbar.querySelector("#urlbar-input");
                const identityBox = urlbar.querySelector("#identity-box");

                if (!window.gURLBar)
                    return;

                if ("_inputContainer" in gURLBar)
                    gURLBar._inputContainer = inputContainer;

                if ("_textbox" in gURLBar)
                    gURLBar._textbox = textbox;

                if ("textbox" in gURLBar)
                    gURLBar.textbox = textbox;

                if ("_identityBox" in gURLBar && identityBox)
                    gURLBar._identityBox = identityBox;
            } catch (e) {}
        }

        _appendSearchButton() {
            let urlbarContainer = document.getElementById("urlbar-container");
            if (!urlbarContainer)
                return;

            let button = document.createXULElement("button");
            button.id = "search-button";
            button.classList.add("button-toolbar", "chromeclass-location");
            button.label = LocaleUtils.str(throbberBundle, "search_button.label");
            button.addEventListener("command", () => {
                openTrustedLinkIn(Services.search.getDefaultEngineInfo()?.defaultSearchEngineData.submissionURL, "tab");
            });

            // For some reason urlbar-containers has a toolbartabstop
            urlbarContainer.insertBefore(button, urlbarContainer.lastChild);
        }
    }

    g_NettspendURLBar = new NettspendURLbar();
    g_NettspendURLBar.init();
}