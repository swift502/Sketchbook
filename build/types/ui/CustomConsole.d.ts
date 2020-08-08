import { CustomConsoleMessage } from './CustomConsoleMessage';
export declare class CustomConsole {
    messages: CustomConsoleMessage[];
    entranceAnimation: string;
    exitAnimation: string;
    messageDuration: number;
    addMessage(text: string): void;
    update(timeStep: number): void;
}
