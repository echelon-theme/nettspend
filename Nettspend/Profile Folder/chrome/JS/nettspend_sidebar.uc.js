// ==UserScript==
// @name			Nettspend :: Sidebar
// @description 	AYE FUCK FIREFOX THIS CODE MAKES ME WANNA CRY
// @author			Travis
// @include         main
// ==/UserScript==

var g_NettspendSidebarUI;

{
    var { LocaleUtils, waitForElement, setAttributes } = ChromeUtils.importESModule("chrome://userscripts/content/nettspend_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

	let sidebarBundle = "chrome://nettspend/locale/properties/sidebar.properties";

    class SplitterGrippyElement extends MozXULElement
    {
        connectedCallback() {
            this.addEventListener("click", this);
        }

        on_click(event) {
            if (event.button != 0)
                return

            if (this.parentNode.nodeName == "splitter") {
                this.parentNode.setAttribute("state", "collapsed");
            }
        }
    }
    customElements.define("grippy", SplitterGrippyElement);

    class NettspendSidebarUI
    {
        get sidebarPanelHeader() {
            return `
                <hbox class="box-texttab texttab-sidebar">
                    <hbox class="sidebar-tab-left-box">
                        <spacer class="sidebar-tab-left" />
                        <label class="sidebar-tab-text" flex="1" />
                    </hbox>
                    <vbox class="sidebar-tab-right-box" flex="1">
                        <hbox class="sidebar-tab-right-top-box">
                            <image class="sidebar-tab-right-img" />
                            <spacer class="sidebar-tab-right-line" flex="1" />
                        </hbox>
                        <spacer class="sidebar-tab-right-btm" flex="1" />
                    </vbox>
                </hbox>
            `;
        }

        async createElems() {
            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });


            let MozSidebarUI = versionFlags["is126newer"] ? SidebarController : SidebarUI;
            if (!versionFlags["is126newer"])
                MozSidebarUI._ensureShortcutsShown();

            waitForElement("#sidebar-box").then(e => {
                MozSidebarUI.sidebars.forEach((value, key) => {
                    if (key !== "viewMegalistSidebar") { // DIE MOZILLA DIE
                        let panelFragment = window.MozXULElement.parseXULToFragment(this.sidebarPanelHeader);

                        panelFragment.firstChild.setAttribute("id", `namoroka_${value.menuId}`);
                        panelFragment.querySelector(".sidebar-tab-text").setAttribute("value", value.title);

                        panelFragment.firstChild.addEventListener("click", (e) => {
                            MozSidebarUI.show(key);
                        });

                        e.appendChild(panelFragment);
                    }
                });

                let observer = new MutationObserver(this.setActive);
                observer.observe(e, { attributes: true, attributesFilter: ["sidebarcommand"] });

                let sidebarHeaderLabel = document.createXULElement("label");
                let sidebarHeaderLabelAttrs = {
                    "class": "sidebar-header-text",
                    "crop": "right",
                    "flex": "1",
                    "value": LocaleUtils.str(sidebarBundle, "sidebar_header_text.value"),
                };
                setAttributes.set(sidebarHeaderLabel, sidebarHeaderLabelAttrs);

                e.querySelector("#sidebar-header").insertBefore(sidebarHeaderLabel, e.querySelector("#sidebar-header").firstChild);
                e.querySelector("#sidebar-spacer").remove();
            });
        }

        setActive(list) {
            for (const mut of list)
            {
                let MozSidebarUI = versionFlags["is126newer"] ? SidebarController : SidebarUI;
                let menuID = MozSidebarUI.sidebars.get(MozSidebarUI.currentID).menuId;
                let customMenuID = document.getElementById(`namoroka_${menuID}`);
                let tabsSidebar = mut.target.querySelectorAll(".texttab-sidebar");

                let browser = MozSidebarUI.browser;

                tabsSidebar.forEach(elem => {
                    elem.removeAttribute("selected");
                });

                customMenuID.setAttribute("selected", "true");

                mut.target.insertBefore(browser, customMenuID.nextElementSibling);
            }
        }

        createGrippySplitterElem() {
            let grippy = document.createXULElement("grippy");

            document.querySelector(".sidebar-splitter").appendChild(grippy);
        }
    }

    g_NettspendSidebarUI = new NettspendSidebarUI;
    g_NettspendSidebarUI.createElems();
}