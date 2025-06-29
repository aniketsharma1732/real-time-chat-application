import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked
          ? arrayRemove(user.id)
          : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Adipisci,
          harum.
        </p>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared photo</span>
            <img src="./arrowDown.png" alt="" />
          </div>

          <div className="photos">
            {[1, 2, 3, 4].map((_, i) => (
              <div className="photoItem" key={i}>
                <div className="photoDetail">
                  <img
                    src="https://paradepets.com/.image/ar_4:3,c_fill,cs_srgb,fl_progressive,q_auto:good,w_1200/MTkxMzY1Nzg4NjczMzIwNTQ2/cutest-dog-breeds-jpg.jpg"
                    alt=""
                  />
                  <span>photo_2024_{i + 1}.png</span>
                </div>
                <img src="./download.png" className="icon" alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are blocked"
            : isReceiverBlocked
            ? "Unblock user"
            : "Block User"}
        </button>

        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
