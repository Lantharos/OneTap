import Setup from "./modules/Setup";
import Login from "./modules/Login";
import SetupApp from "./modules/SetupApp";

export default class OneTap {
    public static async setup(req: any) {
        return Setup.startSetup(req);
    }

    public static async finishSetup(req: any) {
        return Setup.verifySetup(req);
    }

    public static async verify(req: any) {
        return Login.verify(req);
    }

    public static async newApp(req: any) {
        return SetupApp.newApp(req);
    }

    public static async getApp(req: any) {
        return SetupApp.getBySecret(req);
    }
}