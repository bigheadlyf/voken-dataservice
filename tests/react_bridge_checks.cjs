// Exercises the React/business adapter without browser globals or live services.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, {
    textContent:'',value:'',hidden:false,disabled:false,dataset:{},elements:{},
    reset(){this.resetCalled=true;}, replaceChildren(){this.innerHTML='';},
    insertAdjacentHTML(_where,html){this.innerHTML=(this.innerHTML||'')+html;},
    setAttribute(){},removeAttribute(){},
  });
  return elements.get(selector);
}
const events=[],requests=[];
const context=vm.createContext({
  document:{querySelector:element,querySelectorAll(){return [];},addEventListener(){}},
  window:{__VOKEN_REACT__:true,addEventListener(){},scrollTo(){},dispatchEvent(e){events.push(e);}},
  sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},
  URL,URLSearchParams,Event,CustomEvent:class extends Event{constructor(name,options){super(name);this.detail=options.detail;}},
  MutationObserver:class{observe(){}},crypto:require('node:crypto').webcrypto,
  setTimeout(){},clearTimeout(){},setInterval(){},
  requests,
});
for (const file of ['app.js','workbench.js']) vm.runInContext(fs.readFileSync('app/web_ui/'+file,'utf8'),context);
const filter = element('#wb-filter');
for (const [key,value] of Object.entries({mode:'companies',q:'',target:'procurement',country_filter:'',stage:'',tag:'',verification:'',role_filter:''})) filter.elements[key]={value,type:'text'};
for (const key of ['has_email','due','ready_only']) filter.elements[key]={checked:false,type:'checkbox'};
filter.elements.namedItem = key=>filter.elements[key];
context.FormData=class{constructor(){return Object.entries(filter.elements).filter(([key,value])=>typeof value!=='function'&&value.type!=='checkbox').map(([key,value])=>[key,value.value]);}};
vm.runInContext(`
api=async(path,options)=>{
  requests.push({path,options});
  if(path.endsWith('/crm/summary'))return {total:7};
  if(path.endsWith('/activities')||path.includes('/history/'))return [];
  if(path.includes('/crm/prospects/'))return {id:'p',name:'A & B',version:1};
  if(path.includes('?mode=companies'))return {items:[{id:'p',contacts:[{email:'buyer@example.com'}],duplicates:[]}],summary:{}};
  if(options?.method==='POST')return {id:'saved'};
  return [];
};
`,context);
vm.runInContext(fs.readFileSync('app/web_ui/react-bridge.js','utf8'),context);
// Avoid enter() during adapter setup: the restored session is not loaded by app.js in React mode.
async function main(){
  const bridge=context.window.voken;
  vm.runInContext("state.session={workspace_id:'a'.repeat(32),access_token:'private-token'}",context);
  assert.equal(bridge.snapshot().session.workspace_id,'a'.repeat(32));
  assert.equal(bridge.snapshot().session.access_token,undefined,'UI snapshots must not expose access tokens');
  bridge.select(['p']);
  assert.deepEqual(Array.from(bridge.snapshot().workbench.selected),['p']);
  // Replace loadWorkbench to isolate how the native controls populate the shared form.
  vm.runInContext('loadWorkbench=async()=>{}',context);
  await bridge.filter({mode:'contacts',q:'buyer',has_email:true},30);
  assert.equal(filter.elements.mode.value,'contacts');
  assert.equal(filter.elements.has_email.checked,true);
  assert.equal(bridge.snapshot().workbench.offset,30);
  assert.equal(bridge.snapshot().workbench.selected.length,0,'Changing filters must clear batch selection');
  const detail=await bridge.detail('p');
  assert.equal(detail.contacts[0].email,'buyer@example.com');
  assert.ok(requests.some(r=>r.path.includes('q=A%20%26%20B')),'Company names must be encoded');
  assert.ok(!requests.some(r=>r.path.includes('q=p')),'Details must query by company name, not an unmatched internal ID');
  await bridge.post('/events',{prospect_id:'p',type:'reply',content:'UI test'},'event');
  const post=requests.find(r=>r.options?.method==='POST');
  assert.ok(post.options.headers['Idempotency-Key'],'Contact events retain idempotency');
  await bridge.saveView('UI test saved view');
  const saved=requests.find(r=>r.path.endsWith('/views') && r.options?.method==='POST');
  assert.equal(JSON.parse(saved.options.body).name,'UI test saved view');
  assert.equal(JSON.parse(saved.options.body).mode,'contacts');
  assert.equal(JSON.parse(saved.options.body).has_email,true);
  vm.runInContext('wb.views=[{data:{name:"Company view",mode:"companies",q:"Atlas",has_email:false,due:false}}]',context);
  await bridge.applyView(0);
  assert.equal(filter.elements.mode.value,'companies');
  assert.equal(filter.elements.q.value,'Atlas');
  assert.equal(filter.elements.has_email.checked,false);
  assert.ok(events.some(e=>e.type==='voken:updated'));
  // Snapshot summary must disappear across account clearing.
  await vm.runInContext('api(root()+"/crm/summary")',context);
  assert.equal(bridge.snapshot().summary.total,7);
  vm.runInContext('clearWorkspaceView()',context);
  assert.equal(bridge.snapshot().balance,'— 点数','Account clearing must remove the previous balance');
  assert.equal(bridge.snapshot().summary,null);
  assert.equal(bridge.snapshot().workbench.summary,null);
  console.log('Passed React bridge selection, filter mapping, saved views, detail encoding, event idempotency, token isolation and account clearing.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
