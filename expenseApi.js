import { db }
from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where
}

from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


import {
    auth
}
from "./firebase.js";

export async function saveExpense(
    expense
){

    await addDoc(
        collection(
            db,
            "expenses"
        ),
        expense
    );
}

export async function loadExpenses(){
       
    if(!auth.currentUser){

            return [];

        }
        
    const q =
        query(

            collection(
                db,
                "expenses"
            ),

            where(

                "userId",

                "==",

                auth.currentUser.uid

            )
        );

    const snapshot =
        await getDocs(q);

    const expenses = [];

    snapshot.forEach(doc => {

        expenses.push({

            id: doc.id,

            ...doc.data()

        });

    });

    return expenses;
}

export async function deleteExpenseById(
    id
){

    await deleteDoc(

        doc(
            db,
            "expenses",
            id
        )

    );
}

export async function updateExpenseById(
    id,
    expense
){

    await updateDoc(

        doc(
            db,
            "expenses",
            id
        ),

        expense

    );
}