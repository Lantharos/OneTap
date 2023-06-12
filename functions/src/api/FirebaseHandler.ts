import {initializeApp} from "firebase/app";
import * as admin from "firebase-admin";

import {collection, getFirestore} from "firebase/firestore";

import * as UserHandler from "./firebase/FirebaseUserHandler";
import * as AppHandler from "./firebase/FirebaseAppHandler";
import * as TempHandler from "./firebase/FirebaseTempHandler";

const serviceAccount = require("../serviceAccountKey.json")

const firebaseApp = initializeApp({
    apiKey: process.env.APPFIREBASE_AKEY,
    authDomain: "wulfco-authenticator.firebaseapp.com",
    projectId: "wulfco-authenticator",
    storageBucket: "wulfco-authenticator.appspot.com",
    messagingSenderId: process.env.APPFIREBASE_SENDER_ID,
    appId: process.env.APPFIREBASE_APP_ID,
    measurementId: process.env.APPFIREBASE_MEASUREMENT_ID
});

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore(firebaseApp);
const users = collection(db, "users");
const apps = collection(db, "apps");
const temp = collection(db, "temporary");

export class Users {
    public static sendNotification = async (token: string, title: string, body: string) => {
        firebaseAdmin.messaging().send({
            notification: {
                title: title,
                body: body
            },
            token: token
        }).then(r => {
            console.log(r)
        })
    }

    public static getUser = async (id: string) => {
        return await UserHandler.getUser(users, id)
    }

    public static saveNewUser = async (secret: string, pushToken: string, fcm: string, deviceId: string, serviceId: string) => {
        return await UserHandler.saveNewUser(users, secret, pushToken, fcm, deviceId, serviceId)
    }

    public static getUserByDeviceId = async (deviceId: string) => {
        return await UserHandler.getUserByDeviceId(users, deviceId)
    }

    public static updateUser = async (id: string, fcm: string, apps: any) => {
        return await UserHandler.updateUser(users, id, fcm, apps)
    }
}

export class Apps {
    public static getApp = async (id: string) => {
        return await AppHandler.getApp(apps, id)
    }

    public static getAppBySecret = async (secret: string) => {
        return await AppHandler.getAppBySecret(apps, secret)
    }

    public static saveNewApp = async (name: string, description: string, secret: string, loginUrl: string, setupUrl: string, icon: string) => {
        return await AppHandler.saveNewApp(apps, name, description, secret, loginUrl, setupUrl, icon)
    }
}

export class Temp {
    public static getTemp = async (id: string) => {
        return await TempHandler.getTemp(temp, id)
    }

    public static saveNewSetup = async (verificationCode: any, secret: any, serviceSecret: any) => {
        return await TempHandler.saveNewSetup(temp, verificationCode, secret, serviceSecret)
    }

    public static verifySetup = async (verificationCode: number, secret: string) => {
        return await TempHandler.verifySetup(temp, verificationCode, secret)
    }
}