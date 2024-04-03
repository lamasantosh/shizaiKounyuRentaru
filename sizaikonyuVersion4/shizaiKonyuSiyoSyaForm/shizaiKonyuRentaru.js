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
    return `${timestamp}_${randomPart}`;
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
    denpyouBangoArray.forEach(obj => Logger.log('object' + obj));
  
    if(denpyouBangoArray.indexOf(searchDenpyouBango) != -1){
      bibaHomuSheet1LastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
      bibaHomufinalSheetLastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
      bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('FULL');  
    }else{
       bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('AVAIL'); 
    }
  
    //accessing the other sheet
    // const ssLinkedSheet = spreadsheetBibaHomu.getSheetByName("ssLinked");
  
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
  
    var feedbackUrl = `https://script.google.com/macros/s/AKfycbww34sdNMSTL_grBMyHEkUm83Bs8AGD0aXt2NyvO8gT8y_6GjYJIcXQgy-qdPYnC3EqbA/exec?formId=${uniqueId}`;
    
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
  
  function formatNumberWithLeadingZeros(number, desiredLength) {
      // Default desired length to 5 if not provided
      desiredLength = desiredLength || 5;
  
      // Convert to string only if the number is defined
      let formattedNumber = (number !== undefined) ? number.toString() : '';
  
      // Format the number with leading zeros
      return formattedNumber.padStart(desiredLength, '0');
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
  
  