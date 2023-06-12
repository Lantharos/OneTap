import {addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where} from "firebase/firestore";

export async function getApp(apps: any, id: string) {
    try {
        return await getDoc(doc(apps, id))
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function getAppBySecret(apps: any, secret: string) {
    try {
        const appDoc = await getDocs(query(apps, where("secret", "==", secret)));

        if(appDoc.size === 0) {
            return {
                status: 400,
                success: false,
                data: { message: "Invalid secret" }
            };
        }

        return {
            status: 200,
            success: true,
            app: appDoc.docs[0]
        };
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function saveNewApp(apps: any, name: string, description: string, secret: string, loginUrl: string, setupUrl: string, icon: string) {
    try {
        return await addDoc(apps, {
            secret,
            name,
            description,
            loginUrl,
            setupUrl,
            icon,
            created: Date.now()
        });
    } catch(e) {
        console.log(e)
        return null;
    }
}