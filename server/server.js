
//@@@@@@@socket ID SPELLING FIX!!

require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
const express = require("express");
const session = require("express-session");
const app = express();
const httpServer = require("http").createServer(app);
const { Server } = require("socket.io"); //socketIo
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", //client
    credentials: true,
  },
});

const { createAdapter } = require("@socket.io/postgres-adapter"); //app.get, 안써도 socket.io 안에서 직접 postgres 연결이 가능. root path 따로 설정 불필요.
const sessionMiddleware = session({
  secret: "coding_buddy",
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true,
});

const { getOneUserLanguages } = require("./coding_buddy_db");
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

//G. socket(server)
//G. create a new instance of a socket handler
//G. and passing io as an argument.
//G. io is the Server.

app.use(cors());
app.use(sessionMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, }));

io.use((socket, next) => { sessionMiddleware(socket.request, {}, next); });
io.adapter(createAdapter(pool));

// store all users' socket id with username key-value pair
const currentUsers = {}; // => {username : socket.id}
const usersInRooms = {};

// OPEN SOCKET
io.on("connection", (socket) => {
  const session = socket.request.session;
  session.save();
  // LOGIN USER CONNECTED
  // socketID and username matching triggered when user login
  socket.on("SET USERNAME", (obj) => {
    //Login.jsx 의 setUser(res.data.userName)
    const { username, socketID } = obj;
    currentUsers[username] = socketID;
    pool.query("SELECT id, username AS name, email, avatar_id FROM users",
      (err, res) => {
        // res.rows => {id: , name: , email: , avatar_id}
        const allUsersObj = res.rows;
        // console.log(allUsersObj)
        pool.query(
          "SELECT languages.id, user_id, language_name FROM user_language JOIN languages ON language_id=languages.id",
          (err, res_1) => {
            // res.rows_1 => {id(languageID): , user_id: , language_name: }
            const userIDAndLang = res_1.rows;
            const loginUsersData = {};
            allUsersObj.map(user => {
              if (currentUsers[user.name]) {
                loginUsersData[user.name] = {
                  // socketID: socketID,
                  email: user.email,
                  avatar_id: user.avatar_id,
                  languages: []
                };
                userIDAndLang.map(lang => {
                  if (user.id === lang.user_id) {
                    loginUsersData[user.name].languages.push(lang.language_name);
                  }
                });
              }
            });
            // currentUsers = {name: socketID}
            const alluserNames = Object.keys(loginUsersData);
            alluserNames.forEach((name) => {
              io.to(currentUsers[name]) // socketID
                .emit("all user names", { "users": loginUsersData }); // all user names
            });
          });
      });
  });


  socket.on("friendsList", (id) => {
    // id.socketID = new user's socketid
    const newSocketID = id.socketID;
    // check this id is in currentUsers Object
    const existUsername = Object.keys(currentUsers).find((id) => currentUsers[id] === newSocketID)?.id;

    if (existUsername) { // @@아니면 이렇게 쓰는 건? if (existUsername)
      return pool.query("SELECT * FROM users")
        .then((res) => {
          // {id: , username: , password: , email: , avatar: , lan_id: }
          // 테이블이 존재하면 // 불필요한듯
          const userID = res.rows.find(obj => obj.username === existUsername);
          if (!userID) throw 'No user found';
          pool.query(
            // find added(followers) id
            "SELECT added FROM favorites WHERE added_by=$1",
            // {id: , following: , followed: }
            [userID])
            .then((res) => {
              const usernames = [];
              const followedIds = []; // userid[1, 2, 3....]
              const followedInfo = {};
              res.rows.map(obj => {
                followedIds.push(obj.added);
              });
              allusersTable.map(row => {
                if (followedIds.includes(row.id)) {
                  usernames.push(row.username);
                  followedInfo[row.username] = {};
                  followedInfo[row.username]["languages"] = [];
                  // followedInfo[row.username]["email"] = row.email
                }
              });
              // console.log("INFOMATION", usernames)
              // console.log(usernames);
              pool.query(
                "SELECT * FROM user_language JOIN languages ON language_id=languages.id", (err, res_3) => {
                  res_3.rows.map(userLanguageID => { // @@ userLanguageName 으로 바꾸고 밑에서 =>// obj.language_name 으로 하기
                    // console.log("THIS", userLanguageID);
                    // console.log(allusersTable);
                    const nameMatching = allusersTable.find(obj => obj.id === userLanguageID.user_id).username;
                    if (followedIds.includes(userLanguageID.user_id)) {
                      followedInfo[nameMatching].languages.push(userLanguageID.language_name);
                      // console.log(userLanguageID.language_id)
                    }
                    // console.log("INFO", userLanguageID)
                  });
                  socket.emit("friendsListBack", followedInfo);
                });
            });

        })
        .catch((e) => console.error(e));
    }
  });
});


// FOR USER MOVEMENT (Canvas)
socket.on('sendData', data => {

  const { userState, room, removeFrom } = data;

  // console.log('got data', data);
  if (!usersInRooms[room]) {
    usersInRooms[room] = {};
  }
  // console.log('BEFORE LOOP', usersInRooms);
  //when usersInRooms have some properties
  for (const rooms in usersInRooms) {
    // console.log(usersInRooms[rooms])
    for (const user in usersInRooms[rooms]) {
      if (room !== rooms && userState.username === user) {
        delete usersInRooms[rooms][userState.username];
      }
    }
  }
  usersInRooms[room][userState.username] = userState;
  // console.log('usersInROMMs', usersInRooms)

  io.emit('sendData', { usersInRooms, room }); // 다시 Canvas.jsx -> const newCharactersData = data;

});

socket.on("lecture", url => {
  const address = 'https://www.youtube.com/embed/' + url.split('=')[1];
  io.emit("new lecture", address);
});


// ADD FRIEND
// socket.on("add friend", {username, addFreindName})
socket.on("add friend", ({ username, addFriendName, userID }) => {
  // console.log("ADD FRIEND", nameObj)
  pool.query(
    "SELECT id, username FROM users WHERE username=$1", [addFriendName],
    (err, res) => {
      // res.rows => users table [{id: , username: ,....}]
      const targetID = res.rows[0].id;
      // console.log("target users id", targetID);

      pool.query(
        "INSERT INTO favorites (added_by, added) VALUES ($2, $1)", [userID, targetID]
      );
      // console.log(targetID);
      /////////////////////////////////////////
      /////////////////////////////////////////

      pool.query("SELECT * FROM user_language JOIN languages ON user_language.language_id=languages.id WHERE user_id=$1", [targetID],
        (err, res) => {
          const languages = [];
          res.rows.map(obj => {
            languages.push(obj.language_name);
          });
          const newFriendLanguageObj = {};
          newFriendLanguageObj[addFriendName] = { languages };
          // console.log("WHAT", addFriendName, {languages});
          // socket.emit("updateFriendsList", newFriendLanguageObj);
          socket.emit("updateFriendsList", { newFriendName: addFriendName, languages: languages });
        });

    }
  );

  // pool.query(
  //   "SELECT * FROM favorites",
  //   (err, res) => {
  //     // console.log(res.rows)
  //   }
  // );
});

// receive message
socket.on("NEW MESSAGE", (e) => {
  // console.log(e);
  // all users
  io.emit("PASS", "PASS");
});

socket.on("PRIVATE", (obj) => {
  // obj = {nickname, content: "", recipient: recipient}
  // nickname = 보내는사람
  // content = 내용
  // recipient = 받는사람
  // const Name target
  const responseData = {
    ...obj,
    type: "PRIVATE",
    time: new Date()
  };


  // const content = obj.content;
  const recipient = obj.recipient;
  const senderSocketID = obj.senderSocketId;

  const recipientSocketId = currentUsers[recipient.value]; // get target's socketid
  io
    .to(recipientSocketId)
    .emit("PRIVATE", responseData);
  io
    .to(senderSocketID)
    .emit("PRIVATE", responseData);
});

/* ADDED FROM socket/index.js */
const usersWithRoom = {};
const rooms = ['plaza', 'js', 'ruby'];
let newRoom;

socket.on("JOIN_ROOM", (requestData) => {
  // 콜백함수의 파라미터는 클라이언트에서 보내주는 데이터.
  // 이 데이터를 소켓 서버에 던져줌.
  // 소켓서버는 데이터를 받아 콜백함수를 실행.
  // const currentRoom = usersWithRoom[requestData[0]];

  newRoom = requestData[1];
  socket.join(newRoom); // user를 "room 1" 방에 참가시킴.
  const responseData = {
    ...requestData,
    type: "JOIN_ROOM",
    time: new Date(),
  };
  // console.log('JOIN TO NEW ROOM', newRoom)

  // receive.message는 ChatRoom.jsx 에서 defined
  // --------------- SEND MESSAGE ---------------
  socket.on("SEND_MESSAGE", (requestData) => {
    //emiting back to receive message in line 67
    const responseData = {
      ...requestData,
      type: "SEND_MESSAGE",
      time: new Date(),
    };
    // SVGPreserveAspectRatio.to(roomName).emit
    io.to(newRoom).emit("RECEIVE_MESSAGE", responseData);

    //responseData = chat message
    //@@@@@@ ChatRoom.jsx line 21
    io.emit("dataToCanvas", responseData);
  });


  // "room 1"에는 이벤트타입과 서버에서 받은 시각을 덧붙여 데이터를 그대로 전송.
  io.to(newRoom).emit("RECEIVE_MESSAGE", responseData);
  // 클라이언트에 이벤트를 전달.
  // 클라이언트에서는 RECEIVE_MESSAGE 이벤트 리스너를 가지고 있어서 그쪽 콜백 함수가 또 실행됌. 서버구현 마치고 클라이언트 구현은 나중에.
});

socket.on("UPDATE_NICKNAME", (requestData) => {
  const responseData = {
    ...requestData,
    type: "UPDATE_NICKNAME",
    time: new Date(),
  };
  io.to(roomName).emit("RECEIVE_MESSAGE", responseData);
});




/* 오브젝트에서 종료되는 유저 삭제 */
// todo need to test this function and make sure offline user is deleted from other users online list
socket.on("disconnect", () => {
  const alluserNames = Object.keys(currentUsers);
  let disconnectedUsername;
  alluserNames.forEach((name) => {
    if (currentUsers[name] === socket.id)
      delete currentUsers[name];
    disconnectedUsername = name;
    // console.log("Server.js - A USER DISCONNECTED - CURRENT USERS", name, socket.id);
  }); // {"users": [name1, name2] }
  io.emit("update login users information", { disconnectedUser: disconnectedUsername }); // App.jsx & Recipients.jsx 로 보내기
});


app.get("/", (req, res) => {
  // 8000
  res.json({ connected: "start" });
});

// 로그인 정보 리퀘스트 .. 진행중
app.post("/login", (req, res) => {
  const email = req.body.userEmail;
  const password = req.body.userPassword;

  return pool.query("SELECT * FROM users WHERE email=$1 AND password=$2", [email, password])
    .then((res) => {
      const { userID, userName, avatar } = res.rows[0];
      // find languages
      return pool.query("SELECT * FROM user_language WHERE user_id=$1", [userID])
        .then((res) => {
          if (!res.rows.length) {
            return console.log("No available language", res.rows);
          }
          const userLanguages = res.rows.map(({ language_id }) => language_id);
          const loginUserData = {
            userName,
            avatar,
            userLanguages,
            userID,
            // friends
          };
        });
    })
    .catch((e) => console.error(e));
});


// friends

app.post("/register", (req, res) => {
  const userName = req.body.userInfo.userName;
  const userPassword = req.body.userInfo.userPassword;
  const userEmail = req.body.userInfo.userEmail;
  const userLanguages = req.body.userInfo.userLanguages;
  const avatar = req.body.userInfo.userAvatar;

  pool.query(
    //check if user al
    // ready exists in DB during registration
    "SELECT * FROM users WHERE username = $1 OR email = $2", [userName, userEmail])
    .then((response) => {
      // break promise chain early by throwing error
      if (response.rows[0]) {
        res.status(201).send(false);
        // return Promise.reject(('User already registered')); // option 1?
      }
      // throw res.status(409).send('User already registered'); // option 2

      return pool.query(
        "INSERT INTO users (username, password, email, avatar_id) VALUES ($1, $2, $3, $4) RETURNING *", [userName, userPassword, userEmail, avatar]);
      // "RETURNING *" means we are returning the new 'user' entry to the next .then
    })
    .then((response) => {
      const { id } = response.rows[0];
      const userID = id;
      const userData = { userName, avatar, userLanguages, userID };

      userLanguages.forEach((lang_id) => {
        pool.query(
          "INSERT INTO user_language (user_id, language_id) VALUES ($1, $2) RETURNING *",
          [response.rows[0].id, lang_id]
        );
      });
      // sending user info back to Register.jsx (as res.data)
      console.log("REGISTRATION SUCCESS", userData);
      res.status(201).send(userData);
    })
    .catch((e) => { console.error(e); });
});


httpServer.listen(PORT, () => {
  console.log(
    `Server Started on port ${PORT}, ${new Date().toLocaleString()} #####`
  );
});