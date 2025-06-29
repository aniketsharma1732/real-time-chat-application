import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
    onSnapshot,
    doc,
    updateDoc,
    getDoc,
    arrayUnion,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
    const [chat, setChat] = useState(null);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = useUserStore();
    const [img, setImg] = useState({
        file: null,
        url: "",
    });
    

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages?.length]);

    useEffect(() => {
        if (!chatId) return;

        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };


    const handleSend = async () => {
        if (text.trim() === "") return;

        let imgUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }
            const newMessage = {
                senderId: currentUser.id,
                text,
                createdAt: new Date(),
                ...(imgUrl && { img: imgUrl }),
            };

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion(newMessage),
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchats", id); // 🔁 Make sure this matches your DB structure
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    if (Array.isArray(userChatsData.chats)) {
                        const chatIndex = userChatsData.chats.findIndex(
                            (c) => c.chatId === chatId
                        );

                        if (chatIndex !== -1) {
                            userChatsData.chats[chatIndex].lastMessage = text;
                            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                            userChatsData.chats[chatIndex].updatedAt = Date.now();

                            await updateDoc(userChatsRef, {
                                chats: userChatsData.chats,
                            });
                        }
                    }
                }
            });

            setText(""); // Clear input after sending
        } catch (err) {
            console.log("Error sending message:", err);
        }

        setImg({
            file: null,
            url: ""
        })

        setText("");
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username }</span>
                        <p>Start chatting below 👇</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="Call" />
                    <img src="./video.png" alt="Video" />
                    <img src="./info.png" alt="Info" />
                </div>
            </div>

            <div className="center">
                {chat?.messages?.map((message, index) => (
                    <div
                        className={message.senderId === currentUser.id ? "message own" : "message"}
                        key={message.createdAt?.toString() || index}
                    >
                        <div className="texts">
                            {message.img && <img src={message.img} alt="msg media" />}
                            <p>{message.text}</p>
                            {/* <span>{message}</span>*/}
                        </div>
                    </div>
                ))}
                {img.url && (
                    <div className="message own uploading">
                        <div className="texts">
                            <img src={img.url} alt="preview" />
                            
                        </div>
                    </div>
                )}

                <div ref={endRef}></div>
            </div>

            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="Upload" />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
                    <img src="./camera.png" alt="Camera" />
                    <img src="./mic.png" alt="Mic" />
                </div>
                <input
                    type="text"
                    placeholder={isCurrentUserBlocked || isReceiverBlocked ? "you cannot send a message" : "Type a message..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emojis">
                    <img
                        src="./emoji.png"
                        alt="emoji"
                        onClick={() => setOpen((prev) => !prev)}
                    />
                    {open && (
                        <div className="picker">
                            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                        </div>
                    )}
                </div>
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
