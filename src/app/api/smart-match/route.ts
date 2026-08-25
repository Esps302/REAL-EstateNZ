import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
 try {
 const { propertyId, buyerMaxPrice } = await request.json();

 if (!propertyId || buyerMaxPrice === undefined) {
 return NextResponse.json(
 { error: 'Missing required fields (propertyId, buyerMaxPrice)' },
 { status: 400 }
 );
 }

 // Fetch the property from Firestore securely on the server
 const propertyDoc = await getDoc(doc(db, "properties", propertyId));

 if (!propertyDoc.exists()) {
 return NextResponse.json(
 { error: 'Property not found' },
 { status: 404 }
 );
 }

 const propertyData = propertyDoc.data();
 let reservePrice = propertyData.reservePrice;

 if (!reservePrice) {
 // If no reserve price is set, default to public asking price for matching purposes
 reservePrice = propertyData.price;
 }

 if (!reservePrice) {
 return NextResponse.json(
 { error: 'Property has no price configured.' },
 { status: 400 }
 );
 }

 const price = Number(buyerMaxPrice);
 const target = Number(reservePrice);

 let matchCategory = '';
 let colorClass = '';

 if (price >= target) {
 matchCategory = 'Excellent Match';
 colorClass = 'text-green-600 bg-green-50 border-green-200';
 } else if (price >= target * 0.95) {
 matchCategory = 'Strong Match';
 colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
 } else if (price >= target * 0.90) {
 matchCategory = 'Good Match';
 colorClass = 'text-yellow-600 bg-yellow-50 border-yellow-200';
 } else if (price >= target * 0.85) {
 matchCategory = 'Moderate Match';
 colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
 } else {
 matchCategory = 'Low Match';
 colorClass = 'text-red-600 bg-red-50 border-red-200';
 }

 return NextResponse.json({ 
 success: true, 
 indicator: matchCategory,
 colorClass: colorClass
 });

 } catch (error) {
 console.error('Smart Match API error:', error);
 return NextResponse.json(
 { error: 'Internal Server Error' },
 { status: 500 }
 );
 }
}
