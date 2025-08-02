/*
https://appscript.dev/apps-script-tutorials/string-objects-in-apps-script/match-method/

28 mai 2023 : remplacé par du code vu sur https://www.lido.app/tutorials/yahoo-finance-google-sheets
              passage du cache de 12h à 24h pour voir si ça règle les pbs de Exception: Service invoked too many times for one day: urlfetch.

16 avril 2024 
curl -A "Mozilla/5.0 (Linux; Android 10; SM-G996U Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36" https://finance.yahoo.com/quote/CE > quote.txt
<fin-streamer class="livePrice svelte-mgkamr" data-symbol="CE" data-testid="qsp-price" data-field="regularMarketPrice" data-trend="none" data-pricehint="2" data-value="155" active><span>155.00</span></fin-streamer>       


13 janvier 2025
j'ai utilisé voir le code code source de https://finance.yahoo.com/quote/ROL/ avec une recherche sur data-field="regularMarketPreviousClose" et copilot pour trouver le pattern

2 juillet 2025
finnhub permet 60 req par minutes (mais ne couvre ques les actions et etf US)
curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=d1ioa2hr01qhbuvr8sfgd1ioa2hr01qhbuvr8sg0" | jq -e -r '.c'

2 aout 2025
retour sur yahoo finance avec le endpoint `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
*/


function FINNHUB(symbol) {
  var cache = CacheService.getScriptCache(); // CacheService.getUserCache();
  cprice = cache.get(symbol);

  if (cprice == null) {

    const endpoint = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=d1ioa2hr01qhbuvr8sfgd1ioa2hr01qhbuvr8sg0`;
    const response = UrlFetchApp.fetch(endpoint);
    const data = JSON.parse(response.getContentText());
    const price = data.c;


    //cache.put(symbol, price,21600);
    cache.put(symbol, price, 86400);
    console.log("from yahoo:" + symbol + "=" + price);
    return parseFloat(price);
  }
  else {
    console.log("from cache:" + symbol + "=" + cprice);
    return parseFloat(cprice);
  }
}


function YAHOOFINANCE(symbol) {
  var cache = CacheService.getScriptCache();
  cprice = cache.get(symbol);

  if (cprice == null) {

    const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = UrlFetchApp.fetch(endpoint);
    //console.log(response.getContentText())
    const data = JSON.parse(response.getContentText());
    const price = data.chart.result[0].meta.regularMarketPrice;

    /*
    const url = `https://finance.yahoo.com/quote/${symbol}?p=${symbol}`;
    const res = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    const contentText = res.getContentText();
    //const price_tab = contentText.match(/<fin-streamer(?:.*?)active="">(\d+[,]?[\d\.]+?)<\/fin-streamer>/);
    //const price_tab = contentText.match(/<fin-streamer(?:.*?)active><span>(\d+[,]?[\d\.]+?)<\/span><\/fin-streamer>/);
  
    const pattern = /<fin-streamer\b(?:.*?)data-symbol=".*?"(?:.*?)data-value="(\d+[,]?[\d\.]+?)"(?:.*?)data-field="regularMarketPreviousClose"(?:.*?)"/;
    const price_tab = contentText.match(pattern);

    console.log(price_tab)
    const price = price_tab[1].replace(/\,/g,'');
    */

    //cache.put(symbol, price,21600);
    cache.put(symbol, price, 86400);
    console.log("from yahoo:" + symbol + "=" + price);
    return parseFloat(price);
  }
  else {
    console.log("from cache:" + symbol + "=" + cprice);
    return parseFloat(cprice);
  }
}

// Tests unitaires
function main() {
  var cache = CacheService.getScriptCache();

  cache.remove("NVR");
  p1 = YAHOOFINANCE("NVR")
  console.log(p1)

  // https://finance.yahoo.com/quote/%5ETNX/
  cache.remove("%5ETNX");
  p2 = YAHOOFINANCE("%5ETNX")
  console.log(p2)
}
