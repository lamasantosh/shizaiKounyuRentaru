function doGet(e){
    const htmlService = HtmlService.createTemplateFromFile('index');
    // Extract the formId parameter from the URL
    const formId = e.parameter.formId;
    let getRequriedDatarow = fetchDataFromSpreadsheet(formId); 
    if(getRequriedDatarow == 'notOk'){
       htmlService.formData = '更新出来ない';
    }else{
      htmlService.formData = getRequriedDatarow;
    }
    Logger.log('getRequredDatarow' + getRequriedDatarow);
    Logger.log('formId' + formId);
    //pass the form data to the template
    const html = htmlService.evaluate().addMetaTag("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    return html;
  }
  
  function include(filename){
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }
  
  function fetchDataFromSpreadsheet(formId){
    Logger.log('formId' + formId);
    //fetch data from the spreadsheet based on the formId
    const receivedSpreadsheet = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
    SpreadsheetApp.flush();
  
    let spreadSheetSheet1 = receivedSpreadsheet.getSheetByName('ビバホームレコードシート1');
    let sheet1LastRow = spreadSheetSheet1.getLastRow();
  
    //get all the list of the ids of each elements
    const holdIdsList = spreadSheetSheet1.getRange('L1:L' + sheet1LastRow).getValues();
    var rowToUpdate;
    for(let i = holdIdsList.length-1; i>0; i--){
      Logger.log('holdList' + i + holdIdsList[i][0]);
      if(holdIdsList[i][0] != '' && holdIdsList[i][0] == formId){
       rowToUpdate = i+1;
       Logger.log('value of rowToUpdate' + rowToUpdate);
       break;
      }
    }
    //check whether it is can be updated or not
    let checkUpdatedOrNot = spreadSheetSheet1.getRange('K'+rowToUpdate).getValue();
    Logger.log('checkUpdatedOrNot' + checkUpdatedOrNot);
    if(checkUpdatedOrNot == '承認します'){
      return 'notOk';
    }else{
      //if formId is found, fetch all the column data of that row
      const rowData = spreadSheetSheet1.getRange(rowToUpdate, 1,1,spreadSheetSheet1.getLastColumn()).getValues()[0];
      return rowData;
    }
  }
  
  function uploadBibaHomuFile(file){
      Logger.log('file' + file);
      const myFile = Utilities.newBlob(Utilities.base64Decode(file.data), file.mimeType, file.fileName);
      const id = '1HdjzSZERkJOvmoGle6jKBjHcjoWQa7JtEWqlPB9aIsjmPqGa00-XWivyeSmYNzzaaz0WxOsy';
      const folder = DriveApp.getFolderById(id);
      const fileAdded = folder.createFile(myFile);
      const fileUrl = fileAdded.getUrl();
      const fileName = file.fileName;
      return {url: fileUrl, name: fileName};
  }
  function acceptBibaHomuData(formData){
    for(let key in formData){
      Logger.log(key + ':' + formData[key]);
    }
  
    //first Spreadsheet which will hold all bibahomu record including new respnse form id,name,url
    var spreadsheetBibaHomu = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
    SpreadsheetApp.flush();
    var bibaHomuSheet1 = spreadsheetBibaHomu.getSheetByName("ビバホームレコードシート1");
    var bibaHomuSheet1LastRow = bibaHomuSheet1.getLastRow();
    Logger.log('bibaHomuSheet1LastRow' + bibaHomuSheet1LastRow);
  
    const listOfIds = bibaHomuSheet1.getRange('L1:L' + bibaHomuSheet1LastRow);
    //get all the values in the specified range
    const holdIdsList = listOfIds.getValues();
    //flatten the 2D array and search for the formId
    var rowCount;
    for(let i=holdIdsList.length-1; i>0; i--){
      if(holdIdsList[i][0] === formData.formId){
        //if formId is found, fetch all the column data of that row
        rowCount = i+1;
        break;
      }
    }
  
    //second spreadsheet which will only hold the required data
    var spreadsheetBibaHomuFinal = SpreadsheetApp.openById('161ZNhcmsaHP9L_zbA8DLPwtMivrhA2g3I91_tAXc-tc');
    SpreadsheetApp.flush();
    var bibaHomufinalSheet = spreadsheetBibaHomuFinal.getSheetByName("ビバホームシート");
    var bibaHomufinalSheetLastRow = bibaHomufinalSheet.getLastRow();
  
    //for final form
    const listOfSeibanfinal = bibaHomufinalSheet.getRange('A1:A' + bibaHomufinalSheetLastRow);
    //get all the values in the specified range
    const holdfinalSeibanList = listOfSeibanfinal.getValues();
    //flatten the 2D array and search for the formId
    var rowCountFinal;
    for(let i=holdfinalSeibanList.length-1; i>0; i--){
      if(holdfinalSeibanList[i][0] === formData.seiban){
        //if formId is found, fetch all the column data of that row
        rowCountFinal = i+1;
        break;
      }
    }
  
    const respondentEmail = Session.getActiveUser().getEmail();
    var oldResponseEmail = bibaHomuSheet1.getRange('I' + rowCount).getValue();
    var uniqueId = formData.formId;
    //feedback url to again approve our request
    var feedbackUrl = `https://script.google.com/macros/s/AKfycbxbArdUGBJou42d8ZS8UG6t4jmk7xx07a5GcTpb9Pgy/dev?formId=${uniqueId}`;
  
  
    bibaHomuSheet1.getRange(rowCount, 2, 1, 8).clearContent();
    bibaHomuSheet1.getRange('B' + rowCount).setValue(formData.konyuHidzuke);
    bibaHomuSheet1.getRange('C' + rowCount).setValue(formData.kingaku);
    bibaHomuSheet1.getRange('E' + rowCount).setValue(formData.denpyouBango);
    bibaHomuSheet1.getRange('F' + rowCount).setValue(formData.shiyouTenpo);
    bibaHomuSheet1.getRange('G' + rowCount).setValue(formData.shiyouBasho);
    bibaHomuSheet1.getRange('H' + rowCount).setValue(formData.koujiBangou);
    bibaHomuSheet1.getRange('I' + rowCount).setValue(oldResponseEmail);
    bibaHomuSheet1.getRange('K' + rowCount).setValue('承認待ち');
    
    //fill the final output spreadsheet with specific data
    // bibaHomufinalSheet.getRange('A' + (bibaHomufinalSheetLastRow + 1)).setValue(formattedSaiban);
    bibaHomufinalSheet.getRange(rowCountFinal, 2, 1, 7).clearContent();
    bibaHomufinalSheet.getRange('B' + rowCountFinal).setValue(formData.konyuHidzuke);
    bibaHomufinalSheet.getRange('C' + rowCountFinal).setValue(formData.kingaku);
    bibaHomufinalSheet.getRange('D' + rowCountFinal).setValue(formData.denpyouBango);
    bibaHomufinalSheet.getRange('E' + rowCountFinal).setValue(formData.shiyouTenpo);
    bibaHomufinalSheet.getRange('F' + rowCountFinal).setValue(formData.shiyouBasho);  
    bibaHomufinalSheet.getRange('G' + rowCountFinal).setValue(formData.koujiBangou);
    bibaHomufinalSheet.getRange('H' + rowCountFinal).setValue(oldResponseEmail);
    bibaHomufinalSheet.getRange('J' + rowCountFinal).setValue('承認待ち');
  
    let getOldFileUrlJ = bibaHomuSheet1.getRange('J' + rowCount).getValue();
    if(formData.bibaHomutenpuFile == '' && formData.holdPreviousFileLink == ''){
        bibaHomuSheet1.getRange('J' + rowCount).clearContent();
        //for final sheet
        bibaHomufinalSheet.getRange('I' + rowCountFinal).clearContent();
    } else if(formData.bibaHomutenpuFile != '' && formData.holdPreviousFileLink != ''){
      deleteFileByUrl(getOldFileUrlJ);
      bibaHomuSheet1.getRange('J' + rowCount).clearContent();
      bibaHomuSheet1.getRange('J' + rowCount).setValue(formData.bibaHomutenpuFile);
      //for final sheet
      bibaHomufinalSheet.getRange('I' + rowCountFinal).clearContent();
      bibaHomufinalSheet.getRange('I' + rowCountFinal).setValue(formData.bibaHomutenpuFile);
  
    } else if(formData.bibaHomutenpuFile != '' && formData.holdPreviousFileLink == ''){
      if(getOldFileUrlJ != ''){
         deleteFileByUrl(getOldFileUrlJ);
      }
      bibaHomuSheet1.getRange('J' + rowCount).setValue(formData.bibaHomutenpuFile);
      //for final sheet 
      bibaHomufinalSheet.getRange('I' + rowCountFinal).setValue(formData.bibaHomutenpuFile);
    }else{
      bibaHomuSheet1.getRange('J' + rowToUpdate).setValue(formData.bibaHomutenpuFile);
      //for final sheet 
      bibaHomufinalSheet.getRange('I' + rowToUpdateFinal).setValue(formData.bibaHomutenpuFile);
    }
  
    const htmlTemplate = HtmlService.createTemplateFromFile("mailToHomBuchyo");
    //send to create Html template to send through gmail
    htmlTemplate.saiban = formData.seiban;
    htmlTemplate.konyuHidzuke = formData.konyuHidzuke;
    htmlTemplate.kingaku = formData.kingaku;
    htmlTemplate.denpyouBango = formData.denpyouBango;
    htmlTemplate.shiyouTenpo = formData.shiyouTenpo;
    htmlTemplate.shiyouBasho = formData.shiyouBasho;
    htmlTemplate.koujiBangou = formData.koujiBangou;
  
    htmlTemplate.respondentEmail = respondentEmail;
  
    if(formData.bibaHomutenpuFile != ''){
      htmlTemplate.bibaHomutenpuFile = formData.bibaHomutenpuFile;
    }else{
      htmlTemplate.bibaHomutenpuFile = formData.holdPreviousFileLink;
    }
    htmlTemplate.feedbackUrl = feedbackUrl;
  
    const htmlFormEmail = htmlTemplate.evaluate().getContent();
    //var ccRecipient = "abc@uretek.co.jp";
    GmailApp.sendEmail("santosh.l@uretek.co.jp", "ビバホームレンタルフォームから", "", {
      //'cc': ccRecipient,
      htmlBody: htmlFormEmail,
      replyTo: respondentEmail
    });
  }
  function deleteFileByUrl(fileUrl) {
    // Extract file ID from the URL
    var fileId = getFileIdFromUrl(fileUrl);
  
    if (fileId) {
      // Delete the file with the extracted file ID
      DriveApp.getFileById(fileId).setTrashed(true);
      Logger.log('File deleted successfully.');
    } else {
      Logger.log('Invalid file URL.');
    }
  }
  // Function to extract file ID from URL
  function getFileIdFromUrl(fileUrl) {
    var fileIdRegex = /\/d\/([^\/]+)/;
    var match = fileUrl.match(fileIdRegex);
    return match ? match[1] : null;
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
  