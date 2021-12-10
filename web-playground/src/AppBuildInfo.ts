export namespace AppBuildInfo {
    /**
     * Version number of the app. 
     */
    export const version: string = __app_build_version__;

    const _time: string = __app_build_time__;

    /**
     * The date that this version of the app was built.
     */
    export function date(): Date {
        const timeNum = parseInt(_time);
        return new Date(timeNum);
    }

    export function mode(): string {
        return import.meta.env.MODE;
    }

    /**
     * Is the app in development mode?
     */
     export function inDevMode(): boolean {
        return import.meta.env.DEV;
    }

    /**
     * Is the app in production mode?
     */
    export function inProdMode(): boolean {
        return import.meta.env.PROD;
    }
}
