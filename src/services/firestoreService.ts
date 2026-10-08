import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingItemRequest } from '../types';

const REQUESTS_COLLECTION = 'shopping_requests';
const PURCHASED_COLLECTION = 'purchased_states';

/**
 * Listens to live real-time updates for shopping requests across all colleagues.
 */
export function subscribeShoppingRequests(
  onUpdate: (requests: ShoppingItemRequest[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, REQUESTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ShoppingItemRequest[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ShoppingItemRequest;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore requests listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Listens to live purchased status map across all colleagues.
 */
export function subscribePurchasedStates(
  onUpdate: (map: Record<string, boolean>) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, PURCHASED_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const map: Record<string, boolean> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        map[docSnap.id] = !!data.isPurchased;
      });
      onUpdate(map);
    },
    (err) => {
      console.error('Firestore purchased listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Adds a new shopping request to the shared cloud database.
 */
export async function addShoppingRequestToCloud(request: ShoppingItemRequest): Promise<void> {
  const docRef = doc(db, REQUESTS_COLLECTION, request.id);
  await setDoc(docRef, {
    ...request,
    createdAt: request.createdAt || new Date().toISOString(),
  });
}

/**
 * Deletes a shopping request from the shared cloud database.
 */
export async function deleteShoppingRequestFromCloud(id: string): Promise<void> {
  const docRef = doc(db, REQUESTS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Toggles or updates the purchased status of a consolidated item in the cloud.
 */
export async function setPurchasedStateInCloud(itemId: string, isPurchased: boolean): Promise<void> {
  const docRef = doc(db, PURCHASED_COLLECTION, itemId);
  await setDoc(docRef, {
    itemId,
    isPurchased,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Clears all shopping requests from the cloud database.
 */
export async function clearAllShoppingRequestsFromCloud(): Promise<void> {
  const colRef = collection(db, REQUESTS_COLLECTION);
  const snapshot = await getDocs(colRef);
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();

  // Clear purchased states as well
  const purCol = collection(db, PURCHASED_COLLECTION);
  const purSnapshot = await getDocs(purCol);
  const purBatch = writeBatch(db);
  purSnapshot.forEach((docSnap) => {
    purBatch.delete(docSnap.ref);
  });
  await purBatch.commit();
}
