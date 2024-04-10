<script>
  $(document).ready(function(){
    let receiveSyonin = document.getElementById('syonin');
    let receiveKyakka = document.getElementById('kyakka');
    let comment = document.getElementById('comment');
    let commentWrap = document.getElementById('comment-wrap');
    receiveSyonin.addEventListener('change', function(){
      showComment('syonin');
    });
    receiveKyakka.addEventListener('change', function(){
      showComment('kyakka');
    });
    function showComment(result){
      if(result == 'syonin'){
        console.log('inside clicked');
        comment.dataset.validate="not=''";
        comment.value = '';
        commentWrap.classList.add('d-none');
      }else{
        comment.value = '';
        commentWrap.classList.remove("d-none");
        comment.dataset.validate = "required";
      }
    }
  });
  const wholeFormWrap = document.getElementById("whole-contact-wrap");
  const contactForm = document.getElementById("contact-form");
  const successMessage = document.getElementById("success-message");
  const backToForm = document.getElementById("back-to-form");
  const errorMessage = document.getElementById("error-message");

  contactForm.addEventListener("submit", submitSyounin);
  function submitSyounin(e){
    e.preventDefault();
    console.log('you clicked inside');
  }

  function addFeedbackBibaHomu(){
    const progress = document.getElementById("progress");
    console.log('you clicked inside addFeedbackSonota');
    let receiveSyonin = document.getElementById('syonin');
    let receiveKyakka = document.getElementById('kyakka');
    let comment = document.getElementById('comment');
    const idToFeedback = document.getElementById("formId").value;
    if(idToFeedback){
      console.log('exist');
    }else{
      console.log('does not exist');
    }
    console.log('idToFeedback' + idToFeedback);
    let handanResult;
    if (receiveSyonin.checked) {
        handanResult = "承認します"; // Set the value based on the checked radio button
    } else if (receiveKyakka.checked) {
        handanResult = "却下します"; // Set the value based on the checked radio button
        if(comment.value == ''){
          console.log('kekka show error')
          errorComment.classList.remove("d-none");
          return;
        }
    } else {
       // No radio button is checked, handle this case accordingly
    }
    wholeFormWrap.classList.add("d-none");
    progress.classList.remove("d-none");
    const feedback = {
                        feedbackId: idToFeedback,
                        handanResult: handanResult,
                        comment: comment.value
                      };
    google.script.run
      .withSuccessHandler((response) => {
        if(response){
          //if there's an error message returned from the server-side function
          errorMessage.classList.remove("d-none");
          alert(response);
        }else{
          contactForm.reset();
          successMessage.classList.remove("d-none");
        }
        progress.classList.add("d-none");
      })
      .withFailureHandler(() =>{
        //handler if any failure
        alert("フォームの送信中にエラーが発生しました");
        progress.classList.add('d-none');
      })
      .updateFeedbackBibaHomu(feedback);
  }

</script>
