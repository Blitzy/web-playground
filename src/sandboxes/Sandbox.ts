export default abstract class Sandbox {
    /**
     * Called once after the sandbox class is constructed.
     * Put loading intensive stuff in here.
     */
    abstract start(): Promise<void>;
}