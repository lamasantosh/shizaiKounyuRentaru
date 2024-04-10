<script>
  const wholeFormWrap = document.getElementById("whole-contact-wrap");
  const contactForm = document.getElementById("contact-form");
  const successMessage = document.getElementById("success-message");
  const backToForm = document.getElementById("back-to-form");
  const progress = document.getElementById("progress");

  contactForm.addEventListener("submit", submitBibaHomuData);

function submitBibaHomuData(e) {
  e.preventDefault();
}
function addBibaHomuRecord() {
  const fileInput = document.getElementById("bibaHomutenpuFile");
  const file = fileInput.files[0];
  if (file) {
    showOverlay();
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileData = event.target.result.split(",");
      const obj = {
        fileName: file.name,
        mimeType: file.type,
        data: fileData[1],
      };

      // Upload the file to Google Apps Script and retrieve its URL
      google.script.run
        .withSuccessHandler((url) => {
          hideOverlay();
          // Once the file URL is retrieved, hide the form and show progress
          wholeFormWrap.classList.add("d-none");
          progress.classList.remove("d-none");
          // Construct the form data including the file URL
          const formData = constructFormData(url);
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
  } else {
    wholeFormWrap.classList.add("d-none");
    progress.classList.remove("d-none");
    // If no file is uploaded, directly submit the form data without the file URL
    const formData = constructFormData('null');
    submitFormData(formData);
  }
}

function constructFormData(fileUrl) {
  return {
    denpyouBangoSelect: document.getElementById("denpyouBangoSelect").value,
    denpyouBangoFill: document.getElementById("denpyouBangoFill").value,
    shiyouBasho: document.getElementById("shiyouBasho").value,
    koujiBangou: document.getElementById("koujiBangou").value,
    bibaHomutenpuFile: fileUrl, // Add the file URL if available
  };
}

function submitFormData(formData) {
  // Pass formData to Google Apps Script function
  google.script.run
    .withSuccessHandler(() => {
      // Reset form and show success message
      contactForm.reset();
      successMessage.classList.remove("d-none");
      progress.classList.add("d-none");
    })
    .withFailureHandler(() => {
      // Handle failure
      console.error("Error occurred while submitting form.");
      alert("Error occurred while submitting form.");
      progress.classList.add("d-none");
    })
    .acceptBibaHomuData(formData);
}

 document.addEventListener("DOMContentLoaded", function () {
    var denpyouBangoSelect = document.getElementById("denpyouBangoSelect");
    var denpyouBangoFill = document.getElementById("denpyouBangoFill");
    var denpyouBangoFillWrap = document.getElementById("denpyouBangoFillWrap");

    // var extraInputSection = document.getElementById('extraInputSection');

    denpyouBangoSelect.addEventListener('change', function () {
        denpyouBangoFill.value = '';
        let selectedValue = denpyouBangoSelect.value;
        // Check if the selected option is '伝票番号無し'
        if (selectedValue === '伝票番号無し') {
            denpyouBangoFillWrap.style.display = 'block';
            denpyouBangoFill.dataset.validate = "required";
        } else {
            denpyouBangoFill.dataset.validate="not=''";
            denpyouBangoFillWrap.style.display = 'none';
        }
        // genbaJusyou.value = "";
        // genbaKaisyaMei.value = "";
    });
  });

</script>
