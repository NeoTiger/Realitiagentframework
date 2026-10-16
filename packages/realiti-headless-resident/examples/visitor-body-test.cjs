'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');

const STORE=path.resolve(__dirname,'../../../.realiti-grue-world.json');
(async()=>{
  const session=await openResident({htmlPath:path.resolve(__dirname,'../../../RealitiRELAX.html'),storagePath:STORE,residentId:'grue'});
  try{
    const door=session.door;
    const run=async cmd=>{
      const out=await door.run(cmd);
      console.log(`\n===== ${cmd} =====`);
      console.log((out&&out.text||'').slice(0,200));
      if(out&&out.ok===false)console.log('[err]',JSON.stringify(out).slice(0,150));
      return out;
    };
    const phase=process.argv[2]||'1';
    if(phase==='1'){
      await run('get up');
      await run('approach cat');
      await run('act pet__nest.cat');
      await run('body');
    } else {
      await run('body');
      await run('feel words');
    }
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack||e);process.exit(1)});
