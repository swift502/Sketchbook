import { CopyShader } from './CopyShader';
import { EffectComposer } from './EffectComposer';
import { Pass } from './Pass';
import { FXAAShader } from './FXAAShader';
import { ClearMaskPass } from './MaskPass';
import { MaskPass } from './MaskPass';
import { RenderPass } from './RenderPass';
import { ShaderPass } from './ShaderPass';
import { Sky } from './Sky';

export let Shaders = {
    CopyShader: CopyShader,
    EffectComposer: EffectComposer,
    Pass: Pass,
    FXAAShader: FXAAShader,
    ClearMaskPass : ClearMaskPass ,
    MaskPass: MaskPass,
    RenderPass: RenderPass,
    ShaderPass: ShaderPass,
    Sky: Sky
};