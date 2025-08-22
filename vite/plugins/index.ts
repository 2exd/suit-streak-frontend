import vue from '@vitejs/plugin-vue';
import { PluginOption } from 'vite';
import createSetupExtend from "./setup-extend"
import createSvgIcon from "./svg-icon"
import createCompression from "./compression"


export default function createVitePlugins(viteEnv: Record<string, string>, isBuild = false) {
    const vitePlugins: PluginOption[] = [vue()];


    vitePlugins.push(createSetupExtend());
    vitePlugins.push(createSvgIcon(isBuild));
    isBuild && vitePlugins.push(...createCompression(viteEnv));
    return vitePlugins;
}
