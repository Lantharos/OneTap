import * as crypto from "crypto";
import {Temp, Users, Apps} from "../FirebaseHandler";

export default class SetupApp {
    public static async newApp(req: any) {
        const {name, loginUrl, setupUrl, description, icon} = req.body;

        const secret = crypto.randomBytes(18).toString('hex');

        const app = await Apps.saveNewApp(name, description, secret, loginUrl, setupUrl, icon);

        return {
            status: 200,
            success: true,
            data: {
                secret
            }
        }
    }

    public static async getBySecret(req: any) {
        const {secret} = req.query;

        const app = await Apps.getAppBySecret(secret);
        if(!app.success || !app.app) {
            return app;
        }

        const appData = app.app.data();

        return {
            status: 200,
            success: true,
            data: {
                // @ts-ignore
                name: appData.name,
                // @ts-ignore
                description: appData.description,
                // @ts-ignore
                icon: appData.icon
            }
        }
    }
}