// import { World } from "../core/World";

// export abstract class GameModesBase
// {
//     public world: World;
    
//     public timescaleSwitch(code: string, pressed: boolean): void
//     {
//         if (code === 'KeyT' && pressed === true) 
//         {
//             if (this.world.timeScaleTarget < 0.5)
//             {
//                 this.world.timeScaleTarget = 1;
//             }
//             else 
//             {
//                 this.world.timeScaleTarget = 0.3;
//             }
//         }
//     }

//     public checkIfWorldIsSet(): void
//     {
//         if (this.world === undefined)
//         {
//             console.error('Calling gameMode init() without having specified gameMode\'s world first: ' + this);
//         }
//     }
// }