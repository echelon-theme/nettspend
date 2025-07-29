// ==UserScript==
// @name			Nettspend :: Status Bar
// @description 	Restore separate Status Bar
// @author			Travis
// @include         main
// ==/UserScript==

var g_ReadMail;

{
	var { ctypes } = ChromeUtils.importESModule("resource://gre/modules/ctypes.sys.mjs");
	var { Registry } = ChromeUtils.importESModule("chrome://modules/content/Registry.sys.mjs");
	var { PrefUtils, LocaleUtils, waitForElement, setAttributes } = ChromeUtils.import("chrome://userscripts/content/nettspend_utils.sys.mjs");
    waitForElement = waitForElement.bind(window);

	let statusBundle = "chrome://nettspend/locale/properties/statusbar.properties";

	class MailClientUtils {
        runFile(filePath, commandLineArgs) {
            const HWND = ctypes.voidptr_t;
            const LPCWSTR = ctypes.jschar.ptr;
            const HINSTANCE = ctypes.voidptr_t;
            const UINT = ctypes.uint32_t;
            const SW = { SHOWNORMAL: 1 };

            const shell32 = ctypes.open("shell32.dll");

            const ShellExecuteW = shell32.declare(
                "ShellExecuteW",
                ctypes.winapi_abi,
                HINSTANCE,
                HWND, LPCWSTR, LPCWSTR, LPCWSTR, LPCWSTR, UINT
            );

            const filePathWide = ctypes.jschar.array()(filePath);
            const commandLineArgsWide = ctypes.jschar.array()(commandLineArgs);

            const hInstance = ShellExecuteW(
                null,
                "open",
                filePathWide,
                commandLineArgsWide,
                null,
                SW.SHOWNORMAL
            );

            if (hInstance <= 32) 
                console.error("Error starting "+ filePath +". "+ hInstance.toString())

            shell32.close();
        }

        get _defaultMailClient() {
            if (Services.appinfo.OS !== "WINNT")
                return
            
            return Registry.getRegKeyValue("HKLM", "SOFTWARE\\Clients\\Mail", "", "String");
        }

        get _defaultMailPath() {
            return Registry.getRegKeyValue("HKLM", `SOFTWARE\\Clients\\Mail\\${this._defaultMailClient}\\shell\\open\\command`, "", "String");
        }

        open() {
            let mailClientPath = this._defaultMailPath.match(/"([^"]*)"/)[1];
            let mailClientArgs = this._defaultMailPath.split(" ").pop();

            this.runFile(mailClientPath, mailClientArgs);
        }
    }

	g_ReadMail = new MailClientUtils;

	gIdentityHandler.refreshIdentityBlock = function refreshIdentityBlock() {
		if (!this._identityBox) {
			return;
		}

		
		this._refreshIdentityIcons();

		// If this condition is true, the URL bar will have an "invalid"
		// pageproxystate, so we should hide the permission icons.
		if (this._hasInvalidPageProxyState()) {
			gPermissionPanel.hidePermissionIcons();
		} else {
			gPermissionPanel.refreshPermissionIcons();
		}

		if (this._isSecureContext) {
			document.querySelector("#status-bar #security-button").setAttribute("level", "high");
		}
		else {
			document.querySelector("#status-bar #security-button").removeAttribute("level");
		}

		// Hide the shield icon if it is a chrome page.
		gProtectionsHandler._trackingProtectionIconContainer.classList.toggle(
			"chromeUI",
			this._isSecureInternalUI
		);
	}

	var NettspendStatusBarManager = {
		get fragment() {
			return `
				<vbox id="browser-bottombox">
					<statusbar id="status-bar">
						<statusbarpanel id="component-bar">
						</statusbarpanel>
						<statusbarpanel id="statusbar-display" flex="1">
						</statusbarpanel>
						<statusbarpanel id="offline-status" class="statusbarpanel-iconic" label="${LocaleUtils.str(statusBundle, "statusbar_panel_offlinestatus.label")}" onclick="BrowserOffline.toggleOfflineStatus();">
							<image class="statusbarpanel-icon" />
						</statusbarpanel>			
						<statusbarpanel id="security-button" class="statusbarpanel-iconic" tooltiptext="${LocaleUtils.str(statusBundle, "statusbar_panel_securitybutton.tooltiptext")}" onclick="BrowserPageInfo(null, 'securityTab')">
							<image class="statusbarpanel-icon" />
						</statusbarpanel>
						<statusbarpanel class="statusbar-resizerpanel">
							<image class="fakeresizer"></image>
						</statusbarpanel>
					</statusbar>
				</vbox>
			`;
		},

		get menuFragment() {
			return `
				<menuitem oncommand="NettspendStatusBarManager.setStatusBarState(Boolean(this.getAttribute('checked')))" type="checkbox" />
			`;
		},

		get componentBar() {
			return {
				0: {
					"id": "mini-nav",
					"oncommand": "OpenBrowserWindow()",
					"tooltiptext": LocaleUtils.str(statusBundle, "component_bar.nav.tooltiptext"),
				},
				1: {
					"id": "mini-mail",
					"oncommand": "g_ReadMail.open()",
					"tooltiptext": LocaleUtils.str(statusBundle, "component_bar.mail.tooltiptext"),
					"mozillaonly": "true",
				},
				2: {
					"id": "mini-comp",
					"oncommand": "alert('You aint opening shit twin....')",
					"tooltiptext": LocaleUtils.str(statusBundle, "component_bar.comp.tooltiptext"),
				},
				3: {
					"id": "mini-addr",
					"oncommand": "alert('You aint opening shit twin....')",
					"tooltiptext": LocaleUtils.str(statusBundle, "component_bar.addr.tooltiptext"),
					"mozillaonly": "true",
				},
				4: {
					"id": "mini-irc",
					"oncommand": "alert('You aint opening shit twin....')",
					"tooltiptext": LocaleUtils.str(statusBundle, "component_bar.irc.tooltiptext"),
				},
			};
		},

		init() {
			document.body.appendChild(MozXULElement.parseXULToFragment(this.fragment));

			this.renderComponentBar();

			Services.obs.addObserver(this, "network:offline-status-changed");
			this.setOfflineStatus(Services.io.offline);



			this.initStatusPanelVisibility();
		},

		observe(aSubject, aTopic) {
			if (aTopic != "network:offline-status-changed") {
				return;
			}

			this.setOfflineStatus(Services.io.offline);
		},

		setOfflineStatus(state) {
			let offlineStatus = document.querySelector("#status-bar #offline-status");
			let offlineStatusTooltipText;

			if (state) {
				offlineStatusTooltipText = LocaleUtils.str(statusBundle, "statusbar_panel_offlinestatus_offline.tooltiptext");
				offlineStatus.setAttribute("offline", "true");
				offlineStatus.setAttribute("checked", "true");
			}
			else {
				offlineStatusTooltipText = LocaleUtils.str(statusBundle, "statusbar_panel_offlinestatus.tooltiptext");
				offlineStatus.removeAttribute("offline");
				offlineStatus.removeAttribute("checked");
			}

			offlineStatus.setAttribute("tooltiptext", offlineStatusTooltipText);
		},

		renderComponentBar() {
			let componentBarItems = this.componentBar;
			let componentBarElem = document.querySelector("#status-bar #component-bar");
			let branding = PrefUtils.tryGetBoolPref("nettspend.appearance.mozilla");

			for (const taskbutton of Object.keys(componentBarItems)) {
				let taskbuttonElem = document.createXULElement("toolbarbutton");
				
				const taskbuttonElemAttrs = {
					"class": "taskbutton",
					"id": componentBarItems[taskbutton].id,
					"oncommand": componentBarItems[taskbutton].oncommand,
					"tooltiptext": componentBarItems[taskbutton].tooltiptext,
				};
				setAttributes.set(taskbuttonElem, taskbuttonElemAttrs);

				if (!branding && componentBarItems[taskbutton].mozillaonly) {
					taskbuttonElem.setAttribute("hidden", "true");
				}

				componentBarElem.appendChild(taskbuttonElem);
			};
		},

		initStatusPanelVisibility() {
			try
			{
				this._applyStatusBarEnabledPrefs();
			}
			catch (e)
			{
				if (e.name == "NS_ERROR_UNEXPECTED") // preference does not exist
				{
					try
					{
						PrefUtils.trySetBoolPref("nettspend.status-bar.enabled", true);
					}
					catch (e) {}
				}
			}
			
			Services.prefs.addObserver("nettspend.status-bar.enabled", this._applyStatusBarEnabledPrefs.bind(this));
		},

		_moveStatusPanel() {
			if (document.querySelector(".browserStack #statuspanel")) {
				document.querySelector("#status-bar #statusbar-display").appendChild(StatusPanel.panel);
			}
		},

		_onPopupShowing() {
			let item = document.querySelectorAll("#menu_NettspendStatusBar");
			if (item)
			{
				item.forEach(elem => {
					elem.label = LocaleUtils.str(statusBundle, "nettspend_statusbar.label");
					elem.accessKey = LocaleUtils.str(statusBundle, "nettspend_statusbar.accesskey");

					let pref = Services.prefs.getBoolPref("nettspend.status-bar.enabled");

					if (pref == true)
					{
						elem.setAttribute("checked", "true");
					}
					else
					{
						elem.removeAttribute("checked");
					}
				});
			}
		},

		setStatusBarState(state)
		{
			PrefUtils.trySetBoolPref("nettspend.status-bar.enabled", state);
			this._hideStatusPanel(state);
		},

		_applyStatusBarEnabledPrefs() {
			let newState = Services.prefs.getBoolPref("nettspend.status-bar.enabled");
			this._hideStatusPanel(newState);
		},

		_hideStatusPanel(state) {
			let panel = document.querySelector("#browser-bottombox");

			if (state == true)
			{
				panel.removeAttribute("hidden");
			}
			else
			{
				panel.setAttribute("hidden", "true");
			}

			let menuitem = document.querySelectorAll("#menu_NettspendStatusBar");

			if (menuitem) {
				menuitem.forEach(elem => {
					if (state == true)
					{
						elem.setAttribute("checked", "true");
					}
					else {
						elem.removeAttribute("checked");
					}
				});
			}
		}
	};

	document.addEventListener("DOMContentLoaded", NettspendStatusBarManager.init(), false);

	waitForElement("#statuspanel").then(e => {
		NettspendStatusBarManager._moveStatusPanel();
	});

	waitForElement("#menu_viewPopup").then((menu) => {
		let statusBarItem = window.MozXULElement.parseXULToFragment(NettspendStatusBarManager.menuFragment).firstChild;
		statusBarItem.id = "menu_NettspendStatusBar";
		menu.insertBefore(statusBarItem.cloneNode(), document.querySelector("#viewSidebarMenuMenu"));
		menu.addEventListener("popupshowing", NettspendStatusBarManager._onPopupShowing);
	});

	// Compact Menu Reloaded Support
    waitForElement("#compact-menu-popup").then((menu) => {
        menu.addEventListener("popupshowing", NettspendStatusBarManager._onPopupShowing);
    });

	waitForElement("#tabbrowser-tabpanels").then(e => {	
		let browserStackObserver = new MutationObserver(NettspendStatusBarManager._moveStatusPanel);
		browserStackObserver.observe(e, { childList: true, subtree: true });
	});
}