import { test, expect } from '@playwright/test';
for (const width of [320,375,390,430,768,1024,1440,1920]) {
 for (const lang of ['en','ar']) {
  test(width+'px '+lang+' menu currency search and bag',async ({page})=>{
   test.setTimeout(100000);
   await page.setViewportSize({width,height:900});
   await page.addInitScript(l=>localStorage.setItem('lha-language',l),lang);
   await page.goto('/',{waitUntil:'load'});
   await expect(page.locator('main')).toBeVisible();
   await expect(page.locator('html')).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
   const reject=page.getByRole('button',{name:/reject|رفض/i});
   if(await reject.isVisible().catch(()=>false)) await reject.click();
   const menu=page.locator('.mobile-more-action');
   const mobile=await menu.isVisible();
   if(mobile){
    await expect.poll(async ()=>(await menu.boundingBox())?.height||0).toBeGreaterThanOrEqual(44);
    await menu.click();
    await expect(page.locator('#mobile-menu')).toHaveClass(/open/);
    await expect.poll(async ()=>{
     const box=await page.locator('#mobile-menu').boundingBox();
     return !!box && box.x>=-2 && box.x+box.width<=width+2;
    }).toBe(true);
    await page.locator('#mobile-menu select').first().selectOption('LYD');
    await page.getByRole('button',{name:/close menu|إغلاق القائمة/i}).click();
    await menu.click();
    await expect(page.locator('#mobile-menu select').first()).toHaveValue('LYD');
    await page.getByRole('button',{name:/close menu|إغلاق القائمة/i}).click();
   }else{
    const select=page.locator('.desktop-utilities select:visible').first();
    await select.selectOption('LYD');
    await expect(select).toHaveValue('LYD');
   }
   await page.getByRole('button',{name:/open search|فتح البحث/i}).first().click();
   const dialog=page.getByRole('dialog').first();
   await expect(dialog.getByRole('combobox')).toBeVisible();
   await page.keyboard.press('Escape');
   await expect(dialog).toBeHidden();
   await page.locator('button.cart-btn:visible').first().click();
   await expect(page.locator('.cart-drawer')).toHaveClass(/open/);
  });
 }
}
