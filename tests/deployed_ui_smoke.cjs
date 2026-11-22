// Read-only public deployment verification. Never signs in, starts jobs or sends messages.
// Run after npm ci in frontend: node tests/deployed_ui_smoke.cjs <public-app-url>
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('../frontend/node_modules/playwright');

async function main(){
  const target=new URL(process.argv[2] || 'http://8.163.73.136/api/app');
  assert.ok(['http:','https:'].includes(target.protocol));
  assert.ok(target.pathname.endsWith('/app'));
  const prefix=target.pathname.slice(0,-4);
  const evidence=path.resolve(__dirname,'../.local/deployed-smoke');
  fs.mkdirSync(evidence,{recursive:true});
  const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge'});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    const response=await page.goto(target.href);
    assert.equal(response.status(),200);
    await page.getByRole('button',{name:'进入工作台',exact:true}).waitFor();
    await page.waitForFunction(()=>!document.querySelector('#login-form button[type=submit]')?.disabled);
    assert.equal(await page.locator('#login-password').inputValue(),'');
    const nonce=await page.locator('meta[name="csp-nonce"]').getAttribute('content');
    assert.ok(response.headers()['content-security-policy'].includes('nonce-'+nonce));
    const specResponse=await context.request.get(target.origin+prefix+'/openapi.json');
    assert.equal(specResponse.status(),200);
    const spec=await specResponse.json();
    const operations=Object.values(spec.paths).reduce((total,methods)=>total+Object.keys(methods).filter(method=>['get','post','put','patch','delete'].includes(method)).length,0);
    assert.equal(operations,116);
    assert.ok(spec.paths['/api/v1/workspaces/{workspace_id}/crm/workbench']);
    const denied=await context.request.get(target.origin+'/api/v1/workspaces/'+'0'.repeat(32)+'/crm/workbench');
    assert.equal(denied.status(),401);
    const healthResponse=await context.request.get(target.origin+prefix+'/health');
    assert.equal(healthResponse.status(),200);
    const health=await healthResponse.json();assert.equal(health.status,'ok');
    await page.screenshot({path:path.join(evidence,'login-public.png'),fullPage:false});
    assert.deepEqual(errors,[],'No JavaScript, CSP or resource errors in the deployed browser');
    const result={url:target.href,status:'passed',operations,schemas:Object.keys(spec.components.schemas).length,
      browser_errors:errors.length,unauthenticated_business_status:denied.status(),authenticated_requests:false,
      external_paid_or_messaging_requests:false};
    fs.writeFileSync(path.join(evidence,'result.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result,null,2));
  } finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
