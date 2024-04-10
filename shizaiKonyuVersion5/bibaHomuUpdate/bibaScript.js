<script>
    const wholeFormWrap = document.getElementById("whole-contact-wrap");
    const contactForm = document.getElementById("contact-form");
    const successMessage = document.getElementById("success-message");
    const backToForm = document.getElementById("back-to-form");
    const progress = document.getElementById("progress");
  
    const removeFileLink = document.getElementById("removeFileLink");
    let fileLink = document.getElementById("holdPreviousFileLink");
  
    contactForm.addEventListener("submit", submitBibaHomuData);
    removeFileLink.addEventListener("click", function() {
      fileLink.href = '';
      fileLink.classList.add('showHideTag');
      removeFileLink.classList.remove('alert');
      removeFileLink.classList.add('success');
      removeFileLink.innerText = '送信したら削除されます。';
    });
  function submitBibaHomuData(e) {
    e.preventDefault();
  }
  function addBibaHomuRecord() {
    const fileInput = document.getElementById("bibaHomutenpuFile");
    console.log('fileInput' + fileInput);
    const file = fileInput.files[0];
  
    if(fileInput.files && fileInput.files.length > 0){
      showOverlay();
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileData = event.target.result.split(",");
        const obj = {
          fileName: file.name,
          mimeType: file.type,
          data: fileData[1],
        };
  
        console.log("File object:", obj);
  
        // Upload the file to Google Apps Script and retrieve its URL
        google.script.run
          .withSuccessHandler((url) => {
            hideOverlay();
            console.log("File URL:", url);
            // Once the file URL is retrieved, hide the form and show progress
            wholeFormWrap.classList.add("d-none");
            progress.classList.remove("d-none");
            // Construct the form data including the file URL
            const formData = constructFormData(url);
  
            console.log("Form data:", formData);
  
            // Pass formData to Google Apps Script function
            submitFormData(formData);
          })
          .withFailureHandler(() => {
            // Handle failure during file upload
            console.error("Error occurred while uploading file.");
            alert("Error occurred while uploading file.");
            progress.classList.add("d-none");
          })
          .uploadBibaHomuFile(obj); // Call the uploadBibaHomuFile function to upload the file
      };
  
      reader.readAsDataURL(file); // Read file as data URL
    }else{
      wholeFormWrap.classList.add("d-none");
      progress.classList.remove("d-none");
      // If no file is uploaded, directly submit the form data without the file URL
      const formData = constructFormData('null');
      submitFormData(formData);
    }
  }
  
  function constructFormData(fileUrl) {
    let fileLink = document.getElementById("holdPreviousFileLink");
    let oldTenpuFile1;
  
    if(fileLink.classList.contains('showHideTag')){
      oldTenpuFile = '';
    }else{
      oldTenpuFile = document.getElementById("holdPreviousFileLink").href;
    }
  
    console.log('inside construct form');
    const formData = {
      formId: document.getElementById("formId").value,
      seiban: document.getElementById('showSaiban').innerHTML,
      konyuHidzuke: document.getElementById("konyuHidzuke").value,
      kingaku: document.getElementById("kingaku").value,
      denpyouBango: document.getElementById("denpyouBangoFill").value,
      shiyouTenpo: document.getElementById("shiyouTenpo").value,
      shiyouBasho: document.getElementById("shiyouBasho").value,
      koujiBangou: document.getElementById("koujiBangou").value,
      holdPreviousFileLink: oldTenpuFile,
    }
    if(fileUrl != 'null'){
      console.log('inside not null fileurl' + fileUrl.url);
      formData.bibaHomutenpuFile = fileUrl.url;
    }else{
      formData.bibaHomutenpuFile = '';
    }
  
    return formData;
  }
  
  function submitFormData(formData) {
    // Pass formData to Google Apps Script function
    google.script.run
      .withSuccessHandler((response) => {
        if(response){
          //if there's an error message returning though it was sucess, from the server-side function
          errorMessage.classList.remove("d-none");
          alert(response);
        }else{
          contactForm.reset();
          successMessage.classList.remove("d-none");
        }
        progress.classList.add("d-none");
      })
      .withFailureHandler(() => {
        // Handle failure
        alert("フォームの送信中にエラーが発生しました");
        progress.classList.add("d-none");
      })
      .acceptBibaHomuData(formData);
  }
  
    // backToForm.addEventListener("click", () => {
    //   wholeFormWrap.classList.remove("d-none");
    //   successMessage.classList.add("d-none");
    // });
  </script>
  