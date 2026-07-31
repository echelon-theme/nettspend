// ==UserScript==
// @name			Nettspend :: Toolbar Element
// @description 	Restores the toolbargrippies and other things
// @author			travy-patty
// @github          https://github.com/travy-patty
// @include			(.*)
// @loadOrder       0
// ==/UserScript==


class MozToolboxElement extends MozXULElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(this.fragment);
    }

    connectedCallback() {
        if (this.delayConnectedCallback() || this.hasConnected) {
            return;
        }

        this.hasConnected = true;
    }

    ensureInitialized() {
        this.shadowRoot;
    }

    get fragment() {
        if (!this.constructor.hasOwnProperty("_fragment")) {
            this.constructor._fragment = MozXULElement.parseXULToFragment(
                this.markup
            );
        }
        return document.importNode(this.constructor._fragment, true);
    }

    get markup() {
        return `
            <html:link rel="stylesheet" href="chrome://global/skin/toolbar.css" />
            <html:link rel="stylesheet" href="chrome://nettspend/skin/nettspend.au.css" />
            <vbox class="toolbox-internal-box" flex="1">
                <html:slot></html:slot>
            </vbox>
            <hbox tbattr="collapsed-tray-holder" class="collapsed-tray-holder" moz-collapsed="true">
                <hbox tbattr="collapsed-tray" class="collapsed-tray" />
                <spacer flex="1" class="collapsed-tray-spacer" />
            </hbox>
        `;
    }

    get shadowRoot() {
        return super.shadowRoot;
    }

    collapseToolbar(toolbar) {
        try {
            this.createCollapsedGrippy(toolbar);
            toolbar.setAttribute("moz-collapsed", "true");
        }
        catch (e) {
        }
    }

    expandToolbar(aGrippyID) {
        var idString = aGrippyID.substring("moz_tb_collapsed_".length, aGrippyID.length);

        var toolbar = document.getElementById(idString);
        toolbar.setAttribute("moz-collapsed", "false");

        var collapsedTray = this.findNodeByAttribute("tbattr", "collapsed-tray");
        var collapsedToolbar = this.shadowRoot.querySelector("#moz_tb_collapsed_" + toolbar.id);
        collapsedTray.removeChild(collapsedToolbar);

        if (!collapsedTray.hasChildNodes()) {
            this.findNodeByAttribute("tbattr", "collapsed-tray-holder").setAttribute("moz-collapsed", "true");
        }
    }

    findNodeByAttribute(aAttribute, aValue) {
        const root = this.shadowRoot;
        if (!root) {
            return null;
        }

        if (aAttribute == "id") {
            return root.getElementById(aValue);
        }

        return root.querySelector(`[${aAttribute}="${aValue}"]`);
    }

    createCollapsedGrippy(aToolbar) {
        try {
            var grippy = aToolbar.findNodeByAttribute("tbattr", "toolbar-grippy");
            var collapsedGrippy = document.createXULElement("toolbargrippy");

            if (collapsedGrippy) {
                var width = grippy.clientHeight > 20 ? grippy.clientHeight : 23;
                var height = grippy.clientWidth > 10 ? grippy.clientWidth : 13;
                var styleString = "width: " + width + "px; height: " + height + "px;";

                collapsedGrippy.setAttribute("style", styleString);
                collapsedGrippy.setAttribute("id", "moz_tb_collapsed_" + aToolbar.id);
                collapsedGrippy.setAttribute("moz_grippy_collapsed", "true");
                collapsedGrippy.setAttribute("tbgrippy-collapsed", "true");
                collapsedGrippy.setAttribute("tooltiptext", aToolbar.getAttribute("toolbarname") || aToolbar.getAttribute("aria-label"));

                var collapsedTrayHolder = this.findNodeByAttribute("tbattr", "collapsed-tray-holder");
                if (collapsedTrayHolder.getAttribute("moz-collapsed") == "true")
                    collapsedTrayHolder.removeAttribute("moz-collapsed");

                this.findNodeByAttribute("tbattr", "collapsed-tray").appendChild(collapsedGrippy);
                collapsedGrippy = document.getElementById("moz_tb_collapsed_" + aToolbar.id);
            }
        }
        catch (e) {
            throw e;
        }
    }
}
customElements.define("toolbox", MozToolboxElement);
MozElements.MozToolbox = MozToolboxElement;

class MozToolbarElement extends MozXULElement {
    constructor() {
        super();

        if (this.id !== "notifications-toolbar" && this.id !== "TabsToolbar") {
            this.attachShadow({ mode: "open" });
            this.shadowRoot.appendChild(this.fragment);
        }

        if (this.getAttribute("moz-collapsed") == "true" &&
            this.parentNode.localName == "toolbox") {
            this.parentNode.createCollapsedGrippy(this);
        }
    }

    connectedCallback() {
        if (this.delayConnectedCallback() || this.hasConnected) {
            return;
        }

        this.initializeAttributeInheritance();
        this.hasConnected = true;
    }

    ensureInitialized() {
        this.shadowRoot;
    }

    static get inheritedAttributes() {
        return {
            "toolbargrippy": "last-toolbar,hidden=grippyhidden",
            ".toolbar-holder": "collapsed,last-toolbar,orient=tborient,align=tbalign,pack=tbpack",
        };
    }

    get fragment() {
        if (!this.constructor.hasOwnProperty("_fragment")) {
            this.constructor._fragment = MozXULElement.parseXULToFragment(
                this.markup
            );
        }
        return document.importNode(this.constructor._fragment, true);
    }

    get markup() {
        return `
        <html:link rel="stylesheet" href="chrome://global/skin/toolbar.css" />
            <html:link rel="stylesheet" href="chrome://nettspend/skin/nettspend.au.css" />
            <toolbargrippy tbattr="toolbar-grippy" class="toolbar-grippy" part="toolbar-grippy" />
            <hbox class="toolbar-holder" flex="1" part="toolbar-holder">
                <html:slot></html:slot>
            </hbox>
        `;
    }

    get shadowRoot() {
        return super.shadowRoot;
    }

    findNodeByAttribute(aAttribute, aValue) {
        const root = this.shadowRoot;
        if (!root) {
            return null;
        }

        if (aAttribute == "id") {
            return root.getElementById(aValue);
        }

        return root.querySelector(`[${aAttribute}="${aValue}"]`);
    }
}
customElements.define("toolbar", MozToolbarElement);
MozElements.MozToolbar = MozToolbarElement;

class MozToolbarGrippyElement extends MozXULElement {
    constructor() {
        super();

        this.addEventListener("click", this);
    }

    connectedCallback() {
        if (this.delayConnectedCallback() || this.hasConnected) {
            return;
        }

        this.appendChild(this.fragment);

        this.hasConnected = true;
    }

    get fragment() {
        if (!this.constructor.hasOwnProperty("_fragment")) {
            this.constructor._fragment = MozXULElement.parseXULToFragment(
                this.markup
            );
        }
        return document.importNode(this.constructor._fragment, true);
    }

    get markup() {
        return `
            <html:link rel="stylesheet" href="chrome://global/skin/toolbar.css" />
            <html:link rel="stylesheet" href="chrome://nettspend/skin/nettspend.au.css" />
            <image class="toolbargrippy-arrow"/>
            <spacer class="toolbargrippy-texture" flex="1"/>
        `;
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

    handleEvent(event) {
        switch (event.type) {
            case "click":
                this.grippyTriggered();
                break;
        }
    }

    returnNode(...names) {
        let node = this;

        while (node) {
            if (node.localName && names.includes(node.localName)) {
                return node;
            }

            if (node.parentNode) {
                node = node.parentNode;
            } else if (node.host) {
                // crossed a ShadowRoot
                node = node.host;
            } else {
                node = null;
            }
        }

        return null;
    }

    grippyTriggered() {
        var toolbox = this.returnNode("toolbox");
        var toolbar = this.returnNode("toolbar", "menubar");
        if (this.collapsed)
            toolbox.expandToolbar(this.id);
        else
            toolbox.collapseToolbar(toolbar);
    }
}
customElements.define("toolbargrippy", MozToolbarGrippyElement);
MozElements.MozToolbarGrippy = MozToolbarGrippyElement;