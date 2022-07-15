import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../App";
import Canvas from "./Canvas";
import "./Game.scss";
import Chat from "./Chat";
import Online from "./Online";

import { useLocation } from "react-router-dom";
import FriendList from "./FriendsList";

export default function Game(props) {
  const location = useLocation();
  const { nickname, socket } = useContext(SocketContext);
  const { sendMessage, sendPrivateMessage } = props

  console.log('location', location);

  const [show, setShow] = useState(false);
  const [lecture, setLecture] = useState("https://www.youtube.com/embed/FSs_JYwnAdI" );
  const [url, setUrl] = useState("");
  const showLecture = () => {
    setShow(!show);
  }

  function sendUrl(url){
    socket && socket.emit("lecture", url);
  }

useEffect(() => {
    socket.on("new lecture", data => {
      setLecture(data)
    })
},[socket])
  return (

    <div className='main'>

      <div className="main-container">
        <div className="lecture-container">
          { location.pathname === '/game/js' && <button className="lecture-btn" onClick={showLecture}>LECTURE</button>}
          { show && <div className="lecture">
            <iframe width="560" height="315" src={lecture} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            <div>
              <input className="lecture-input" type="text" placeholder="YOUTUBE URL" onKeyUp={e => setUrl(e.target.value)}></input>
              <button className="input-btn" onClick={() => {sendUrl(url)}}>UPLOAD</button>
            </div>
          </div>}
        </div>
        <Canvas
          username={nickname}
          avatar={location.state?.[1]}
          sendMessage={sendMessage}
          sendPrivateMessage={sendPrivateMessage}
          room={props.room}
          sendData={props.sendData}
          map={props.map}
        />
        <Chat
          username={props.username}
          room={props.room}
          handleSubmitNickname={props.handleSubmitNickname}
        />
      </div>
      <div className="side-bar">
          <FriendList />
          <Online />
        </div>
    </div>
  );
}
