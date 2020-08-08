import { CustomConsole } from './CustomConsole';
export declare class CustomConsoleMessage {
    domElement: HTMLElement;
    private customConsole;
    private elapsedTime;
    private removalTriggered;
    constructor(console: CustomConsole, domElement: HTMLElement);
    update(timeStep: number): void;
    private triggerRemoval;
}
