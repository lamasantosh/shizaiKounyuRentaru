function doGet() {
  const htmlService = HtmlService.createTemplateFromFile('index');
  htmlService.denpyoBangoList = getDenpyoBangoList();
  var denpyoList = getDenpyoBangoList();
  Logger.log('denpyoList' + denpyoList);
  const html = htmlService.evaluate().addMetaTag("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
  return html;
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function acceptFirstFormData(formData){
  //first Spreadsheet which will hold all bibahomu record including new respnse form id,name,url
  var spreadsheetBibaHomu = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
  SpreadsheetApp.flush();
  var bibaHomuSheet1 = spreadsheetBibaHomu.getSheetByName("ビバホームレコードシート1");
  var bibaHomuSheet1LastRow = bibaHomuSheet1.getLastRow();
  
  //second spreadsheet which will only hold the required data
  var spreadsheetBibaHomuFinal = SpreadsheetApp.openById('161ZNhcmsaHP9L_zbA8DLPwtMivrhA2g3I91_tAXc-tc');
  SpreadsheetApp.flush();
  var bibaHomufinalSheet = spreadsheetBibaHomuFinal.getSheetByName("ビバホームシート");
  var bibaHomufinalSheetLastRow = bibaHomufinalSheet.getLastRow();
  
  //look whether that denpyou bango is filled or selected
  var searchDenpyouBango;
  if(formData.denpyouBangoSelect == '伝票番号無し'){
    searchDenpyouBango = formData.denpyouBangoFill;
  }else{
    searchDenpyouBango = formData.denpyouBangoSelect;
  }

  let denpyouBangoColumnValues = bibaHomuSheet1.getRange(1,5,bibaHomuSheet1LastRow).getValues();
  let denpyouBangoArray = [];
  denpyouBangoArray = denpyouBangoColumnValues.flat().map(String);
  denpyouBangoArray.forEach(obj => Logger.log('object' + obj));

  if(denpyouBangoArray.indexOf(searchDenpyouBango) != -1){
    bibaHomuSheet1LastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
    bibaHomufinalSheetLastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
    bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('FULL');  
  }else{
    bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('AVAIL');  
  }

  //accessing the other sheet
  const ssLinkedSheet = spreadsheetBibaHomu.getSheetByName("ssLinked");
  createNewToHoldSpreadsheet(ssLinkedSheet);

  bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).setNumberFormat('@STRING@');
  bibaHomufinalSheet.getRange('A' + (bibaHomufinalSheetLastRow + 1)).setNumberFormat('@STRING@');
  var formattedSaiban = formatNumberWithLeadingZeros(bibaHomuSheet1LastRow, 5).toString();
  
  //Get the User's email address
  const respondentEmail = Session.getActiveUser().getEmail();
  Logger.log('formData' + formData);
  for(var key in formData){
    Logger.log(key + ': ' + formData[key]);
  }
  Logger.log('formData.denpyouBangoSelect' + formData.denpyouBangoSelect);
  bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).setValue(formattedSaiban);
  bibaHomuSheet1.getRange('B' + (bibaHomuSheet1LastRow + 1)).setValue(formData.konyuHidzuke);
  bibaHomuSheet1.getRange('C' + (bibaHomuSheet1LastRow + 1)).setValue(formData.kingaku);
  if(formData.denpyouBangoSelect == '伝票番号無し'){
    bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoFill);   
  }else{
    bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoSelect);
  }
  bibaHomuSheet1.getRange('F' + (bibaHomuSheet1LastRow + 1)).setValue(formData.shiyouTenpo);
  bibaHomuSheet1.getRange('O' + (bibaHomuSheet1LastRow + 1)).setValue('承認待ち');
  
  //fill the final output spreadsheet with specific data
  bibaHomufinalSheet.getRange('A' + (bibaHomufinalSheetLastRow + 1)).setValue(formattedSaiban);
  bibaHomufinalSheet.getRange('B' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.konyuHidzuke); 
  bibaHomufinalSheet.getRange('C' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.kingaku);
  if(formData.denpyouBangoSelect == '伝票番号無し'){
    bibaHomufinalSheet.getRange('D' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.denpyouBangoFill);  
  }else{
    bibaHomufinalSheet.getRange('D' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.denpyouBangoSelect);
  }
  bibaHomufinalSheet.getRange('E' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.shiyouTenpo);
  bibaHomufinalSheet.getRange('L' + (bibaHomufinalSheetLastRow + 1)).setValue('承認待ち');
}
function createNewToHoldSpreadsheet(ssLinkedSheet){
    /*
    ssLinkedSheetの中で検索始める。/start
    もし、スプレッドシートのリンクなかった場合は新しいスプレッドシートの作成する。
    */
    
    //get the values in column A From row 1 to 10
    var lastRowOfssLinkedSheet = ssLinkedSheet.getLastRow();
    if (lastRowOfssLinkedSheet > 0) {
      let columnAValueOfssLinkedSheet = ssLinkedSheet.getRange(lastRowOfssLinkedSheet, 1).getValue();
      let spreadSheetInside = SpreadsheetApp.openById(columnAValueOfssLinkedSheet);
      //get all sheets in the spreadsheet
      let allSheet = spreadSheetInside.getSheets();

      let visibleSheets = allSheet.filter(function (sheet) {
        return !sheet.isSheetHidden();
      });
      if (visibleSheets.length >= 190) {
        let spreadsheetFolderId = "1Kb1nKgl8fDIE41T3crAzSOwq2EqR1r5X";
        //create a new spreadsheet
        let newSsForHoldSheets = SpreadsheetApp.create("holdRemainingSs");
        //get the Id of the newly created spreadsheet
        let newSpreadsheetId = newSsForHoldSheets.getId();
        ssLinkedSheet.getRange(lastRowOfssLinkedSheet + 1, 1).setValue(newSpreadsheetId);
        latestData = newSpreadsheetId;
        //get folder by its Id
        let folder = DriveApp.getFolderById(spreadsheetFolderId);
        //move the spreadsheet to the folder
        DriveApp.getFileById(newSpreadsheetId).moveTo(folder);
      }
    } else {
      let spreadsheetFolderId = "1Kb1nKgl8fDIE41T3crAzSOwq2EqR1r5X";
      //create a new spreadsheet
      let newSsForHoldSheets = SpreadsheetApp.create("holdRemainingSs");
      //get the Id of the newly created spreadsheet
      let newSpreadsheetId = newSsForHoldSheets.getId();
      ssLinkedSheet.getRange(lastRowOfssLinkedSheet + 1, 1).setValue(newSpreadsheetId);
      latestData = newSpreadsheetId;
      //get folder by its Id
      let folder = DriveApp.getFolderById(spreadsheetFolderId);
      //move the spreadsheet to the folder
      DriveApp.getFileById(newSpreadsheetId).moveTo(folder);
    }

    /*
     ssLinkedSheetの検索終了/end
    */
}
function formatNumberWithLeadingZeros(number, desiredLength) {
    // Default desired length to 5 if not provided
    desiredLength = desiredLength || 5;

    // Convert to string only if the number is defined
    let formattedNumber = (number !== undefined) ? number.toString() : '';

    // Format the number with leading zeros
    return formattedNumber.padStart(desiredLength, '0');
}

function getDenpyoBangoList(){
   const ss = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
   const bibahomuSheet = ss.getSheetByName("ビバホームレコードシート1");
   const denpyoBangoList = bibahomuSheet.getRange("D2:E" + bibahomuSheet.getLastRow()).getValues();
   var denpyoBangoSelect = [];
   denpyoBangoSelect.push('伝票番号無し');
   denpyoBangoList.forEach(row => {
      if (row[0] === "AVAIL") { // Check if the value in column F is "AVAIL"
         denpyoBangoSelect.push(row[1]); // Push the corresponding value from column E
      }
   });

   return denpyoBangoSelect;
}

