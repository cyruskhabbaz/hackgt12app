import { settingCategories, settings } from "@/info/settings"
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react"

export default function SettingsPanel({onClose}) {
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(settingCategories)[0]);

    console.log("cats", settingCategories);

    console.log("sel", selectedCategory);

    return (
        <div
            className="settings-panel-bg-cover"
            onClick={ev => {
                if (ev.target.className == "settings-panel-bg-cover") {
                    onClose();
                }
            }}
        >
            <div className="settings-panel">
                <div className="settings-top-bar">
                    <p className="title">Settings</p>
                    <a className="btn" onClick={onClose}>
                        <XIcon/>
                    </a>
                </div>
                <div className="settings-split">
                    <div className="settings-category-container">
                        {
                            Object.keys(settingCategories).map((ctg, i) => (
                                <a
                                    key={i}
                                    className={"category" + (selectedCategory === ctg ? " selected" : "")}
                                    onClick={() => {setSelectedCategory(ctg)}}
                                >
                                    <p>
                                        {ctg}
                                    </p>
                                </a>
                            ))
                        }
                    </div>
                    <div className="settings-option-container">
                        {Object.keys(settings).map((setting, i) =>
                        settingCategories[selectedCategory].includes(setting) ?
                        (
                            <div key={i} className="option">
                                <div className="option-name-container">
                                    <p>{setting}</p>
                                </div>
                                <div className="option-value-container">
                                    {/* change this to make options interface dependent on the option itself */}
                                    {/* e.g. connected accounts will have option to connect account */}
                                    <input type="text" value={JSON.stringify(settings[setting])}></input>
                                </div>
                            </div>
                        ) : undefined
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}