import { Switch } from "@mui/material";

class SettingOption {
    name = ""
    value = "";
    type = "string";
    handleChange=(()=>{});

    constructor(name, value="", type="string", handleChange=(()=>{})) {
        this.name = name;
        this.type = type;
        this.handleChange = handleChange;
        if (this.type === "boolean") {
            this.value = Boolean(value);
        }
    }

    update(newValue) {
        let parsedNewValue;
        try {
            parsedNewValue = JSON.parse(newValue);
        } catch {
            parsedNewValue = newValue
        }
        console.log("update " + this.name + "\n", this.value, "\nto\n", parsedNewValue, "\ninput:\n", newValue);
        this.value = parsedNewValue;
    }

    static Component({settingOption, onChange}) {
        const fullOnChange = val => {
            console.log(settingOption);
            console.log("val", val);
            settingOption.update(val);
            onChange();
            // setTimeout(() => {
            //     console.log(settingOption);
            // }, 500);
        }
        return (
            <div className="option">
                <div className="option-name-container">
                    <p>{settingOption.name}</p>
                </div>
                <div className="option-value-container">
                    {(() => {
                        if (settingOption.type === "boolean") {
                            return (
                                <input
                                    type="checkbox"
                                    checked={settingOption.value}
                                    onChange={e => {
                                        fullOnChange(e.target.checked);
                                    }}
                                />
                            )
                        }
                        if (settingOption.type === "string") {
                            return (
                                <input
                                    type="text"
                                    defaultValue={settingOption.value}
                                    onChange={e => {
                                        fullOnChange(e.target.value);
                                    }}
                                />
                            )
                        }

                        return (
                            <input
                                type="text"
                                defaultValue={JSON.stringify(settingOption.value)}
                                onChange={fullOnChange}
                            />
                        )
                    })()}
                </div>
            </div>
        )
    }
}

const settings = [
    new SettingOption("Connected Calendar"),
    new SettingOption("Connect Event Scraping Source (Gmail)"),
    new SettingOption("something else", undefined,"boolean")
]

const settingCategories = {
    Accounts: [
        "Connected Calendar",
        "Connect Event Scraping Source (Gmail)"
    ],
    Other: [
        "something else"
    ]
}

export { settings, settingCategories, SettingOption };