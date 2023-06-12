import {addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where, deleteDoc} from "firebase/firestore";

export async function getTemp(temp: any, id: string) {
    try {
        return await getDoc(doc(temp, id))
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function saveNewSetup(temp: any, verificationCode: any, secret: any, serviceSecret: any) {
    try {
        return await addDoc(temp, {
            verificationCode,
            secret,
            serviceSecret,
            created: Date.now()
        });
    } catch(e) {
        console.log(e)
        return null;
    }
}

export async function verifySetup(temp: any, verificationCode: number, secret: string) {
    try {
        const tempDoc = await getDocs(query(temp, where("secret", "==", secret)));

        if(tempDoc.size === 0) {
            return {
                status: 400,
                success: false,
                data: { message: "Invalid secret" }
            };
        }

        // @ts-ignore
        if(tempDoc.docs[0].data().verificationCode !== verificationCode) {
            return {
                status: 400,
                success: false,
                data: { message: "Invalid Verification Code" }
            };
        }

        const returnWhat = {
            status: 200,
            success: true,
            // @ts-ignore
            data: { message: "Successfully Verified", serviceSecret: tempDoc.docs[0].data().serviceSecret }
        };

        await deleteDoc(doc(temp, tempDoc.docs[0].id));

        return returnWhat;
    } catch(e) {
        console.log(e)
        return null;
    }
}