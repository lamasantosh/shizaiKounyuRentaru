function generateUniqueID2() {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 1000); // Change 1000 to adjust the range of the random part
    return `${timestamp}_${randomPart}`;
  }
  
  function uploadSonotaFile(file){
    const myFile = Utilities.newBlob(Utilities.base64Decode(file.data), file.mimeType, file.fileName);
    const id = '1Hgi6rj9OR4eO_12adN1Q2liOtDNvQGb4';
    const folder = DriveApp.getFolderById(id);
    const fileAdded = folder.createFile(myFile)
    const fileUrl = fileAdded.getUrl();
    const fileName = file.fileName;
    return {url: fileUrl, name: fileName};
  }
  
  function acceptSonotaData(formData){
    // for(var key in formData){
    //   Logger.log(key + ': ' + formData[key]);
    // }
    //first Spreadsheet which will hold all bibahomu record including new response from id, name, url
    let spreadsheetSonota = SpreadsheetApp.openById('1kfXF33ed_0NfdAQbDz8buJdN2hkov1FTu-nbM7WuU5g');
    SpreadsheetApp.flush();
    let sonotaSheet1 = spreadsheetSonota.getSheetByName('その他レコードシート１');
    let sonotaSheet1LastRow = sonotaSheet1.getLastRow() + 1;
  
    //second spreadsheet which will only hold the required data 
    let spreadsheetSonotaFinal = SpreadsheetApp.openById('1-nBPPN7Om-L0LhJ4i7gcR0KF4vESgp7XAuCRotg80DQ');
    SpreadsheetApp.flush();
    let sonotaSheet1Final = spreadsheetSonotaFinal.getSheetByName('その他レコードシート１');
    let sonotaSheet1FinalLastRow = sonotaSheet1Final.getLastRow() + 1;
  
    //to get last row
    sonotaSheet1.getRange('A' + (sonotaSheet1LastRow)).setNumberFormat('@STRING@');
    sonotaSheet1Final.getRange('A' + (sonotaSheet1FinalLastRow)).setNumberFormat('@STRING@');
    var formattedSaiban = formatNumberWithLeadingZeros(sonotaSheet1LastRow, 5).toString();
  
    //Get the User's email address
     const respondentEmail = Session.getActiveUser().getEmail();
    // Logger.log('respondentEmail' + respondentEmail);
    const uniqueId = generateUniqueID2();
    sonotaSheet1.getRange('A' + sonotaSheet1LastRow).setValue(formattedSaiban);
    sonotaSheet1.getRange('B' + sonotaSheet1LastRow).setValue(formData.konyuHidzukeSonota);
    sonotaSheet1.getRange('C' + sonotaSheet1LastRow).setValue(formData.shiyouBistartDate);
    sonotaSheet1.getRange('D' + sonotaSheet1LastRow).setValue(formData.shiyouBiendDate);
    sonotaSheet1.getRange('E' + sonotaSheet1LastRow).setValue(formData.shiireSakiSonota);
    sonotaSheet1.getRange('F' + sonotaSheet1LastRow).setValue(formData.shiyouBashoSonota);
    sonotaSheet1.getRange('G' + sonotaSheet1LastRow).setValue(formData.koujiBangouSonota);
    sonotaSheet1.getRange('H' + sonotaSheet1LastRow).setValue(formData.ringiNoSonota);
    sonotaSheet1.getRange('I' + sonotaSheet1LastRow).setValue(formData.naiyouKattaMono);
    sonotaSheet1.getRange('J' + sonotaSheet1LastRow).setValue(formData.kingakuSonota);
    sonotaSheet1.getRange('K' + sonotaSheet1LastRow).setValue(respondentEmail);
    //show here the tempuFileSonota1, tempuFileSonota2, tempuFileSonota3
    sonotaSheet1.getRange('L' + sonotaSheet1LastRow).setValue(formData.tenpuFileSonota1);
    sonotaSheet1.getRange('M' + sonotaSheet1LastRow).setValue(formData.tenpuFileSonota2);
    sonotaSheet1.getRange('N' + sonotaSheet1LastRow).setValue(formData.tenpuFileSonota3);
    sonotaSheet1.getRange('O' + sonotaSheet1LastRow).setValue('承認待ち');
    sonotaSheet1.getRange('P' + sonotaSheet1LastRow).setValue(uniqueId);
  
    //その他finalの情報
    sonotaSheet1Final.getRange('A' + sonotaSheet1FinalLastRow).setValue(formattedSaiban);
    sonotaSheet1Final.getRange('B' + sonotaSheet1FinalLastRow).setValue(formData.konyuHidzukeSonota);
    sonotaSheet1Final.getRange('C' + sonotaSheet1FinalLastRow).setValue(formData.shiyouBistartDate);
    sonotaSheet1Final.getRange('D' + sonotaSheet1FinalLastRow).setValue(formData.shiyouBiendDate);
    sonotaSheet1Final.getRange('E' + sonotaSheet1FinalLastRow).setValue(formData.shiireSakiSonota);
    sonotaSheet1Final.getRange('F' + sonotaSheet1FinalLastRow).setValue(formData.shiyouBashoSonota);
    sonotaSheet1Final.getRange('G' + sonotaSheet1FinalLastRow).setValue(formData.koujiBangouSonota);
    sonotaSheet1Final.getRange('H' + sonotaSheet1FinalLastRow).setValue(formData.ringiNoSonota);
    sonotaSheet1Final.getRange('I' + sonotaSheet1FinalLastRow).setValue(formData.naiyouKattaMono);
    sonotaSheet1Final.getRange('J' + sonotaSheet1FinalLastRow).setValue(formData.kingakuSonota);
    sonotaSheet1Final.getRange('K' + sonotaSheet1FinalLastRow).setValue(respondentEmail);
    sonotaSheet1Final.getRange('L' + sonotaSheet1FinalLastRow).setValue(formData.tenpuFileSonota1);
    sonotaSheet1Final.getRange('M' + sonotaSheet1FinalLastRow).setValue(formData.tenpuFileSonota2);
    sonotaSheet1Final.getRange('N' + sonotaSheet1FinalLastRow).setValue(formData.tenpuFileSonota3);
    sonotaSheet1Final.getRange('O' + sonotaSheet1FinalLastRow).setValue('承認待ち');
  
    const htmlTemplate = HtmlService.createTemplateFromFile("mailToHomBuchyo2");
    htmlTemplate.saiban = formattedSaiban;
    htmlTemplate.konyuHidzukeSonota = formData.konyuHidzukeSonota;
    htmlTemplate.shiyouBistartDate = formData.shiyouBistartDate;
    htmlTemplate.shiyouBiendDate = formData.shiyouBiendDate;
    htmlTemplate.shiireSakiSonota = formData.shiireSakiSonota;
    htmlTemplate.shiyouBashoSonota = formData.shiyouBashoSonota;
    htmlTemplate.koujiBangouSonota = formData.koujiBangouSonota;
    htmlTemplate.ringiNoSonota = formData.ringiNoSonota;
    htmlTemplate.naiyouKattaMono = formData.naiyouKattaMono;
    htmlTemplate.kingakuSonota = formData.kingakuSonota;
    htmlTemplate.tenpuFileSonota1 = formData.tenpuFileSonota1;
    htmlTemplate.tenpuFileSonota2 = formData.tenpuFileSonota2;
    htmlTemplate.tenpuFileSonota3 = formData.tenpuFileSonota3;
    htmlTemplate.feedbackUrl = `https://script.google.com/macros/s/AKfycbwWpEPQFrF7j0EcxY12EiW3k5TtqN52GXYvDhZYmTMb/dev?formId=${uniqueId}`;
  
    const htmlFormEmail = htmlTemplate.evaluate().getContent();
    GmailApp.sendEmail("santosh.l@uretek.co.jp", "購入その他レンタルフォームから", "", {
      //'cc': ccRecipient,
      htmlBody: htmlFormEmail,
      replyTo: respondentEmail
    });
  
  }
  
  function formatNumberWithLeadingZeros(number, desiredLength) {
      // Default desired length to 5 if not provided
      desiredLength = desiredLength || 5;
  
      // Convert to string only if the number is defined
      let formattedNumber = (number !== undefined) ? number.toString() : '';
  
      // Format the number with leading zeros
      return formattedNumber.padStart(desiredLength, '0');
  }
  