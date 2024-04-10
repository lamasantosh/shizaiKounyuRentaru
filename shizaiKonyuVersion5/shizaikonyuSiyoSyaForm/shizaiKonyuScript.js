function doGet() {
    const htmlService = HtmlService.createTemplateFromFile('index');
    htmlService.denpyoBangoList = getDenpyoBangoList();
    htmlService.emailList = getGmailList();
    const html = htmlService.evaluate().addMetaTag("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    return html;
  }
  
  function include(filename){
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }
  
  function generateUniqueID() {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 1000); // Change 1000 to adjust the range of the random part
    return `${timestamp}_${randomPart}`;
  }
  
  function uploadBibaHomuFile(file){
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
  
    //generate unique id
    const uniqueId = generateUniqueID();
  
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
  
    if(denpyouBangoArray.indexOf(searchDenpyouBango) != -1){
      bibaHomuSheet1LastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
      bibaHomufinalSheetLastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
      if(bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).getValue() == ''){
        bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('AVAIL');  
      }else{
        bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('FULL');  
      }
    }else{
       bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('AVAIL'); 
    }
  
    //accessing the other sheet
    // const ssLinkedSheet = spreadsheetBibaHomu.getSheetByName("ssLinked");
  
    //Get the User's email address
    const respondentEmail = Session.getActiveUser().getEmail();
    Logger.log('respondentEmail' + respondentEmail);
    // Logger.log('respondentEmail' + respondentEmail);
    // for(var key in formData){
    //   Logger.log(key + ': ' + formData[key]);
    // }
  
    var feedbackUrl = `https://script.google.com/macros/s/AKfycbxbArdUGBJou42d8ZS8UG6t4jmk7xx07a5GcTpb9Pgy/dev?formId=${uniqueId}`;
    
    // Get the file URL from the formData object
    const bibaFileUrl = formData.bibaHomutenpuFile.url;
    
    if(formData.denpyouBangoSelect == '伝票番号無し'){
      bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoFill);   
    }else{
      bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoSelect);
    }
    bibaHomuSheet1.getRange('G' + (bibaHomuSheet1LastRow + 1)).setValue(formData.shiyouBasho);
    bibaHomuSheet1.getRange('H' + (bibaHomuSheet1LastRow + 1)).setValue(formData.koujiBangou); 
    bibaHomuSheet1.getRange('I' + (bibaHomuSheet1LastRow + 1)).setValue(respondentEmail);
    bibaHomuSheet1.getRange('J' + (bibaHomuSheet1LastRow + 1)).setValue(bibaFileUrl);
    bibaHomuSheet1.getRange('K' + (bibaHomuSheet1LastRow + 1)).setValue('承認待ち');
    bibaHomuSheet1.getRange('L' + (bibaHomuSheet1LastRow + 1)).setValue(uniqueId);
    
    if(formData.denpyouBangoSelect == '伝票番号無し'){
      bibaHomufinalSheet.getRange('D' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.denpyouBangoFill);  
    }else{
      bibaHomufinalSheet.getRange('D' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.denpyouBangoSelect);
    }
    //fill the final output spreadsheet with specific data
    bibaHomufinalSheet.getRange('F' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.shiyouBasho);
    bibaHomufinalSheet.getRange('G' + (bibaHomufinalSheetLastRow + 1)).setValue(formData.koujiBangou);
    bibaHomufinalSheet.getRange('H' + (bibaHomufinalSheetLastRow + 1)).setValue(respondentEmail);
    bibaHomufinalSheet.getRange('I' + (bibaHomufinalSheetLastRow + 1)).setValue(bibaFileUrl);
    bibaHomufinalSheet.getRange('J' + (bibaHomufinalSheetLastRow + 1)).setValue('承認待ち');
  
    //var ccRecipient = "abc@uretek.co.jp";
    if(bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).getValue() == 'FULL'){
      let seibanValue = bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).getValue();
      let konyuHidzukeValue = bibaHomuSheet1.getRange('B' + (bibaHomuSheet1LastRow + 1)).getValue();
      let kingakuValue = bibaHomuSheet1.getRange('C' + (bibaHomuSheet1LastRow + 1)).getValue();
      let shiyouTenpoValue = bibaHomuSheet1.getRange('F' + (bibaHomuSheet1LastRow + 1)).getValue();
  
      const htmlTemplate = HtmlService.createTemplateFromFile("mailToHomBuchyo");
      //send to create Html template to send through gmail
      htmlTemplate.saiban = seibanValue;
      htmlTemplate.konyuHidzuke = formatDate(konyuHidzukeValue);
      htmlTemplate.kingaku = kingakuValue;
      
      if(formData.denpyouBangoSelect == '伝票番号無し'){
        htmlTemplate.denpyouBango = formData.denpyouBangoFill;
      }else{
        htmlTemplate.denpyouBango = formData.denpyouBangoSelect;
      }
      htmlTemplate.shiyouTenpo = shiyouTenpoValue;
      htmlTemplate.shiyouBasho = formData.shiyouBasho;
      htmlTemplate.koujiBangou = formData.koujiBangou;
      htmlTemplate.respondentEmail = respondentEmail;
      htmlTemplate.bibaFileUrl = bibaFileUrl;
      htmlTemplate.formUrl = feedbackUrl;
  
      const htmlFormEmail = htmlTemplate.evaluate().getContent();
      GmailApp.sendEmail("santosh.l@uretek.co.jp", "ビバホームレンタルフォームから", "", {
        //'cc': ccRecipient,
        htmlBody: htmlFormEmail,
        replyTo: respondentEmail
      });
    }
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
  
  function getGmailList(){
     const ss = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
     const bibahomuSheet = ss.getSheetByName("メールリスト");
     const emailList = bibahomuSheet.getRange("A1:A" + bibahomuSheet.getLastRow()).getValues();
     var emailListSelect = [];
     emailList.forEach(row => {
        emailListSelect.push(row); // Push the corresponding value from column E
     });
     return emailListSelect;
  }
  
  function formatDate(dateString){
    // Create a new Date object
    var date = new Date(dateString);
  
    // Get the year, month, and day from the Date object
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero based
    var day = ("0" + date.getDate()).slice(-2);
  
    // Concatenate the year, month, and day with "-" separator
    var formattedDate = year + "-" + month + "-" + day;
    return formattedDate;
  }