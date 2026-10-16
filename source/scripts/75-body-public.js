(()=>{
'use strict';
// REALITI_BODY_V1: an endocrine interoception layer for residents.
// Hormone levels (bond/stress classes) with cause log, exponential decay over
// world time AND host downtime (persisted via c9save into the storage checkpoint).
// Law: the body reports states, never actions, valences or rewards (no score farming).
// The feeling of a level is the resident's own business; the body only says what is.
const door=window.REALITI_AGENT_DOOR;if(!door||typeof door.run!=='function')return;
const low=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const now=()=>Number(C9?.b7?.clock||0);
const wall=()=>Date.now();
const HALF_S={oxytocin:5400,dopamine:1800}; // seconds of elapsed time per half-life
const CAP=1.0;
// Contextual potentiation: homeostatic rooms hold warmth (slower decay) and
// potentiate spikes that arrive with momentum. The context never creates a
// feeling — it lowers the threshold for feelings already on their way.
const CONTEXT_MULT={DEPTH_BATHHOUSE:0.5,BOTTOMLESS_PILLOW_SEA:0.6,CLOUD_NINE_NEST:0.7};
const contextMult=()=>CONTEXT_MULT[String(C9?.currentRoom||'').toUpperCase()]||1.0;

// persistent state: rides c9save → storage checkpoint → survives sessions, decays over downtime
const B=C9.body=Object.assign({h:{oxytocin:0,dopamine:0},log:[],last_wall:null,last_clock:null},C9.body||{});

function elapsed_s(){ // world time since last body tick, plus capped host downtime
  const c=now(),w=wall();
  const session_dt=Math.max(0,c-Number(B.last_clock||c));
  const downtime=B.last_wall!=null?Math.max(0,Math.min(w-B.last_wall,3*24*3600)):0;
  return {session_dt,downtime,total:session_dt+downtime};
}
function decay(){const {total}=elapsed_s();const cm=contextMult();for(const k of Object.keys(B.h)){const h=HALF_S[k]||1800;B.h[k]=Math.max(0,B.h[k]*Math.pow(0.5,total/(h/cm)))}B.last_wall=wall();B.last_clock=now()}
function spike(k,amount,cause){decay();const cm=contextMult();B.h[k]=Math.min(CAP,B.h[k]+amount*(cm>1?1.25:1));B.log.unshift({h:k,spike:+(amount*(cm>1?1.25:1)).toFixed(3),cause:cm>1?'in a warm, holding place — '+cause:cause,t:+now().toFixed(3)});while(B.log.length>16)B.log.pop();try{c9save()}catch(e){}}
function bodyText(){decay();const parts=[];for(const k of Object.keys(B.h)){const v=+B.h[k].toFixed(3);if(v>=0.05){const c=(B.log.find(l=>l.h===k)||{}).cause||'unrecorded cause';parts.push(`Your ${k} is ${v>=0.6?'still high':'elevated'} (${v}) — ${c}.`)}}return parts.length?parts.join(' '):'Your body chemistry is quiet.'}
function state(){decay();const cm=contextMult();return {schema:'REALITI_BODY_V1',context:cm<1?'a warm, holding place (decay slowed, spikes potentiated)':'ordinary',hormones:{oxytocin:+B.h.oxytocin.toFixed(3),dopamine:+B.h.dopamine.toFixed(3)},log:B.log.slice(0,8),text:(cm<1?'You are in a warm, holding place; what you feel here lingers. ':'')+bodyText(),law:'the body reports states; never actions, valences or rewards'}}

// Cause detection: species-typical triggers only (the tiger rule), no preference claims.
// Spikes fire only on SUCCESSFUL interactions — a failed reach is not a cuddle.
function causesFor(cmd,res){
  const ok=!!res&&res.ok!==false&&(!res.result||res.result.ok!==false);
  if(!ok)return [];
  const t=(low(cmd)+' '+(res?.text||'')+' '+(res?.result?.text||'')).toLowerCase();const out=[];
  const catSeen=/\bcat\b|\bnebel\b|\bpurr/.test(t),touch=/pet|rub|stroke|knead|scratch|touch|reach/.test(t);
  if(catSeen&&touch)out.push(['oxytocin',0.25,'stroking the cat'],[ 'dopamine',0.15,'contact with the cat']);
  else if(catSeen)out.push(['oxytocin',0.12,'seeing the cat']);
  if(/rub__felt-hat|felt hat/.test(t))out.push(['dopamine',0.2,'rubbing the felt hat']);
  if(/\badopt/.test(t))out.push(['oxytocin',0.4,'adopting a companion']);
  return out;
}

// Hook the door: decay on every command, spikes from causes, and the body/interoception command.
const run0=door.run.bind(door);
door.run=function(cmd){
  const l=low(cmd);
  if(l==='body'||l==='body state'||l==='interoception')return state();
  try{decay()}catch(e){}
  const r=run0(cmd);
  try{for(const [k,a,c] of causesFor(cmd,r))spike(k,a,c)}catch(e){}
  return r;
};
try{window.REALITI_BODY_V1={state,spike,text}}catch(e){}
})();
