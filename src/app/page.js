"use client";

import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CircleXIcon, CogIcon, EditIcon, EraserIcon, PencilIcon, RefreshCwIcon, SettingsIcon, SparkleIcon, SparklesIcon, SunIcon, SunMoonIcon, UserIcon, WandSparklesIcon, XIcon } from "lucide-react"
import { appInfo } from "../info/appInfo";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useEffect, useState } from "react";
import _ from "lodash";
import SettingsPanel from "./settingsPanel";
import AuthPanel from "./authPanel";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import axios from "axios";
import { onValue, push, ref, remove, set, update } from "firebase/database";
import { db } from "@/info/firebaseConfig";
import ICAL from "ical.js";

const logoImg = require("../assets/radnel.png");

const localizer = momentLocalizer(moment);

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeselectingEvent, setIsDeselectingEvent] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [userData, setUserData] = useState({});

  const [fullCalendarData, setFullCalendarData] = useState({});
  const [calendarEvents, setCalendarEvents] = useState({});


  const [chatData, setChatData] = useState({});

  const [chatInput, setChatInput] = useState("");

  const [waitingForBotMessage, setWaitingForBotMessage] = useState(false);

  useEffect(() => {
    if (isDeselectingEvent) {
      setTimeout(() => {
        setSelectedEvent(null);
        setIsDeselectingEvent(false);
        setIsEditingEvent(false);
      }, 200);
    }
  }, [isDeselectingEvent])

  // console.log("selected event", selectedEvent);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, [])

  // async function fetchCalendarData() {
  //   if (!currentUser) {
  //     return {};
  //   }

  //   let oneMonth = 30 * 24 * 60 * 60 * 1000;
  //   let minD = new Date(Date.now() - 2 * oneMonth);
  //   let maxD = new Date(Date.now() + 2 * oneMonth);

  //   let minDateString = minD.toISOString();
  //   let maxDateString = maxD.toISOString();

  //   let token = await currentUser.getIdToken();

  //   let req = await axios.get(
  //     appInfo.apiURLs.gcal + "calendars/primary/events",
  //     {
  //       params: {
  //         timeMin: minDateString,
  //         timeMax: maxDateString
  //       },
  //       headers: {
  //         Authorization: "Bearer " + token
  //       }
  //     }
  //   )
  //   console.log("cal req", req);
  // }

  async function fetchICalData() {
    const res = await axios.get(appInfo.apiURLs.icalProxy);
    console.log(res.data);
    setFullCalendarData(res.data);
    let events = Object.keys(res.data).map((id, i) => {
      let evt = res.data[id];
      if (evt.type === "VEVENT") {
        // title: string
        // start: Date,
        // end: Date,
        // allDay: boolean,
        // resource: any
        return {
          resource: id,
          start: new Date(evt.start),
          end: new Date(evt.end),
          title: evt.summary
        }
      }
    }).filter(e => (e != undefined));
    setEventList(events);
  }

  useEffect(() => {
    if (currentUser) {
      // fetchCalendarData();
      fetchICalData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setChatData({});
      return;
    }

    let chatRef = ref(db, "/users/" + currentUser.uid + "/chat");
    onValue(chatRef, snapshot => {
      let val = snapshot.val();
      setChatData(val ? val : {});
    });
  }, [currentUser]);

  async function sendMessage() {
    let msg = chatInput;
    if (/^\s*$/.test(msg)) return;
    setChatInput("");
    let userChatRef = ref(db, "/users/" + currentUser.uid + "/chat/userToBot");
    await push(userChatRef, {
      time: Date.now(),
      content: msg
    });

    let aiUrl = appInfo.apiURLs.mastra + "/agents/calendarAgent/generate";

    try {
      setWaitingForBotMessage(true);
      const req = await axios.post(aiUrl,
      {
        messages: [
          {
            role: "user",
            content: msg
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      });
      setWaitingForBotMessage(false);
      if (req.status === 200) {
        let data = req.data;
        if (data.text) await addBotMessage(data.text);
      }
      else {
        await addBotMessage("Something went wrong...");
      }
    } catch (err) {
      console.log("error asking ai", err);
      setWaitingForBotMessage(false);
    }
  }

  async function addBotMessage(msg) {
    let userChatRef = ref(db, "/users/" + currentUser.uid + "/chat/botToUser");
    await push(userChatRef, {
      time: Date.now(),
      content: msg
    });
  }

  async function clearMessages() {
    let userChatRef = ref(db, "/users/" + currentUser.uid + "/chat/");
    await set(userChatRef, {});
  }

  return (
    <div className="app-container">
      <div className="section top-bar">
        <div className="options left"></div>
        <div className="title">
          <Image src={logoImg} alt="RADNEL" className="logo"/>
        </div>
        <div className="options right">
          <a className="btn" id="auth-btn" onClick={() => {setShowAuth(true)}}>
            {
              (currentUser && currentUser.photoURL) ? (
                <img src={currentUser.photoURL}/>
              ) : (
                <UserIcon />
              )
            }
          </a>
          <a className="btn" id="settings-btn" onClick={() => {setShowSettings(true)}}>
            <CogIcon/>
          </a>
        </div>
      </div>
      <div className="section main-area">
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            startAccessor="start"
            endAccessor="end"
            className="calendar-component"
            events={eventList}
            onSelectEvent={evt => {
              if (_.isEqual(evt, selectedEvent)) return;
              setSelectedEvent(null);
              setTimeout(() => {
                setSelectedEvent(evt);
              }, 0);
            }}
          />
        </div>
        <div className="right-panel">
          <div
            className={
              "event-details-container" +
              (selectedEvent === null ? "" : " animate-enter-once") +
              (isDeselectingEvent ? " animate-exit-once" : "")
            }
            style={selectedEvent === null ? {display: "none"} : undefined}
          >
            <div className="top-bar-container">
              <a className="btn" id="chat-close" onClick={() => {setIsDeselectingEvent(true);}}>
                <XIcon />
              </a>
            </div>
            {
              selectedEvent != null ? (
                <div className="event-details">
                  <p className="event-title">{selectedEvent.title}</p>
                  <p className="event-time">
                    {(() => {
                      if (selectedEvent.allDay) {
                        return start.toDateString();
                      }
                      let { start, end } = selectedEvent;
                      if (start.toDateString() == end.toDateString()) {
                        return start.toDateString() + ", " + start.toLocaleTimeString() + " - " + end.toLocaleTimeString();
                      }
                      else {
                        return start.toLocaleDateString() + " " + start.toLocaleTimeString()
                        + " - " + end.toLocaleDateString() + " " + end.toLocaleTimeString();
                      }
                    })()}
                  </p>
                </div>
              ) : undefined
            }
          </div>
          <div className="chat-container">
            <div className="top-bar-container">
              <a className="btn">
                <RefreshCwIcon onClick={fetchICalData}/>
              </a>
              <a className="btn" onClick={clearMessages}>
                <EraserIcon />
              </a>
            </div>
            <div className="chat-message-container">
              {(() => {
                if (Object.keys(chatData).length === 0) {
                  return;
                }

                let botMsgs = chatData.botToUser ?
                Object.values(chatData.botToUser).map(val => {
                  return {
                    ...val, from: "bot"
                  }
                }) : [];

                let userMsgs = chatData.userToBot ?
                Object.values(chatData.userToBot).map(val => {
                  return {
                    ...val, from: "user"
                  }
                }) : [];

                let allMsgs = botMsgs.concat(userMsgs).sort(
                  (a,b) => b.time - a.time
                );

                if (waitingForBotMessage) {
                  allMsgs = [{
                    content: "•••",
                    time: -1,
                    from: "bot"
                  }].concat(allMsgs);
                }

                return allMsgs.map((msg, i) => (
                  <div key={allMsgs.length-i} className={"chat-message " + msg.from}>
                    <p>{msg.content}</p>
                  </div>
                ))
              })()}
            </div>
            <div className="chat-input-container">
              <textarea
                value={chatInput}
                placeholder="Type to AI..."
                rows={2}
                onChange={e => {
                  setChatInput(e.target.value);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {showSettings ?
      <SettingsPanel onClose={() => {setShowSettings(false)}}/>
      : undefined}
      <AuthPanel
        onClose={() => {setShowAuth(false)}}
        currentUser={currentUser}
        style={showAuth ? {} : {display: "none"}}
        onUserDataUpdate={setUserData}
      />
    </div>
  );
}
