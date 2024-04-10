<script>
    const wholeFormWrap = document.getElementById("whole-contact-wrap");
    const contactForm = document.getElementById("contact-form-sonota");
    const successMessage = document.getElementById("success-message");
    const progress = document.getElementById("progress");
  
    const removeFileLink1 = document.getElementById("removeFileLink1");
    const removeFileLink2 = document.getElementById("removeFileLink2");
    const removeFileLink3 = document.getElementById("removeFileLink3");
  
    let fileLink1 = document.getElementById("holdPreviousFileLink1");
    let fileLink2 = document.getElementById("holdPreviousFileLink2");
    let fileLink3 = document.getElementById("holdPreviousFileLink3");
  
    removeFileLink1.addEventListener("click", function() {
      fileLink1.href = '';
      fileLink1.classList.add('showHideTag');
      removeFileLink1.classList.remove('alert');
      removeFileLink1.classList.add('success');
      removeFileLink1.innerText = '送信したら削除されます。';
    });
    removeFileLink2.addEventListener("click", function() {
      fileLink2.href = '';
      fileLink2.classList.add('showHideTag');
      removeFileLink2.classList.remove('alert');
      removeFileLink2.classList.add('success');
      removeFileLink2.innerText = '送信したら削除されます。';
    });
    removeFileLink3.addEventListener("click", function() {
      fileLink3.href = '';
      fileLink3.classList.add('showHideTag');
      removeFileLink3.classList.remove('alert');
      removeFileLink3.classList.add('success');
      removeFileLink3.innerText = '送信したら削除されます。';
    });
  
    contactForm.addEventListener("submit", submitSonotaPrevent);
  
    function submitSonotaPrevent(e){
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
          submitSonotaData(formData);
        })
        .catch(error => {
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
    let fileLink1 = document.getElementById("holdPreviousFileLink1");
    let fileLink2 = document.getElementById("holdPreviousFileLink2");
    let fileLink3 = document.getElementById("holdPreviousFileLink3");
      let oldTenpuFile1;
      let oldTenpuFile2;
      let oldTenpuFile3;
      if(fileLink1.classList.contains('showHideTag')){
        oldTenpuFile1 = '';
      }else{
        oldTenpuFile1 = document.getElementById("holdPreviousFileLink1").href;
      }
      if(fileLink2.classList.contains('showHideTag')){
        oldTenpuFile2 = '';
      }else{
        oldTenpuFile2 = document.getElementById("holdPreviousFileLink2").href;
      }
      if(fileLink3.classList.contains('showHideTag')){
        oldTenpuFile3 = '';
      }else{
        oldTenpuFile3 = document.getElementById("holdPreviousFileLink3").href;
      }
      const formData = {
        formId: document.getElementById("formId").value,
        konyuHidzukeSonota: document.getElementById("konyuHidzukeSonota").value,
        shiyouBistartDate: document.getElementById("shiyouBistartDate").value,
        shiyouBiendDate: document.getElementById("shiyouBiendDate").value,
        shiireSakiSonota: document.getElementById("shiireSakiSonota").value,
        shiyouBashoSonota: document.getElementById("shiyouBashoSonota").value,
        koujiBangouSonota: document.getElementById("koujiBangouSonota").value,
        ringiNoSonota: document.getElementById("ringiNoSonota").value,
        naiyouKattaMono: document.getElementById("naiyouKattaMono").value,
        kingakuSonota: document.getElementById("kingakuSonota").value,
        oldTenpuFile1: oldTenpuFile1,
        oldTenpuFile2: oldTenpuFile2,
        oldTenpuFile3: oldTenpuFile3
      };
      if(fileUrl != 'null'){
        for (let i = 0; i < 3; i++) {
          if(fileUrl[i] != null){
            formData[`tenpuFileSonota${i+1}`] = fileUrl[i].url;
          }else{
            formData[`tenpuFileSonota${i+1}`] = '';
          }
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
      .acceptSonotaData(formData);
  }
  
  </script>
  