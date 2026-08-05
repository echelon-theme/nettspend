// ==UserScript==
// @name           Nettspend :: Menu Bar
// @description    Scripts to restore the "Go" and "Windows" menu
// @author	       aubymori, travy-patty
// @github         https://github.com/aubymori
// @github         https://github.com/travy-patty
// ==/UserScript==

var g_WindowMenu;

{
    var { PrefCalls, LocaleUtils, waitForElement } = ChromeUtils.importESModule("chrome://modules/content/NSUtils.sys.mjs");
    waitForElement = waitForElement.bind(window);

    let menusBundle = "chrome://nettspend/locale/properties/menus.properties";

    const WINDOW_MENU_XUL = 
    `
    <menu id="window-menu" label="${LocaleUtils.str(menusBundle, 'windows_menu.label')}" accesskey="${LocaleUtils.str(menusBundle, 'windows_menu.accesskey')}">
        <menupopup id="menu_WindowPopup">
            <menuseparator id="window-menu-separator"/>
        </menupopup>
    </menu>
    `;

    class WindowMenu {
        get menupopup()
        {
            let menupopup = document.getElementById("menu_WindowPopup");
            Object.defineProperty(this, "menupopup", {
                value: menupopup,
                writable: false
            });
            return menupopup;
        }

        get separator()
        {
            let separator = document.getElementById("window-menu-separator");
            Object.defineProperty(this, "menuseparator", {
                value: separator,
                writable: false
            });
            return separator;
        }

        get tasksMenus() {
			return {
				0: {
					"id": "tasksMenuNavigator",
					"command": "cmd_newNavigator",
					"icon": "icon-navigator16",
				},
				1: {
					"id": "tasksMenuMail",
					"oncommand": "g_ReadMail.open()",
					"icon": "icon-mail16",
					"mozillaonly": "true",
				},
				2: {
					"id": "tasksMenuEditor",
					"oncommand": "alert('You aint opening shit twin....')",
					"icon": "icon-composer16",
				},
				3: {
					"id": "tasksMenuAddressBook",
					"oncommand": "alert('You aint opening shit twin....')",
					"icon": "icon-addressbook16",
					"mozillaonly": "true",
				},
				4: {
					"id": "tasksMenuIRC",
					"oncommand": "alert('You aint opening shit twin....')",
				},
			};
		}

        switchTo(win)
        {
            try
            {
                win.document.commandDispatcher.focusedWindow.focus();
            }
            catch(err)
            {
                win.focus();
            }
        }

        populate()
        {
            for (const item of this.menupopup.querySelectorAll(".window-item"))
            {
                item.remove();
            }

            let windowList = Services.wm.getEnumerator("navigator:browser");
            let index = 0;
            for (let win of windowList)
            {
                let winIndex = ++index;
                let item = document.createXULElement("menuitem");
                item.setAttribute("type", "radio");
                if (win == window)
                    item.setAttribute("checked", "true");
                item.setAttribute("class", "window-item");
                item.setAttribute("label", String(winIndex) + " " + win.document.title);
                item.setAttribute("accesskey", String(winIndex));
                item.addEventListener("command", () => {
                    this.switchTo(win);
                });
                this.menupopup.appendChild(item);
            }
            
            for (const item of this.menupopup.querySelectorAll(".task-item"))
            {
                item.remove();
            }

            for (const tasksMenu of Object.keys(this.tasksMenus)) {
                let branding = PrefCalls.getPref("nettspend.appearance.mozilla");
                let tasksMenuItem = document.createXULElement("menuitem");

				const taskMenusItemAttrs = {
					"id": this.tasksMenus[tasksMenu].id,
                    "class": "menuitem-iconic task-item",
                    "label": LocaleUtils.str(menusBundle, this.tasksMenus[tasksMenu].id + ".label"),
                    "accesskey": LocaleUtils.str(menusBundle, this.tasksMenus[tasksMenu].id + ".accesskey"),
				};
				setAttributes.set(tasksMenuItem, taskMenusItemAttrs);
                tasksMenuItem.classList.add(this.tasksMenus[tasksMenu].icon);

                if (this.tasksMenus[tasksMenu].command) {
                    tasksMenuItem.setAttribute("command", this.tasksMenus[tasksMenu].command);
                }

                if (!branding && this.tasksMenus[tasksMenu].mozillaonly) {
					tasksMenuItem.setAttribute("hidden", "true");
				}

                if (this.tasksMenus[tasksMenu].id == "tasksMenuIRC") {
                    this.separator.insertAdjacentElement("afterEnd", tasksMenuItem);
                } else {
                    this.menupopup.insertBefore(tasksMenuItem, this.separator);
                }
            }
        }
    };

    g_WindowMenu = new WindowMenu;

    waitForElement("#tools-menu").then((menu) => {
        let fragment = MozXULElement.parseXULToFragment(WINDOW_MENU_XUL);
        fragment.querySelector("#menu_WindowPopup").addEventListener("popupshowing", (e) => {
            g_WindowMenu.populate();
        }); 
        menu.insertAdjacentElement("afterend", fragment.children[0]);
    });

    waitForElement("#history-menu").then((menu) => {
        menu.setAttribute("label", LocaleUtils.str(menusBundle, "history_menu.label"));
        menu.setAttribute("accesskey", LocaleUtils.str(menusBundle, "history_menu.accesskey"));
        menu.removeAttribute("data-l10n-id");
    });
}