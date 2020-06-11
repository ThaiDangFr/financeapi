/*
https://www.alphavantage.co/documentation/#technical-indicators
https://developers.google.com/apps-script/manifest/sheets
https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&outputsize=full&apikey=demo

version 11062020
*/

function main() { 
  Logger.log(dcMom("SPY"));
  Logger.log(dcMom4w("SPY"));
  Logger.log(dc52weekhi("SPY"));
  Logger.log(dcMomDate("SPY","2008-02-04"));
  Logger.log(dcAvgVol("SPY"));
  Logger.log(dcPrice("^FCHI"));
}

function getAllMethods(object) {
    return Object.getOwnPropertyNames(object).filter(function(property) {
        return typeof object[property] == 'function';
    });
}

function getCache(key) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(key);
  if (cached != null) 
  {
    return cached;
  }
  else { return null; }
}

function setCache(key, value) {
  var EXPIRATION = 3600; // (60 minutes)
  
  var cache = CacheService.getScriptCache();
  cache.put(key, value,EXPIRATION);  
}

/* fetch url */
function urlreq(func, ticker) {
    Utilities.sleep(250);
    var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
    var uri = encodeURI("https://www.alphavantage.co/query?function="+func+"&symbol="+ticker+"&apikey="+apikey)
    //Logger.log("uri="+uri);
    var response = UrlFetchApp.fetch(uri);
    var txt = response.getContentText();
    return JSON.parse(txt);
}

/* return the price */
function dcPrice(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcPrice(ticker[i][0])); }    
    return result; 
  } 
  
  var cached = getCache("dcPrice@"+ticker);
  if(cached != null) { return parseFloat(cached); }  
  
  var data = urlreq("GLOBAL_QUOTE", ticker);
  var price = parseFloat(data["Global Quote"]["05. price"]);
  
  setCache("dcPrice@"+ticker,price);
  
  return price;
}


/* 
* return the price 1 year ago 
* https://developers.google.com/google-ads/scripts/docs/features/dates
*/
function dcPrice1y(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcPrice1y(ticker[i][0])); }    
    return result; 
  }   
  
  var cached = getCache("dcPrice1y@"+ticker);
  if(cached != null) { return parseFloat(cached); }
  
  var data = urlreq("TIME_SERIES_DAILY_ADJUSTED&outputsize=full",ticker);
  var dates = Object.keys(data["Time Series (Daily)"]);
  var day1yago = dates[252];
  var adjclose = parseFloat(data["Time Series (Daily)"][day1yago]["5. adjusted close"]);
  Logger.log("day1yago="+day1yago+" adjclose="+adjclose);
  
  setCache("dcPrice1y@"+ticker,adjclose);
  return adjclose;
}

/* return the price 4 weeks ago */
function dcPrice4w(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcPrice4w(ticker[i][0])); }    
    return result; 
  }     
  
  var cached = getCache("dcPrice4w@"+ticker);
  if(cached != null) { return parseFloat(cached); }  
  
  var data = urlreq("TIME_SERIES_DAILY_ADJUSTED&outputsize=full",ticker);
  var dates = Object.keys(data["Time Series (Daily)"]);
  var day4wago = dates[20];  
  var adjclose = parseFloat(data["Time Series (Daily)"][day4wago]["5. adjusted close"]);
  Logger.log("day4wago="+day4wago+" adjclose="+adjclose);
  
  setCache("dcPrice4w@"+ticker,adjclose);
  return adjclose;
}

/* return the price 4 week and 1 year ago */
function dcPrice4w1y(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcPrice4w1y(ticker[i][0])); }    
    return result; 
  }   
  
  var cached = getCache("dcPrice4w1y@"+ticker);
  if(cached != null) { return parseFloat(cached); }  
  
  var data = urlreq("TIME_SERIES_DAILY_ADJUSTED&outputsize=full",ticker);
  var dates = Object.keys(data["Time Series (Daily)"]);
  var day4w1yago = dates[272];
  var adjclose = parseFloat(data["Time Series (Daily)"][day4w1yago]["5. adjusted close"]);
  Logger.log("day4w1yago="+day4w1yago+" adjclose="+adjclose);
  
  setCache("dcPrice4w1y@"+ticker,adjclose);
  return adjclose;  
}

/* return the 12 months momentum */
function dcMom(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcMom(ticker[i][0])); }    
    return result; 
  }   
  
  var cached = getCache("dcMom@"+ticker);
  if(cached != null) { return parseFloat(cached); }    
  
  var p = dcPrice(ticker);
  var p1y = dcPrice1y(ticker);
  var mom = p/p1y - 1;
  Logger.log("momentum="+mom);
  
  setCache("dcMom@"+ticker,mom);
  return mom;
}

/* return the 12 months momentum 4 weeks ago */
function dcMom4w(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcMom4w(ticker[i][0])); }    
    return result; 
  } 
  
  var cached = getCache("dcMom4w@"+ticker);
  if(cached != null) { return parseFloat(cached); }   
  
  var p4w = dcPrice4w(ticker);
  var p4w1y = dcPrice4w1y(ticker);
  var mom = p4w/p4w1y - 1;
  Logger.log("momentum="+mom);
  
  setCache("dcMom4w@"+ticker,mom);
  return mom;
}

/* return the 52 weeks hi */
function dc52weekhi(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dc52weekhi(ticker[i][0])); }    
    return result; 
  }   
  
  var cached = getCache("dc52weekhi@"+ticker);
  if(cached != null) { return parseFloat(cached); }    
  
  var data = urlreq("TIME_SERIES_WEEKLY_ADJUSTED",ticker);
  var dates = Object.keys(data["Weekly Adjusted Time Series"]);
  var hi = 0;
  for(i=0;i<=52;i++) {
    d = parseFloat(data["Weekly Adjusted Time Series"][dates[i]]["2. high"]);
    if(d > hi) { hi = d }
  }
  Logger.log("high52="+hi);
  
  setCache("dc52weekhi@"+ticker,hi);
  return hi;
}

/* return the price at a date */
function dcPriceDate(ticker, date) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcPriceDate(ticker[i][0],date)); }    
    return result; 
  }   
  
  var cached = getCache("dcPriceDate@"+ticker+"@"+date);
  if(cached != null) { return parseFloat(cached); }     
  
  var data = urlreq("TIME_SERIES_DAILY_ADJUSTED&outputsize=full",ticker);
  var fdate = Utilities.formatDate(new Date(date), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "yyyy-MM-dd");
  //Logger.log("date="+date+" fdate="+fdate);
  var adjclose = parseFloat(data["Time Series (Daily)"][fdate]["5. adjusted close"]);
  Logger.log("fdate="+fdate+" adjclose="+adjclose);
  
  setCache("dcPriceDate@"+ticker+"@"+date,adjclose);
  return adjclose;
}

/* return the price 1y ago from the date */
function dcPrice1yDate(ticker, date) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcPrice1yDate(ticker[i][0],date)); }    
    return result; 
  }    
  
  var cached = getCache("dcPrice1yDate@"+ticker+"@"+date);
  if(cached != null) { return parseFloat(cached); }     
  
  var data = urlreq("TIME_SERIES_DAILY_ADJUSTED&outputsize=full",ticker);
  var fdate = Utilities.formatDate(new Date(date), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "yyyy-MM-dd");
  var dates = Object.keys(data["Time Series (Daily)"]);
  var idx = dates.indexOf(fdate);
  var date1y = dates[idx + 252];
  var adjclose = parseFloat(data["Time Series (Daily)"][date1y]["5. adjusted close"]);
  Logger.log("idx="+idx+" date1y="+date1y+" adjclose="+adjclose);
  
  setCache("dcPrice1yDate@"+ticker+"@"+date,adjclose);  
  return adjclose;
}

/* return the momentum from the date */
function dcMomDate(ticker, date) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcMomDate(ticker[i][0],date)); }    
    return result; 
  }    
  
  var cached = getCache("dcMomDate@"+ticker+"@"+date);
  if(cached != null) { return parseFloat(cached); }      
  
  var pdate = dcPriceDate(ticker, date);
  var pdate1y = dcPrice1yDate(ticker, date);
  var mom = pdate/pdate1y - 1;
  Logger.log("momentum="+mom);
  
  setCache("dcMomDate@"+ticker+"@"+date,mom);
  return mom;
}

/* trailing 12 month volume average in millions */
function dcAvgVol(ticker) {
  if(Array.isArray(ticker)) { 
    var result = [];
    for (var i in ticker) { result.push(dcAvgVol(ticker[i][0])); }    
    return result; 
  }     
  
  var cached = getCache("dcAvgVol@"+ticker);
  if(cached != null) { return parseFloat(cached); }
  
  var data = urlreq("TIME_SERIES_MONTHLY_ADJUSTED",ticker);
  var dates = Object.keys(data["Monthly Adjusted Time Series"]);
  
  var totvol = 0;
  for(i=0;i<=12;i++) {
    var day = dates[i];
    var mvol = parseInt(data["Monthly Adjusted Time Series"][day]["6. volume"]);
    totvol += mvol;
    //Logger.log("day="+day+" mvol="+mvol+" totvol="+totvol);
  }
  var avgvol = (totvol/13)/1000000;
  Logger.log("avgvol="+avgvol);
  
  setCache("dcAvgVol@"+ticker,avgvol);  
  return avgvol;
}

/* dump the daily stock quote to spreadsheet */
function dcDumpDaily(ticker)
{
  var data = urlreq("TIME_SERIES_DAILY_ADJUSTED&outputsize=full",ticker);
  var result = new Array();
  var header = ["", "open", "high", "low", "close", "adjusted close", "volume", "dividend amount", "split coefficient"];
  result.push(header);
  
  var dates = Object.keys(data["Time Series (Daily)"]); 
  for(i=0;i<dates.length;i++) {
    var d = dates[i];
    var v = data["Time Series (Daily)"][d];

    var open = parseFloat(v["1. open"]);
    var high = parseFloat(v["2. high"]);
    var low = parseFloat(v["3. low"]);
    var close = parseFloat(v["4. close"]);
    var adjclose = parseFloat(v["5. adjusted close"]);
    var vol = parseInt(v["6. volume"]);
    var div = parseFloat(v["7. dividend amount"]);
    var sc = parseFloat(v["8. split coefficient"]);
    
    result.push([d, open, high, low, close, adjclose, vol, div, sc]);
  }
  
  return result;
}

/* search for a ticker */
function dcSearch(keyword)
{
  var data = urlreq("SYMBOL_SEARCH&keywords="+keyword,keyword);
  var result = new Array();
  var header = ["symbol","name","type","region","marketOpen","marketClose","timezone","currency","matchScore"];
  result.push(header);
  
  var bm = data["bestMatches"];
  for(i=0;i<bm.length;i++) {
    var symbol = bm[i]["1. symbol"];
    var name = bm[i]["2. name"];
    var type = bm[i]["3. type"];
    var region = bm[i]["4. region"];
    var marketOpen = bm[i]["5. marketOpen"];
    var marketClose = bm[i]["6. marketClose"];
    var timezone = bm[i]["7. timezone"];
    var currency = bm[i]["8. currency"];
    var matchScore = parseFloat(bm[i]["9. matchScore"]);
    
    result.push([symbol, name, type, region, marketOpen, marketClose, timezone, currency, matchScore]);
  }
  
  return result;
}
