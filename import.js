import { db }
from "./firebase.js";

import {

    collection,

    addDoc

}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { auth }
from "./firebase.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserSessionPersistence
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



console.log(auth.currentUser);
async function importData(){

    const pin =

        document
        .getElementById(
            "pin"
        )
        .value
        .trim();

    if(pin.length !== 4){

        alert(
            "Enter 4 Digit PIN"
        );

        return;
    }

    try{

        const pinSnapshot =

            await getDoc(

                doc(
                    db,
                    "loginPins",
                    pin
                )
            );

        if(!pinSnapshot.exists()){

            alert(
                "Invalid PIN"
            );

            return;
        }

        const email =
            pinSnapshot.data().email;

        await signInWithEmailAndPassword(

            auth,

            email,

            pin + "MBT@2026"

        );

        console.log(

            "Logged in as",

            auth.currentUser.uid

        );

        const file =

            document
            .getElementById(
                "jsonFile"
            )
            .files[0];

        if(!file){

            alert(
                "Select JSON File"
            );

            return;
        }

        const text =
            await file.text();

        const expenses =
            JSON.parse(text);

        for(const expense of expenses){

            expense.userId =
                auth.currentUser.uid;

            await addDoc(

                collection(
                    db,
                    "expenses"
                ),

                expense

            );
        }

        alert(

            "✅ Import Successful"

        );

    }
    catch(error){

        console.error(error);

        alert(error.message);
    }
}

window.importData=importData;