import {ghApi}from "./github.ts"
Deno.test("ghApi works with cache",async ()=>{
  await ghApi("https://api.github.com/repos/shoppingjaws/gh-notification-filter/issues/1")
  await ghApi("https://api.github.com/repos/shoppingjaws/gh-notification-filter/issues/1")
})