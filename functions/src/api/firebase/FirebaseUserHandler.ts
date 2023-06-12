import {addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where} from "firebase/firestore";

export async function getUser(users: any, id: string) {
    try {
        return await getDoc(doc(users, id))
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function getUserByDeviceId(users: any, deviceId: string) {
    try {
        const userDoc = await getDocs(query(users, where("deviceId", "==", deviceId)));

        if(userDoc.size === 0) {
            return {
                status: 400,
                success: false,
                data: { message: "Invalid deviceId" }
            };
        }

        return {
            status: 200,
            success: true,
            user: userDoc.docs[0]
        };
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function saveNewUser(users: any, secret: string, pushToken: string, fcm: string, deviceId: string, serviceId: string) {
    try {
        return await addDoc(users, {
            secret,
            pushToken,
            fcm,
            deviceId,
            apps: [serviceId],
            created: Date.now()
        });
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function updateUser(users: any, id: string, fcm: string, apps: any) {
    try {
        return await updateDoc(doc(users, id), {
            apps,
            fcm
        });
    } catch(e) {
        console.log(e)
        return null;
    }
}
