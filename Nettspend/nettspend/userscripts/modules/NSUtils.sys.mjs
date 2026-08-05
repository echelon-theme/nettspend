export function renderElement(nodeName, attrMap = {}, childrenArr = []) {
    let prefix = null;
    let localName = nodeName;

    if (nodeName.includes(":")) 
	{
        [prefix, localName] = nodeName.split(":");
    }

    let namespaceURI;

    if (prefix) 
	{
        namespaceURI = this.document.documentElement.lookupNamespaceURI(prefix);

        if (!namespaceURI) 
		{
            throw new Error(`Unknown namespace prefix: ${prefix}`);
        }
    } else {
        namespaceURI = this.document.documentElement.lookupNamespaceURI(null) || "http://www.w3.org/1999/xhtml";
    }

    const element = this.document.createElementNS(namespaceURI, nodeName);

    for (let key in attrMap) 
	{
        if (key.includes(":")) 
		{
            const [attrPrefix, attrName] = key.split(":");
            const attrNS = this.document.documentElement.lookupNamespaceURI(attrPrefix);

            if (!attrNS) {
                throw new Error(`Unknown attribute namespace: ${attrPrefix}`);
            }

            element.setAttributeNS(attrNS, key, attrMap[key]);
        } 
		else {
            element.setAttribute(key, attrMap[key]);
        }
    }

    for (let i = 0; i < childrenArr.length; i++) {
        const child = childrenArr[i];

        if (typeof child == "string") 
		{
            element.appendChild(this.document.createTextNode(child));
        } 
		else 
		{
            element.appendChild(child);
        }
    }

    return element;
}

export async function waitForElement(selector, root = this.document)
{
    while (root.querySelector(selector) == null)
    {
        await new Promise(r => this.requestAnimationFrame(r));
    }
    return root.querySelector(selector);
}

export class PrefCalls
{
	static getPrefBranch()
	{
		return Services.prefs.getBranch(null);
	}

	static getDefaultPrefBranch()
	{
		return Services.prefs.getDefaultBranch(null);
	}

	static setPref(prefName, value, defaultBranch)
	{
		try 
		{
			let prefBranch = defaultBranch ? this.getDefaultPrefBranch() : this.getPrefBranch();

			switch (typeof value)
			{
				case "string":
					prefBranch.setStringPref(prefName, value);
					break;
				case "number":
					prefBranch.setIntPref(prefName, value);
					break;
				case "boolean":
					prefBranch.setBoolPref(prefName, value);
					break;
				default:
					return;
			}
		} 
		catch (e) 
		{
			throw e;
		}
	}

	static defaultPref(prefName, value)
	{
		this.setPref(prefName, value, true);
	}

	static lockPref(prefName, value)
	{
		try 
		{
			let prefBranch = this.getPrefBranch();

			if (prefBranch.prefIsLocked(prefName))
				prefBranch.unlockPref(prefName);

			this.defaultPref(prefName, value);

			prefBranch.lockPref(prefName);
		} 
		catch (e) 
		{
			throw e;
		}
	}
	
	static unlockPref(prefName)
	{
		try 
		{
			let prefBranch = this.getPrefBranch();

			prefBranch.unlockPref(prefName);
		} 
		catch (e) 
		{
			throw e;
		}
	}

	
	static getPref(prefName) {
		try 
		{
			let prefBranch = this.getPrefBranch();

			switch (prefBranch.getPrefType(prefName)) 
			{
				case prefBranch.PREF_STRING:
					return prefBranch.getStringPref(prefName);
				case prefBranch.PREF_INT:
					return Number(prefBranch.getIntPref(prefName));
				case prefBranch.PREF_BOOL:
					return prefBranch.getBoolPref(prefName);
				default:
					return null;
			}
		} 
		catch (e) 
		{
			throw e;
		}
	}

	static clearPref(prefName) {
		try
		{
			let prefBranch = this.getPrefBranch();
			prefBranch.clearUserPref(prefName);
		} catch (e) {};
	}
}

export class BrandUtils
{	
	static bundle = Services.strings.createBundle("chrome://branding/locale/brand.properties");

	static getBrandingKey(key)
	{
		return this.bundle.GetStringFromName(key);
	}
}

export class LocaleUtils
{
	
	static str(bundle, l10nId, ...extra)
    {
        try
        {
            if (arguments.length > 2)
            {
                return Services.strings.createBundle(bundle).formatStringFromName(l10nId, extra);
            }
            else
            {
                return Services.strings.createBundle(bundle).GetStringFromName(l10nId);
            }
        }
        catch (e)
        {
			try {
				let stringBundle = Services.strings.createBundle(`chrome://namoroka/content/locale/en-US/properties/${bundle.split("/").pop()}`);

				if (arguments.length > 2)
				{
					return Services.strings.createBundle(stringBundle).formatStringFromName(l10nId, extra);
				}
				else
				{
					return Services.strings.createBundle(stringBundle).GetStringFromName(l10nId);
				}
			}
			catch (e)
			{
				return "<" + l10nId + ">";
			}
        }
    }
}

export class setAttributes
{
	static set(element, attributes) {
		Object.keys(attributes).forEach(attr => {
			element.setAttribute(attr, attributes[attr]);
		});	
	}

	static remove(element, attributes) {
		Object.keys(attributes).forEach(attr => {
			element.removeAttribute(attr);
		});	
	}
}