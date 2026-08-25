"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { 
 Users, 
 Search, 
 Filter,
 MoreVertical,
 Shield,
 CheckCircle2,
 XCircle,
 Download,
 Plus
} from "lucide-react";
import { User } from "@/types";
import { sendNotificationEmail } from "@/utils/sendNotificationEmail";

export default function UserManagementPage() {
 const { user, userData, loading: authLoading } = useAuth();
 const router = useRouter();
 
 const [users, setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 
 const [editingUser, setEditingUser] = useState<User | null>(null);
 const [editFormData, setEditFormData] = useState({ name: "", role: "" });
 const [isSaving, setIsSaving] = useState(false);

 const handleEditClick = (u: User) => {
 setEditingUser(u);
 setEditFormData({ name: u.name || "", role: u.role || "buyer" });
 };

 const handleSaveUser = async () => {
 if (!editingUser) return;
 setIsSaving(true);
 try {
 const userRef = doc(db, "users", editingUser.id);
 await updateDoc(userRef, {
 name: editFormData.name,
 role: editFormData.role
 });
 
 if (editingUser.role !== editFormData.role) {
   await addDoc(collection(db, "notifications"), {
     userId: editingUser.id,
     title: "Account Role Updated",
     message: `Your account role has been updated to ${editFormData.role}.`,
     type: "info",
     isRead: false,
     isPoppedUp: false,
     createdAt: Date.now()
   });

   sendNotificationEmail({
     userId: editingUser.id,
     to: editingUser.email,
     templateType: "adminNotificationToUser",
     payload: {
       userName: editingUser.name || "Valued Client",
       updateTitle: "Account Role Updated",
       updateMessage: `Your account role has been updated. You now have access to features associated with the ${editFormData.role} role.`,
       status: editFormData.role,
       link: `${window.location.origin}/dashboard`
     }
   });
 }

 toast.success("User updated successfully");
 setEditingUser(null);
 } catch (error) {
 console.error("Error updating user:", error);
 toast.error("Failed to update user");
 } finally {
 setIsSaving(false);
 }
 };

 useEffect(() => {
 let unsubscribe: () => void;

 if (!authLoading) {
 if (!user || (userData?.role !== "admin" && userData?.role !== "super_admin")) {
 router.push("/dashboard");
 } else {
 const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
 unsubscribe = onSnapshot(q, (snapshot) => {
 const fetchedUsers: User[] = [];
 snapshot.forEach(doc => {
 fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
 });
 setUsers(fetchedUsers);
 setLoading(false);
 }, (error) => {
 console.error("Error fetching users:", error);
 setLoading(false);
 });
 }
 }

 return () => {
 if (unsubscribe) unsubscribe();
 };
 }, [user, userData, authLoading, router]);

 const filteredUsers = users.filter(u => 
 u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
 u.email?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (authLoading || loading) {
 return (
 <div className="flex-1 flex items-center justify-center h-full min-h-[500px]">
 <div className="animate-pulse flex flex-col items-center">
 <div className="h-8 w-32 bg-zinc-200 rounded mb-4"></div>
 <div className="text-sm text-zinc-500 font-medium">Loading User Database...</div>
 </div>
 </div>
 );
 }

 if (userData?.role !== "admin" && userData?.role !== "super_admin") return null;

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
 <Users className="w-6 h-6" /> User Management
 </h1>
 <p className="text-sm text-zinc-500 font-medium mt-1">
 Manage your platform's buyers, sellers, agents, and staff.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <button className="px-4 py-2 bg-white border border-zinc-200 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm flex items-center gap-2">
 <Download className="w-4 h-4" /> Export CSV
 </button>
 <button className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
 <Plus className="w-4 h-4" /> Add User
 </button>
 </div>
 </div>

 {/* Table Controls */}
 <div className="bg-white p-4 rounded-t-xl border border-zinc-200 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
 <div className="relative w-full max-w-md">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-zinc-400" />
 </div>
 <input
 type="text"
 placeholder="Search users by name or email..."
 className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-md text-sm bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <button className="flex-1 sm:flex-none px-3 py-2 border border-zinc-200 rounded-md text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2">
 <Filter className="w-4 h-4" /> Filter
 </button>
 <select className="flex-1 sm:flex-none text-sm border-zinc-200 rounded-md py-2 px-3 text-zinc-700 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm">
 <option>All Roles</option>
 <option>Admin</option>
 <option>Agent</option>
 <option>User</option>
 </select>
 </div>
 </div>

 {/* Data Table */}
 <div className="bg-white border border-zinc-200 rounded-b-xl shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-zinc-200">
 <thead className="bg-zinc-50">
 <tr>
 <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
 User Info
 </th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
 Role
 </th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
 Status
 </th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
 Joined
 </th>
 <th scope="col" className="relative px-6 py-3">
 <span className="sr-only">Actions</span>
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-zinc-200">
 {filteredUsers.map((u) => (
 <tr key={u.id} className="hover:bg-zinc-50 transition-colors group">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center border border-zinc-300">
 <span className="text-sm font-bold text-zinc-600">
 {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
 </span>
 </div>
 <div className="ml-4">
 <div className="text-sm font-semibold text-zinc-900">{u.name || "Unknown User"}</div>
 <div className="text-sm text-zinc-500">{u.email}</div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
 u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
 u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
 'bg-zinc-100 text-zinc-700 border-zinc-200'
 }`}>
 {u.role === 'super_admin' && <Shield className="w-3 h-3 mr-1" />}
 {u.role ? u.role.replace('_', ' ') : 'User'}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
 <CheckCircle2 className="w-3 h-3 mr-1" /> Active
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 font-medium">
 {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <button onClick={() => handleEditClick(u)} className="text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-100 shadow-sm text-xs font-bold">
 Edit
 </button>
 </td>
 </tr>
 ))}
 
 {filteredUsers.length === 0 && (
 <tr>
 <td colSpan={5} className="px-6 py-12 text-center">
 <Users className="mx-auto h-12 w-12 text-zinc-300" />
 <h3 className="mt-2 text-sm font-semibold text-zinc-900">No users found</h3>
 <p className="mt-1 text-sm text-zinc-500">
 {searchTerm ? `No users matching "${searchTerm}"` : "Get started by adding a new user."}
 </p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 
 {/* Pagination Placeholder */}
 <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200 flex items-center justify-between sm:px-6">
 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
 <div>
 <p className="text-sm text-zinc-700 font-medium">
 Showing <span className="font-bold">1</span> to <span className="font-bold">{filteredUsers.length}</span> of <span className="font-bold">{users.length}</span> results
 </p>
 </div>
 <div>
 <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
 <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-zinc-300 bg-white text-sm font-medium text-zinc-500 hover:bg-zinc-50">
 Previous
 </button>
 <button className="relative inline-flex items-center px-4 py-2 border border-zinc-300 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50">
 1
 </button>
 <button className="relative inline-flex items-center px-4 py-2 border border-indigo-500 bg-indigo-50 text-sm font-bold text-indigo-600 z-10">
 2
 </button>
 <button className="relative inline-flex items-center px-4 py-2 border border-zinc-300 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50">
 3
 </button>
 <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-zinc-300 bg-white text-sm font-medium text-zinc-500 hover:bg-zinc-50">
 Next
 </button>
 </nav>
 </div>
 </div>
 </div>
 </div>

 {/* Edit User Modal */}
 {editingUser && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
 <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
 <div className="flex justify-between items-center p-5 border-b border-zinc-100">
 <h3 className="font-extrabold text-lg text-zinc-900">Edit User</h3>
 <button onClick={() => setEditingUser(null)} className="text-zinc-400 hover:text-zinc-700">
 <XCircle className="w-5 h-5" />
 </button>
 </div>
 <div className="p-5 space-y-4">
 <div>
 <label className="block text-sm font-bold text-zinc-700 mb-1">Email</label>
 <input type="text" disabled value={editingUser.email} className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-500 font-medium cursor-not-allowed" />
 <p className="text-xs text-zinc-400 mt-1">Email cannot be changed directly via admin panel.</p>
 </div>
 <div>
 <label className="block text-sm font-bold text-zinc-700 mb-1">Name</label>
 <input 
 type="text" 
 value={editFormData.name} 
 onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
 className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-lg font-medium outline-none" 
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-zinc-700 mb-1">Role</label>
 <select 
 value={editFormData.role}
 onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
 className="w-full px-3 py-2 bg-white border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-lg font-medium outline-none"
 >
 <option value="buyer">Buyer</option>
 <option value="seller">Seller</option>
 <option value="agent">Agent</option>
 <option value="admin">Admin</option>
 {userData?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
 </select>
 </div>
 </div>
 <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
 <button onClick={() => setEditingUser(null)} className="px-4 py-2 font-bold text-zinc-600 hover:text-zinc-900 transition-colors">
 Cancel
 </button>
 <button onClick={handleSaveUser} disabled={isSaving} className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
 {isSaving ? "Saving..." : "Save Changes"}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
