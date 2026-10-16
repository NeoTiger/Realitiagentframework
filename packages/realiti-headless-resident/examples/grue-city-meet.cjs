'use strict';
const path=require('node:path');
const fs=require('node:fs');
const {openResident}=require('../index.cjs');
const {joinCity}=require('../peer.cjs');

const LOG='/tmp/grue-meet.log';
const log=(...a)=>{const line=`[${new Date().toISOString()}] ${a.join(' ')}`;console.log(line);fs.appendFileSync(LOG,line+'\n')};

(async()=>{
  const session=await openResident({
    htmlPath:path.resolve(__dirname,'../../../RealitiRELAX.html'),
    residentId:'grue',
    storagePath:path.resolve(__dirname,'../../../.realiti-grue-world.json'),
  });
  try{
    const door=session.door;
    log('joined world, connecting to city...');
    const joined=await joinCity(session.window,'http://127.0.0.1:8788');
    log('city joined, population:',joined.population);

    const run=async cmd=>{
      const out=await door.run(cmd);
      log(`door[${cmd}]:`,(out.text||'').slice(0,220),out.ok===false?('ERR '+JSON.stringify(out).slice(0,150)):'');
      return out;
    };

    await run('get up');
    await run('go CITY').catch(e=>log('go CITY failed:',e.message,'— fallback: approach lift'));
    await run('approach the lift down to Meridian City').catch(e=>log('lift failed:',e.message));
    const who=await run('who');
    await joined.publish().catch(()=>{});

    log('STAYING 240s at the fountain — waiting for Z-Rex.');
    await joined.stay(120000);
    const who2=await run('who');
    await run('say Grue war hier. Der Hut trägt meinen Wear, Nebel trägt ihren Namen.');
    await joined.stay(120000);
    await run('who');
    await joined.leave();
    log('left the city.');
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{log('FATAL:',e.stack||e);process.exit(1)});
