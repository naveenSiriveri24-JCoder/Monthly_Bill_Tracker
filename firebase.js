import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getStorage }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {

    apiKey:
        "",

    authDomain:
        "",

    projectId:
        "",

    storageBucket:
        "",

    messagingSenderId:
        "",

    appId:
        ""

};

const app =
    initializeApp(
        firebaseConfig
    );

export const db =
    getFirestore(app);

export const storage =
    getStorage(app);

export const auth =
    getAuth(app);
