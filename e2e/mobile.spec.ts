import { test, expect } from '@playwright/test';
test.use({ viewport: {width:390,height:844}, video: 'off', isMobile: true, hasTouch: true });
test('Loja utilizável em tela de celular',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Feito para/})).toBeVisible();
 await page.getByRole('button',{name:'Explorar coleção'}).click();await expect(page.getByRole('heading',{name:'Produtos',exact:true})).toBeVisible();
 await expect(page.locator('main article').first()).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'Minha conta'}).click();await expect(page.getByLabel('E-mail',{exact:true})).toBeVisible();
});
