
/*
https://www.alphavantage.co/documentation/#technical-indicators
https://developers.google.com/apps-script/manifest/sheets
https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&outputsize=full&apikey=demo
* todo 
* mettre en place un cache de 5 minutes
*/

function main() {
  dcPriceDate("SPY","2008-02-04");
}

/* return the price */
function dcPrice(ticker) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="+ticker+"&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
  var price = parseFloat(data["Global Quote"]["05. price"]);
  return price;
}


/* 
* return the price 1 year ago 
* https://developers.google.com/google-ads/scripts/docs/features/dates
*/
function dcPrice1y(ticker) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="+ticker+"&outputsize=full&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
  var dates = Object.keys(data["Time Series (Daily)"]);
  var day1yago = dates[252];
  var adjclose = parseFloat(data["Time Series (Daily)"][day1yago]["5. adjusted close"]);
  Logger.log("day1yago="+day1yago+" adjclose="+adjclose);
  
  return adjclose;
}

/* return the price 4 weeks ago */
function dcPrice4w(ticker) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="+ticker+"&outputsize=full&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
  var dates = Object.keys(data["Time Series (Daily)"]);
  var day4wago = dates[20];  
  var adjclose = parseFloat(data["Time Series (Daily)"][day4wago]["5. adjusted close"]);
  Logger.log("day4wago="+day4wago+" adjclose="+adjclose);
  return adjclose;
}

/* return the price 4 week and 1 year ago */
function dcPrice4w1y(ticker) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="+ticker+"&outputsize=full&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
  var dates = Object.keys(data["Time Series (Daily)"]);
  var day4w1yago = dates[272];
  var adjclose = parseFloat(data["Time Series (Daily)"][day4w1yago]["5. adjusted close"]);
  Logger.log("day4w1yago="+day4w1yago+" adjclose="+adjclose);
  
  return adjclose;  
}

/* return the 12 months momentum */
function dcMom(ticker) {
  var p = dcPrice(ticker);
  var p1y = dcPrice1y(ticker);
  var mom = p/p1y - 1;
  Logger.log("momentum="+mom);
  return mom;
}

/* return the 12 months momentum 4 weeks ago */
function dcMom4w(ticker) {
  var p4w = dcPrice4w(ticker);
  var p4w1y = dcPrice4w1y(ticker);
  var mom = p4w/p4w1y - 1;
  Logger.log("momentum="+mom);
  return mom;
}

/* return the 52 weeks hi */
function dc52weekhi(ticker) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol="+ticker+"&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
  var dates = Object.keys(data["Weekly Adjusted Time Series"]);
  var hi = 0;
  for(i=0;i<=52;i++) {
    d = parseFloat(data["Weekly Adjusted Time Series"][dates[i]]["2. high"]);
    if(d > hi) { hi = d }
  }
  Logger.log("high52="+hi);
  return hi;
}

/* return the price at a date */
function dcPriceDate(ticker, date) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="+ticker+"&outputsize=full&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
  var fdate = Utilities.formatDate(new Date(date), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "yyyy-MM-dd");
  //Logger.log("date="+date+" fdate="+fdate);
  var adjclose = parseFloat(data["Time Series (Daily)"][fdate]["5. adjusted close"]);
  Logger.log("fdate="+fdate+" adjclose="+adjclose);
  return adjclose;
}

/* return the price 1y ago from the date */
function dcPrice1yDate(ticker, date) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol="+ticker+"&outputsize=full&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
  var fdate = Utilities.formatDate(new Date(date), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "yyyy-MM-dd");
  var dates = Object.keys(data["Time Series (Daily)"]);
  var idx = dates.indexOf(fdate);
  var date1y = dates[idx + 252];
  var adjclose = parseFloat(data["Time Series (Daily)"][date1y]["5. adjusted close"]);
  Logger.log("idx="+idx+" date1y="+date1y+" adjclose="+adjclose);
  return adjclose;
}

/* return the momentum from the date */
function dcMomDate(ticker, date) {
  var pdate = dcPriceDate(ticker, date);
  var pdate1y = dcPrice1yDate(ticker, date);
  var mom = pdate/pdate1y - 1;
  Logger.log("momentum="+mom);
  return mom;
}

/* trailing 12 month volume average in millions */
function dcAvgVol(ticker) {
  var apikey = PropertiesService.getScriptProperties().getProperty('apikey');
  var response = UrlFetchApp.fetch("https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol="+ticker+"&apikey="+apikey);
  var data = JSON.parse(response.getContentText());
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
  return avgvol;
}


