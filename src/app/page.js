"use client";

import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CircleXIcon, CogIcon, EditIcon, PencilIcon, SettingsIcon, SparkleIcon, SparklesIcon, SunIcon, SunMoonIcon, UserIcon, WandSparklesIcon, XIcon } from "lucide-react"
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

const logoImg = require("../assets/radnel.png");

const localizer = momentLocalizer(moment);

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeselectingEvent, setIsDeselectingEvent] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [userData, setUserData] = useState({});

  const [apiCalendarData, setApiCalendarData] = useState({});
  const [calendarData, setCalendarData] = useState({});

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isDeselectingEvent) {
      setTimeout(() => {
        setSelectedEvent(null);
        setIsDeselectingEvent(false);
        setIsEditingEvent(false);
      }, 200);
    }
  }, [isDeselectingEvent])

  console.log("selected event", selectedEvent);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, [])

  console.log("ga cu", getAuth().currentUser);
  console.log("cu", getAuth().currentUser);

  // async function fetchCalendarData() {
  //   if (!currentUser) {
  //     return {};
  //   }
  //   let req = await axios.get(
  //     appInfo.apiURLs.gcal + "calendars/primary/events",
  //     {
  //       params: {
          
  //       }
  //     }
  //   )
  //   console.log(req);
  // }

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
            events={[
              {
                title: "this event",
                start: new Date(1758988800000),
                end: new Date(1758992400000),
                allDay: false,
                resource: "ok"
              },
              {
                title: "another event",
                start: new Date(1758994800000),
                end: new Date(1758999400000)
              }
            ]}
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
              <a className="btn">
                <PencilIcon />
              </a>
              <a className="btn" id="chat-close" onClick={() => {setIsDeselectingEvent(true);}}>
                <XIcon />
              </a>
            </div>
            {
              selectedEvent != null ? (
                <div className="event-details">
                  <input type="text" className="event-title" value={selectedEvent.title}></input>
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
                    <label>Start</label><input
                      type="datetime-local"
                      value=""
                      id=""
                    ></input>
                  </p>
                </div>
              ) : undefined
            }
          </div>
          <div className="chat-container">
            <div className="chat-message-container">

            </div>
            <div className="chat-input-container">
              <textarea placeholder="Type to AI..." rows={2}></textarea>
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
