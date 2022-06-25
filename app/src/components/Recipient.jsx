import { useState, useContext, useEffect } from "react";
import Select from 'react-select';
import { SocketContext } from '../App.js'
import { UserListContext } from '../App.js'

function Recipient() {
  let { nickname, online } = useContext(SocketContext)
  const { recipient, setRecipient } = useContext(UserListContext);


  const [otherUsers, setOtherUsers] = useState([])
  useEffect(() => {

    const onlineOthers = online.filter(user => user.value !== nickname)
    return setOtherUsers(onlineOthers)
  }, [online, nickname])

  return (
    <div className="card d-flex flex-row chat-to-container" >
      <label htmlFor="user-name-input" className="chat-to">
        Recipient
      </label>
      <Select
        type="text"
        id="pdown"
        maxLength={12}
        value={recipient !== null && (recipient || { value: "all", label: "all" })}
        defaultValue={recipient}
        onChange={setRecipient}
        options={otherUsers}
      />

    </div>

  );
};

export default Recipient;