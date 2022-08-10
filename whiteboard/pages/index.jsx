import styles from "../styles/createroom.module.css";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { socketInit } from "../context/socket";

const CreateRoom = () => {
  const socket = useRef();
  const router = useRouter();
  const [user, setUser] = useState();
  const [roomId, setRoomId] = useState(null);
  const [roomIds, setRoomsIds] = useState([]);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState();
  const [mode, setMode] = useState("Create");
  const [img, setImg] = useState(null);

  const roomIdInput = useRef();
  const nameInput = useRef();
  const roomIdInputJoin = useRef();
  const nameInputJoin = useRef();

  useEffect(() => {
    socket.current = socketInit();
  }, []);

  const joinHandler = () => {
    let userId = uuidv4();
    setUserId(userId);
    if (nameInputJoin.current.value === "") return;
    if (roomIdInputJoin.current.value === "") return;
    const exists = roomIds.map((room) => room === roomIdInputJoin.current.value);
    if (exists[0] === "false") {
      return;
    }
    const roomData = { name: nameInputJoin.current.value, roomId: roomIdInputJoin.current.value, userId, host: false, presenter: false };
    setUser(roomData);
    socket.current.emit("userJoined", roomData);
    router.push(`/${roomIdInputJoin.current.value}`);
  };

  useEffect(() => {
    socket.current.on("userIsJoined", (data) => {
      if (data.success) {
        console.log("User Joined");
      } else {
        console.log("User Joined Error");
      }
    });
  }, []);

  const generateRoomHandler = () => {
    let roomId = uuidv4();
    roomIdInput.current.value = roomId;
    setRoomId(roomId);
  };

  const submitHandler = () => {
    let userId = uuidv4();
    setUserId(userId);
    setUserName(nameInput.current.value);
    setRoomsIds((state) => [...state, roomId]);

    if (roomIdInput.current.value === "") return;
    if (nameInput.current.value === "") return;

    const roomData = { name: nameInput.current.value, roomId, userId, host: true, presenter: true };
    setUser(roomData);
    socket.current.emit("userJoined", roomData);
    router.push(`/${roomId}`);
  };

  const modeHandler = (mode) => {
    setMode(mode);
  };

  return (
    <>
      {mode === "Create" && (
        <div className={styles.pageContainer}>
          <div className={styles.roomContainer}>
            <div className={styles.header}>Create Room</div>
            <input className={styles.input} placeholder="Enter your name" ref={nameInput} />
            <div className={styles.generate}>
              <input className={styles.input} placeholder="Generate Room code" ref={roomIdInput} value={roomIdInput?.current?.value} />
              <button onClick={generateRoomHandler} className={styles.submit}>
                Generate
              </button>
            </div>

            <button onClick={submitHandler} className={styles.submit}>
              Create a Room
            </button>
            <div>or</div>
            <button onClick={() => modeHandler("Join")}>Join a room</button>
          </div>
        </div>
      )}
      {mode === "Join" && (
        <div className={styles.pageContainer}>
          <div className={styles.roomContainer}>
            <div className={styles.header}>Join Room</div>
            <input className={styles.input} placeholder="Enter your name" ref={nameInputJoin} />
            <input className={styles.input} placeholder="Enter Room code" ref={roomIdInputJoin} />
            <button onClick={joinHandler} className={styles.submit}>
              Join Room
            </button>
            <div>or</div>
            <button onClick={() => modeHandler("Create")}>Create a room</button>
          </div>
        </div>
      )}
    </>
  );
};
export default CreateRoom;
