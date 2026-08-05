// ==UserScript==
// @name			Nettspend :: Toolbox
// @description 	Restores the toolbargrippies and other things
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include			main
// ==/UserScript==

var g_NettspendToolbox;

{
    var { waitForElement, PrefCalls } = ChromeUtils.importESModule("chrome://modules/content/NSUtils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    class NettspendToolboxManager {
        async init() {
            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });

            let navigatorToolbox = document.querySelector("#navigator-toolbox");

            let TabsToolbar = navigatorToolbox.querySelector("#TabsToolbar");

            let navBar = navigatorToolbox.querySelector("#nav-bar");
            navBar.classList.add("toolbar-primary");
            navBar.shadowRoot.querySelector("toolbargrippy").classList.add("toolbar-primary-grippy");
            navBar.shadowRoot.querySelector(".toolbar-holder").classList.add("toolbar-primary-holder");

            if (TabsToolbar) {
                document.getElementById("navigator-toolbox").appendChild(TabsToolbar);
				TabsToolbar.removeAttribute("flex");
            }

            this.appendTabBarCloseButton();
            this.createPrintMenuButtion();

            window.addEventListener(
                "customizationstarting",
                this.customizeModeManager
            );
            window.addEventListener(
                "aftercustomization",
                this.customizeModeManager
            );
        }

        customizeModeManager = new (class {
            handleEvent(event) {
                switch (event.type) {
                    case "customizationstarting":
                        document.querySelector("#browser").removeAttribute("flex");
                        break;
                    case "aftercustomization":
                        document.querySelector("#browser").setAttribute("flex", "1");
                        break;
                }
            }
        });

        appendTabBarCloseButton() {
            let tabsToolbar = document.querySelector("#TabsToolbar");

            let closeButton = window.MozXULElement.parseXULToFragment(`
                <hbox class="tabs-closebutton-box" align="center" pack="end">
                    <toolbarbutton class="tabs-closebutton close-icon">
                    </toolbarbutton>
                </hbox>
            `);

            closeButton.querySelector(".tabs-closebutton").addEventListener("command", () => {
                gBrowser.removeCurrentTab();
            });

            tabsToolbar.querySelector("#TabsToolbar-customization-target").appendChild(closeButton);
        }

        createPrintMenuButtion() {
            waitForElement("#print-button").then((printButton) => {
                let fragment = `
                    <!--
                    <menupopup id="printMenu">
                        <menuitem id="printMenuItemToolbar" default="true" />
                        <menuitem id="printPreviewMenuItemToolbar" />
                    </menupopup>
                    -->
                    <stack class="box-inherit toolbarbutton-menubutton-stack" flex="1">
                        <toolbarbutton class="box-inherit toolbarbutton-menubutton-button">
                        </toolbarbutton>
                        <dropmarker class="toolbarbutton-menubutton-dropmarker" />
                    </stack>
                `;

                printButton.setAttribute("type", "menu-button");
                printButton.querySelector(".toolbarbutton-icon").remove();
                printButton.querySelector(".toolbarbutton-text").remove();

                printButton.appendChild(window.MozXULElement.parseXULToFragment(fragment));

                if (!printButton.shadowRoot) {
                    printButton.querySelector(".toolbarbutton-menubutton-dropmarker").appendChild(document.createXULElement("image"));
                }
            });
        }
    }

    g_NettspendToolbox = new NettspendToolboxManager;
    g_NettspendToolbox.init();
}
