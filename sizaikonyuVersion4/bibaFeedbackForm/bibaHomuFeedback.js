function doGet(e) {
    const htmlService = HtmlService.createTemplateFromFile('index');
    // Extract the formId parameter from the URL
    const formId = e.parameter.formId;
    Logger.log('formId' + formId);
    const checkValidIdOrnot = checkValidId(formId);
    if(checkValidIdOrnot == 'notOk'){
       htmlService.formData = '更新出来ない';
    }else{
      htmlService.formData = formId;
    }
    const html = htmlService.evaluate().addMetaTag("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    return html;
  }
  
  function include(filename){
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }
  function checkValidId(formId){
    var spreadsheetBibaHomu = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
    SpreadsheetApp.flush();
    var bibaHomuSheet1 = spreadsheetBibaHomu.getSheetByName("ビバホームレコードシート1");
    var bibaHomuSheet1LastRow = bibaHomuSheet1.getLastRow() + 1;
    Logger.log('bibaHomuSheet1LastRow' + bibaHomuSheet1LastRow);
  
    //get all the list of the Ids of each elements
    holdIdsList = bibaHomuSheet1.getRange('L1:L' + bibaHomuSheet1LastRow).getValues();
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
    let checkUpdatedOrNot = bibaHomuSheet1.getRange('K'+rowToUpdate).getValue();
  
    Logger.log('checkUpdatedOrNot' + checkUpdatedOrNot);
    if(checkUpdatedOrNot == '承認します'){
      return 'notOk';
    }else{
      return 'Ok';
    }
  }
  
  function updateFeedbackBibaHomu(feedback){
    Logger.log('feedback id' + feedback.feedbackId);
    Logger.log('feedback comment' + feedback.comment);
    Logger.log('feedback result' + feedback.handanResult);
      //first Spreadsheet which will hold all bibahomu record including new respnse form id,name,url
    var spreadsheetBibaHomu = SpreadsheetApp.openById('1eTquTEPg7nmC2DzG3Dxx3YZJtwFyKFtRHvhFEGIyc2s');
    SpreadsheetApp.flush();
    var bibaHomuSheet1 = spreadsheetBibaHomu.getSheetByName("ビバホームレコードシート1");
    var bibaHomuSheet1LastRow = bibaHomuSheet1.getLastRow();
    
    //second spreadsheet which will only hold the required data
    var spreadsheetBibaHomuFinal = SpreadsheetApp.openById('161ZNhcmsaHP9L_zbA8DLPwtMivrhA2g3I91_tAXc-tc');
    SpreadsheetApp.flush();
    var bibaHomuFinalSheet = spreadsheetBibaHomuFinal.getSheetByName("ビバホームシート");
    var bibaHomuFinalSheetLastRow = bibaHomuFinalSheet.getLastRow();
  
    //get all the list of the Ids of each elements 
    holdIdsList = bibaHomuSheet1.getRange('L1:L' + bibaHomuSheet1LastRow).getValues();
    var rowToUpdate;
    for(let i=holdIdsList.length - 1; i>0; i--){
      if(holdIdsList[i][0] == feedback.feedbackId){
        //if id is found
        rowToUpdate = i+1;
        break;
      }
    }
  
    let checkFinalSeiban = bibaHomuSheet1.getRange('A'+rowToUpdate).getValue();
    Logger.log('checkFinalSeiban' + checkFinalSeiban);
    //get all the list of the Ids of each elements
    finalSheetSaibanList = bibaHomuFinalSheet.getRange('A1:A' + bibaHomuFinalSheetLastRow).getValues();
    Logger.log('finalSheetSaibanList' + finalSheetSaibanList);
    Logger.log('finalSheetSaibanList.length' + finalSheetSaibanList.length);
    var rowToUpdateFinal;
    for(let i=finalSheetSaibanList.length-1; i>0; i--){
     if(finalSheetSaibanList[i][0] === checkFinalSeiban){
      rowToUpdateFinal = i+1;
      break;
     }
    }
  
    let syoninMessage = '';
    let createUpdateUrl = '';
    if(feedback.handanResult == '承認します'){
      bibaHomuSheet1.getRange('K' + rowToUpdate).setValue('承認します');
      syoninMessage = '購入レンタルビバホームは承認します。';
      //now, finally update the final record with
      bibaHomuFinalSheet.getRange('J' + rowToUpdateFinal).setValue('承認します');
    }else{
      syoninMessage = '購入レンタルビバホームは却下します。';
      bibaHomuSheet1.getRange('K' + rowToUpdate).setValue('却下します');
      // bibaHomuSheet1.getRange('P' + rowToUpdate).setValue(feedback.comment);
      //now, finally update the final record with
      bibaHomuFinalSheet.getRange('J' + rowToUpdateFinal).setValue('却下します');
      let addId = feedback.feedbackId;
      createUpdateUrl = `https://script.google.com/macros/s/AKfycbzmyVMnEg9rXWZU8CSZFwUEAeKZcsdpk0iUHYNfoQc/dev?formId=${addId}`;
    }
  
    const htmlTemplate = HtmlService.createTemplateFromFile("bibaHomuMailFeedback");
    htmlTemplate.handanResult = feedback.handanResult;
    htmlTemplate.comment = feedback.comment;
    htmlTemplate.saiban = bibaHomuSheet1.getRange('A' + rowToUpdate).getValue();
    htmlTemplate.konyuHidzuke = bibaHomuSheet1.getRange('B' + rowToUpdate).getValue();
    htmlTemplate.kingaku = bibaHomuSheet1.getRange('C' + rowToUpdate).getValue();
    htmlTemplate.denpyouBango = bibaHomuSheet1.getRange('E' + rowToUpdate).getValue();
    htmlTemplate.shiyouTenpo = bibaHomuSheet1.getRange('F' + rowToUpdate).getValue();
    htmlTemplate.shiyouBasho = bibaHomuSheet1.getRange('G' + rowToUpdate).getValue();
    htmlTemplate.koujiBangou = bibaHomuSheet1.getRange('H' + rowToUpdate).getValue();
    var toResponse = bibaHomuSheet1.getRange('I' + rowToUpdate).getValue();
    htmlTemplate.respondentEmail = toResponse;
    htmlTemplate.bibaFileUrl = bibaHomuSheet1.getRange('J' + rowToUpdate).getValue();
    htmlTemplate.updateUrl = createUpdateUrl;
  
    const htmlFormEmail = htmlTemplate.evaluate().getContent();
    //var ccRecipient = "abc@uretek.co.jp";
    //Get the User's email address
    const syninSuruHito = Session.getActiveUser().getEmail();
  
    GmailApp.sendEmail(toResponse, syoninMessage, "", {
      //'cc': ccRecipient,
      htmlBody: htmlFormEmail,
      replyTo: syninSuruHito
    });
   return null;
  }
  
  