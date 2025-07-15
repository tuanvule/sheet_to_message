import * as admin from 'firebase-admin';
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>; // Optional additional data
  imageUrl?: string; // Optional image URL
}

export class FirebaseAdminControler {
  private static instance: FirebaseAdminControler;
  private initialized: boolean = false;
  private db: admin.firestore.Firestore | null = null;


  private constructor() { }

  public static getInstance(): FirebaseAdminControler {
    if (!FirebaseAdminControler.instance) {
      FirebaseAdminControler.instance = new FirebaseAdminControler();
    }
    return FirebaseAdminControler.instance;
  }
  private checkInitialization(): void {
    if (!this.initialized || !this.db) {
      throw new Error("Firebase Admin not initialized. Call initialize() first.");
    }
  }

  public async initialize(key: string): Promise<void> {
    if (this.initialized) return; // Already initialized

    if (!key) throw new Error("Missing config for Firebase Controller initialization");

    try {
      const serviceAccount = require(key);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      this.db = admin.firestore();
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
      throw new Error("Failed to initialize Firebase Admin");
    }
  }

  public async sendNotification(payload: NotificationPayload, deviceToken: string | Array<string>) {
    console.log(payload);
    try {
      if (Array.isArray(deviceToken)) {
        const messages = deviceToken.map(token => ({
          notification: {
            title: payload.title,
            body: payload.body
          },
          token
        }));
        
        const responses = await Promise.all(
          messages.map(message => admin.messaging().send(message))
        );
        
        return responses;
      } else {
        const message = {
          notification: {
            title: payload.title,
            body: payload.body
          },
          token: deviceToken
        };
        
        return await admin.messaging().send(message);
      }
    } catch (e) {
      console.error("Error sending notification:", e);
      throw e; // Consider re-throwing for better error handling upstream
    }
  }

  public async createDocument(collection: string, data: any): Promise<string> {
    this.checkInitialization();

    try {
      const docRef = await this.db!.collection(collection).add({
        ...data
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error("Failed to create document");
    }
  }

  public async createDocumentIfNotExists(collection: string, data: any, uniqueField: string): Promise<string>  {
    this.checkInitialization();
  
    try {
      const querySnapshot = await this.db!.collection(collection)
                                .where(uniqueField, "==", data[uniqueField])
                                .get();

      console.log(querySnapshot.empty)
      if(!querySnapshot.empty) return querySnapshot.docs[0].id;
      const docRef = await this.db!.collection(collection).add({
        ...data
      });
  
      return docRef.id;
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error("Failed to create document");
    }
  }

  public async setDocument(collection: string, docId: string, data: any, merge: boolean = false): Promise<void> {
    this.checkInitialization();

    try {
      await this.db!.collection(collection).doc(docId).set({
        ...data,
      }, { merge });
    } catch (error) {
      console.error("Error setting document:", error);
      throw new Error("Failed to set document");
    }
  }

  /**
   * Update a document in Firestore
   */
  public async updateDocument(collection: string, docId: string, data: any): Promise<void> {
    this.checkInitialization();

    try {
      await this.db!.collection(collection).doc(docId).update({
        ...data,
      });
    } catch (error) {
      console.error("Error updating document:", error);
      throw new Error("Failed to update document");
    }
  }

  /**
   * Delete a document from Firestore
   */
  public async deleteDocument(collection: string, docId: string): Promise<void> {
    this.checkInitialization();

    try {
      await this.db!.collection(collection).doc(docId).delete();
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error("Failed to delete document");
    }
  }

  public async deleteMultiDocument(collection: string, docIds: string[]): Promise<void> {
    this.checkInitialization();
    const chunkSize = 500;
    
    try {
      for (let i = 0; i < docIds.length; i += chunkSize) {
        const chunk = docIds.slice(i, i + chunkSize);

        await this.runBatch((batch) => {
          for (const id of chunk) {
            const ref = this.db!.collection(collection).doc(id);
            batch.delete(ref);
          }
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error("Failed to delete multiple document");
    }
  }

  /**
   * Get a single document from Firestore
   */
  public async getDocument<T>(collection: string, docId: string): Promise<T | null> {
    this.checkInitialization();

    try {
      const docSnap = await this.db!.collection(collection).doc(docId).get();

      if (!docSnap.exists) {
        return null;
      }

      return { ...docSnap.data(), id: docSnap.id } as T;
    } catch (error) {
      console.error("Error getting document:", error);
      throw new Error("Failed to get document");
    }
  }

  /**
 * Get all documents from a collection
 */
  public async getCollection<T>(collection: string): Promise<T[]> {
    this.checkInitialization();

    try {
      const querySnap = await this.db!.collection(collection).get();

      if (querySnap.empty) {
        return [];
      }

      return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error("Error getting collection:", error);
      throw new Error("Failed to get collection");
    }
  }


  /**
   * Query documents from a collection
   */
  public async queryDocuments<T>(
    collection: string,
    queryFn?: (ref: admin.firestore.CollectionReference) => admin.firestore.Query
  ): Promise<T[]> {
    this.checkInitialization();

    try {
      let query: admin.firestore.Query = this.db!.collection(collection);

      if (queryFn) {
        query = queryFn(query as admin.firestore.CollectionReference);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error) {
      console.error("Error querying documents:", error);
      throw new Error("Failed to query documents");
    }
  }

  /**
   * Run a batch operation
   */
  public async runBatch(batchOperations: (batch: admin.firestore.WriteBatch) => void): Promise<void> {
    this.checkInitialization();

    try {
      const batch = this.db!.batch();
      batchOperations(batch);
      await batch.commit();
    } catch (error) {
      console.error("Error in batch operation:", error);
      throw new Error("Failed to run batch operation");
    }
  }

  /**
   * Run a transaction
   */
  public async runTransaction<T>(
    transactionFn: (transaction: admin.firestore.Transaction) => Promise<T>
  ): Promise<T> {
    this.checkInitialization();

    try {
      return await this.db!.runTransaction(transactionFn);
    } catch (error) {
      console.error("Error in transaction:", error);
      throw new Error("Failed to run transaction");
    }
  }


}