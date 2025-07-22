"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAdminControler = void 0;
const admin = __importStar(require("firebase-admin"));
class FirebaseAdminControler {
    static instance;
    initialized = false;
    db = null;
    constructor() { }
    static getInstance() {
        if (!FirebaseAdminControler.instance) {
            FirebaseAdminControler.instance = new FirebaseAdminControler();
        }
        return FirebaseAdminControler.instance;
    }
    checkInitialization() {
        if (!this.initialized || !this.db) {
            throw new Error("Firebase Admin not initialized. Call initialize() first.");
        }
    }
    async initialize(key) {
        if (this.initialized)
            return; // Already initialized
        if (!key)
            throw new Error("Missing config for Firebase Controller initialization");
        try {
            const serviceAccount = require(key);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            this.db = admin.firestore();
            this.initialized = true;
        }
        catch (error) {
            console.error("Error initializing Firebase Admin:", error);
            throw new Error("Failed to initialize Firebase Admin");
        }
    }
    async sendNotification(payload, deviceToken) {
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
                const responses = await Promise.all(messages.map(message => admin.messaging().send(message)));
                return responses;
            }
            else {
                const message = {
                    notification: {
                        title: payload.title,
                        body: payload.body
                    },
                    token: deviceToken
                };
                return await admin.messaging().send(message);
            }
        }
        catch (e) {
            console.error("Error sending notification:", e);
            throw e; // Consider re-throwing for better error handling upstream
        }
    }
    async createDocument(collection, data) {
        this.checkInitialization();
        try {
            const docRef = await this.db.collection(collection).add({
                ...data
            });
            return docRef.id;
        }
        catch (error) {
            console.error("Error creating document:", error);
            throw new Error("Failed to create document");
        }
    }
    async createDocumentIfNotExists(collection, data, uniqueField) {
        this.checkInitialization();
        try {
            const querySnapshot = await this.db.collection(collection)
                .where(uniqueField, "==", data[uniqueField])
                .get();
            console.log(querySnapshot.empty);
            if (!querySnapshot.empty)
                return querySnapshot.docs[0].id;
            const docRef = await this.db.collection(collection).add({
                ...data
            });
            return docRef.id;
        }
        catch (error) {
            console.error("Error creating document:", error);
            throw new Error("Failed to create document");
        }
    }
    async setDocument(collection, docId, data, merge = false) {
        this.checkInitialization();
        try {
            await this.db.collection(collection).doc(docId).set({
                ...data,
            }, { merge });
        }
        catch (error) {
            console.error("Error setting document:", error);
            throw new Error("Failed to set document");
        }
    }
    /**
     * Update a document in Firestore
     */
    async updateDocument(collection, docId, data) {
        this.checkInitialization();
        try {
            await this.db.collection(collection).doc(docId).update({
                ...data,
            });
        }
        catch (error) {
            console.error("Error updating document:", error);
            throw new Error("Failed to update document");
        }
    }
    /**
     * Delete a document from Firestore
     */
    async deleteDocument(collection, docId) {
        this.checkInitialization();
        try {
            await this.db.collection(collection).doc(docId).delete();
        }
        catch (error) {
            console.error("Error deleting document:", error);
            throw new Error("Failed to delete document");
        }
    }
    async deleteMultiDocument(collection, docIds) {
        this.checkInitialization();
        const chunkSize = 500;
        try {
            for (let i = 0; i < docIds.length; i += chunkSize) {
                const chunk = docIds.slice(i, i + chunkSize);
                await this.runBatch((batch) => {
                    for (const id of chunk) {
                        const ref = this.db.collection(collection).doc(id);
                        batch.delete(ref);
                    }
                });
            }
        }
        catch (error) {
            console.error("Error deleting document:", error);
            throw new Error("Failed to delete multiple document");
        }
    }
    /**
     * Get a single document from Firestore
     */
    async getDocument(collection, docId) {
        this.checkInitialization();
        try {
            const docSnap = await this.db.collection(collection).doc(docId).get();
            if (!docSnap.exists) {
                return null;
            }
            return { ...docSnap.data(), id: docSnap.id };
        }
        catch (error) {
            console.error("Error getting document:", error);
            throw new Error("Failed to get document");
        }
    }
    /**
   * Get all documents from a collection
   */
    async getCollection(collection) {
        this.checkInitialization();
        try {
            const querySnap = await this.db.collection(collection).get();
            if (querySnap.empty) {
                return [];
            }
            return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        catch (error) {
            console.error("Error getting collection:", error);
            throw new Error("Failed to get collection");
        }
    }
    /**
     * Query documents from a collection
     */
    async queryDocuments(collection, queryFn) {
        this.checkInitialization();
        try {
            let query = this.db.collection(collection);
            if (queryFn) {
                query = queryFn(query);
            }
            const snapshot = await query.get();
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        }
        catch (error) {
            console.error("Error querying documents:", error);
            throw new Error("Failed to query documents");
        }
    }
    /**
     * Run a batch operation
     */
    async runBatch(batchOperations) {
        this.checkInitialization();
        try {
            const batch = this.db.batch();
            batchOperations(batch);
            await batch.commit();
        }
        catch (error) {
            console.error("Error in batch operation:", error);
            throw new Error("Failed to run batch operation");
        }
    }
    /**
     * Run a transaction
     */
    async runTransaction(transactionFn) {
        this.checkInitialization();
        try {
            return await this.db.runTransaction(transactionFn);
        }
        catch (error) {
            console.error("Error in transaction:", error);
            throw new Error("Failed to run transaction");
        }
    }
}
exports.FirebaseAdminControler = FirebaseAdminControler;
