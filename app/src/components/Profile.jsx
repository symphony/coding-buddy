import { useEffect, useCallback, useContext, useState } from "react";
import { SocketContext, UserListContext } from "../App.js";

export default function Profile(props) {
  const { clicked, profiles, nickname, setProfiles, profileShow, setProfileShow } = useContext(UserListContext);
  const { socket } = useContext(SocketContext);

  const [profile, setProfile] = useState({});

  useEffect(() => {
    socket.on("update login users information", ({ disconnectedUser }) => {
      const newProfiles = profiles;
      if (newProfiles[disconnectedUser]) {
        delete newProfiles[disconnectedUser];
        setProfiles(newProfiles);
      }
    });
  }, [profiles]);

  /**
   * profile = {
   *  name: {
   *     name: 'mike',
   *     email: 'email',
   *     languages: [html, css....],
   *     avatar_id: 'avatar_id',
   *   }
   * }
   */



  const profileNames = Object.keys(profiles);
  const profileArticles = profileNames.map((username, ind) => {

    // when user is not me!
    if (username !== nickname) {
      const title = profiles[username].name;
      const email = profiles[username].email;
      const languageLists = profiles[username].languages.map((lang, index) => (
        <li key={index} className="list-languages">{lang}</li>
      ));

      if (clicked.value === username) {
        return (
          <div className='profile' key={ind} onClick={props.closeProfile}>
            {/* 클릭없이 보고싶으면 밑에 있는것 사용 */}
            {/* <div className={`profile ${username}`} key={ind} style={{display: "inline"}}> */}
            {/* <title> */}
            {/* <div className="profile-name">{title}</div> */}

            <div className="profile-email"><p>Email</p>{email}</div>
            <div>
              <p>Languages</p>
              <div className="profile-language">{languageLists}</div>
            </div>

          </div>
        );
      }
    }
  });

  return <div className="div_profile" onClick={props.close}>{profileArticles}</div>;
};
