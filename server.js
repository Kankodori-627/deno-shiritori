import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import {serveDir} from "https://deno.land/std@0.138.0/http/file_server.ts";

const S = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ"
const N = 1
const tangoArray = [];//過去に入力された文字列たちの配列
let previousWord = Array.from(Array(N)).map(() => S[Math.floor(Math.random()*S.length)]).join('');
let eflag = false;
let tekazu = 0;
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
    tangoArray[tekazu] = nextWord;
    if(nextWord.length > 0 && 
      previousWord.charAt(previousWord.length - 1) !== nextWord.charAt(0)//前の単語の最後と次の単語の最初を比較
      ){
        return new Response("前の単語に続いていません。",{status: 400});
      }    
      if(nextWord.charAt(nextWord.length - 1) === "ん"){//最後にんがついたら負け
        return new Response("最後にんがついたのでおわりです。", {status: 400});
      }
      for(let i = 0; i < nextWord.length; i++){
        if(((nextWord.codePointAt(i) < 0x3041) || (nextWord.codePointAt(i) > 0x3093))){//ひらがな以外が入力されるとエラー
          eflag = true;
        }
      }
      if(nextWord.length <= 1){
        return new Response("二文字以上入力してください。", {status: 400});
      }
      if(eflag){
        return new Response("ひらがなだけ使用できます", {status: 400})
      }
      for(let i = 0; i < tekazu; i++){
        if(nextWord == tangoArray[i]){
          return new Response(tangoArray[i] + "はすでに入力されています", {status: 400});
        }
      }
    previousWord = nextWord;
    tekazu++;
    console.log(String(tangoArray.length));
    return new Response(previousWord);
  }
  if(req.method == "POST" && pathname === "/yarinaoshi"){
    previousWord = Array.from(Array(N)).map(() => S[Math.floor(Math.random()*S.length)]).join('');
    tekazu = 0;
    tangoArray.length = 0;//過去に入力された文字列をすべて削除
    console.log(String(tangoArray.length));
    return new Response(previousWord);
  }
  return serveDir(req, {
    fsRoot:"public",
    urlRoot:"",
    showDirListing:true,
    enableCors: true,
  });
});