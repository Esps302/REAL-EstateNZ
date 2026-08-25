"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Review, ReviewTargetType } from "@/types";
import { Star, MessageSquare, ChevronDown, ChevronUp, Edit2, Trash2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewSectionProps {
  targetId: string;
  targetType: ReviewTargetType;
}

export default function ReviewSection({ targetId, targetType }: ReviewSectionProps) {
  const { user, userData } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Accordion State
  const [isExpanded, setIsExpanded] = useState(false);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  // Edit State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "reviews"),
        where("targetId", "==", targetId)
      );
      const snapshot = await getDocs(q);
      let fetchedReviews: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.targetType === targetType) {
          fetchedReviews.push({ id: doc.id, ...data } as Review);
        }
      });
      // Sort in Javascript to avoid needing a Firestore Composite Index
      fetchedReviews.sort((a, b) => b.createdAt - a.createdAt);
      
      setReviews(fetchedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchReviews();
    }
  }, [targetId, targetType]);

  const recalculateAndSaveAverage = async (updatedReviews: Review[]) => {
    const newReviewCount = updatedReviews.length;
    const newAverage = newReviewCount > 0 
      ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) / newReviewCount 
      : 0;

    const collectionName = targetType === 'agent' ? 'users' : 'properties';
    const targetRef = doc(db, collectionName, targetId);
    await updateDoc(targetRef, {
      averageRating: newAverage,
      reviewCount: newReviewCount
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) {
      setError("You must be logged in to leave a review.");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please leave a comment.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newReview = {
        targetId,
        targetType,
        reviewerId: user.uid,
        reviewerName: userData.name || user.displayName || "Anonymous User",
        rating,
        comment: comment.trim(),
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, "reviews"), newReview);
      const addedReview = { id: docRef.id, ...newReview } as Review;
      
      const updatedReviews = [addedReview, ...reviews];
      setReviews(updatedReviews);
      await recalculateAndSaveAverage(updatedReviews);

      setRating(0);
      setComment("");
    } catch (err: any) {
      console.error("Error adding review:", err);
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      const updatedReviews = reviews.filter(r => r.id !== reviewId);
      setReviews(updatedReviews);
      await recalculateAndSaveAverage(updatedReviews);
    } catch (err: any) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
    }
  };

  const startEditing = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleEditSubmit = async (reviewId: string) => {
    if (editRating === 0 || !editComment.trim()) {
      alert("Please provide a rating and a comment.");
      return;
    }

    try {
      await updateDoc(doc(db, "reviews", reviewId), {
        rating: editRating,
        comment: editComment.trim()
      });

      const updatedReviews = reviews.map(r => 
        r.id === reviewId ? { ...r, rating: editRating, comment: editComment.trim() } : r
      );
      
      setReviews(updatedReviews);
      await recalculateAndSaveAverage(updatedReviews);
      setEditingReviewId(null);
    } catch (err: any) {
      console.error("Error updating review:", err);
      alert("Failed to update review.");
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm mt-8 overflow-hidden transition-all duration-300">
      {/* Accordion Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-sm font-extrabold border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                {averageRating.toFixed(1)}
              </div>
              <span className="text-xs font-semibold text-zinc-500">
                ({reviews.length})
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <span className="text-xs font-bold text-blue-600 hidden sm:block">View all & write review</span>
          )}
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}`}
      >
        <div className="p-5 border-t border-zinc-100 bg-zinc-50/50">
          
          {/* Write Review Form */}
          {user && userData ? (
            <form onSubmit={handleSubmit} className="mb-8 bg-white rounded-xl p-5 border border-zinc-200 shadow-sm">
              <h4 className="font-bold text-zinc-900 text-sm mb-3">Leave a Review</h4>
              {error && <div className="text-red-500 text-xs mb-3 font-medium bg-red-50 p-2 rounded">{error}</div>}
              
              <div className="mb-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900"
                  rows={2}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          ) : (
            <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-center flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <MessageSquare className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Want to leave a review?</h4>
                  <p className="text-zinc-600 text-xs">You must be logged in to share your experience.</p>
                </div>
              </div>
              <a href="/login" className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-colors">
                Log In
              </a>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 bg-zinc-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-200 w-1/4 rounded"></div>
                      <div className="h-12 bg-zinc-200 w-full rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="flex gap-4 p-4 bg-white rounded-xl border border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-600 font-bold text-sm flex-shrink-0">
                    {review.reviewerName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingReviewId === review.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-zinc-900 text-sm">Edit Review</h5>
                          <button onClick={() => setEditingReviewId(null)} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setEditHoverRating(star)}
                              onMouseLeave={() => setEditHoverRating(0)}
                              onClick={() => setEditRating(star)}
                            >
                              <Star className={`w-5 h-5 ${star <= (editHoverRating || editRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                          rows={2}
                        />
                        <button 
                          onClick={() => handleEditSubmit(review.id)}
                          className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-800"
                        >
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      // Display Mode
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-bold text-zinc-900 text-sm truncate pr-2">{review.reviewerName}</h5>
                          <span className="text-[10px] font-semibold text-zinc-400 flex-shrink-0 whitespace-nowrap">
                            {review.createdAt ? formatDistanceToNow((review.createdAt as any)?.toDate ? (review.createdAt as any).toDate() : review.createdAt, { addSuffix: true }) : 'Just now'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                            ))}
                          </div>
                          
                          {/* Actions */}
                          {user && user.uid === review.reviewerId && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                              <button 
                                onClick={() => startEditing(review)}
                                className="text-zinc-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(review.id)}
                                className="text-zinc-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-zinc-700 text-xs leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-400 bg-white rounded-xl border border-dashed border-zinc-200">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No reviews yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
