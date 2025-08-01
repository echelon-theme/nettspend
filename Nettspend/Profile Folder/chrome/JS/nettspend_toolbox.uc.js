// ==UserScript==
// @name			Nettspend :: Toolbox
// @description 	Restores the toolbargrippies and other things
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include			main
// ==/UserScript==

var g_NettspendToolbox

{
    var { waitForElement, PrefUtils } = ChromeUtils.importESModule("chrome://userscripts/content/nettspend_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    class ToolbarGrippyElement extends MozXULElement
    {
        static get fragment() {
            let frag = document.importNode(
            MozXULElement.parseXULToFragment(`
                <image class="toolbargrippy-arrow" />
                <spacer class="toolbargrippy-texture" flex="1" />
            `),
            true
            );
            Object.defineProperty(this, "fragment", { value: frag });
            return frag;
        }

        get _hasRendered() {
            return this.querySelector(":scope > .toolbargrippy-arrow") != null;
        }

        get collapsed() {
            return this.hasAttribute("moz_grippy_collapsed");
        }

        set collapsed(val) {
            if (val) {
                this.setAttribute("moz_grippy_collapsed", "true");
            }
            else {
                this.removeAttribute("moz_grippy_collapsed");
            }
            return val;
        }

        get toolbarStates() {
			return JSON.parse(Services.prefs.getCharPref("nettspend.toolbar.states"));
		}

        setToolbarStates(states) {
            PrefUtils.trySetStringPref("nettspend.toolbar.states", JSON.stringify(states));
        }

        writeGrippyState(toolbarNode, state)
        {
            const toolbarStates = this.toolbarStates;
            let toolbarNodeID = toolbarNode.id;

            var width = toolbarNode.clientHeight > 20 ? toolbarNode.clientHeight : 23;
            var height = toolbarNode.clientWidth > 10 ? toolbarNode.clientWidth : 13;

            const collapsedToolbar = {
                id: toolbarNodeID,
                collapsed: state,
                width: `${width}px`,
                height: `${height}px`,
            };

            let duplicate = toolbarStates.find(prop => prop.id == toolbarNodeID);

            if (duplicate) {
                duplicate.collapsed = state;
                duplicate.width = `${width}px`;
                duplicate.height = `${height}px`;
            }
            else {
                toolbarStates.push(collapsedToolbar);
            }

            this.setToolbarStates(toolbarStates);
        } 

        connectedCallback() {
            if (this.delayConnectedCallback())
                return;

            this.render();
        }

        render() {
            if (this._hasRendered)
                return

            this.appendChild(this.constructor.fragment.cloneNode(true));

            this.addEventListener("command", this.grippyTriggered);
            this.addEventListener("click", this.grippyTriggered);
        }
        
        returnNode(aNodeA, aNodeB) {
            var node = this.parentNode;
            while (node && node.localName != "window" &&
                (node.localName != aNodeA && (node.localName != aNodeB))) {
                node = node.parentNode;
            }
            return node;
        }

        collapseToolbar(toolbar)
        {
            try
            {
                this.createCollapsedGrippy(toolbar);
                toolbar.setAttribute("nettspend_collapsed", "true");
                this.writeGrippyState(toolbar, true);
            }
            catch (e) {
                throw e
            }
        }

        expandToolbar(aGrippyID)
        {
            var idString = aGrippyID.substring("moz_tb_collapsed_".length, aGrippyID.length);
            var toolbar = document.getElementById(idString);

            toolbar.setAttribute("nettspend_collapsed", "false");
            this.writeGrippyState(toolbar, false);

            var collapsedTray = document.querySelector(".collapsed-tray-holder .collapsed-tray");
            var collapsedToolbar = document.getElementById("moz_tb_collapsed_" + toolbar.id);

            collapsedTray.removeChild(collapsedToolbar);

            if (!collapsedTray.hasChildNodes()) 
                document.querySelector(".collapsed-tray-holder").setAttribute("collapsed", "true");
        }

        createCollapsedGrippy(aToolbar)
        {
            var toolbarGrippy = aToolbar.querySelector("toolbargrippy");
            var collapsedGrippy = document.createXULElement("toolbargrippy");

            if (collapsedGrippy) {
                var width = toolbarGrippy.clientHeight > 20 ? toolbarGrippy.clientHeight : 23;
                var height = toolbarGrippy.clientWidth > 10 ? toolbarGrippy.clientWidth : 13;
                var styleString = "width: " + width + "px; height: " + height + "px;";
                collapsedGrippy.setAttribute("style", styleString);

                collapsedGrippy.setAttribute("id", "moz_tb_collapsed_" + aToolbar.id);
                collapsedGrippy.setAttribute("moz_grippy_collapsed", "true"); 
                collapsedGrippy.setAttribute("tbgrippy-collapsed", "true");
                collapsedGrippy.setAttribute("tooltiptext", aToolbar.getAttribute("toolbarname"));

                var collapsedTrayHolder = document.querySelector(".collapsed-tray-holder");
                if (collapsedTrayHolder.getAttribute("collapsed") == "true")
                    collapsedTrayHolder.removeAttribute("collapsed");

                document.querySelector(".collapsed-tray-holder .collapsed-tray").appendChild(collapsedGrippy);

                collapsedGrippy = document.getElementById("moz_tb_collapsed_" + aToolbar.id);
            }
        }

        grippyTriggered(event) {
            var toolbar = this.returnNode("toolbar", "menubar");

            if (this.collapsed) {
                this.expandToolbar(this.id);
            }
            else {
                this.collapseToolbar(toolbar);
            }
        }
    }
    customElements.define("toolbargrippy", ToolbarGrippyElement);

    class NettspendToolboxManager
    {
        get internalToolbarFragment()
        {
            return `
                <vbox flex="1" class="toolbar-internal-box">

                </vbox>
                <hbox class="collapsed-tray-holder">
                    <hbox class="collapsed-tray">
                    
                    </hbox>
                    <spacer class="collapsed-tray-spacer" />
                </hbox>
			`;
        }

        async init()
        {
            await new Promise(resolve => {
                let delayedStartupObserver = (aSubject, aTopic, aData) => {
                    Services.obs.removeObserver(delayedStartupObserver, "browser-delayed-startup-finished");
                    resolve();
                };
                Services.obs.addObserver(delayedStartupObserver, "browser-delayed-startup-finished");
            });

            /*
            *  Put all toolbars into a vbox element
            *  for the grippy shit
            */

            let navigatorToolbox = gNavToolbox;
            let fragment = this.internalToolbarFragment;
            
            navigatorToolbox.appendChild(window.MozXULElement.parseXULToFragment(fragment));

            let internalBox = navigatorToolbox.querySelector(".toolbar-internal-box");
            let toolbars = navigatorToolbox.querySelectorAll("toolbar");

            toolbars.forEach(toolbar => {
                if (toolbar.id !== "TabsToolbar") {
                    let toolbargrippy = document.createXULElement("toolbargrippy");
                    if (toolbar.id == "nav-bar") {
                        toolbargrippy.setAttribute("class", "toolbar-primary-grippy");
                    }
                    
                    if (toolbar.id !== "notifications-toolbar") {
                        toolbar.insertBefore(toolbargrippy, toolbar.firstChild);
                    }

                    internalBox.appendChild(toolbar);
                }
                else {
                    document.querySelector("#appcontent").insertBefore(toolbar, document.querySelector("#appcontent").firstChild);
                    toolbar.removeAttribute("flex");
                }
            });

            if (document.getElementById("titlebar")) {
                document.getElementById("titlebar").remove();
            }

            this.appendTabBarCloseButton();
            this.setToolbarStates();
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
            handleEvent(event)
            {
                switch (event.type)
                {
                    case "customizationstarting":
                        document.querySelector("#browser").removeAttribute("flex");
                        break;
                    case "aftercustomization":
                        document.querySelector("#browser").setAttribute("flex", "1");
                        break;
                }
            }
        });

        appendTabBarCloseButton()
        {
            let tabsToolbar = document.querySelector("#TabsToolbar");

            let closeButton = window.MozXULElement.parseXULToFragment(`
                <hbox class="tabs-closebutton-box" align="center" pack="end">
                    <toolbarbutton class="tabs-closebutton close-icon" onclick="gBrowser.removeCurrentTab();">
                    </toolbarbutton>
                </hbox>
            `);

            tabsToolbar.querySelector("#TabsToolbar-customization-target").appendChild(closeButton);
        }

        setToolbarStates()
        {
            this.createToolbarStatePref();
            
            let pref = JSON.parse(Services.prefs.getCharPref("nettspend.toolbar.states"));

            pref.forEach(toolbarNode => {
                document.getElementById(toolbarNode.id).setAttribute("nettspend_collapsed", toolbarNode.collapsed);
                
                // Create the collapsed grippy
                if (toolbarNode.collapsed) {
                    customElements.get("toolbargrippy").prototype.createCollapsedGrippy(document.getElementById(toolbarNode.id));

                    // Set the height and width from the saved value
                    document.getElementById(`moz_tb_collapsed_${toolbarNode.id}`).style.width = toolbarNode.width;
                    document.getElementById(`moz_tb_collapsed_${toolbarNode.id}`).style.height = toolbarNode.height;
                }
            });
        }

        createToolbarStatePref()
        {
            try
			{
				Services.prefs.getCharPref("nettspend.toolbar.states");
			}
			catch (e)
			{
				if (e.name == "NS_ERROR_UNEXPECTED") // preference does not exist
				{
					try
					{
						Services.prefs.setCharPref("nettspend.toolbar.states", "[]");
					}
					catch (e) {}
				}
			}

            let pref = Services.prefs.getCharPref("nettspend.toolbar.states");

            if (pref == "") {
                Services.prefs.setCharPref("nettspend.toolbar.states", "[]");
            }
        }

        createPrintMenuButtion()
        {
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
            });
        }
    }

    g_NettspendToolbox = new NettspendToolboxManager;
    g_NettspendToolbox.init();
}