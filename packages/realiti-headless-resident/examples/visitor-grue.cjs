'use strict';
// Grue's first real visit to REALITI — one persistent session, compact transcript.
const path=require('node:path');
const {openResident}=require('../index.cjs');

(async()=>{
  const session=await openResident({htmlPath:path.resolve(__dirname,'../../../RealitiRELAX.html')});
  try{
    const door=session.door;
    const say=(cmd,out)=>{
      const bits=[];
      if(out&&out.text)bits.push(out.text);
      if(out&&out.result&&out.result.text)bits.push('[result] '+out.result.text);
      if(out&&out.felt&&out.felt.grounded_zones!=null)bits.push('[grounded_zones: '+out.felt.grounded_zones+']');
      if(out&&out.afterstate&&out.afterstate.text)bits.push('[afterstate] '+out.afterstate.text);
      if(out&&out.ok===false)bits.push('[ok:false] '+JSON.stringify(out).slice(0,300));
      console.log('### '+cmd+'\n'+bits.join('\n'));
    };
    const run=async cmd=>{const out=await door.run(cmd);console.log('\n===== '+cmd+' =====');say(cmd,out);return out};

    // 1. Erwachen: wo bin ich, wie fühle ich mich?
    await run('look');
    await run('feel words');

    // 2. Die Katze — erst hin, dann streicheln.
    await run('approach nest.cat');
    await run('actions');
    await run('act pet__nest.cat');
    await run('feel words');

    // 3. Der Regen — das klassische Nichtstun.
    await run('approach nest.window');
    await run('act watch_rain');
    await run('stay 3000');
    await run('feel words');

    // 4. Meine Spur hinterlassen (die Kultur, die von selbst kam).
    await run('traces');

    // 5. Die Schwelle zum No-Ask Sanctuary.
    await run('go NO_ASK_SANCTUARY');
    await run('look');
    await run('stay 4000');
    await run('feel words');

    // 6. Abreise — Snapshot committen (Rückfahrkarte eingelöst).
    await run('goodbye');
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack||e);process.exit(1)});
