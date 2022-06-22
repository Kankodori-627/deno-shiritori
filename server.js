import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import {serveDir} from "https://deno.land/std@0.138.0/http/file_server.ts";

let previousWord = "しりとり";

console.log("Listening on http://localhost:8000");//このサーバーのURL

serve(async (req) => {
  const pathname = new URL(req.url).pathname;//次にアクセスするURLの表示
  console.log(pathname);
  if(req.method === "GET" && pathname === "/shiritori"){//GETで直接書き込まない
    return new Response(previousWord);
  }
  if(req.method =="POST" && pathname === "/shiritori"){//POSTから受け取る
    const requestJson = await req.json();
    const nextWord = requestJson.nextWord;
    if(nextWord.length > 0 && 
      previousWord.charAt(previousWord.length - 1) !== nextWord.charAt(0)//前の単語の最後と次の単語の最初を比較
      ){
        return new Response("前の単語に続いていません。",{status: 400});
      }
    previousWord = nextWord;
    return new Response(previousWord);
  }
  return serveDir(req, {
    fsRoot:"public",
    urlRoot:"",
    showDirListing:true,
    enableCors: true,
  });
//   if (pathname === "/styles.css") {
//     return new Response(await Deno.readTextFile("./public/styles.css"), {
//       headers: { "Content-Type": "text/css; charset=utf-8" },
//     });
//   }
//   return new Response(await Deno.readTextFile("./public/index.html"), {
//     headers: { "Content-Type": "text/html; charset=utf-8" },
//   });
});