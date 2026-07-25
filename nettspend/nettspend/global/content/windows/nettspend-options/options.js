const gPrefHandler = {
    updatePref: function PrefHandler_updatePref(element)
    {
        switch (element.localName)
        {
            case "checkbox":
                element.checked = Services.prefs.getBoolPref(
                    element.getAttribute("preference"),
                    false
                );
                break;
            case "menulist":
                element.value = Services.prefs.getIntPref(
                    element.getAttribute("preference"),
                    0
                );
                break;
            case "input":
                switch (element.type)
                {
                    case "number":
                        element.value = Services.prefs.getIntPref(
                            element.getAttribute("preference"),
                            0
                        );
                        break;
                }
                break;
        }
    },

    handleEvent: function PrefHandler_handleEvent(event)
    {
        switch (event.type)
        {
            case "CheckboxStateChange":
                Services.prefs.setBoolPref(
                    event.target.getAttribute("preference"),
                    event.target.checked
                );
                break;
            case "input":
            {
                let pref = event.target;
                switch (pref.type)
                {
                    case "number":
                        if (pref.value && Number.isInteger(Number(pref.value)))
                        {
                            pref.removeAttribute("invalid");
                            Services.prefs.setIntPref(
                                pref.getAttribute("preference"),
                                Number(pref.value)
                            );
                        }
                        else
                        {
                            pref.setAttribute("invalid", "");
                        }
                        break;
                }
            }
            case "command":
                Services.prefs.setIntPref(
                    event.target.parentElement.parentElement.getAttribute("preference"),
                    Number(event.target.parentElement.parentElement.value)
                );
                break;
        }
    },

    observe: function PrefHandler_observe(subject, topic, data)
    {
        if (topic == "nsPref:changed")
        {
            let pref = document.querySelector(`[preference="${data}"]`);
            pref && this.updatePref(pref);
        }
    },

    init: function PrefHandler_init()
    {
        for (const pref of document.querySelectorAll("[preference]"))
        {
            this.updatePref(pref);
        }
        Services.prefs.addObserver(null, this);
        document.addEventListener("CheckboxStateChange", this);
        document.addEventListener("input", this);
        document.addEventListener("command", this);
    }
};

gPrefHandler.init();