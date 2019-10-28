export interface IGameMode {
    init(): void;
    update(): void;
    handleKey(event: KeyboardEvent, code: string, pressed: boolean): void;
    handleScroll(event: WheelEvent, value: number): void;
    handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void;
}