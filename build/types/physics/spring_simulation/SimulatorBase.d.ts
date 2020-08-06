export declare abstract class SimulatorBase {
    mass: any;
    damping: any;
    frameTime: number;
    offset: number;
    abstract cache: any[];
    constructor(fps: number, mass: number, damping: number);
    setFPS(value: number): void;
    lastFrame(): any;
    /**
     * Generates frames between last simulation call and the current one
     * @param {timeStep} timeStep
     */
    generateFrames(timeStep: number): void;
    abstract getFrame(isLastFrame: boolean): any;
    abstract simulate(timeStep: number): void;
}
