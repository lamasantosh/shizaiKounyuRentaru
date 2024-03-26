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

function generateUniqueID() {
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 1000); // Change 1000 to adjust the range of the random part
  return `ID_${timestamp}_${randomPart}`;
}

function uploadBibaHomuFile(file){
    Logger.log('file' + file);
    const myFile = Utilities.newBlob(Utilities.base64Decode(file.data), file.mimeType, file.fileName);
    const id = '1HdjzSZERkJOvmoGle6jKBjHcjoWQa7JtEWqlPB9aIsjmPqGa00-XWivyeSmYNzzaaz0WxOsy';
    const folder = DriveApp.getFolderById(id);
    const fileAdded = folder.createFile(myFile)
    // const rep = {
    //   'url' : fileAdded.getUrl(),
    //   'name' : file.fileName
    // }
    const fileUrl = fileAdded.getUrl();
    const fileName = file.fileName;
    return {url: fileUrl, name: fileName};
}
function acceptBibaHomuData(formData){
  //first Spreadsheet which will hold all bibahomu record including new response form id,name,url
  var spreadsheetBibaHomu = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
  SpreadsheetApp.flush();
  var bibaHomuSheet1 = spreadsheetBibaHomu.getSheetByName("ビバホームレコードシート1");
  var bibaHomuSheet1LastRow = bibaHomuSheet1.getLastRow();
  Logger.log('bibaHomuSheet1LastRow' + bibaHomuSheet1LastRow);
  
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

  //to get last row
  bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).setNumberFormat('@STRING@');
  bibaHomufinalSheet.getRange('A' + (bibaHomufinalSheetLastRow + 1)).setNumberFormat('@STRING@');
  var formattedSaiban = formatNumberWithLeadingZeros(bibaHomuSheet1LastRow, 5).toString();

  //Get the User's email address
  const respondentEmail = Session.getActiveUser().getEmail();
  Logger.log('formData' + formData);
  for(var key in formData){
    Logger.log(key + ': ' + formData[key]);
  }
  var result = createNewForm();
  var formUrl = result[0];
  var formId2 = result[1];
  var spreadsheet = SpreadsheetApp.openById('1XKZgsgxdaEy6Uc5Nc-S4QIO0mQQziufMPJEKGApGO3U');
  //use of SpreadsheetApp.flush() is to ensure that any pending changes in the script are applied
  SpreadsheetApp.flush();
  //get all sheets inside the speradsheet
  var sheets = spreadsheet.getSheets();
  //filter out hidden sheets
  var visibleSheetName = sheets
    .filter(function (sheet) {
      return !sheet.isSheetHidden();
    })
    .reduce(function (prev, current) {
      var prevNum = getNumericPart(prev.getName());
      var currentNum = getNumericPart(current.getName());
      return prevNum > currentNum ? prev : current;
    });
  Logger.log('formUrl' + formUrl + 'formId2' + formId2);
  // Get the file URL from the formData object
  const bibaFileUrl = formData.bibaHomutenpuFile.url;
  

  
  if(formData.denpyouBangoSelect == '伝票番号無し'){
    bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoFill);   
  }else{
    bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoSelect);
  }
  bibaHomuSheet1.getRange('G' + (bibaHomuSheet1LastRow + 1)).setValue(formData.shiyouBasho);
  bibaHomuSheet1.getRange('H' + (bibaHomuSheet1LastRow + 1)).setValue(formData.koujiBangou); 
  bibaHomuSheet1.getRange('I' + (bibaHomuSheet1LastRow + 1)).setValue(formData.shiyoSya);
  bibaHomuSheet1.getRange('J' + (bibaHomuSheet1LastRow + 1)).setValue(respondentEmail);
  bibaHomuSheet1.getRange('K' + (bibaHomuSheet1LastRow + 1)).setValue(bibaFileUrl);
  bibaHomuSheet1.getRange('L' + (bibaHomuSheet1LastRow + 1)).setValue(formId2);
  bibaHomuSheet1.getRange('M' + (bibaHomuSheet1LastRow + 1)).setValue(visibleSheetName.getName());
  bibaHomuSheet1.getRange('N' + (bibaHomuSheet1LastRow + 1)).setValue(formUrl);
  bibaHomuSheet1.getRange('O' + (bibaHomuSheet1LastRow + 1)).setValue('承認待ち');
  
  if(formData.denpyouBangoSelect == '伝票番号無し'){
    bibaHomufinalSheet.getRange('D' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.denpyouBangoFill);  
  }else{
    bibaHomufinalSheet.getRange('D' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.denpyouBangoSelect);
  }
  //fill the final output spreadsheet with specific data
  bibaHomufinalSheet.getRange('F' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.shiyouBasho);
  bibaHomufinalSheet.getRange('G' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.koujiBangou);
  bibaHomufinalSheet.getRange('H' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.shiyoSya);
  bibaHomufinalSheet.getRange('I' + (bibaHomufinalSheetLastRow + 1)).setValue(respondentEmail);
  bibaHomufinalSheet.getRange('J' + (bibaHomufinalSheetLastRow + 1)).setValue(bibaFileUrl);
  bibaHomufinalSheet.getRange('K' + (bibaHomufinalSheetLastRow + 1)).setValue('承認待ち');

  //var ccRecipient = "abc@uretek.co.jp";
  if(denpyouBangoArray.indexOf(searchDenpyouBango) != -1){
    let seibanValue = bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).getValue();
    let konyuHidzukeValue = bibaHomuSheet1.getRange('B' + (bibaHomuSheet1LastRow + 1)).getValue();
    let kingakuValue = bibaHomuSheet1.getRange('C' + (bibaHomuSheet1LastRow + 1)).getValue();
    let shiyouTenpoValue = bibaHomuSheet1.getRange('F' + (bibaHomuSheet1LastRow + 1)).getValue();

    const htmlTemplate = HtmlService.createTemplateFromFile("mailToHomBuchyo");
    //send to create Html template to send through gmail
    htmlTemplate.saiban = seibanValue;
    htmlTemplate.konyuHidzuke = konyuHidzukeValue;
    htmlTemplate.kingaku = kingakuValue;
    
    if(formData.denpyouBangoSelect == '伝票番号無し'){
      htmlTemplate.denpyouBango = formData.denpyouBangoFill;
    }else{
      htmlTemplate.denpyouBango = formData.denpyouBangoSelect;
    }
    htmlTemplate.shiyouTenpo = shiyouTenpoValue;
    htmlTemplate.shiyouBasho = formData.shiyouBasho;
    htmlTemplate.koujiBangou = formData.koujiBangou;
    htmlTemplate.shiyoSya = formData.shiyoSya;
    htmlTemplate.respondentEmail = respondentEmail;
    htmlTemplate.bibaFileUrl = bibaFileUrl;
    htmlTemplate.formUrl = formUrl;

    const htmlFormEmail = htmlTemplate.evaluate().getContent();
    GmailApp.sendEmail("santosh.l@uretek.co.jp", "ビバホームレンタルフォームから", "", {
      //'cc': ccRecipient,
      htmlBody: htmlFormEmail,
      replyTo: respondentEmail
    });
  }
}

function formatNumberWithLeadingZeros(number, desiredLength) {
    // Default desired length to 5 if not provided
    desiredLength = desiredLength || 5;

    // Convert to string only if the number is defined
    let formattedNumber = (number !== undefined) ? number.toString() : '';

    // Format the number with leading zeros
    return formattedNumber.padStart(desiredLength, '0');
}
//新しいフォームを作成するためにコードです。
function createNewForm() {
    var ss = SpreadsheetApp.openById("1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s");
    //accessing the other sheet
    var ssLinkedSheet = ss.getSheetByName("ssLinked");
  /*
    Start of the new form creation
    */
  // Create a new form
  var newForm = FormApp.create("承認フォーム");
  var formId2;
  // Get the ID of the newly created form
  if (newForm) {
    formId2 = newForm.getId();
  }

  // add a checkBox item to a form and require exactly two selections.
  var item = newForm.addCheckboxItem();
  item.setTitle("id of items").setChoiceValues([formId2]).setRequired(true);

  var item = newForm.addMultipleChoiceItem();
  item.setTitle("ビバホームを");
  //Set some choices with go-to-page logic
  var okeyChoice = item.createChoice(
    "承認します。",
    FormApp.PageNavigationType.SUBMIT
  );
  var notOkeyChoice = item.createChoice(
    "却下します。",
    FormApp.PageNavigationType.CONTINUE
  );
  item.setChoices([okeyChoice, notOkeyChoice]);
  item.setRequired(true);

  //break page into different section
  var pageBreak = newForm.addPageBreakItem();
  //adding items inside pageBreak
  var paragraphTextItem = newForm
    .addParagraphTextItem()
    .setTitle("コメント")
    .setRequired(true);

  //get the index of the page break and items added inside it
  var pageBreakIndex = pageBreak.getIndex();
  var paragraphTextItemIndex = paragraphTextItem.getIndex();

  //move the added items inside the page break to reposition them
  newForm.moveItem(paragraphTextItemIndex, pageBreakIndex + 1);

  var file = DriveApp.getFileById(formId2);
  //assigning the folder id
  var folderId = "1nl5E2cWw_kvoqEaICqT2Cy1FLEnqZq_W";
  // Make a copy of the form into the specified folder
  var folder = DriveApp.getFolderById(folderId);
  file.moveTo(folder);
  // Gets the URL to respond to the form and logs it to the console.
  const formUrl = newForm.getPublishedUrl();

  // Open the newly created form
  var newFormOpened = FormApp.openById(formId2);

  //link the form to the spreadsheet
  var formResponseDestination = FormApp.DestinationType.SPREADSHEET;
  var openTocheckSheets = SpreadsheetApp.openById("1XKZgsgxdaEy6Uc5Nc-S4QIO0mQQziufMPJEKGApGO3U");
  //Force the execution of pending changes in the spreadsheet
  SpreadsheetApp.flush();
  var checkSheets = openTocheckSheets.getSheets();
  var lastRowOfSheet3;
  if (checkSheets.length > 10) {
    lastRowOfSheet3 = ssLinkedSheet.getLastRow();
    //it holds the id of the latest newly created spreadsheet in sheet: ssLinked
    var columnAValueOfSheet3 = ssLinkedSheet.getRange(lastRowOfSheet3, 1).getValue();
    for (let i = 0; i < checkSheets.length; i++) {
      if (i > 9) {
          let sheetNameToDelete = checkSheets[i].getName();
          let sheet = openTocheckSheets.getSheetByName(sheetNameToDelete);
          if (sheet) {
            let formUrl = sheet.getFormUrl(); 
            if (formUrl !== null) {
              
              let formId = FormApp.openByUrl(formUrl).getId();
              let form = FormApp.openById(formId);
              try {
                form.setDestination(FormApp.DestinationType.SPREADSHEET, columnAValueOfSheet3);
              } catch (e) {
                // Log an error or handle it appropriately
                Logger.log("Error setting form destination: " + e.toString());
              }
            }
            //to delete the Sheet
            try {
              openTocheckSheets.deleteSheet(sheet);
            } catch (e) {
              // Log an error or handle it appropriately
              Logger.log("Error deleting sheet: " + e.toString());
            }
          }
      }
    }
  }
  newFormOpened.setDestination(
    formResponseDestination,
    "1XKZgsgxdaEy6Uc5Nc-S4QIO0mQQziufMPJEKGApGO3U"
  );
  /*
      End of the form creation and move to a specified destination
    */
  return [formUrl, formId2];
}

  function getNumericPart(sheetName) {
    // Extract the numeric part from the sheet name
    var matches = sheetName.match(/\d+/);
    return matches ? parseInt(matches[0]) : 0;
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

