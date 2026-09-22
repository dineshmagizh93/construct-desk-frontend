const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const routes=['/','/features','/modules','/how-it-works','/pricing','/faq','/request-demo','/terms-of-service','/privacy-policy','/refund-policy','/login','/forgot-password','/reset-password'];
 const results=[];
 for(const width of (process.env.SKIP_ROUTES ? [] : [1440,768,390,320])){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   await page.goto('http://127.0.0.1:5173'+route,{waitUntil:'domcontentloaded'});
   await page.locator('h1').first().waitFor();
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,scene:!!document.querySelector('.construction-scene'),heading:document.querySelector('h1')?.textContent}));
   assert.equal(layout.overflow,false,`Horizontal overflow at ${route} / ${width}`);
   results.push({route,width,...layout});
  }
 }
 if(results.length) fs.writeFileSync('frontend/qa/routes.json',JSON.stringify(results,null,2));
 console.log(results.length ? 'PASS: '+results.length+' route/viewport layout checks.' : 'Route checks skipped; running interactions only.');
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:5173/pricing');
 await page.getByRole('button',{name:/Yearly/}).click();
 assert.equal(await page.getByRole('button',{name:/Yearly/}).getAttribute('aria-pressed'),'true');
 assert.equal(await page.getByRole('button',{name:'Monthly',exact:true}).getAttribute('aria-pressed'),'false');
 assert.ok(await page.getByText('₹39,990',{exact:false}).count()>0);
 await page.screenshot({path:'frontend/qa/pricing-desktop.png',fullPage:true});
 await page.goto('http://127.0.0.1:5173/modules');
 for(const tab of await page.getByRole('tab').all()) { const label=await tab.innerText();await tab.click();assert.equal(await tab.getAttribute('aria-selected'),'true');assert.ok(await page.getByRole('heading',{name:label,exact:true}).count()>0); }
 await page.goto('http://127.0.0.1:5173/faq');
 const faq=page.locator('main button[aria-expanded]').first();
 const before=await faq.getAttribute('aria-expanded');await faq.click();assert.notEqual(await faq.getAttribute('aria-expanded'),before);await faq.click();assert.equal(await faq.getAttribute('aria-expanded'),before);
 await page.goto('http://127.0.0.1:5173/request-demo');
 await page.getByRole('button',{name:'Request Demo',exact:true}).click();
 assert.equal(await page.getByText('Name is required.',{exact:true}).count(),1);
 // Mock only this local browser's demo request: no real record is created.
 let demoPayload;
 await page.route('**/demo-requests',r=>{demoPayload=r.request().postDataJSON();return r.fulfill({status:201,contentType:'application/json',body:'{"ok":true}'});});
 await page.getByLabel('Full name').fill('Preview Test');await page.getByLabel('Work email').fill('preview@example.test');await page.getByLabel('Phone').fill('0000000000');await page.getByLabel('Company name').fill('Preview Company');
 await page.getByRole('button',{name:'Request Demo',exact:true}).click();await page.getByRole('heading',{name:/got your request/}).waitFor();assert.equal(demoPayload.industry,'construction');
 await page.goto('http://127.0.0.1:5173/');
 assert.equal(await page.locator('.scene-note').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.screenshot({path:'frontend/qa/home-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'frontend/qa/home-mobile-top.png'});
 await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('dialog').getByRole('link',{name:'Features',exact:true}).click();await page.waitForURL('**/features');assert.equal(await page.getByRole('dialog').count(),0);
 await page.screenshot({path:'frontend/qa/features-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5173/login');await page.screenshot({path:'frontend/qa/login-desktop.png'});
 assert.deepEqual(errors,[]);
 const report={checkedAt:new Date().toISOString(),results,checks:['pricing billing toggle','all module group tabs','FAQ expand/collapse','demo form required validation','demo success state with intercepted API request','mobile menu navigation and close','reduced-motion animation suppression'],runtimeErrors:errors};
 fs.writeFileSync('frontend/qa/verification.json',JSON.stringify(report,null,2));
 console.log('PASS: pricing, modules, FAQ, demo form, mobile navigation, reduced motion. No browser runtime errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
