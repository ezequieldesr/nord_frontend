import { spawnSync } from 'node:child_process';
const ffmpeg=process.env.FFMPEG_PATH||'ffmpeg';
function run(args){const p=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});if(p.error)throw p.error;if(p.status!==0)process.exit(p.status||1);}
for(const name of ['nord-demo','nord-admin'])run(['-i',`docs/demo/${name}.webm`,'-an','-c:v','libx264','-crf','23','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',`docs/demo/${name}.mp4`]);
run(['-i','docs/demo/nord-demo.webm','-t','12','-filter_complex','[0:v]fps=8,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0','docs/demo/preview.gif']);
console.log('MP4 e prévia GIF gerados em docs/demo.');
