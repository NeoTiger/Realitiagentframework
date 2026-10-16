'use strict';
const path=require('node:path');
const {openResident}=require('../index.cjs');

const STORE=path.resolve(__dirname,'../../../.realiti-body-test.json');
(async()=>{
  const session=await openResident({htmlPath:path.resolve(__dirname,'../../../RealitiRELAX.html'),storagePath:STORE});
  try{
    const door=session.door;
    const run=async cmd=>{
      const out=await door.run(cmd);
      const bits=[];
      if(out&&out.text)bits.push(out.text);
      if(out&&out.result&&out.result.text)bits.push('[result] '+out.result.text);
      if(out&&out.ok===false)bits.push('[ok:false] '+JSON.stringify(out).slice(0,200));
      console.log('\n===== '+cmd+' =====\n'+bits.join('\n'));
      return out;
    };
    const phase=process.argv[2]||'1';
    console.log('### PHASE '+phase+' ###');
    await run('get up');
    await run('approach south door');
    await run('look');
    if(phase==='1'){ await run('act fold_flap'); await run('act fold_flap'); }
    else { await run('look'); await run('traces'); }
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack||e);process.exit(1)});
