"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageSquare, Building, ShieldCheck } from "lucide-react";
import { ChatBox } from "@/components/ChatBox";
import { formatDistanceToNow } from "date-fns";

export default function AdminMessagesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);

  const ADMIN_ID = "admin_agent_1"; // The ID we use for the generic admin agent

  useEffect(() => {
    if (!loading) {
      if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
        router.push("/dashboard");
        return;
      }
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (loading || !user) return;

    // Fetch conversations where the admin is a participant
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", ADMIN_ID),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convos);
      
      if (convos.length > 0 && !selectedConvoId) {
        setSelectedConvoId(convos[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, loading, selectedConvoId]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center h-[500px]">Loading Admin Messages...</div>;
  }

  const selectedConvo = conversations.find(c => c.id === selectedConvoId);
  const otherPartyName = selectedConvo 
    ? Object.entries(selectedConvo.participantNames).find(([id]) => id !== ADMIN_ID)?.[1] as string
    : "Client";

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] min-h-[600px] flex gap-6 mt-6 mb-6">
      
      {/* Sidebar */}
      <div className="w-1/3 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-zinc-200 bg-zinc-900 text-white shrink-0">
          <h2 className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> 
            Admin Inbox
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Manage all client inquiries</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
              <p className="text-sm">No messages yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {conversations.map(convo => {
                const isSelected = convo.id === selectedConvoId;
                const clientName = Object.entries(convo.participantNames).find(([id]) => id !== ADMIN_ID)?.[1] as string || "Client";
                
                return (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvoId(convo.id)}
                    className={`w-full text-left p-4 transition-colors hover:bg-zinc-50 ${isSelected ? "bg-zinc-100/50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold ${isSelected ? "text-zinc-900" : "text-zinc-700"}`}>{clientName}</span>
                      {convo.updatedAt && (
                        <span className="text-[10px] text-zinc-400">
                          {convo.updatedAt ? formatDistanceToNow((convo.updatedAt as any)?.toDate ? (convo.updatedAt as any).toDate() : convo.updatedAt, { addSuffix: true }) : ''}
                        </span>
                      )}
                    </div>
                    {convo.propertyTitle && (
                      <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-2 line-clamp-1">
                        <Building className="w-3 h-3 text-emerald-600 shrink-0" />
                        {convo.propertyTitle}
                      </div>
                    )}
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {convo.lastMessage || "No messages"}
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
        {selectedConvoId ? (
          <ChatBox 
            conversationId={selectedConvoId}
            currentUserId={ADMIN_ID}
            currentUserName="James Harrison (Agent)"
            otherPartyName={otherPartyName}
            propertyTitle={selectedConvo?.propertyTitle}
          />
        ) : (
          <div className="h-full bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400">
            Select an inquiry to reply
          </div>
        )}
      </div>

    </div>
  );
}
