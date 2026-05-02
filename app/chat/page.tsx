"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";

interface Message {
  id: number;
  role: "coach" | "user";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "coach",
    content:
      "I have reviewed the telemetry. Your discipline is fracturing. $142.50 evaporated on \"entertainment\" while your high-yield debt bleeds you dry at 22% APR. This is unacceptable. Explain this weakness immediately.",
  },
  {
    id: 2,
    role: "user",
    content:
      "It was a necessary client dinner. I couldn't avoid it without risking a contract.",
  },
  {
    id: 3,
    role: "coach",
    content:
      'Excuses are the architecture of failure. If the dinner was a necessary tactical expense, prove the ROI. Otherwise, it is indulgence masked as strategy. The deadline approaches. To verify your current standing and calculate the penalty trajectory, raw data is required.',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  console.log("[ChatPage] Rendering chat. Messages count:", messages.length);

  const handleSend = () => {
    if (!input.trim()) return;
    console.log("[ChatPage] Sending message:", input.trim());
    const newMsg: Message = {
      id: messages.length + 1,
      role: "user",
      content: input.trim(),
    };
    setMessages([...messages, newMsg]);
    setInput("");

    // Simulate coach response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "coach",
          content:
            "Your words reveal the pattern. Let us examine the data. Pull up your last 30 days of transactions. The truth hides in the numbers, not the narrative.",
        },
      ]);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <div className={styles.chatPage}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div>
            <span className="label-caps text-primary">TARGET LOCK</span>
            <h2 style={{ fontSize: 20, marginTop: 4 }}>ELIMINATE DEBT</h2>
          </div>
          <div className={styles.stakeInfo}>
            <div className={styles.stakeCard}>
              <span className="label-caps text-muted">Active Stake</span>
              <span className={styles.stakeAmount}>$500 Penalty</span>
              <span className="text-muted" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                Failure to meet the $1,200 monthly reduction will trigger an automatic donation to a charity you despise.
              </span>
            </div>
            <div className={styles.timerBadge}>
              <span className="material-icons" style={{ fontSize: 16 }}>timer</span>
              <span>7 DAYS REMAINING</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.role === "coach" ? styles.messageCoach : styles.messageUser
              }`}
            >
              {msg.role === "coach" && (
                <div className={styles.messageAvatar}>
                  <Image
                    src="/mascot.png"
                    alt="Coach"
                    width={40}
                    height={40}
                    className={styles.coachAvatarImg}
                  />
                </div>
              )}
              <div className={styles.messageBubble}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className={styles.chatInput}>
          <input
            type="text"
            className="input-field"
            placeholder="Share your update..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            id="chat-input"
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            id="chat-send"
          >
            <span className="material-icons" style={{ fontSize: 18 }}>send</span>
          </button>
        </div>
      </div>
    </>
  );
}
