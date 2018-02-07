if(!window.fhq) window.fhq = {};



fhq.processParams = function(){
	if(fhq.userinfo && fhq.userinfo.role != 'admin'){
		fhq.ws.cleanuptoken();
		fhq.showSignInForm();
	}else{
		console.log(fhq.userinfo);
	}
}

fhq.showSignInForm = function(){
	$('#signinErrorMessage').hide();
	$('#signinEmailInput').unbind().bind('keyup', function(event){
		if (event.keyCode == 13){
			fhq.signin();
		} else {
			fhq.cleanupSignInMessages();
		}
	});
	
	$('#signinPasswordInput').unbind().bind('keyup', function(event){
		if (event.keyCode == 13){
			fhq.signin();
		} else {
			fhq.cleanupSignInMessages();
		}
	});
	
	$('#modalSignIn').modal('show');
}

fhq.cleanupSignInMessages = function() {
	$('#signinErrorMessage').html('');
	$('#signinErrorMessage').hide();
}

fhq.signin = function() {
	var email = $("#signinEmailInput").val();
	var password = $("#signinPasswordInput").val();
	
	fhq.ws.login({email: email,password: password}).done(function(r){
		console.log(r);
		if(r.user.role != 'admin'){
			$('#signinErrorMessage').show();
			$("#signinErrorMessage").html("This page allow only for admin");
		}else{
			$('#modalSignIn').modal('hide');
			$('.modal-backdrop').hide();
		}
	}).fail(function(r){
		$('#signinErrorMessage').show();
		$("#signinErrorMessage").html(r.error);
	})
}
