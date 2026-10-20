import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Avatar, EmptyState } from "../components/components";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInbox = async () => {
    setLoading(true);
    try {
      const res = await api.get("/messages/inbox");
      setConversations(res.data.conversations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const openThread = async (partner) => {
    setActivePartner(partner);
    const res = await api.get(`/messages/thread/${partner._id}`);
    setThread(res.data.thread);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const res = await api.post("/messages", { receiver: activePartner._id, content: reply });
    setThread([...thread, res.data.message]);
    setReply("");
    loadInbox();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p className="page-subtitle">Conversations with other students about listings and requests.</p>
        </div>
      </div>

      <div className="messages-layout">
        <div className="conversation-list">
          {loading ? (
            <p className="muted">Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <EmptyState
              title="No conversations yet"
              description="Message someone from a listing or request to start a conversation."
            />
          ) : (
            conversations.map(({ partner, lastMessage }) => (
              <button
                key={partner._id}
                className={`conversation-item ${activePartner?._id === partner._id ? "active" : ""}`}
                onClick={() => openThread(partner)}
              >
                <Avatar name={partner.name} color={partner.avatarColor} size={36} />
                <div>
                  <strong>{partner.name}</strong>
                  <p>{lastMessage.content}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="thread-panel">
          {!activePartner ? (
            <EmptyState title="Select a conversation" description="Choose a conversation from the list to view it." />
          ) : (
            <>
              <div className="thread-header">
                <Avatar name={activePartner.name} color={activePartner.avatarColor} size={32} />
                <strong>{activePartner.name}</strong>
              </div>
              <div className="thread-messages">
                {thread.map((msg) => (
                  <div
                    key={msg._id}
                    className={`bubble ${msg.sender._id === user._id ? "bubble-mine" : "bubble-theirs"}`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <form className="thread-reply" onSubmit={handleSendReply}>
                <input
                  placeholder="Write a message…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button className="btn btn-primary">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
