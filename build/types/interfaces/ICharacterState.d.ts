export interface ICharacterState {
    canFindVehiclesToEnter: boolean;
    canEnterVehicles: boolean;
    canLeaveVehicles: boolean;
    update(timeStep: number): void;
    onInputChange(): void;
}
