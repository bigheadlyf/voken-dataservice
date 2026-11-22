const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector,{value:'',hidden:false,dataset:{},elements:{},innerHTML:'',
    reset(){this.resetCalled=true;},replaceChildren(){this.innerHTML='';},scrollIntoView(){},
    insertAdjacentHTML(_where,html){this.innerHTML+=html;},
    setAttribute(){},removeAttribute(){}});
  return elements.get(selector);
}
const context=vm.createContext({document:{querySelector:element,querySelectorAll(){return[];},addEventListener(){}},
  window:{addEventListener(){},scrollTo(){}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},
  URL,URLSearchParams,crypto:require('node:crypto').webcrypto,setTimeout(){},clearTimeout(){},setInterval(){}});
vm.runInContext(fs.readFileSync('app/web_ui/app.js','utf8'),context);
vm.runInContext(fs.readFileSync('app/web_ui/workbench.js','utf8'),context);
vm.runInContext('wbRecordForm("a".repeat(32),"buyer@example.com")',context);
const form=element('#wb-history').innerHTML;
assert.equal((form.match(/name="email"/g)||[]).length,1);
assert.ok(form.includes('value="buyer@example.com"'));
vm.runInContext(`renderWbInbox([{id:'a',data:{subject:'<script>alert(1)</script>',senders:['buyer@example.com'],content:'<img src=x onerror=alert(1)>',suggested_prospect_ids:[]}}])`,context);
assert.ok(!element('#wb-inbox').innerHTML.includes('<script>'));
assert.ok(!element('#wb-inbox').innerHTML.includes('<img'));
assert.ok(element('#wb-inbox').innerHTML.includes('&lt;img'));
const markup=vm.runInContext(`wbEmailHTML({prospect_id:'a',email:'',name:'<b>Jane</b>',company:'Buyer',titles:['Purchasing Manager'],blocked:false,next_action:'补全联系方式',company_assessment:{status:'unreviewed'},role_match:{reason:'<script>'},verification:{status:'unverified',history_count:0},warnings:['email_missing'],sources:[],supplier_observations:[]})`,context);
assert.ok(markup.includes('&lt;b&gt;Jane&lt;/b&gt;'));
assert.ok(markup.includes('暂无完整邮箱'));
assert.ok(markup.includes('disabled>验证邮箱'));
vm.runInContext('state.session={workspace_id:"workspace-one"};wb.selected.add("private-customer");wb.preview={private:true};wb.cohorts={private:true};resetWorkbench()',context);
assert.equal(vm.runInContext('wb.selected.size',context),0);
assert.equal(vm.runInContext('wb.preview',context),null);
assert.equal(vm.runInContext('wb.cohorts',context),null);
assert.equal(element('#wb-history').innerHTML,'');
assert.equal(element('#wb-history').hidden,true);
assert.ok(!element('#wb-views').innerHTML.includes('workspace-one'));
console.log('Passed workbench event mailbox binding, email-free candidate display, source escaping, and account clearing.');
