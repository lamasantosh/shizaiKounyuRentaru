function doGet() {
    const htmlService = HtmlService.createTemplateFromFile('index');
    htmlService.denpyoBangoList = getDenpyoBangoList();
    var denpyoList = getDenpyoBangoList();
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
    // denpyouBangoArray.forEach(obj => Logger.log('object' + obj));
  
    if(denpyouBangoArray.indexOf(searchDenpyouBango) != -1){
      bibaHomuSheet1LastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
      bibaHomufinalSheetLastRow = denpyouBangoArray.indexOf(searchDenpyouBango);
      if(bibaHomuSheet1.getRange('I' + (bibaHomuSheet1LastRow + 1)).getValue() == ''){
        bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('AVAIL');  
      }else{
        bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('FULL');  
      }
    }else{
      bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).setValue('AVAIL');  
    }
  
    //accessing the other sheet
    // const ssLinkedSheet = spreadsheetBibaHomu.getSheetByName("ssLinked");
    // createNewToHoldSpreadsheet(ssLinkedSheet);
  
    bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).setNumberFormat('@STRING@');
    bibaHomufinalSheet.getRange('A' + (bibaHomufinalSheetLastRow + 1)).setNumberFormat('@STRING@');
    var formattedSaiban = formatNumberWithLeadingZeros(bibaHomuSheet1LastRow, 5).toString();
    
    //Get the User's email address
    // const respondentEmail = Session.getActiveUser().getEmail();
    // for(var key in formData){
    //   Logger.log(key + ': ' + formData[key]);
    // }
    bibaHomuSheet1.getRange('A' + (bibaHomuSheet1LastRow + 1)).setValue(formattedSaiban);
    bibaHomuSheet1.getRange('B' + (bibaHomuSheet1LastRow + 1)).setValue(formData.konyuHidzuke);
    bibaHomuSheet1.getRange('C' + (bibaHomuSheet1LastRow + 1)).setValue(formData.kingaku);
    if(formData.denpyouBangoSelect == '伝票番号無し'){
      bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoFill);   
    }else{
      bibaHomuSheet1.getRange('E' + (bibaHomuSheet1LastRow + 1)).setValue(formData.denpyouBangoSelect);
    }
    bibaHomuSheet1.getRange('F' + (bibaHomuSheet1LastRow + 1)).setValue(formData.shiyouTenpo);
    bibaHomuSheet1.getRange('K' + (bibaHomuSheet1LastRow + 1)).setValue('承認待ち');
    
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
    bibaHomufinalSheet.getRange('J' + (bibaHomufinalSheetLastRow + 1)).setValue('承認待ち');
  
    //var ccRecipient = "abc@uretek.co.jp";
    if(bibaHomuSheet1.getRange('D' + (bibaHomuSheet1LastRow + 1)).getValue() != 'AVAIL'){
      let shiyouTenpoValue = bibaHomuSheet1.getRange('F' + (bibaHomuSheet1LastRow + 1)).getValue();
      let shiyouBasho = bibaHomuSheet1.getRange('G' + (bibaHomuSheet1LastRow + 1)).getValue();
      let koujiBangou = bibaHomuSheet1.getRange('H' + (bibaHomuSheet1LastRow + 1)).getValue();
      let respondentEmail = bibaHomuSheet1.getRange('I' + (bibaHomuSheet1LastRow + 1)).getValue();
      let bibaFileUrl = bibaHomuSheet1.getRange('J' + (bibaHomuSheet1LastRow + 1)).getValue();
      let uniqueId = bibaHomuSheet1.getRange('L' +(bibaHomuSheet1LastRow + 1)).getValue();
  
      const htmlTemplate = HtmlService.createTemplateFromFile("mailToHomBuchyo");
      //send to create Html template to send through gmail
      htmlTemplate.saiban = formattedSaiban;
      htmlTemplate.konyuHidzuke = formData.konyuHidzuke;
      htmlTemplate.kingaku = formData.kingaku;
      
      if(formData.denpyouBangoSelect == '伝票番号無し'){
        htmlTemplate.denpyouBango = formData.denpyouBangoFill;
      }else{
        htmlTemplate.denpyouBango = formData.denpyouBangoSelect;
      }
      
      htmlTemplate.shiyouTenpo = shiyouTenpoValue;
      htmlTemplate.shiyouBasho = shiyouBasho;
      htmlTemplate.koujiBangou = koujiBangou;
      htmlTemplate.respondentEmail = respondentEmail;
  
      htmlTemplate.bibaFileUrl = bibaFileUrl;
      htmlTemplate.formUrl = `https://script.google.com/macros/s/AKfycbxbArdUGBJou42d8ZS8UG6t4jmk7xx07a5GcTpb9Pgy/dev?formId=${uniqueId}`;
  
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
  
  