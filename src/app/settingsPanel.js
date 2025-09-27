import { settingCategories, SettingOption, settings } from "@/info/settings"
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react"

export default function SettingsPanel({onClose}) {
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(settingCategories)[0]);
    const [lastSettingChange, setLastSettingChange] = useState(Date.now());

    console.log("selected category", selectedCategory);

    const onSettingChange = () => {
        setLastSettingChange(Date.now())
    }

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
                        {settings.map((setting, i) => {
                            return (
                                settingCategories[selectedCategory].includes(setting.name) ?
                                (
                                    <SettingOption.Component
                                        settingOption={setting}
                                        key={i}
                                        onChange={onSettingChange}
                                    />
                                ) : undefined
                            )
                        }
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}