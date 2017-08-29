
TDStatus = {
  // variables that control various features of the page

  // how often the page automatically updates, in seconds
  // probably want to keep this at 2 or higher
  RefreshInterval: 3,

  // currency symbol
  CurrencySymbol: "$",

  // currency symbol on left or right
  CurrencySymbolOnLeft: true,

  // symbol for the decimal point (".")
  DecimalPoint: ".",

  // symbol for the decimal comma (",")
  DecimalComma: ",",

  // chips displayed as currency (that is, should they have a currency symbol)?
  DisplayChipsAsCurrency: false,

  // use whole numbers for chips?
  DisplayChipsAsWholeNumbers: true,

  // set to true to hide the Ante entirely when its value is 0
  HideZeroAnte: false,

  // URL to the tdstatus.txt file
  URLStatus: "tdstatus.txt",



  // private, don't change these
  LastUpdateTime: null,
  LastResponseReceivedTime: null,
  Vars: {},
  RegExComma: /(\d)(?=(\d{3})+$)/g
};



TDStatus.init = function()
{
  $("#refreshRate").val(TDStatus.RefreshInterval);
  $("#buttonSetRefreshRate").click(TDStatus.setRefreshRate);

  TDStatus.checkTimeout();
}



TDStatus.setMyTimeout = function()
{
  setTimeout(TDStatus.checkTimeout, 1000);
}



TDStatus.checkTimeout = function()
{
  if((TDStatus.LastUpdateTime === null)
    || (Math.round((new Date().getTime() - TDStatus.LastUpdateTime) / 1000) >= TDStatus.RefreshInterval))
  {
    TDStatus.refresh();
  }

  TDStatus.setMyTimeout();
}



TDStatus.setRefreshRate = function()
{
  try
  {
    TDStatus.RefreshInterval = parseInt($("#refreshRate").val());
  }
  catch(ex)
  {
    TDStatus.RefreshInterval = 5;
  }

  if((TDStatus.RefreshInterval < 1) || (TDStatus.RefreshInterval > 3600))
    TDStatus.RefreshInterval = 5;
}



TDStatus.refresh = function()
{
  $.ajax({ url: TDStatus.URLStatus, cache: false }).done(TDStatus.processResponse);
}



TDStatus.processResponse = function(inResp)
{
  TDStatus.LastResponseReceivedTime = new Date();

  try
  {
    // parse the variables
    theLines = inResp.split(/\n/);

    for(var i=0, iLen = theLines.length; i < iLen; i++)
    {
      if(theLines[i].search(/\w+=.*/) >= 0)
      {
        var theParts = theLines[i].split(/=/);
        TDStatus.Vars[theParts[0]] = theParts[1];
      }
    }
  }
  catch(ex)
  {
    alert(ex);
  }

  TDStatus.updatePage();
}



TDStatus.pad = function(inInt, inLen)
{
  inLen -= ("" + inInt).length;

  if(inLen > 0)
    return new Array(inLen + 1).join("0") + inInt;

  return "" + inInt;
}



TDStatus.padRight = function(inInt, inLen)
{
  inLen -= ("" + inInt).length;

  if(inLen > 0)
    return inInt + new Array(inLen + 1).join("0");

  return "" + inInt;
}



TDStatus.attachCurrencySymbol = function(inValue)
{
  return TDStatus.CurrencySymbolOnLeft ? TDStatus.CurrencySymbol + inValue : inValue + TDStatus.CurrencySymbol;
}



TDStatus.insertCommas = function(inValue, inComma)
{
  var theParts = ("" + inValue).split(/\./);

  theParts[0] = theParts[0].replace(/(\d)(?=(\d{3})+$)/g, "$1" + (inComma ? inComma : ","));

  return (theParts.length == 1) ? theParts[0] : theParts[0] + "." + theParts[1];
}



TDStatus.getNumberString = function(inValue, inDecimalPlaces, inInsertCommas)
{
  var theParts = ("" + inValue).split(/\./);

  if(inInsertCommas)
    theParts[0] = TDStatus.insertCommas(theParts[0], TDStatus.DecimalComma);

  if(inDecimalPlaces == 0)
    return theParts[0];

  if(theParts.length == 1)
    theParts[1] = "0";

  theParts[1] = "" + Math.round(parseInt(theParts[1]) / Math.pow(10, theParts[1].length - inDecimalPlaces));

  return theParts[0] + TDStatus.DecimalPoint + TDStatus.padRight(theParts[1], inDecimalPlaces);
}



TDStatus.getMoneyString = function(inValue, inWholeNumbers)
{
  return TDStatus.attachCurrencySymbol(TDStatus.getNumberString(inValue, inWholeNumbers ? 0 : 2, true));
}



TDStatus.getChipsString = function(inValue)
{
  if(TDStatus.DisplayChipsAsCurrency)
    return TDStatus.getMoneyString(inValue, TDStatus.DisplayChipsAsWholeNumbers);

  return TDStatus.getNumberString(inValue, TDStatus.DisplayChipsAsWholeNumbers ? 0 : 2, true);
}



TDStatus.getClockValue = function(inSeconds)
{
  if((inSeconds == null) || (inSeconds == ""))
    return "";

  inSeconds = parseInt(inSeconds);

  var theSecs = inSeconds % 60;
  inSeconds = (inSeconds - theSecs) / 60;
  var theMins = inSeconds % 60;
  inSeconds = (inSeconds - theMins) / 60;

  return inSeconds ? (inSeconds + ":" + TDStatus.pad(theMins, 2) + ":" + TDStatus.pad(theSecs, 2)) : theMins + ":" + TDStatus.pad(theSecs, 2);
}



TDStatus.setValue = function(inID, inNewValue, inCurrentValue)
{
  if((inCurrentValue == null) || (inCurrentValue == ""))
    inCurrentValue = $("#" + inID).html();

  if(inCurrentValue != inNewValue)
  {
    $("#" + inID).fadeOut("fast", function() { $("#" + inID).html(inNewValue).fadeIn("fast"); });
  }
}



TDStatus.updatePage = function()
{
  var theTitle = TDStatus.Vars["title"];
  var theDescription = TDStatus.Vars["description"];
  var theChipCount = parseInt(TDStatus.Vars["chipcount"]);
  var thePlayersLeft = parseInt(TDStatus.Vars["playersleft"]);
  var theAvgStack = thePlayersLeft == 0 ? 0 : Math.floor(theChipCount / thePlayersLeft);
  var theRound = (TDStatus.Vars["isbreak"] == 1) ? "On Break (" + TDStatus.Vars["breaknum"] + ")" : TDStatus.Vars["roundnum"];

  var theNewClock = TDStatus.getClockValue(TDStatus.Vars["secondsleft"]) + (TDStatus.Vars["clockpaused"] == 1 ? " (PAUSED)" : "");

  TDStatus.setValue("title", theTitle);
  TDStatus.setValue("description", theDescription);
  TDStatus.setValue("clock", theNewClock);
  TDStatus.setValue("round", theRound);
  TDStatus.setValue("blinds", TDStatus.getChipsString(TDStatus.Vars["smallblind"]) + " / " + TDStatus.getChipsString(TDStatus.Vars["bigblind"]));
  TDStatus.setValue("ante", TDStatus.getChipsString(TDStatus.Vars["ante"]));
  $("#ante").css({ display: TDStatus.HideZeroAnte ? "none" : "" });
  $("#label_ante").css({ display: TDStatus.HideZeroAnte ? "none" : "" });
  $("#space_ante").css({ display: TDStatus.HideZeroAnte ? "none" : "" });
  TDStatus.setValue("players", thePlayersLeft + " / " + TDStatus.Vars["buyins"]);
  TDStatus.setValue("averagestack", TDStatus.getChipsString(theAvgStack));
  TDStatus.setValue("pot", TDStatus.getMoneyString(TDStatus.Vars["pot"]));
  TDStatus.setValue("lastupdated", "" + new Date(parseInt(TDStatus.Vars["time"]) * 1000));

  TDStatus.LastUpdateTime = new Date().getTime();
}
