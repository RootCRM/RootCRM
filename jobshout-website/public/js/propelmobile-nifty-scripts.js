function _checkEMailAddress(pEmailAddressStr)
{
	var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (filter.test(pEmailAddressStr)){
	return true; }
		else {
	return false;
	}
}

function __setPopUpSelectedValue(pIDStr, pValueStr)
{
	var pObject=eval(document.getElementById(pIDStr));
	if(pObject){
		if(pObject.type == "select-one") {
			if(pObject.length > 0){
				for(var i=0; i<pObject.length; i++){ 
					if(pObject.options[i].value==pValueStr) 
					{ 
						pObject.options[i].selected = true;
						return; 
					} 
				} 
			}
		}
	}
}

//Start of On-Ready Function//
$(document).ready(function(){
	$(".emailMeJob").colorbox({inline:true, width:"50%"});
	$("#emailMeJobId").colorbox({inline:true, width:"50%"});
	$(".applyNow").colorbox({inline:true, width:"50%"});
	$(".applyNowId").colorbox({inline:true, width:"50%"});
	$(".tell_a_friend").colorbox({inline:true, width:"50%"});
	$("#requestCallback").colorbox({inline:true, width:"50%"});
	$(".interest_profile").colorbox({inline:true, width:"50%"});
	$(".upload_cv").colorbox({inline:true, width:"50%"});
	$(".profileDetail").colorbox({inline:true, width:"50%"});
	$(".change_password").colorbox({inline:true, width:"50%"});

});
//End of On-Ready Function//

//Start of colorbox validation forms//
$.applyNow = function applyNow(){
	//alert('Validate');	
	var msg = '';
	var name = $('#applyNow_name').val();
	var email = $('#applyNow_email').val();
	var phone = $('#applyNow_phone').val();
	//alert(name.val());
	if(name==''){
		msg='Enter Name!\n';
	}

	if(email==''){
		msg += 'Enter Email!\n';
	}
	else if(_checkEMailAddress(email)==false){
		msg += 'Enter valid Email!\n';
	}

	if(phone==''){
		msg += 'Enter Telephone!\n';
	}

		
	if(msg != ""){
		alert(msg);
	}
	else{
		$('.applyNowForm').submit();

	}
};


$.tell_a_friend = function tell_a_friend(){

	var name = $('#tellA_name').val();
	var email = $('#tellA_email').val();
	var friendName = $('#tellA_friendName').val();
	var friendEmail = $('#tellA_friendEmail').val();
	var msg='';
	
	if(name=='')
	  msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter name!</li>";
	
	if(email=='')
	  msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter email address!</li>";
	else if(_checkEMailAddress(email)==false){
	  msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter valid email address!<li>";
	}
	
	if(friendEmail=='')
	  msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter friend\'s email address!</li>";
	else if(_checkEMailAddress(friendEmail)==false){
	  msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter valid friend\'s email address!<li>";
	}
	
	if(msg!=''){
	   $('#Error').html('');$('#Error').show();
	   $('#Error').html('<ul>'+msg+'</ul>');
	   return false;
	}


	$.post("include/json-tell-a-friend.php?&"+Math.random(), {name:name, email: email, friendname:friendName, friendemail:friendEmail, JobUrl:$('#JobUrl').val()},
	function(data){
		if(data.response=='EMAIL_SEND_OK'){
	   		$('#Error').html('');$('#Error').show();
	   		$('#Error').html("An email has been send to your friend.<br>");
		}
		else{
			$('#Error').html('');$('#Error').show();
		   $('#Error').html("A problem has been occurred to send an email. Please try after some time.<br>");
		}
	}, "json");
}


$.callback = function callback()
{	
  var callEmail=$('#email').val();
  var callName=$('#name').val();
  var callPhone=$('#phone').val();
  var callPurpose=$('#purpose').val();
  o = $('#Error');
  o.hide();
  var msg='';

  if(callEmail=='')
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter email address!</li>";
  else if(_checkEMailAddress(callEmail)==false){
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter valid email address!<li>";
  }
  if(callName=='')
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter name</li>";
  if(callPhone=='')
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter Phone</li>";
  if(callPurpose=='')
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter Purpose of call</li>";
  
  if(msg!=''){
	   $('#Error').html('');$('#Error').show();
	   $('#Error').html('<ul>'+msg+'</ul>');
	   return false;
  }
	
	$.post("include/json-request-callback.php?"+Math.random(), {phone: $('#phone').val(), name: $('#name').val(), purpose: $('#purpose').val(), email: $('#email').val()},
	function(data){
		if(data.response=='CALL_BACK_OK'){
	   		$('#Error').html('');$('#Error').show();
			$('#Error').html("Thank you "+$('#name').val()+"! We will contact you as soon as possible.<br><br>", o);
		}
		else{
	   		$('#Error').html('');$('#Error').show();
			$('#Error').html('A problem has been occurred to send an email. Please try later.', o);
		}
	}, "json");
}

$.email_jobs_like_this = function email_jobs_like_this()
{	
  var callEmail=$('#email'),
  callName=$('#name'),
  keyword=$('#keyword'),
  comments=$('#purpose');
  o = $('#Error');
  o.hide();
  var msg='';

  if(callEmail.val()=='')
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter email address!</li>";
  else if(_checkEMailAddress(callEmail.val())==false){
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter valid email address!<li>";
  }
  if(callName.val()=='')
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Please enter name</li>";
  if(keyword.val()=='')
      msg+="<li style='color:#FF54B6; margin-left:20px;'>Send email jobs alerts matching keywords in jobs</li>";

  if(msg!=''){
	   $('#Error').html('');$('#Error').show();
	   $('#Error').html('<ul>'+msg+'</ul>');
       return false;
  }
	
	$.post("include/json-email-job-like.php?"+Math.random(), {keyword: keyword.val(), name: callName.val(), 
				comments: comments.val(), email: callEmail.val(), skill: $('#skills').val(),job_guid: $('#job_guid').val(), 
				marketsector: $('#marketsector').val(), permanent: $('#permanent').val(), 
				freelancetemp: $('#freelancetemp').val(), contract: $('#contract').val()},
	   function(data){
			if(data.response=='EMAIL_JOB_ALERTS_SET'){
				//$("#registervacancy").hide();
				$('#Error').html('');$('#Error').show();
				$('#Error').html("Thanks "+$('#name').val()+" for subscribing to our job alerts.  You'll get a confirmation email in a moment! please click the verification link in it. Then you're all set.<br>", o);
			}
	
			if(data.response=='EMAIL_JOB_ALERTS_ALL_OK'){//Candidate is logged in
				$('#Error').html('');$('#Error').show();
				$('#Error').html("Thank you "+$('#name').val()+"! You will receive email job alerts matching your job wish list<br>Please "+'<a href="https://jobs.propellondon.com/candidate-secure-area.html?tab=tab2&"+Math.random()+"\">'+"click here</a> to check your jobs wish list<br>", o);
			}
	
		}, "json");
}

$.update_interest_profile = function update_interest_profile(){
	if($('#permanent').attr('checked'))
		var permanent = 'on';
	
	if($('#freelancetemp').attr('checked'))
		var freelancetemp = 'on';

	if($('#contract').attr('checked'))
		var contract = 'on';

	
	$.post("include/json-update-interest-profile.php?"+Math.random(), 
			{guid: $('#guid').val(), rowmode: $('#rowmode').val() , keywords: $('#search_term').val(), 
			skill: $('#skills').val(), marketsector: $('#marketsector').val(), contact_guid:$('#contact_guid').val(),
			permanent: permanent, freelancetemp: freelancetemp, contract: contract},
	function(data){
		if (data.GUID != '' && data.GUID != 'INVALID_UUID'){
			document.location.href="candidate-secure-area.php?tab=tab2&" + Math.random();
		}
		else {
			if($('#rowmode').val() == 'D'){ //delete
				location.reload();
			}else{
				alert('Unable to save interest profile.');
			}
		}
	}, "json");
}
//End of colorbox validation forms//

