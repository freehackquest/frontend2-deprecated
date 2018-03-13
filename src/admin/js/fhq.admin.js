if(!window.fhq) window.fhq = {};

fhq.showLoader = function(){
	$('.fhq-page-loader').show();
}

fhq.hideLoader = function(){
	setTimeout(function(){
		$('.fhq-page-loader').hide();
	},1000);
}

fhq.parsePageParams = function() {
	var loc = location.search.slice(1);
	var arr = loc.split("&");
	var result = {};
	var regex = new RegExp("(.*)=([^&#]*)");
	for(var i = 0; i < arr.length; i++){
		if(arr[i].trim() != ""){
			p = regex.exec(arr[i].trim());
			console.log("results: " + JSON.stringify(p));
			if(p == null)
				result[decodeURIComponent(arr[i].trim().replace(/\+/g, " "))] = '';
			else
				result[decodeURIComponent(p[1].replace(/\+/g, " "))] = decodeURIComponent(p[2].replace(/\+/g, " "));
		}
	}
	console.log(JSON.stringify(result));
	return result;
}

fhq.pageParams = fhq.parsePageParams();


fhq.containsPageParam = function(name){
	return (typeof fhq.pageParams[name] !== "undefined");
}

fhq.lang = function(){
	return window.fhq.sLang || window.fhq.locale();
}

fhq.locale = function(){
	var langs = ['en', 'ru']
	self.sLang = 'en';
	if(fhq.containsPageParam('lang') && langs.indexOf(this.pageParams['lang']) >= -1){
		self.sLang = fhq.pageParams['lang'];
	} else if (navigator) {
		var navLang = 'en';
		navLang = navigator.language ? navigator.language.substring(0,2) : navLang;
		navLang = navigator.browserLanguage ? navigator.browserLanguage.substring(0,2) : navLang;
		navLang = navigator.systemLanguage ? navigator.systemLanguage.substring(0,2) : navLang;
		navLang = navigator.userLanguage ? navigator.userLanguage.substring(0,2) : navLang;
		self.sLang =  langs.indexOf(navLang) >= -1 ? navLang : self.sLang;
	} else {
		self.sLang = 'en';
	}
	return self.sLang;
}

fhq.mainLangs = {
	'en': 'English',
	'ru': 'Русский',
	'de': 'Deutche',
}

fhq.t = function(message){
	if(fhq.localization){
		var tr = fhq.localization[message];
		if(tr){
			if(tr[fhq.lang()]){
				return fhq.localization[message][fhq.lang()];
			}else{
				console.warn("Not found localization for language " + fhq.lang() + " '" + message + "'");
				return fhq.localization[message]['en'];
			}
		}else{
			console.warn("Not found localization '" + message + "'");
		}
	}else{
		console.warn("Not found localization module '" + message + "'");
	}
	return message;
}


fhq.pages = [];

fhq.processParams = function(){
	if(fhq.token == "" || (fhq.userinfo && fhq.userinfo.role != 'admin')){
		fhq.ws.cleanuptoken();
		fhq.showSignInForm();
	}else{
		console.log(fhq.userinfo);
		console.log(fhq.pages);
		for(var name in fhq.pages){
			if(fhq.containsPageParam(name)){
				fhq.pages[name]();
				break;
			}	
		}
	}
}

fhq.logout = function(){
	fhq.ws.cleanuptoken();
	window.location.reload();
}

fhq.changeLocationState = function(newPageParams){
	var url = '';
	var params = [];
	console.log("changeLocationState");
	console.log("changeLocationState", newPageParams);
	for(var p in newPageParams){
		params.push(encodeURIComponent(p) + "=" + encodeURIComponent(newPageParams[p]));
	}
	console.log("changeLocationState", params);
	console.log("changeLocationState", window.location.pathname + '?' + params.join("&"));
	window.history.pushState(newPageParams, document.title, window.location.pathname + '?' + params.join("&"));
	fhq.pageParams = fhq.parsePageParams();
}

fhq.paginatorClick = function(onpage, page){
	fhq.pageParams['onpage'] = onpage;
	fhq.pageParams['page'] = page;
	fhq.changeLocationState(fhq.pageParams);
	fhq.processParams();
}

fhq.paginator = function(min,max,onpage,page) {
	if (max == 0) 
		return "";

	if (min == max || page > max || page < min )
		return " Paging Error ";
	
	var pages = Math.ceil(max / onpage);

	var pagesInt = [];
	var leftp = 5;
	var rightp = leftp + 1;

	if (pages > (leftp + rightp + 2)) {
		pagesInt.push(min);
		if (page - leftp > min + 1) {
			pagesInt.push(-1);
			for (var i = (page - leftp); i <= page; i++) {
				pagesInt.push(i);
			}
		} else {
			for (var i = min+1; i <= page; i++) {
				pagesInt.push(i);
			}
		}
		
		if (page + rightp < pages-1) {
			for (var i = page+1; i < (page + rightp); i++) {
				pagesInt.push(i);
			}
			pagesInt.push(-1);
		} else {
			for (var i = page+1; i < pages-1; i++) {
				pagesInt.push(i);
			}
		}
		if (page != pages-1)
			pagesInt.push(pages-1);
	} else {
		for (var i = 0; i < pages; i++) {
			pagesInt.push(i);
		}
	}

	var content = '';
	content += '<nav><ul class="pagination">';
	content += '<li class="page-item disabled"> <div class="page-link" tabindex="-1">Found: ' + (max-min) + '</div></li>'
	for (var i = 0; i < pagesInt.length; i++) {
		if (pagesInt[i] == -1) {
			content += " ... ";
		} else if (pagesInt[i] == page) {
			content += '<li class="page-item active"><div class="page-link">' + (pagesInt[i]+1) + '</div></li>';
		} else {
			content += '<li class="page-item ' + (pagesInt[i] == page ? 'active' : '') + '"><div class="page-link" onclick="fhq.paginatorClick(' + onpage + ',' + pagesInt[i] + ');">' + (pagesInt[i]+1) + '</div></li>';
		}
	}
	content += "</ul></nav>";
	
	return content;
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

fhq.createUser = function()  {
	fhq.showLoader();
	$('#error_info').hide();
	var data = {};
	data["role"] = $("#newuser_role").val();
	data["email"] = $("#newuser_login").val();
	data["password"] = $("#newuser_password").val();
	data["nick"] = $("#newuser_nick").val();
	data["university"] = $("#newuser_university").val();
	
	fhq.ws.user_create(data).done(function(r){
		fhq.hideLoader();
		fhq.pages['users']();
	}).fail(function(err){
		fhq.hideLoader();
		console.error(err);
		$('#error_info').show();
		$('#error_info .alert').html('ERROR: ' + err.error);
		
	})
};

fhq.pages['user_create'] = function(){
	fhq.changeLocationState({'user_create':''});
	$('#page_name').html('User Create');
	var el = $('#page_content');
	fhq.hideLoader();
	el.html(''
		+ '<div class="card">'
		+ '		<div class="card-header">New user</div>'
		+ '		<div class="card-body">'
		+ '			<div class="form-group row">'
		+ '				<label for="newuser_role" class="col-sm-2 col-form-label">Role</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" value="" id="newuser_role">'
		+ '						<option value="user">User</option>'
		+ '						<option value="admin">Admin</option>'
		+ '					</select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newuser_login" class="col-sm-2 col-form-label">Email or login</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newuser_login">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newuser_password" class="col-sm-2 col-form-label">Password</label>'
		+ ' 			<div class="col-sm-10">'
        + '					<input type="text" class="form-control" value="" id="newuser_password">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
        + '				<label for="newuser_nick" class="col-sm-2 col-form-label">Nick</label>'
		+ ' 			<div class="col-sm-10">'
        + '					<input type="text" class="form-control" value="" id="newuser_nick">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newuser_university" class="col-sm-2 col-form-label">University (optional)</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newuser_university">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div class="btn btn-secondary" onclick="fhq.createUser();">Create</div>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row" id="error_info" style="display: none">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div class="alert alert-danger"></div>'
		+ '				</div>'
		+ '			</div>'
		+ '		</div>'
		+ '</div>'
	);
}

fhq.pages['users'] = function(){
	$('#page_name').html('Users');
	$('#page_content').html('');
	fhq.showLoader();
	
	var onpage = 5;
	if(fhq.containsPageParam("onpage")){
		onpage = parseInt(fhq.pageParams['onpage'], 10);
	}

	var page = 0;
	if(fhq.containsPageParam("page")){
		page = parseInt(fhq.pageParams['page'], 10);
	}
	
	var el = $("#page_content");
	el.html('Loading...')
	
	window.fhq.changeLocationState({'users': '', 'onpage': onpage, 'page': page});

	fhq.ws.users({'onpage': onpage, 'page': page}).done(function(r){
		fhq.hideLoader();
		
		el.html('');
        el.append('<button id="user_create" class="btn btn-secondary">Create User</button><hr>');
		$('#user_create').unbind().bind('click', fhq.pages['user_create']);
		

		el.append(fhq.paginator(0, r.count, r.onpage, r.page));
		el.append('<table class="table table-striped">'
			+ '		<thead>'
			+ '			<tr>'
			+ '				<th>#</th>'
			+ '				<th>Email / Nick</th>'
			+ '				<th>Last IP <br> Country / City / University</th>'
			+ '				<th>Last Sign in <br> Status / Role</th>'
			+ '			</tr>'
			+ '		</thead>'
			+ '		<tbody id="users_list">'
			+ '		</tbody>'
			+ '</table>'
		)
		for(var i in r.data){
			var u = r.data[i];
			$('#users_list').append('<tr>'
				+ '	<td>' + u.id + '</td>'
				+ '	<td><p>' + u.email + '</p><p>'  + u.nick + '</p></td>'
				+ '	<td><p>' + u.last_ip + '</p><p>' + u.country + ' / ' + u.city + ' / ' + u.university + '</p></td>'
				+ '	<td><p>' + u.dt_last_login + '</p><p>' + '' + u.role + '</p></td>'
				+ '</tr>'
			)
		}
		
		
		
	}).fail(function(r){
		fhq.hideLoader();
		console.error(r);
		el.append(r.error);
	})
}

fhq.mailSend = function()  {
	fhq.showLoader();
	$('#error_info').hide();
	var data = {};
	data["to"] = $("#mail_to").val();
	data["subject"] = $("#mail_subject").val();
	data["body"] = $("#mail_body").val();
	
	fhq.ws.mail_send(data).done(function(r){
		fhq.hideLoader();
		fhq.pages['mails']();
	}).fail(function(err){
		fhq.hideLoader();
		console.error(err);
		$('#error_info').show();
		$('#error_info .alert').html('ERROR: ' + err.error);
		
	})
};


fhq.pages['mail_send'] = function(){
	fhq.changeLocationState({'mail_send':''});
	$('#page_name').html('Mail Send');
	var el = $('#page_content');
	fhq.hideLoader();
	el.html(''
		+ '<div class="card">'
		+ '		<div class="card-header">New mail</div>'
		+ '		<div class="card-body">'
		+ '			<div class="form-group row">'
		+ '				<label for="mail_to" class="col-sm-2 col-form-label">To</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="email" class="form-control" value="" id="mail_to">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="mail_subject" class="col-sm-2 col-form-label">Subject</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="mail_subject">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="mail_body" class="col-sm-2 col-form-label">Body</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<textarea class="form-control" style="height: 220px;" id="mail_body"></textarea>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div class="btn btn-secondary" onclick="fhq.mailSend();">Send</div>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row" id="error_info" style="display: none">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div class="alert alert-danger"></div>'
		+ '				</div>'
		+ '			</div>'
		+ '		</div>'
		+ '</div>'
	);
}

fhq.pages['mails'] = function(){
	$('#page_name').html('Mails');
	$('#page_content').html('');
	fhq.showLoader();
	
	var onpage = 5;
	if(fhq.containsPageParam("onpage")){
		onpage = parseInt(fhq.pageParams['onpage'], 10);
	}

	var page = 0;
	if(fhq.containsPageParam("page")){
		page = parseInt(fhq.pageParams['page'], 10);
	}
	
	var el = $("#page_content");
	el.html('Loading...')
	
	window.fhq.changeLocationState({'mails': '', 'onpage': onpage, 'page': page});

	fhq.ws.mails_list({'onpage': onpage, 'page': page}).done(function(r){
		fhq.hideLoader();
		console.log(r);
		el.html('');
		
		el.append('<button id="mail_send" class="btn btn-secondary">Mail Send</button><hr>');
		$('#mail_send').unbind().bind('click', fhq.pages['mail_send']);
		
		
		
		el.append(fhq.paginator(0, r.count, r.onpage, r.page));
		el.append('<table class="table table-striped">'
			+ '		<thead>'
			+ '			<tr>'
			+ '				<th>#</th>'
			+ '				<th>To Email <br> Subject</th>'
			+ '				<th>Message</th>'
			+ '				<th>Datetime <br> Status <br> Priority </th>'
			+ '			</tr>'
			+ '		</thead>'
			+ '		<tbody id="users_list">'
			+ '		</tbody>'
			+ '</table>'
		)
		for(var i in r.data){
			var em = r.data[i];
			$('#users_list').append('<tr>'
				+ '	<td>' + em.id + '</td>'
				+ '	<td><p>' + em.email + '</p><p>'  + em.subject + '</p></td>'
				+ '	<td><pre>' + em.message + '</pre></td>'
				+ '	<td><p>' + em.dt + '</p><p>Status: ' + em.status + '</p><p>Priority: ' + em.priority + ' </p></td>'
				+ '</tr>'
			)
		}
	}).fail(function(r){
		fhq.hideLoader();
		console.error(r);
		el.append(r.error);
	})
}


fhq.pages['quests'] = function(){
	$('#page_name').html('Quests');
	$('#page_content').html('');

}

fhq.pages['orchestra'] = function(){
	$('#page_name').html('Orchestra');
	$('#page_content').html('');
	fhq.showLoader();
	
	var onpage = 5;
	if(fhq.containsPageParam("onpage")){
		onpage = parseInt(fhq.pageParams['onpage'], 10);
	}

	var page = 0;
	if(fhq.containsPageParam("page")){
		page = parseInt(fhq.pageParams['page'], 10);
	}
	
	var el = $("#page_content");
	el.html('Loading...')
	
	window.fhq.changeLocationState({'orchestra': '', 'onpage': onpage, 'page': page});

	fhq.ws.mails_list({'onpage': onpage, 'page': page}).done(function(r){
		fhq.hideLoader();
		console.log(r);
		el.html('');
		el.append(fhq.paginator(0, r.count, r.onpage, r.page));
		el.append('<table class="table table-striped">'
			+ '		<thead>'
			+ '			<tr>'
			+ '				<th>#</th>'
			+ '				<th>Name</th>'
			+ '				<th>Info</th>'
			+ '				<th>Status</th>'
			+ '			</tr>'
			+ '		</thead>'
			+ '		<tbody id="data_list">'
			+ '		</tbody>'
			+ '</table>'
		)
		for(var i in r.data){
			var or = r.data[i];
			$('#data_list').append('<tr>'
				+ '	<td>' + or.id + '</td>'
				+ '	<td><p>' + or.name + '</p><p>'  + or.dt + '</p></td>'
				+ '	<td><pre>' + or.info + '</pre></td>'
				+ '	<td><p>' + or.status + '</p></td>'
				+ '</tr>'
			)
		}
	}).fail(function(r){
		fhq.hideLoader();
		console.error(r);
		el.append(r.error);
	})
}

fhq.pages['settings'] = function(idelem) {
	fhq.changeLocationState({'settings':''});
	$('#page_name').html('Settings');
	$('#page_content').html('');
	
	var el = $('#page_content');
	el.html('');
	
	fhq.ws.server_settings().done(function(r){
		fhq.hideLoader();
		console.log(r);
		for(var name in r.data){
			var sett = r.data[name];
			var groupid = 'settings_group_' + sett.group;
			if($('#' + groupid).length == 0){
				el.append(''
					+ '<div class="card">'
					+ '  <div class="card-header">' + fhq.t(groupid) + '</div>'
					+ '  <div class="card-body">'
					+ '   <div id="' + groupid + '">'
					+ '   </div>'
					+ '  </div>'
					+ '</div><br>'
				);
			}
			
			var settid = 'setting_name_' + sett.name;
			
			var input_type = 'text';
			if(sett.type == 'integer'){
				$('#' + groupid).append(''
					+ '<div class="form-group row">'
					+ '	<label for="' + settid + '" class="col-sm-2 col-form-label">' + fhq.t(settid) + '</label>'
					+ '	<div class="col-sm-7">'
					+ '		<input type="number" readonly class="form-control" id="' + settid + '">'
					+ '	</div>'
					+ '	<div class="col-sm-2">'
					+ '		<div class="btn btn-secondary edit-settings" groupid="' + groupid + '" setttype="' + sett.type + '" settname="' + sett.name + '" settid="' + settid + '">Edit</div>'
					+ '	</div>'
					+ '</div>'
				);
				$('#' + settid).val(sett.value);
			}else if(sett.type == 'password'){
				$('#' + groupid).append(''
					+ '<div class="form-group row">'
					+ '	<label for="' + settid + '" class="col-sm-2 col-form-label">' + fhq.t(settid) + '</label>'
					+ '	<div class="col-sm-7">'
					+ '		<input type="password" readonly class="form-control" id="' + settid + '">'
					+ '	</div>'
					+ '	<div class="col-sm-2">'
					+ '		<div class="btn btn-secondary edit-settings" groupid="' + groupid + '" setttype="' + sett.type + '" settname="' + sett.name + '" settid="' + settid + '">Edit</div>'
					+ '	</div>'
					+ '</div>'
				);
				$('#' + settid).val(sett.value);
			}else if(sett.type == 'string'){
				$('#' + groupid).append(''
					+ '<div class="form-group row">'
					+ '	<label for="' + settid + '" class="col-sm-2 col-form-label">' + fhq.t(settid) + '</label>'
					+ '	<div class="col-sm-7">'
					+ '		<input type="text" readonly class="form-control" id="' + settid + '">'
					+ '	</div>'
					+ '	<div class="col-sm-2">'
					+ '		<div class="btn btn-secondary edit-settings" groupid="' + groupid + '" setttype="' + sett.type + '" settname="' + sett.name + '" settid="' + settid + '">Edit</div>'
					+ '	</div>'
					+ '</div>'
				);
				$('#' + settid).val(sett.value);
			}else if(sett.type == 'boolean'){
				$('#' + groupid).append(''
					+ '<div class="form-group row">'
					+ '	<label for="' + settid + '" class="col-sm-2 col-form-label">' + fhq.t(settid) + '</label>'
					+ '	<div class="col-sm-7">'
					+ '		<select disabled class="form-control" id="' + settid + '">'
					+ '			<option name="no">no</option>'
					+ '			<option name="yes">yes</option>'
					+ '		<select class="form-control">'
					+ '	</div>'
					+ '	<div class="col-sm-2">'
					+ '		<div class="btn btn-secondary edit-settings" groupid="' + groupid + '" setttype="' + sett.type + '" settname="' + sett.name + '" settid="' + settid + '">Edit</div>'
					+ '	</div>'
					+ '</div>'
				);
				$('#' + settid).val(sett.value == true ? 'yes' : 'no');
			}
		}
		
		
		$('.edit-settings').unbind().bind('click', function(){
			$('#modalSettings').modal('show');
			
			var setttype = $(this).attr('setttype');
			var settname = $(this).attr('settname');
			var settid = $(this).attr('settid');
			var groupid = $(this).attr('groupid');
			
			var val = $('#' + settid).val();
			
			$('#modalSettings .modal-body').html('');
			$('#modalSettings .modal-body').append('<h3>' + fhq.t(groupid) + '/' + fhq.t(settid) + '</h3>')
			
			if(setttype == 'string'){
				$('#modalSettings .modal-body').append(
					'<input type="text" class="form-control" id="modalSettings_newval">'
					+ '<p id="modalSettings_error"></p>'
				);
				$('#modalSettings_newval').val(val);
			}else if(setttype == 'boolean'){
				$('#modalSettings .modal-body').append(''
					+ '		<select class="form-control" id="modalSettings_newval">'
					+ '			<option name="no">no</option>'
					+ '			<option name="yes">yes</option>'
					+ '		<select class="form-control">'
					+ '<p id="modalSettings_error"></p>'
				);
				$('#modalSettings_newval').val(val);
				
					
			}else if(setttype == 'password'){
				$('#modalSettings .modal-body').append(
					'<input type="password" class="form-control" id="modalSettings_newval">'
					+ '<p id="modalSettings_error"></p>'
				);
				$('#modalSettings_newval').val('');
			}else if(setttype == 'integer'){
				$('#modalSettings .modal-body').append(
					'<input type="number" class="form-control" id="modalSettings_newval">'
					+ '<p id="modalSettings_error"></p>'
				);
				$('#modalSettings_newval').val(val);
			}
			
			$('#modalSettings .save-setting').unbind().bind('click', function(){
				$('#modalSettings_newval').attr({'readonly': true});
				$('#modalSettings_newval').attr({'disabled': true});
				$('#modalSettings_error').html('');
				var data = {};
				data.name = settname;
				data.value = $('#modalSettings_newval').val();

				fhq.ws.server_settings_update(data).done(function(r){
					if(setttype != 'password'){
						$('#' + settid).val(data.value);
					}
					$('#modalSettings').modal('hide');
				}).fail(function(err){
					console.error(err);
					$('#modalSettings_newval').removeAttr('readonly');
					$('#modalSettings_newval').removeAttr('disabled');
					$('#modalSettings_error').html(err.error);
				})
				
			});
			// modalSettings
			
		});
		
	}).fail(function(err){
		fhq.ui.hideLoading();
		console.error(err);
	})
}




