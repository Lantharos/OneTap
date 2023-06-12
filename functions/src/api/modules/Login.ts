import * as crypto from "crypto";
import {Temp, Users, Apps} from "../FirebaseHandler";

export default class Login {
    public static async verify(req: any) {
        const {user, secret, pushToken} = req.body;

        const app = await Apps.getAppBySecret(secret);
        if(!app.success || !app.app) {
            return app;
        }

        const appData = app.app.data();

        const userDoc = await Users.getUser(user);
        if(!userDoc) {
            return { status: 400, success: false, data: { message: "Invalid user" } };
        }

        const userData = userDoc.data();

        if(!userData.apps.includes(app.app.id)) {
            return {
                status: 401,
                success: false,
                data: { message: "Unauthorized" }
            };
        }

        // @ts-ignore
        await Users.sendNotification(pushToken, "Verify login request", "Please verify this login request on your device for the app " + appData.name);

        return {
            status: 200,
            success: true,
            data: {
                message: "Notification sent"
            }
        }
    }

    public static async confirm(req: any) {
        const {user, securityCode, serviceSecret, deviceId} = req.body;

        const app = await Apps.getAppBySecret(serviceSecret);
        if(!app.success || !app.app) {
            return app;
        }

        const appData = app.app.data();

        const userDoc = await Users.getUser(user);
        if(!userDoc) {
            return { status: 400, success: false, data: { message: "Invalid user" } };
        }

        const userData = userDoc.data();

        if(!userData.apps.includes(app.app.id)) {
            return {
                status: 401,
                success: false,
                data: { message: "Unauthorized" }
            };
        }

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', serviceSecret + "." + deviceId, iv);
        cipher.setAutoPadding(true);

        let encryptedUser = cipher.update(user.id, 'utf8', 'base64');
        encryptedUser += cipher.final('base64');

        const confirmation = iv.toString('base64') + encryptedUser;

        if (securityCode !== confirmation) {
            return {
                status: 401,
                success: false,
                data: { message: "Unauthorized" }
            };
        }

        // @ts-ignore
        await fetch(appData.loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: user.id,
                deviceId,
                confirmation
            })
        });

        return {
            status: 200,
            success: true,
            data: {
                message: "Login confirmed"
            }
        }
    }
}

