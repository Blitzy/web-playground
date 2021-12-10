export namespace AppBuildInfo {
    /**
     * Version number of the app. 
     */
    export const version: string = '__web-playground-version__';

    const _time: string = '__web-playground-build-time__';

    /**
     * The date that this version of the app was built.
     */
    export function date(): Date {
        const timeNum = parseInt(_time);
        return new Date(timeNum);
    }
    
    /**
     * The build mode that this app was built with.
     * One of the following: Development, Quality Assurance, Production
     */
    export const mode: string = '__web-playground-build-mode__';

    /**
     * Is the app in development mode?
     */
    export function inDevMode(): boolean {
        return mode === 'Development';
    }

    /**
     * Is the app in quality assurance mode?
     */
    export function inQAMode(): boolean {
        return mode === 'Quality Assurance';
    }

    /**
     * Is the app in production mode?
     */
    export function inProdMode(): boolean {
        return mode === 'Production';
    }
}
