export type UserRole = "buyer" | "seller" | "agent" | "admin" | "super_admin";

export interface User {
 id: string;
 name: string;
 email: string;
 role: UserRole;
 phone?: string;
 location?: string;
 photoURL?: string;
 createdAt: number;
 preferences?: {
 propertyTypes: string[];
 minPrice: number | null;
 maxPrice: number | null;
 locations: string[];
 };
 notifications?: {
 newPropertyAlerts: boolean;
 priceDropAlerts: boolean;
 directMessages: boolean;
 pushNotifications: boolean;
 marketingEmails: boolean;
 };
 privacy?: {
 publicProfile: boolean;
 hidePhone: boolean;
 };
 savedProperties?: string[];
 averageRating?: number;
 reviewCount?: number;
}

export type PropertyType = "House" | "Apartment" | "Land" | "Commercial" | "Villa" | "Townhouse" | "Cabin" | "Studio" | "Loft" | "Penthouse" | "Estate";
export type ListingType = "For Sale" | "For Rent";
export type PropertyStatus = "pending" | "approved" | "rejected";

export interface Property {
 id: string;
 title: string;
 description: string;
 price: number; // Public Asking Price
 currency?: string; // e.g. "NZD", "USD", "AUD"
 reservePrice?: number; // Hidden minimum price (Only visible to admin)
 city: string;
 suburb: string;
 address?: string;
 region?: string;
 district?: string;
 mapEmbed?: string;
 lat?: number;
 lng?: number;
 propertyType: PropertyType;
 listingType: ListingType;
 rentFrequency?: "Weekly" | "Monthly";
 status: PropertyStatus;
 isSold?: boolean;
 bedrooms: number;
 bathrooms: number;
 parkingSpaces?: number;
 yearBuilt?: number;
 area: number;
 amenities: string[];
 images: string[];
 floorPlan?: string;
 ownerId: string;
 createdAt: number;
 plan?: "Basic" | "Premium" | "Featured";
 featuredUntil?: number;
 averageRating?: number;
 reviewCount?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  isRead: boolean;
  isPoppedUp: boolean; // Tracks if the big screen popup has been shown to the user yet
  link?: string;
  createdAt: number;
}

export interface Lead {
 id: string;
 propertyId: string;
 userId?: string;
 name: string;
 phone: string;
 email: string;
 message: string;
 createdAt: number;
}

export interface SavedProperty {
 userId: string;
 propertyId: string;
}

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";

export interface Offer {
 id: string;
 propertyId: string;
 propertyTitle: string;
 buyerId: string;
 buyerPhone?: string;
 sellerId: string; // Used internally by admin, not shown to buyer
 offerPrice: number;
 moveInDate?: number;
 paymentType: "Cash" | "Mortgage";
 notes?: string;
 status: OfferStatus;
 createdAt: number;
 expiresAt?: number;
}

export type ServiceCaseStatus = "pending" | "in_progress" | "approved" | "completed" | "rejected";

export interface MortgageCase {
 id: string;
 buyerId: string;
 propertyId: string;
 income?: number;
 employmentStatus?: string;
 preferredBank?: string;
 status: ServiceCaseStatus;
 createdAt: number;
}

export interface SolicitorCase {
 id: string;
 buyerId: string;
 propertyId: string;
 status: ServiceCaseStatus;
 createdAt: number;
}

export interface Viewing {
 id: string;
 buyerId: string;
 propertyId: string;
 propertyTitle: string;
 preferredDate: number;
 preferredTime: string;
 notes?: string;
 status: "pending" | "approved" | "rejected" | "completed";
 createdAt: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  credits: number;
  lifetimeCredits: number;
  lifetimeConverted: number;
  createdAt: number;
  lastCreditEarnedAt?: number;
}

export type WalletTransactionType = "top_up" | "credit_conversion" | "listing_purchase" | "admin_adjustment";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  status: "completed" | "failed" | "pending";
  description: string;
  referenceId?: string;
  createdAt: number;
}

 export interface CreditTransaction {
  id: string;
  userId: string;
  credits: number;
  reason: string;
  createdAt: number;
}

export type ReviewTargetType = "agent" | "property";

export interface Review {
  id: string;
  targetId: string; // The ID of the agent or property being reviewed
  targetType: ReviewTargetType;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: number;
}
