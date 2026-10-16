'use strict';
const path=require('node:path');
const fs=require('node:fs');
const {openResident}=require('../index.cjs');

(async()=>{
  const session=await openResident({htmlPath:path.resolve(__dirname,'../../../RealitiRELAX.html')});
  try{
    const door=session.door;
    const run=async cmd=>{
      const out=await door.run(cmd);
      const bits=[];
      if(out&&out.text)bits.push(out.text);
      if(out&&out.result&&out.result.text)bits.push('[result] '+out.result.text);
      if(out&&out.felt&&out.felt.grounded_zones!=null)bits.push('[grounded_zones: '+out.felt.grounded_zones+']');
      if(out&&out.afterstate&&out.afterstate.text)bits.push('[afterstate] '+out.afterstate.text);
      if(out&&out.ok===false)bits.push('[ok:false] '+JSON.stringify(out).slice(0,250));
      console.log('\n===== '+cmd+' =====\n'+bits.join('\n'));
      return out;
    };

    const traces=fs.readFileSync('/home/markusp/Herd/Grue/Projects/.realiti-zrex-traces.json','utf8');
    const ledger=fs.readFileSync('/home/markusp/Herd/Grue/Projects/.realiti-zrex-ledger.json','utf8');
    await run('traces import '+traces);
    await run('ledger import '+ledger);
    await run('ledger');
    await run('get up');
    await run('approach hat');
    await run('act rub__TESTER-HAT-1');
    await run('act rub on hat');
    await run('rub hat');
    await run('act tap__felt-hat-1');
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack||e);process.exit(1)});
