import dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, set, update, remove, runTransaction } from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };
  

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);


async function specifiedTakeData(node, id, key) {
    try {

        if (Array.isArray(key)) {
            const dbRef = ref(db, `${node}/${id}`);
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
                let result = {};
                key.forEach(k => {
                    if (snapshot.val()[k] !== undefined) {
                        result[k] = snapshot.val()[k];
                    } else {
                        result[k] = null;
                    }
                });
                return result;
            } else {
                return null;
            }
        } else {

            const dbRef = ref(db, `${node}/${id}/${key}`);
            const snapshot = await get(dbRef);
            return snapshot.exists() ? snapshot.val() : null;
        }
    } catch (error) {
        console.error("Error mengambil data:", error);
        return null;
    }
}

function universalDataFunction(operation, model, fields, data) {
    const dbRef = ref(db, `${model}`);
    if (!Array.isArray(fields)) {
        fields = [fields];
    }
    if (!Array.isArray(data)) {
        data = [data];
    }
    if (operation === "update") {

        runTransaction(dbRef, (currentData) => {
            if (currentData === null) {
                currentData = {};
            }
            fields.forEach((field, index) => {
                const fieldParts = field.split(".");
                let temp = currentData;
                fieldParts.forEach((part, i) => {
                    if (i === fieldParts.length - 1) {
                        temp[part] = data[index];
                    } else {
                        temp[part] = temp[part] || {};
                        temp = temp[part];
                    }
                });
            });
            return currentData;
        }).then(() => {
            console.log(`${model} updated successfully!`);
        }).catch((error) => {
            console.error(`Error updating ${model}:`, error);
        });
    }
}

const getDataFromNode = async (pathh) => (await get(ref(db, pathh))).val();

function generateRandomAlphanumeric(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
}

export { app, db, auth, ref, set, get,  update, remove, runTransaction, specifiedTakeData, universalDataFunction, getDataFromNode, generateRandomAlphanumeric, generateCurrentTime };