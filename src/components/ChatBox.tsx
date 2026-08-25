"use client";

import React, { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Send, UserCircle, Building } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
}

interface ChatBoxProps {
  conversationId: string;
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
  propertyTitle?: string;
}

export function ChatBox({ conversationId, currentUserId, currentUserName, otherPartyName, propertyTitle }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      // Add message to subcollection
      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        text,
        senderId: currentUserId,
        senderName: currentUserName,
        createdAt: serverTimestamp()
      });

      // Update parent document's updatedAt timestamp
      await updateDoc(doc(db, "conversations", conversationId), {
        updatedAt: serverTimestamp(),
        lastMessage: text
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">{otherPartyName}</h3>
            {propertyTitle && (
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <Building className="w-3 h-3" /> {propertyTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400">
            <p>No messages yet.</p>
            <p className="text-sm">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            
            // Handle Firestore serverTimestamp
            let timeString = "";
            if (msg.createdAt?.toMillis) {
              timeString = formatDistanceToNow(msg.createdAt.toMillis(), { addSuffix: true });
            } else if (typeof msg.createdAt === 'number') {
              timeString = formatDistanceToNow(msg.createdAt, { addSuffix: true });
            }

            return (
              <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe 
                    ? "bg-[#0073e6] text-white rounded-tr-sm" 
                    : "bg-white text-zinc-800 border border-zinc-200 rounded-tl-sm shadow-sm"
                }`}>
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-zinc-400"}`}>
                    {timeString || "Just now"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-zinc-200 shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-zinc-100 border-transparent focus:bg-white focus:border-[#0073e6] focus:ring-1 focus:ring-[#0073e6] rounded-full text-sm transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-[#0073e6] text-white rounded-full flex items-center justify-center hover:bg-[#005bb5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
