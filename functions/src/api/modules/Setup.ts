import * as crypto from "crypto";
import {Temp, Users, Apps} from "../FirebaseHandler";

export default class Setup {
    public static async startSetup(req: any) {
        const {serviceSecret} = req.body;
        if(!serviceSecret) {
            return {status: 401, success: false, data: { message: "Unauthorized" }};
        }

        const app = await Apps.getAppBySecret(serviceSecret);
        if(!app.success) {
            return app;
        }

        const secret = crypto.randomBytes(18).toString('hex');
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        await Temp.saveNewSetup(verificationCode, secret, serviceSecret)

        return {
            status: 200,
            success: true,
            data: {
                secret,
                verificationCode
            }
        };
    }

    public static async verifySetup(req: any) {
        const {verificationCode, secret, fcm, deviceId} = req.body;

        const temp = await Temp.verifySetup(verificationCode, secret);
        if(!temp.success || !temp.data) {return temp;}

        // @ts-ignore
        const app = await Apps.getAppBySecret(temp.data.serviceSecret);
        if(!app.success || !app.app) {
            return app;
        }

        const appData = app.app.data();

        const pushToken = crypto.randomBytes(18).toString('hex');

        let user = await Users.getUserByDeviceId(deviceId);
        if(user.success) {
            // @ts-ignore
            await Users.updateUser(user.user.id, fcm, user.user.data().apps.push(app.app.id));

            // @ts-ignore
            await fetch(appData.setupUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: user.user.id,
                    pushToken,
                    verificationCode
                })
            })

            return {
                status: 200,
                success: true,
                data: { message: "Successfully Verified", id: user.user.id }
            };
        } else {
           const newUser = await Users.saveNewUser(secret, pushToken, fcm, deviceId, app.app.id);

            // @ts-ignore
            await fetch(appData.setupUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user: newUser.id,
                    pushToken,
                    verificationCode
                })
            })

            return {
                status: 200,
                success: true,
                data: { message: "Successfully Verified", id: newUser.id }
            };
        }
    }
}