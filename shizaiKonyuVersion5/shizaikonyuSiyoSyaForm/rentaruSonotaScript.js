<script>
  const contactFormSonota = document.getElementById("contact-form-sonota");

  contactFormSonota.addEventListener("submit", submitRentaruSonotaData);
  
  function submitRentaruSonotaData(e){
    e.preventDefault();
  }

  function addSonotaRecord(){
    //it will hold all the id which is start with name tenpuFileSonota and put it into the fielInputs
    const fileInputs = document.querySelectorAll("[id^='tenpuFileSonota']");
    const files = Array.from(fileInputs).map(input => input.files[0]);
    if(files.some(file => file)){
      showOverlay();
      const promises = files.map(file => {
        return new Promise((resolve,reject) => {
          if(file){
            const reader = new FileReader();
            reader.onload = function(event){
              const fileData = event.target.result.split(",");
              const obj = {
                fileName: file.name,
                mimeType: file.type,
                data: fileData[1],
              };
              google.script.run
              .withSuccessHandler((url) => {
                resolve(url);
              })
              .withFailureHandler(() => {
                reject(new Error("Error occured while uploading file."));
              })
              .uploadSonotaFile(obj);
            };
            reader.readAsDataURL(file);
          }else{
            //Resolve immediately for empty files
            resolve(null);
          }
        });
      });
      Promise.all(promises)
      .then(urls => {
        hideOverlay();
        console.log("File URls: ", urls);

        //Hide the form and show progress
        wholeFormWrap.classList.add("d-none");
        progress.classList.remove("d-none");

        //construct form data and submit
        const formData = constructSonotaData(urls);
        console.log('formData' + formData);
        submitSonotaData(formData);
      })
      .catch(error => {
        console.error(error);
        alert("Error occurred while uploading file.");
        progress.classList.add("d-none");
      });
    }else{
      wholeFormWrap.classList.add("d-none");
      progress.classList.remove("d-none");
      // If no file is uploaded, directly submit the form data without the file URL
      const formData = constructSonotaData('null');
      submitSonotaData(formData);
    }
  }
  function constructSonotaData(fileUrl){
    const formData = {
      konyuHidzukeSonota: document.getElementById("konyuHidzukeSonota").value,
      shiyouBistartDate: document.getElementById("shiyouBistartDate").value,
      shiyouBiendDate: document.getElementById("shiyouBiendDate").value,
      shiireSakiSonota: document.getElementById("shiireSakiSonota").value,
      shiyouBashoSonota: document.getElementById("shiyouBashoSonota").value,
      koujiBangouSonota: document.getElementById("koujiBangouSonota").value,
      ringiNoSonota: document.getElementById("ringiNoSonota").value,
      naiyouKattaMono: document.getElementById("naiyouKattaMono").value,
      kingakuSonota: document.getElementById("kingakuSonota").value,
    };
    if(fileUrl !== 'null'){
      for (let i = 0; i < 3; i++) {
        formData[`tenpuFileSonota${i+1}`] = fileUrl[i] ? fileUrl[i].url : '';
      }
    }else{
      formData.tenpuFileSonota1 = '';
      formData.tenpuFileSonota2 = '';
      formData.tenpuFileSonota3 = '';
    }
    return formData;
  }
  function submitSonotaData(formData) {
    // Pass formData to Google Apps Script function
    google.script.run
      .withSuccessHandler(() => {
        // Reset form and show success message
        contactFormSonota.reset();
        successMessage.classList.remove("d-none");
        progress.classList.add("d-none");
      })
      .withFailureHandler(() => {
        // Handle failure
        console.error("Error occurred while submitting form.");
        alert("Error occurred while submitting form.");
        progress.classList.add("d-none");
      })
      .acceptSonotaData(formData);
  }

</script>