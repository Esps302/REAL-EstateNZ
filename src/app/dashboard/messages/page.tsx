"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageSquare, Building } from "lucide-react";
import { ChatBox } from "@/components/ChatBox";
import { formatDistanceToNow } from "date-fns";

export default function DashboardMessagesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convos);
      
      // Auto-select first conversation if none selected
      if (convos.length > 0 && !selectedConvoId) {
        setSelectedConvoId(convos[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, selectedConvoId]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center h-[500px]">Loading Messages...</div>;
  }

  const selectedConvo = conversations.find(c => c.id === selectedConvoId);
  const otherPartyName = selectedConvo 
    ? Object.entries(selectedConvo.participantNames).find(([id]) => id !== user?.uid)?.[1] as string
    : "Agent";

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)] min-h-[600px] flex gap-6">
      
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 shrink-0">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0073e6]" /> 
            My Messages
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs mt-1">Contact an agent on a property page to start a chat.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {conversations.map(convo => {
                const isSelected = convo.id === selectedConvoId;
                const otherName = Object.entries(convo.participantNames).find(([id]) => id !== user?.uid)?.[1] as string || "Agent";
                
                return (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvoId(convo.id)}
                    className={`w-full text-left p-4 transition-colors hover:bg-zinc-50 ${isSelected ? "bg-blue-50/50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold ${isSelected ? "text-[#0073e6]" : "text-zinc-900"}`}>{otherName}</span>
                      {convo.updatedAt && (
                        <span className="text-[10px] text-zinc-400">
                          {convo.updatedAt ? formatDistanceToNow((convo.updatedAt as any)?.toDate ? (convo.updatedAt as any).toDate() : convo.updatedAt, { addSuffix: true }) : ''}
                        </span>
                      )}
                    </div>
                    {convo.propertyTitle && (
                      <div className="text-xs font-semibold text-zinc-600 flex items-center gap-1 mb-2 line-clamp-1">
                        <Building className="w-3 h-3 text-zinc-400 shrink-0" />
                        {convo.propertyTitle}
                      </div>
                    )}
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {convo.lastMessage || "No messages yet"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedConvoId && user ? (
          <ChatBox 
            conversationId={selectedConvoId}
            currentUserId={user.uid}
            currentUserName={user.displayName || "User"}
            otherPartyName={otherPartyName}
            propertyTitle={selectedConvo?.propertyTitle}
          />
        ) : (
          <div className="h-full bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>

    </div>
  );
}
