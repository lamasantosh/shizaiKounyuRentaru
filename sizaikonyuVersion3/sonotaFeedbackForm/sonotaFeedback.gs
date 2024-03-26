function doGet(e) {
  const htmlService = HtmlService.createTemplateFromFile('index');
  // Extract the formId parameter from the URL
  const formId = e.parameter.formId;
  Logger.log('formId' + formId);
  //pass the form data to the template
  htmlService.formData = formId;
  const html = htmlService.evaluate().addMetaTag("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
  return html;
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function updateFeedbackSonota(feedback){
  Logger.log('feedback id' + feedback.feedbackId);
  Logger.log('feedback comment' + feedback.comment);
  Logger.log('feedback result ' + feedback.handanResult);
    //first Spreadsheet which will hold all bibahomu record including new response from id, name, url
  let spreadsheetSonota = SpreadsheetApp.openById('1kfXF33ed_0NfdAQbDz8buJdN2hkov1FTu-nbM7WuU5g');
  SpreadsheetApp.flush();
  let sonotaSheet1 = spreadsheetSonota.getSheetByName('その他レコードシート１');
  let sonotaSheet1LastRow = sonotaSheet1.getLastRow() + 1;
  Logger.log('sonotaSheet1LastRow' + sonotaSheet1LastRow);


  //get all the list of the Ids of each elements
  holdIdsList = sonotaSheet1.getRange('N1:N' + sonotaSheet1LastRow).getValues();
  var rowToUpdate;
  for(let i=holdIdsList.length-1; i>0; i--){
    if(holdIdsList[i][0] === feedback.feedbackId){
      //if id is found
      rowToUpdate = i+1;
      break;
    }
  } 

  //second spreadsheet which will only hold the required data 
  let spreadsheetSonotaFinal = SpreadsheetApp.openById('1-nBPPN7Om-L0LhJ4i7gcR0KF4vESgp7XAuCRotg80DQ');
  SpreadsheetApp.flush();
  let sonotaSheet1Final = spreadsheetSonotaFinal.getSheetByName('その他レコードシート１');
  let sonotaSheet1FinalLastRow = sonotaSheet1Final.getLastRow() + 1;
  Logger.log('sonotaSheet1FinalLastRow' + sonotaSheet1FinalLastRow);

  let checkFinalSeiban = sonotaSheet1.getRange('A'+rowToUpdate).getValue();
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
 
  //check whether it is can be updated or not
  let checkUpdatedOrNot = sonotaSheet1.getRange('O'+rowToUpdate).getValue();

  Logger.log('checkUpdatedOrNot' + checkUpdatedOrNot);
  if(checkUpdatedOrNot == '承認待ち' || checkUpdatedOrNot == '却下します'){
    let syoninMessage = '';
    let createUpdateUrl = '';
    if(feedback.handanResult == '承認します'){
      sonotaSheet1.getRange('O' + rowToUpdate).setValue('承認します');
      syoninMessage = '購入レンタルは承認します。';
      //now, finally update the final record with
       sonotaSheet1Final.getRange('N' + rowToUpdateFinal).setValue('承認します');
    }else{
      syoninMessage = '購入レンタルは却下します。';
      sonotaSheet1.getRange('O' + rowToUpdate).setValue('却下します');
      // sonotaSheet1.getRange('P' + rowToUpdate).setValue(feedback.comment);
      //now, finally update the final record with
      sonotaSheet1Final.getRange('N' + rowToUpdateFinal).setValue('却下します');
      let addId = feedback.feedbackId;
      createUpdateUrl = `http//somethingsomethign?formId=${addId}`;
    }

    const htmlTemplate = HtmlService.createTemplateFromFile("sonotaMailFeedback");
    htmlTemplate.handanResult = feedback.handanResult;
    htmlTemplate.comment = feedback.comment;
    htmlTemplate.saiban = sonotaSheet1.getRange('A' + rowToUpdate).getValue();
    htmlTemplate.konyuHidzukeSonota = sonotaSheet1.getRange('B' + rowToUpdate).getValue();
    htmlTemplate.shiyouBistartDate = sonotaSheet1.getRange('C' + rowToUpdate).getValue();
    htmlTemplate.shiyouBiendDate = sonotaSheet1.getRange('D' + rowToUpdate).getValue();
    htmlTemplate.shiireSakiSonota = sonotaSheet1.getRange('E' + rowToUpdate).getValue();
    htmlTemplate.shiyouBashoSonota = sonotaSheet1.getRange('F' + rowToUpdate).getValue();
    htmlTemplate.koujiBangouSonota = sonotaSheet1.getRange('G' + rowToUpdate).getValue();
    htmlTemplate.ringiNoSonota = sonotaSheet1.getRange('H' + rowToUpdate).getValue();
    htmlTemplate.naiyouKattaMono = sonotaSheet1.getRange('I' + rowToUpdate).getValue();
    htmlTemplate.naiyouNaniTsukau = sonotaSheet1.getRange('J' + rowToUpdate).getValue();
    htmlTemplate.kingakuSonota = sonotaSheet1.getRange('K' + rowToUpdate).getValue();
    var toResponse = sonotaSheet1.getRange('L' + rowToUpdate).getValue();
    htmlTemplate.respondentEmail = toResponse;
    htmlTemplate.tempuFileSonota = sonotaSheet1.getRange('M' + rowToUpdate).getValue();
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
  }else{
    return 'このIDは更新出来ないです。';
  }
 return null;
}