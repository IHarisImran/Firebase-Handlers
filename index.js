import { initializeApp } from "firebase/app";
import { getDatabase, set, push, ref, onValue, remove } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

initializeApp({
    apiKey: "API_KEY",
    authDomain: "AUTH_DOMAIN",
    projectId: "PROJECT_ID",
    storageBucket: "STORAGE_BUCKET",
    messagingSenderId: "MESSAGING_SENDER_ID",
    appId: "APP_ID"
});

const database = getDatabase(),
    auth = getAuth();

// Database Functions
async function sendData(props) {
    let reference;

    if (props.id !== false) {
        reference = push(ref(database, props.params));
        props.data.id = reference.key
    } else { reference = ref(database, props.params) };

    try {
        await set(reference, props.data);
        return 200;
    } catch (err) { return 500 };
};

function getData(params, callback) {
    const reference = ref(database, params);
    onValue(reference, snapshot => {
        try {
            let data = snapshot.val();
            if (data) {
                if (typeof data === "string") callback(snapshot.val())
                else callback(Object.values(snapshot.val()));
            } else { callback(null) }
        } catch (err) { return 500 }
    });
};

async function removeData(params) {
    try {
        await remove(ref(database, params));
        return 200;
    } catch (err) { return 500 }
};
// Database Functions

// Authentication Functions
function createUser(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => { return 1 })
        .catch(err => {
            if (err.code === 'auth/email-already-in-use') { return 2 }
            else if (err.code === 'auth/invalid-email') { return 3 }
            else { return 4 }
        })
};

// This function is working but never used
function setUserProfile(displayName, photoURL) {
    auth.onAuthStateChanged(user => {
        updateProfile(user.auth.currentUser, { displayName, photoURL })
            .then(() => console.log("success"))
            .catch(err => console.log(err));
    });
};

function verifyUser() { };

async function loginUser(email, password) {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (res.user) {
            const { displayName, uid } = res.user;
            return { res: 1, data: { id: uid, status: true, username: displayName } };
        } else { return 4 };
    } catch (err) {
        if (err.code === 'auth/wrong-password') { return 2 }
        else if (err.code === 'auth/user-not-found') { return 3 }
        else if (err.code === 'auth/invalid-login-credentials') { return 4 };
    };
};

async function logoutUser() {
    try {
        await auth.signOut();
        return 1;
    } catch (err) { return 2 }
};

async function checkUserAuth() { return new Promise(res => auth.onAuthStateChanged(status => res({ id: status ? status.uid : null, status: status ? true : false, username: status ? status.displayName : null }))) };
// Authentication Functions

export {
    sendData, getData, removeData,
    createUser, loginUser, logoutUser, checkUserAuth
};