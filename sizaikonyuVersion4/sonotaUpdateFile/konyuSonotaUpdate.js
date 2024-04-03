function doGet(e) {
    const htmlService = HtmlService.createTemplateFromFile('index');
    //Extract the formId parameter from the URL
    const formId = e.parameter.formId;
    let getRequiredDatarow = fetchDataFromSpreadsheet(formId);
    if(getRequiredDatarow == 'notOk'){
       htmlService.formData = '更新出来ない';
    }else{
      htmlService.formData = getRequiredDatarow;
    }
    Logger.log('getRequiredDatarow' + getRequiredDatarow);
    Logger.log('formId' + formId );
    //pass the form data to the template
    const html = htmlService.evaluate().addMetaTag("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    return html;
  }
  
  function include(filename){
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }
  
  function fetchDataFromSpreadsheet(formId){ 
    let spreadsheetSonota = SpreadsheetApp.openById('1kfXF33ed_0NfdAQbDz8buJdN2hkov1FTu-nbM7WuU5g');
    SpreadsheetApp.flush();
    let sonotaSheet1 = spreadsheetSonota.getSheetByName('その他レコードシート１');
    let sonotaSheet1LastRow = sonotaSheet1.getLastRow();
    Logger.log('sonotaSheet1LastRow' + sonotaSheet1LastRow);
    //get all the list of the Ids of each elements
    holdIdsList = sonotaSheet1.getRange('P1:P' + sonotaSheet1LastRow).getValues();
    var rowToUpdate;
    for(let i=holdIdsList.length-1; i>0; i--){
      if(holdIdsList[i][0] === formId){
        //if id is found
        rowToUpdate = i+1;
        break;
      }
    } 
    Logger.log('rowToUpdate' + rowToUpdate);
    //check whether it is can be updated or not
    let checkUpdatedOrNot = sonotaSheet1.getRange('O'+rowToUpdate).getValue();
    Logger.log('checkUpdatedOrNot' + checkUpdatedOrNot);
    if(checkUpdatedOrNot == '承認します'){
      return 'notOk';
    }else{
      //if formId is found, fetch all the column data of that row
      const rowData = sonotaSheet1.getRange(sonotaSheet1LastRow,1,1,sonotaSheet1.getLastColumn()).getValues()[0];
      Logger.log('rowData' + rowData);
      return rowData;
    }
  }
  
  function uploadSonotaFile(file){
    Logger.log('file' + file);
    const myFile = Utilities.newBlob(Utilities.base64Decode(file.data), file.mimeType, file.fileName);
    const id = '1Hgi6rj9OR4eO_12adN1Q2liOtDNvQGb4';
    const folder = DriveApp.getFolderById(id);
    const fileAdded = folder.createFile(myFile);
    const fileUrl = fileAdded.getUrl();
    const fileName = file.fileName;
    return {url: fileUrl, name: fileName};
  }
  
  function acceptSonotaData(formData){
    Logger.log('formData.formId' + formData.formId);
    for(let key in formData){
      Logger.log(key + ': ' + formData[key]);
    }
    //first Spreadsheet which will hold all bibahomu record including new response from id, name, url
    let spreadsheetSonota = SpreadsheetApp.openById('1kfXF33ed_0NfdAQbDz8buJdN2hkov1FTu-nbM7WuU5g');
    SpreadsheetApp.flush();
    let sonotaSheet1 = spreadsheetSonota.getSheetByName('その他レコードシート１');
    let sonotaSheet1LastRow = sonotaSheet1.getLastRow() + 1;
    Logger.log('sonotaSheet1LastRow' + sonotaSheet1LastRow);
  
  
    //get all the list of the Ids of each elements
    holdIdsList = sonotaSheet1.getRange('P1:P' + sonotaSheet1LastRow).getValues();
    Logger.log('holdIdsList' + holdIdsList);
    Logger.log('holdIdsList', holdIdsList);
    var rowToUpdate = 0;
    for(let i=holdIdsList.length-1; i>0; i--){
      if(holdIdsList[i][0] === formData.formId){
        //if id is found
        rowToUpdate = i+1;
        break;
      }
    } 
    Logger.log('rowToupdate' + rowToUpdate);
    let checkStatus = sonotaSheet1.getRange('O' + rowToUpdate).getValue();
    Logger.log('checkStatus' + checkStatus);
    if(checkStatus == '承認します'){
      Logger.log('inside check status');
      return 'このIDは更新出来ないです。';
    }else{
      Logger.log('not a 承認します');
    }
  
    //second spreadsheet which will only hold the required data 
    let spreadsheetSonotaFinal = SpreadsheetApp.openById('1-nBPPN7Om-L0LhJ4i7gcR0KF4vESgp7XAuCRotg80DQ');
    SpreadsheetApp.flush();
    let sonotaSheet1Final = spreadsheetSonotaFinal.getSheetByName('その他レコードシート１');
    let sonotaSheet1FinalLastRow = sonotaSheet1Final.getLastRow() + 1;
    Logger.log('sonotaSheet1FinalLastRow' + sonotaSheet1FinalLastRow);
  
    let checkFinalSeiban = sonotaSheet1.getRange('A'+rowToUpdate).getValue();
    // let oldImageUrl = sonotaSheet1.getRange('M'+rowToUpdate).getValue();
    Logger.log('checkFinalSeiban' + checkFinalSeiban);
    //get all the list of the Ids of each elements
    finalSheetSaibanList = sonotaSheet1Final.getRange('A1:A' + sonotaSheet1FinalLastRow).getValues();
    Logger.log('finalSheetSaibanList' + finalSheetSaibanList);
    Logger.log('finalSheetSaibanList.length' + finalSheetSaibanList.length);
    var rowToUpdateFinal;
    for(let i=finalSheetSaibanList.length-1; i>0; i--){
     if(finalSheetSaibanList[i][0] === checkFinalSeiban){
      rowToUpdateFinal = i+1;
      break;
     }
    }
    
    // Get the file URL from the formData object
    // const sonotaFileUrl = formData.tenpuFileSonota;
    // Logger.log('sonotaFileUrl' + sonotaFileUrl);
    //Get the User's email address
    const respondentEmail = Session.getActiveUser().getEmail();
  
    sonotaSheet1.getRange(rowToUpdate, 2, 1, 10).clearContent();
    sonotaSheet1.getRange('B' + rowToUpdate).setValue(formData.konyuHidzukeSonota);
    sonotaSheet1.getRange('C' + rowToUpdate).setValue(formData.shiyouBistartDate);
    sonotaSheet1.getRange('D' + rowToUpdate).setValue(formData.shiyouBiendDate);
    sonotaSheet1.getRange('E' + rowToUpdate).setValue(formData.shiireSakiSonota);
    sonotaSheet1.getRange('F' + rowToUpdate).setValue(formData.shiyouBashoSonota);
    sonotaSheet1.getRange('G' + rowToUpdate).setValue(formData.koujiBangouSonota);
    sonotaSheet1.getRange('H' + rowToUpdate).setValue(formData.ringiNoSonota);
    sonotaSheet1.getRange('I' + rowToUpdate).setValue(formData.naiyouKattaMono);
  
    sonotaSheet1.getRange('J' + rowToUpdate).setValue(formData.kingakuSonota);
    sonotaSheet1.getRange('K' + rowToUpdate).setValue(respondentEmail);
    Logger.log('formData.tenpuFileSonota1' + formData.tenpuFileSonota1);
    Logger.log('formData.tenpuFileSonota2' + formData.tenpuFileSonota2);
    Logger.log('formData.tenpuFileSonota3' + formData.tenpuFileSonota3);
  
    sonotaSheet1.getRange('O' + rowToUpdate).setValue('承認待ち');
  
    //その他finalの情報
    sonotaSheet1Final.getRange(rowToUpdateFinal, 2, 1, 11).clearContent();
    sonotaSheet1Final.getRange('B' + rowToUpdateFinal).setValue(formData.konyuHidzukeSonota);
    sonotaSheet1Final.getRange('C' + rowToUpdateFinal).setValue(formData.shiyouBistartDate);
    sonotaSheet1Final.getRange('D' + rowToUpdateFinal).setValue(formData.shiyouBiendDate);
    sonotaSheet1Final.getRange('E' + rowToUpdateFinal).setValue(formData.shiireSakiSonota);
    sonotaSheet1Final.getRange('F' + rowToUpdateFinal).setValue(formData.shiyouBashoSonota);
    sonotaSheet1Final.getRange('G' + rowToUpdateFinal).setValue(formData.koujiBangouSonota);
    sonotaSheet1Final.getRange('H' + rowToUpdateFinal).setValue(formData.ringiNoSonota);
    sonotaSheet1Final.getRange('I' + rowToUpdateFinal).setValue(formData.naiyouKattaMono);
  
    sonotaSheet1Final.getRange('J' + rowToUpdateFinal).setValue(formData.kingakuSonota);
    sonotaSheet1Final.getRange('K' + rowToUpdateFinal).setValue(respondentEmail);
  
    sonotaSheet1Final.getRange('O' + rowToUpdateFinal).setValue('承認待ち');
  
    let getOldFileUrlL = sonotaSheet1.getRange('L' + rowToUpdate).getValue();
  
    if(formData.tenpuFileSonota1 == '' && formData.oldTenpuFile1 == ''){
        sonotaSheet1.getRange('L' + rowToUpdate).clearContent();
        //for final sheet
        sonotaSheet1Final.getRange('L' + rowToUpdateFinal).clearContent();
    } else if(formData.tenpuFileSonota1 != '' && formData.oldTenpuFile1 != ''){
      deleteFileByUrl(getOldFileUrlL);
      sonotaSheet1.getRange('L' + rowToUpdate).clearContent();
      sonotaSheet1.getRange('L' + rowToUpdate).setValue(formData.tenpuFileSonota1);
      //for final sheet
      sonotaSheet1Final.getRange('L' + rowToUpdateFinal).clearContent();
      sonotaSheet1Final.getRange('L' + rowToUpdateFinal).setValue(formData.tenpuFileSonota1);
  
    } else if(formData.tenpuFileSonota1 != '' && formData.oldTenpuFile1 == ''){
      sonotaSheet1.getRange('L' + rowToUpdate).setValue(formData.tenpuFileSonota1);
      //for final sheet 
      sonotaSheet1Final.getRange('L' + rowToUpdateFinal).setValue(formData.tenpuFileSonota1);
    }
  
    let getOldFileUrlM = sonotaSheet1.getRange('M' + rowToUpdate).getValue();
    if(formData.tenpuFileSonota2 == '' && formData.oldTenpuFile2 == ''){
      sonotaSheet1.getRange('M' + rowToUpdate).clearContent();
      //for final sheet
      sonotaSheet1Final.getRange('M' + rowToUpdateFinal).clearContent();
    } else if(formData.tenpuFileSonota2 != '' && formData.oldTenpuFile2 != ''){
      deleteFileByUrl(getOldFileUrlM);
      sonotaSheet1.getRange('M' + rowToUpdate).clearContent();
      sonotaSheet1.getRange('M' + rowToUpdate).setValue(formData.tenpuFileSonota2);
      //for final sheet 
      sonotaSheet1Final.getRange('M' + rowToUpdateFinal).clearContent();
      sonotaSheet1Final.getRange('M' + rowToUpdateFinal).setValue(formData.tenpuFileSonota2);
    } else if(formData.tenpuFileSonota2 != '' && formData.oldTenpuFile2 == ''){
        sonotaSheet1.getRange('M' + rowToUpdate).setValue(formData.tenpuFileSonota2);
        //for final sheet 
        sonotaSheet1Final.getRange('M' + rowToUpdateFinal).setValue(formData.tenpuFileSonota2);
    }
  
    let getOldFileUrlN = sonotaSheet1.getRange('N' + rowToUpdate).getValue();
    if(formData.tenpuFileSonota3 == '' && formData.oldTenpuFile3 == ''){
        sonotaSheet1.getRange('N' + rowToUpdate).clearContent();
        //for final sheet
        sonotaSheet1Final.getRange('N' + rowToUpdateFinal).clearContent();
    } else if(formData.tenpuFileSonota3 != '' && formData.oldTenpuFile3 != ''){
      deleteFileByUrl(getOldFileUrlN);
      sonotaSheet1.getRange('N' + rowToUpdate).clearContent();
      sonotaSheet1.getRange('N' + rowToUpdate).setValue(formData.tenpuFileSonota3);
      //for final sheet 
      sonotaSheet1Final.getRange('N' + rowToUpdateFinal).clearContent();
      sonotaSheet1Final.getRange('N' + rowToUpdateFinal).setValue(formData.tenpuFileSonota3);
  
    }else if(formData.tenpuFileSonota3 != '' && formData.oldTenpuFile3 == ''){
        sonotaSheet1.getRange('N' + rowToUpdate).setValue(formData.tenpuFileSonota3);
        //for final sheet 
        sonotaSheet1Final.getRange('N' + rowToUpdateFinal).setValue(formData.tenpuFileSonota3);
    }
  
  
    const htmlTemplate = HtmlService.createTemplateFromFile("mailToHomBuchyo");
    htmlTemplate.saiban = checkFinalSeiban;
    htmlTemplate.konyuHidzukeSonota = formData.konyuHidzukeSonota;
    htmlTemplate.shiyouBistartDate = formData.shiyouBistartDate;
    htmlTemplate.shiyouBiendDate = formData.shiyouBiendDate;
    htmlTemplate.shiireSakiSonota = formData.shiireSakiSonota;
    htmlTemplate.shiyouBashoSonota = formData.shiyouBashoSonota;
    htmlTemplate.koujiBangouSonota = formData.koujiBangouSonota;
    htmlTemplate.ringiNoSonota = formData.ringiNoSonota;
    htmlTemplate.naiyouKattaMono = formData.naiyouKattaMono;
    htmlTemplate.kingakuSonota = formData.kingakuSonota;
  
    if(formData.tenpuFileSonota1 != ''){
      htmlTemplate.tenpuFileSonota1 = formData.tenpuFileSonota1;
    }else{
      htmlTemplate.tenpuFileSonota1 = formData.oldTenpuFile1;
    }
  
    if(formData.tenpuFileSonota2 != ''){
      htmlTemplate.tenpuFileSonota2 = formData.tenpuFileSonota2;
    }else{
      htmlTemplate.tenpuFileSonota2 = formData.oldTenpuFile2;
    }
  
    if(formData.tenpuFileSonota3 != ''){
      htmlTemplate.tenpuFileSonota3 = formData.tenpuFileSonota3;
    }else{
      htmlTemplate.tenpuFileSonota3 = formData.oldTenpuFile3;
    }
    
    var uniqueId = formData.formId;
    htmlTemplate.feedbackUrl = `https://script.google.com/a/macros/uretek.co.jp/s/AKfycbwWpEPQFrF7j0EcxY12EiW3k5TtqN52GXYvDhZYmTMb/dev?formId=${uniqueId}`;
  
    const htmlFormEmail = htmlTemplate.evaluate().getContent();
    GmailApp.sendEmail("santosh.l@uretek.co.jp", "購入その他レンタルフォームから", "", {
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