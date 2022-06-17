import React, { useEffect } from "react";
import Canvas from "./Canvas";
import "./Game.scss";
import Chat from "./Chat";
import { useLocation, useNavigate } from "react-router-dom";
export default function Game(props) {
  const navigate = useNavigate()
  // let loggedIn = false
  // const setUser = props.setUser
  // sendData function from props => props.sendData
  // console.log("game loading")
  // pass the mapimg as props
  // console.log("GAME PROPS", props.sendPrivateMessage)
  // pass the mapimg as props
  const sendMessage = props.sendMessage
  const sendPrivateMessage = props.sendPrivateMessage
  // const getAllUsers = props.getAllUsers
  // getAllUsers()
  const location = useLocation();
  // useEffect(() => {
  //   if (location.state === null) navigate("/")
  // }, [])
  // useEffect(() => {
  // console.log("LOCATION", location.state)
  // if (location.state == null) navigate("/")
  // })
  // console.log('inside game',location.state)  //username
  // console.log('inside game',location.state.userName)  //username
  // if (location.state === null) alert("hey")

  // if (location.state !== null) {

  console.log("location", location)
  return (
    <>
      {/* <Layout /> */}
      <div className="main-container">
        {/* {(location.state === null) && navigate("/")} */}
        {/* <Canvas username={location.state[0] || 'guest'} avatar={location.state[1]} sendData={props.sendData} sendMessage={sendMessage} sendPrivateMessage={sendPrivateMessage} room={props.room} /> */}
        <Canvas username={props.nickname} avatar={location.state?.[1]} sendMessage={sendMessage} sendPrivateMessage={sendPrivateMessage} room={props.room} sendData={props.sendData} />
        {/* console.log('location.state', location.state) */}
        <Chat username={props.nickname} room={props.room} handleSubmitNickname={props.handleSubmitNickname} nickname={props.nickname} />
      </div>
    </>
  );
  // }
  // else {
  //   return (
  //     <Routes>
  //       <Route path="/" />
  //     </Routes>
  //   )
  // }
}
