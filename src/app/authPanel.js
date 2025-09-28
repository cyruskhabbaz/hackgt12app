import { appInfo } from "@/info/appInfo";
import { SettingOption, settings } from "@/info/settings"
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react"
import { IoLogoGoogle } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { db, signInWithGoogle, signOut } from "@/info/firebaseConfig";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { onValue, ref, update } from "firebase/database";
import { UserCache } from "./data/userDataCache";

export default function AuthPanel({onClose, currentUser, style, onUserDataUpdate=(()=>{})}) {
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    const [userData, setUserData] = useState({});

    const router = useRouter();

    function errorParse(errMsg, isSigningUp=false) {
        let errorText = isSigningUp ? "SIGN UP FAILED" : "SIGN IN FAILED";
        if (errMsg) {
            let split = errMsg.split("/");
            if (split[1]) {
                return split[1]
                .replaceAll(")", "")
                .replaceAll("-", " ")
                .replaceAll(".", " ")
                .toUpperCase();
            }
        }
        return errorText;
    }

    async function handleGoogleSignIn() {
        console.log("attempting google sign in");
        setAuthError(null);
        setAuthLoading(true);
        try {
            let credential = await signInWithGoogle();
            console.log("credential", credential);
            setAuthLoading(false);
        } catch (err) {
            console.error("Google sign-in failed", err);
            let e = errorParse(err.message);
            if (e !== "POPUP CLOSED BY USER") {
                setAuthError();
            }
            setAuthLoading(false);
        }
    }

    async function handleEmailSignIn() {
        console.log("attempting email sign in");
        setAuthError(null);
        setAuthLoading(true);
        try {
            await signInWithEmailAndPassword(getAuth(), emailInput, passwordInput);
            setAuthLoading(false);
        } catch (err) {
            console.log("error:", err);
            setAuthError(errorParse(err.message));
            setAuthLoading(false);
        }
    }

    async function handleEmailSignUp() {
        console.log("attempting email sign up");
        setAuthError(null);
        setAuthLoading(true);
        try {
            await createUserWithEmailAndPassword(getAuth(), emailInput, passwordInput);
            setAuthLoading(false);
        } catch (err) {
            console.log("error:", err);
            setAuthError(errorParse(err.message));
            setAuthLoading(false);
        }
    }

    async function handleSignOut() {
        console.log("attempting sign out");
        setAuthError(null);
        setAuthLoading(true);
        try {
            await signOut();
            setAuthLoading(false);
        } catch {
            console.log("error:", err);
            setAuthError(errorParse(err.message));
            setAuthLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser) {
            let userRef = ref(db, "/users/" + currentUser.uid);
            onValue(userRef, snapshot => {
                setUserData(snapshot.val());
                if (Object.keys(userData).length === 0) {
                    let userRef = ref(db, "/users/" + currentUser.uid);
                    let newUserObject = UserCache.createNewUser(currentUser.email, currentUser.displayName);
                    update(userRef, newUserObject);
                }
            });
        }
        if (!currentUser) {
            setUserData({});
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            if (Object.keys(userData).length === 0) {
                let userRef = ref(db, "/users/" + currentUser.uid);
                let newUserObject = UserCache.createNewUser(currentUser.email, currentUser.displayName);
                update(userRef, newUserObject);
            }
        }
    }, [userData]);

    useEffect(() => {
        (typeof onUserDataUpdate === "function") && onUserDataUpdate(userData);
    }, [userData])

    console.log("userData", userData);

    return (
        <div
            className="panel-bg-cover"
            onClick={ev => {
                if (ev.target.className == "panel-bg-cover") {
                    onClose();
                }
            }}
            style={style}
        >
            <div className="panel auth-panel">
                <div className="top-bar">
                    <p className="title">Account</p>
                    <a className="btn" onClick={onClose}>
                        <XIcon/>
                    </a>
                </div>
                <div className="auth-menu-description">
                    <p>
                        {
                            currentUser ?
                            ("Hey, " + currentUser.displayName + "!")
                            : ("Welcome to " + appInfo.name + "!")
                        }
                    </p>
                </div>
                {
                    currentUser ? (
                        <div className="auth-signed-in-menu-container">
                            <div className="auth-inputs-containers">
                                <input
                                    type="button"
                                    value={"SIGN OUT"}
                                    onClick={handleSignOut}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="auth-menu-container">
                            <div className="auth-inputs-container">
                                {authError ? (
                                    <p className="error-label">{authError}</p>
                                ) : undefined}
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={emailInput}
                                    onChange={e => {
                                        setEmailInput(e.target.value)
                                    }}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={passwordInput}
                                    onChange={e => {
                                        setPasswordInput(e.target.value)
                                    }}
                                />
                                <input
                                    type="button"
                                    value={"SIGN IN"}
                                    onClick={handleEmailSignIn}
                                />
                                <input
                                    className="smaller"
                                    type="button"
                                    value={"CREATE ACCOUNT"}
                                    onClick={handleEmailSignUp}
                                />
                            </div>
                            <div className="auth-external-options-section">
                                <p>Sign in with</p>
                                <div className="auth-external-options-container">
                                    {[
                                        // list of sign in methods
                                        // [icon component, callback]

                                        [IoLogoGoogle, handleGoogleSignIn],
                                    ].map((value, i) => {
                                        let Icon = value[0];
                                        return (
                                            <a key={i} className="auth-external-option" onClick={value[1]}>
                                                <Icon/>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}