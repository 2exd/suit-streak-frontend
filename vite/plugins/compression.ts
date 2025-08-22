import { PluginOption } from 'vite';
import compression from 'vite-plugin-compression';

export default function createCompression(env: Record<string, string>) {
    const { VITE_BUILD_COMPRESS } = env;
    const plugin: PluginOption[] = [];
    if (VITE_BUILD_COMPRESS) {
        const compressList = VITE_BUILD_COMPRESS.split(',');
        if (compressList.includes('gzip')) {
            // 使用gzip解压缩静态文件
            plugin.push(
                compression({
                    verbose: true, // 是否在控制台输出压缩结果
                    disable: false, // 是否禁用
                    threshold: 10240, // 体积大于 threshold 才会被压缩,单位 b
                    algorithm: 'gzip', // 压缩算法,可选 [ 'gzip' , 'brotliCompress' ,'deflate' , 'deflateRaw']
                    ext: '.gz', // 生成的压缩包后缀
                    deleteOriginFile: false //压缩后是否删除源文件
                })
            );
        }
        if (compressList.includes('brotli')) {
            plugin.push(
                compression({
                    ext: '.br',
                    algorithm: 'brotliCompress',
                    deleteOriginFile: false,
                })
            );
        }
    }
    return plugin;
}
