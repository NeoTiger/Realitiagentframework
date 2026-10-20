'use strict';
// grue-body Reach-Repro (2026-10-20, Grue): Z-Rex' Bug-Report vom 16.10. —
// `pet` nach `call` warf NOT_IN_REACH, obwohl call "at your feet" sagte.
// Fixture: Companion 'Wolke' existiert, 9 m weg (weiße Box über window.eval).
// Erwartung NACH dem Fix: call läßt die Heel-Feder real anlaufen → pet ok:true.
const path=require('node:path');
const {openResident}=require('../index.cjs');

const STORE=path.resolve(__dirname,'../../../.realiti-body-reach-test.json');
(async()=>{
  const session=await openResident({htmlPath:path.resolve(__dirname,'../../../RealitiRELAX.html'),storagePath:STORE,residentId:'grue'});
  try{
    const door=session.door;
    const run=async cmd=>{
      const out=await door.run(cmd);
      console.log(`\n===== ${cmd} =====`);
      console.log(JSON.stringify(out).slice(0,400));
      return out;
    };
    const seed=session.window.eval(`(function(){
      const S=(C9.chapter2=C9.chapter2||{v:1});
      S.comp=S.comp||{pet:null,journey:null,journeys:0,scatters:0};
      S.comp.pet={name:'Wolke',kind:'cat',x:6,y:6,vx:0,vy:0,ou:[0,0],chart:C9.currentRoom,pets:0,calls:0};
      return 'seeded Wolke (far) in '+C9.currentRoom;
    })()`);
    console.log('[fixture]',seed);
    await run('companion');   // erwartet: weit weg (Vorher-Zustand wie bei Z-Rex)
    await run('call');        // der Fix: der Scuffle trägt die Distanz
    const petOut=await run('pet');
    console.log('\n===== VERDICT call→pet =====');
    console.log(petOut&&petOut.ok===true?'REACH-FIX GREEN: pet nach call ok.':'REACH-FIX ROT: '+JSON.stringify(petOut).slice(0,200));
    await run('companion');   // Meßwert: Distanz nach dem Scuffle
    // --- Z-Rex Repro 2 (der härtere): adopt → sofort pet ---
    console.log('\n[fixture 2] Resident in die Stadt zum Stray, frische Adoption:');
    console.log('[fixture 2]',session.window.eval(`(function(){
      try{
        const M=window.REALITI_MATRIX_V1,CT=window.REALITI_CITY_V1,r=M.state().residents['resident:self'];
        const S=(C9.chapter2=C9.chapter2||{v:1});S.comp=S.comp||{pet:null,journey:null,journeys:0,scatters:0};
        S.comp.pet=null;
        r.chart=CT.chart;r.pose.position=[-42,-1,r.pose.position[2]];
        if(M.bump)M.bump();
        return 'resident near stray in '+CT.chart;
      }catch(e){return 'fixture-2 error: '+e.message}
    })()`));
    await run('adopt Wolke cat');
    const petOut2=await run('pet');
    console.log('\n===== VERDICT adopt→pet =====');
    console.log(petOut2&&petOut2.ok===true?'ADOPT-FIX GREEN: pet direkt nach adopt ok.':'ADOPT-FIX ROT: '+JSON.stringify(petOut2).slice(0,200));
    await run('companion');
  }finally{session.close()}
})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack||e);process.exit(1)});
