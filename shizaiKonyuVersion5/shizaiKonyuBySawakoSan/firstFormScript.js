<script>
  const wholeFormWrap = document.getElementById("whole-contact-wrap");
  const contactForm = document.getElementById("contact-form");
  const successMessage = document.getElementById("success-message");
  const backToForm = document.getElementById("back-to-form");
  const progress = document.getElementById("progress");

  contactForm.addEventListener("submit", submitBibaHomuData);

  function submitBibaHomuData(e){
    e.preventDefault();
  }
  function addfirstBibaHomuRecord(){
    wholeFormWrap.classList.add("d-none");
    progress.classList.remove("d-none");
    const formData = constructFormData();
    //Pass formData to Google Apps Script 
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
    .acceptFirstFormData(formData);
    
  }
  function constructFormData(){
    return {
      konyuHidzuke: document.getElementById("konyuHidzuke").value,
      kingaku: document.getElementById("kingaku").value,
      denpyouBangoSelect: document.getElementById("denpyouBangoSelect").value,
      denpyouBangoFill: document.getElementById("denpyouBangoFill").value,
      shiyouTenpo: document.getElementById("shiyouTenpo").value,
    }
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
