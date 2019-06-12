if(!window.fhq) window.fhq = {};
if(!window.fhq.ui) window.fhq.ui = {};

fhq.ui.modalDialog2ClickContent = false;

fhq.ui.showModalDialog = function(obj) {
	// document.getElementById('modal_dialog').style.top = document.body.
	$('#fhqmodaldialog').css({'transform': 'scale(1)', visibility: 'visible', overflow: 'hidden'});
	
	$('#fhqmodaldialog_header').html(obj.header);
	$('#fhqmodaldialog_content').html(obj.content);
	$('#fhqmodaldialog_buttons').html(obj.buttons + fhq.ui.templates.dialog_btn_cancel());
	document.body.scroll = "no"; // ie only
	fhq.ui.modalDialog2ClickContent = false;
	document.onkeydown = function(evt) {
		if (evt.keyCode == 27){
			fhq.ui.closeModalDialog();
		}
	}
}

fhq.ui.playStopMusic = function(){
	var status = $('#btnmenu_sound').attr('status');
	if(status && status == 'playing'){
		$('#btnmenu_sound').html('Play Sound');
		$('#btnmenu_sound').attr({'status': 'paused'})
		audio_night_thus.pause();
	}else{
		$('#btnmenu_sound').html('Stop Sound');
		$('#btnmenu_sound').attr({'status': 'playing'})
		audio_night_thus.play();
	}
	
	
}

fhq.ui.showError = function(msg){
	$('#modalInfoTitle').html(fhq.t('Error'));
	$('#modalInfo').modal('show');
	$('#modalInfoBody').html(msg);
	$('#modalInfoButtons').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>');
}

fhq.ui.showLoading = function(){
	$('.fhq-page-loader').show();
}

fhq.ui.hideLoading = function(){
	setTimeout(function(){
		$('.fhq-page-loader').hide();
	},1000);
}

fhq.ui.closeModalDialog = function() {
	$('#fhqmodaldialog').css({'transform': ''});
	setTimeout(function(){
		$('#fhqmodaldialog_content').html("");
		document.getElementById('fhqmodaldialog').style.visibility = 'hidden';
		document.documentElement.style.overflow = 'auto';  // firefox, chrome
		document.body.scroll = "yes"; // ie only
		document.onkeydown = null;
	},800);
}

fhq.ui.updateModalDialog = function(obj) {
	$('#fhqmodaldialog_header').html(obj.header);
	$('#fhqmodaldialog_content').html(obj.content);
	$('#fhqmodaldialog_buttons').html(obj.buttons + fhq.ui.templates.dialog_btn_cancel());
}

fhq.ui.clickModalDialog_content = function() {
	fhq.ui.FHQModalDialog_ClickContent = true;
}

fhq.ui.clickModalDialog_dialog = function() {
	if(fhq.ui.FHQModalDialog_ClickContent != true){
		fhq.ui.closeModalDialog();
	}else{
		fhq.ui.FHQModalDialog_ClickContent = false;
	}
}

/* Sign In */

fhq.ui.showSignInForm = function() {
	
	if (fhq.supportsHtml5Storage()) {
		localStorage.removeItem("email");
		localStorage.removeItem("password");
	}
	$('#signinEmailCaption').html(fhq.t('Email address') + ':');
	$('#signinPasswordCaption').html(fhq.t('Password') + ':');
	$('#modalSignInTitle').html(fhq.t('Sign-in'));
	$('#modalSignIn_go').html(fhq.t('Sign-in'));
	$('#modalSignIn_cansel').html(fhq.t('Close'));
	$('#signinErrorMessage').hide();
	$('#signinForgotPassword').unbind().bind('click', function(){
		window.location = './new/reset-password';
		$('#modalSignIn').modal('hide');
	})

	$('#signinEmailInput').unbind().bind('keyup', function(event){
		if (event.keyCode == 13){
			fhq.ui.signin();
		} else {
			fhq.ui.cleanupSignInMessages();
		}
	});
	
	$('#signinPasswordInput').unbind().bind('keyup', function(event){
		if (event.keyCode == 13){
			fhq.ui.signin();
		} else {
			fhq.ui.cleanupSignInMessages();
		}
	});
	
	$('#modalSignIn').modal('show');
}

fhq.ui.cleanupSignInMessages = function() {
	$('#signinErrorMessage').html('');
	$('#signinErrorMessage').hide();
}

fhq.ui.signin = function() {
	var email = $("#signinEmailInput").val();
	var password = $("#signinPasswordInput").val();
	
	fhq.ws.login({email: email,password: password}).done(function(r){
		fhq.ui.processParams();
		$('#modalSignIn').modal('hide');
		//window.location.reload();
	}).fail(function(r){
		$('#signinErrorMessage').show();
		$("#signinErrorMessage").html(r.error);
	})
}

fhq.ui.signout = function(){
	fhq.token = "";
	fhq.userinfo = null;
	fhq.removeTokenFromCookie();
	localStorage.removeItem('userinfo');
	fhq.ui.processParams();
}

fhq.ui.updateMenu = function(){
	// localization
	$('#btnmenu_quests .nav-link').html(fhq.t('Quests'));
	$('#btnmenu_scoreboard .nav-link').html(fhq.t('Scoreboard'));
	$('#btnmenu_news .nav-link').html(fhq.t('News'));
	$('#btnmenu_about .nav-link').html(fhq.t('About'));
	$('#btnmenu_other .nav-link').html(fhq.t('Other'));

	$('#btnmenu_feedback').html(fhq.t('Feedback'));
	$('#btnmenu_map').html(fhq.t('Map'));
	$('#btnmenu_chat').html(fhq.t('Chat'));
	$('#btnmenu_games').html(fhq.t('Games'));
	$('#btnmenu_tools').html(fhq.t('Tools'));
	$('#btnmenu_knowledge_base').html(fhq.t('Knowledge Base'));
	$('#btnmenu_apidocs').html(fhq.t('FreeHackQuest API'));
	
	// users/unauth menu
	$('#btnmenu_newfeedback').html(fhq.t('New Feedback'));
	$('#btnmenu_proposal_quest').html(fhq.t('Proposal Quest'));
	
	$('#btnmenu_createnews').html(fhq.t('Create News'));

	$('#btnmenu_serversettings').html(fhq.t('Server Settings'));
	
	$('#btnmenu_signin').html(fhq.t('Sign-in'));
	$('#btnmenu_signin_with_google').html(fhq.t('Sign-in with Google'));
	$('#btnmenu_signup').html(fhq.t('Sign-up'));
	$('#btnmenu_reset_password').html(fhq.t('Forgot password?'));
	
	
	$('#btnmenu_user_profile').html(fhq.t('Your Profile'));
	$('#btnmenu_user_logout').html(fhq.t('Sign-out'));
	
	if (fhq.isAdmin()){
		$('.admin-menu').show();
	}else{
		$('.admin-menu').hide();
	}
	
	if(!fhq.isAuth()){
		$('.unauth-menu').show();
		$('.auth-menu').hide();
		$('#user_img').attr({'src' : 'images/menu/user.png'})
		$('#user_nick').html(fhq.t('Account'));
	}else{
		$('.unauth-menu').hide();
		$('.auth-menu').show();
		if(fhq.userinfo){
			$('#user_img').attr({'src' : fhq.userinfo.logo})
			$('#user_nick').html(fhq.userinfo.nick);
		}else{
			$('#user_img').attr({'src' : 'images/menu/user.png'})
			$('#user_nick').html(fhq.t('Account'));
		}
	}
}

fhq.ui.showNotification = function(type, section, message){
	function htmlEncode(value){
		//create a in-memory div, set it's inner text(which jQuery automatically encodes)
		//then grab the encoded contents back out.  The div never exists on the page.
		return $('<div/>').text(value).html();
	}

    $.bootstrapGrowl("<strong>" + htmlEncode(section) + "</strong><br>" + htmlEncode(message), { // options
        type: type, // info, success, warning and danger
		ele: "body", // parent container
		offset: {
			from: "top",
			amount: 70
		},
		align: "right", // right, left or center
		width: 250,
		delay: 10000,
		allow_dismiss: true, // add a close button to the message
		stackup_spacing: 10
	});
}

function FHQGuiLib(api) {
	var self = this;
	this.fhq = api;
	this.api = api;
	
	this.readonly = function(idelem, value) {
		return '<div id="' + idelem +'">' + value + '</div>';
	};

	this.btn = function(caption, js) {
		return '<div class="fhqbtn" onclick="' + js + '">' + caption + '</div>';
	}

	/* Old Modal Dialog */
	
	this.showModalDialog = function(content) {
		// document.getElementById('modal_dialog').style.top = document.body.
		document.getElementById('modal_dialog').style.visibility = 'visible';
		document.getElementById('modal_dialog_content').innerHTML = content;
		document.documentElement.style.overflow = 'hidden';  // firefox, chrome
		document.body.scroll = "no"; // ie only
		document.onkeydown = function(evt) {
			if (evt.keyCode == 27)
				closeModalDialog();
		}	
	}

	this.closeModalDialog = function() {
		document.getElementById('modal_dialog').style.visibility = 'hidden';
		document.documentElement.style.overflow = 'auto';  // firefox, chrome
		document.body.scroll = "yes"; // ie only
		document.onkeydown = null;
		document.getElementById('modal_dialog_content').innerHTML = "";
	}

	this.getUrlParameterByName = function(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	// deprecated
	this.messageLastId = 0;
	this.showedMessages = [];
	
	this.updatePostionMessages = function(){
		var count = self.showedMessages.length;
		for(var t in self.showedMessages){
			var id = self.showedMessages[t];
			count--;
			var bottom = (115 + count*60) + 'px';
			$('#' + id).css({
				'bottom' : bottom,
				'right': '25px'
			});
		}
	}
};

fhq.ui.showUserInfo = function(userid) {
	$('#modalInfoTitle').html('User #' + userid);
	$('#modalInfo').modal('show');
	$('#modalInfoBody').html('');
	$('#modalInfoBody').append('Loading...');
	$('#modalInfoButtons').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>');

	// user info
	fhq.ws.user({userid: userid}).done(function (obj) {
			$('#modalInfoBody').html('');
			$('#modalInfoBody').append('<h3>' + obj.data.nick + '</h3>');
			if(obj.data.university && obj.data.university != ""){
				$('#modalInfoBody').append('<p>University: ' + obj.data.university + '</p>');
			}
			$('#modalInfoBody').append('<p>' + fhq.t('Rating') + ': ' + obj.data.rating + '</p>');

			if(obj.data.about != ""){
				$('#modalInfoBody').append('<p>' + obj.data.about + '</p>');
			}
			
			$('#modalInfoButtons').append(
				'<button type="button" class="btn btn-secondary" userid="userid" id="open_in_new_tab">Open user page</button>'
			);
			
			$('#open_in_new_tab').unbind().bind('click', function(){
				var win = window.open('?user=' + userid, '_blank');
				win.focus();
			})
		}
	).fail(function(r){
		$('#modalInfoBody').html("[Error] " + obj.error.message);
	});
}

fhq.ui.makeUserIcon = function(userid, logo, nick, university) {
	return '<div class="btn btn-default" onclick="fhq.ui.showUserInfo(' + userid + ')"> <img class="fhqmiddelinner" width=25px src="' + logo + '"/> ' + (university && university != "" ? '[' + university + '] ' : '') + nick + '</div>'
}

fhq.ui.pageHandlers = {};

fhq.ui.processParams = function() {
	console.error("processParams onDocReady");
	
	fhq.ui.pageHandlers["quests"] = fhq.ui.loadStatSubjectsQuests;
	fhq.ui.pageHandlers["user"] = fhq.ui.loadUserProfile;
	fhq.ui.pageHandlers["about"] = fhq.ui.loadAboutPage;
	fhq.ui.pageHandlers["game_create"] = fhq.ui.loadFormCreateGame;
	fhq.ui.pageHandlers["game_edit"] = fhq.ui.loadPageEditGame;
	fhq.ui.pageHandlers["scoreboard"] = fhq.ui.loadScoreboard;
	fhq.ui.pageHandlers["quest"] = fhq.ui.loadQuest;
	fhq.ui.pageHandlers["subject"] = fhq.ui.loadQuestsBySubject;
	fhq.ui.pageHandlers["tools"] = fhq.ui.loadTools;
	fhq.ui.pageHandlers["tool"] = fhq.ui.loadTool;
	fhq.ui.pageHandlers["feedback"] = fhq.ui.loadFeedback;
	fhq.ui.pageHandlers["proposal_quest"] = fhq.ui.loadProposalQuestForm;
	
	// admin api
	fhq.ui.pageHandlers["create_news"] = fhq.ui.loadCreateNews;

	function renderPage(){
		fhq.ui.updateMenu();
		var processed = false;
		for(var p in fhq.ui.pageHandlers){
			if(fhq.containsPageParam(p)){
				processed = true;
				console.log("Processed: " + p);
				fhq.ui.pageHandlers[p](fhq.pageParams[p]);
				break;
			}
		}
		
		if(!processed){
			fhq.ui.loadStatSubjectsQuests();
		}
	}
	renderPage();
}

window.onpopstate = function(){
	window.fhq.pageParams = fhq.parsePageParams();
	fhq.ui.processParams();
}

var bDocReady = false;
var bUpdatePageBeforeDocReady = false;

$(document).ready(function(){
	// console.warn("processParams onDocReady");
	bDocReady = true;
	if(bUpdatePageBeforeDocReady){
		bUpdatePageBeforeDocReady = false;
		
		fhq.ui.processParams();	
	}
});

fhq.ui.processParamsOnReady = function(){
	if(!bDocReady){
		bUpdatePageBeforeDocReady = true;
	}else{
		fhq.ui.processParams();
	}
}

fhq.ui.onwsclose = function(){
	fhq.ui.showLoading();
}

fhq.ui.loadCreateNews = function(){
	fhq.changeLocationState({'create_news':''});
	
	$('#content_page').html('<div class="fhq0046"></div>')
	$('#content_page').append('<div class="fhq0049"></div>')
	var el = $('.fhq0046');
	el.append('<h1>' + fhq.t("News") + '</h1>');

	el.append('<div class="fhq0048">' + fhq.t("Type") + ':</div>');
	el.append(''
		+ '<select class="fhq0047" id="create_news_type">'
		+ '	<option value="info">' + fhq.t("Information") + '</option>'
		+ '	<option value="users">' + fhq.t("Users") + '</option>'
		+ '	<option value="games">' + fhq.t("Games") + '</option>'
		+ '	<option value="quests">' + fhq.t("Quests") + '</option>'
		+ '	<option value="warning">' + fhq.t("Warning") + '</option>'
		+ '</select>');
	
	el.append('<div class="fhq0048">' + fhq.t("Message") + ':</div>');
	el.append('<textarea id="create_news_text"></textarea><br><br>');
	el.append('<div class="fhqbtn" onclick="fhq.ui.insertNews()">' + fhq.t("Create") + '</div>');
	
}

fhq.ui.insertNews = function(){
	var data = {};

	data.type = $('#create_news_type').val();
	data.message = $('#create_news_text').val();
	$('.fhq0046').hide();
	$('.fhq0049').show();

	fhq.ws.createpublicevent(data).done(function(){
		fhq.ui.loadPageNews();
	}).fail(function(r){
		$('.fhq0046').show();
		$('.fhq0049').hide();
	
		console.error(r);
		var msg = r.error;
		fhq.ui.showError(msg);
	})
};

fhq.ui.formatUptime = function(t){
	var t_sec = t % 60;
	t = (t - t_sec) / 60;
	var t_min = t % 60;
	t = (t - t_min) / 60;
	var t_hours = t % 24;
	t = (t - t_hours) / 24;
	var t_days = t;
	return t_days + " day(s) " + t_hours + " h " + t_min + " m " + t_sec + " s";
}

fhq.ui.loadAboutPage = function() {
	window.fhq.changeLocationState({'about':''});
	
	var dark_switcher = '';
	if(localStorage && localStorage.getItem('dark') != null){
		dark_switcher = '<a href="javascript:void(0);" onclick="localStorage.removeItem(\'dark\'); window.location.reload();">Default theme</a>'
	}else{
		dark_switcher = '<a href="javascript:void(0);" onclick="localStorage.setItem(\'dark\', true); window.location.reload();">Cyborg theme</a>'
	}
	
	var el = $('#content_page');
	el.html('');
	el.append(''
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('About') + '</div>'
		+ '	<div class="card-body">'
		+ '		<strong>FreeHackQuest</strong> - ' + fhq.t('This is an open source platform for competitions in computer security.')
		+ '		<hr><a href="new/donate">Donate</a>'
		+ '	</div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Theme') + '</div>'
		+ '	<div class="card-body">'
		+ '<p>' + dark_switcher + '</p>'
		+ '	</div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Statistics') + '</div>'
		+ '	<div class="card-body">'
		+ '		<p>' + fhq.t('Quests') + ': <label id="statistics_count_quests">...</label></p>'
		+ '		<p>' + fhq.t('All attempts') + ': <label id="statistics_all_attempts">...</label></p>'
		+ '		<p>' + fhq.t('Already solved') + ': <label id="statistics_already_solved">...</label></p>'
		+ '		<p>' + fhq.t('Users online') + ': <label id="statistics_users_online">...</label></p>'
		+ '	</div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Playing with us') + '</div>'
		+ '	<div class="card-body" id="statistics_playing_with_us">'
		+ '		...'
		+ '	</div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Top 10') + '</div>'
		+ '	<div class="card-body">'
		+ '		<div id="winners"></div>'
		+ '	</div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Contacts') + '</div>'
		+ '	<div class="card-body">'
		+ '			<p>Twitter: '
		+ '				<a href="https://twitter.com/freehackquest" class="twitter-follow-button" data-show-count="false">Follow @freehackquest</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?\'http\':\'https\';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+\'://platform.twitter.com/widgets.js\';fjs.parentNode.insertBefore(js,fjs);}}(document, \'script\', \'twitter-wjs\');</script>'
		+ '			</p>'
		+ '			<p>Telegram chat: '
		+ '				<a href="https://telegram.me/freehackquest" target="_blank">https://telegram.me/freehackquest</a>'
		+ '			</p>'
		+ '			<p>Email: <a href="mailto:freehackquest@gmail.com">freehackquest@gmail.com</a></p>'
		+ '		</div>'
		+ '	</div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('License') + '</div>'
		+ '	<div class="card-body">'
		+ 'The MIT License (MIT)<br>'
		+ '<br>'
		+ 'Copyright (c) 2011-2019 sea-kg<br>'
		+ '<br>'
		+ 'Permission is hereby granted, free of charge, to any person obtaining a copy of<br>'
		+ 'this software and associated documentation files (the "Software"), to deal in<br>'
		+ 'the Software without restriction, including without limitation the rights to<br>'
		+ 'use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of<br>'
		+ 'the Software, and to permit persons to whom the Software is furnished to do so,<br>'
		+ 'subject to the following conditions:<br>'
		+ '<br>'
		+ 'The above copyright notice and this permission notice shall be included in all<br>'
		+ 'copies or substantial portions of the Software.<br>'
		+ '<br>'
		+ 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR<br>'
		+ 'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS<br>'
		+ 'FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR<br>'
		+ 'COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER<br>'
		+ 'IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN<br>'
		+ 'CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.<br>'
		+ '	</div>'
		+ '	</div>'
		+ '</div><br>'
		
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Distribution') + '</div>'
		+ '	<div class="card-body">'
		+ '<h3>' + fhq.t('Install fhq-server from repository') + '</h3>'
		+ 'Ubuntu repo: <a href="https://launchpad.net/~freehackquest/+archive/ubuntu/fhq-server/+packages" target="_blank">https://launchpad.net/~freehackquest/+archive/ubuntu/fhq-server/+packages</a>'
		+ '<pre>$ sudo add-apt-repository ppa:freehackquest/fhq-server<br>$ sudo apt-get update<br>$ sudo apt install fhq-server</pre>'
		+ '<hr>'
		+ '<h3>' + fhq.t('Install fhq-server from docker') + '</h3>'
		+ '<p>Docker hub: <a href="https://hub.docker.com/r/freehackquest/fhq-server" target="_blank">https://hub.docker.com/r/freehackquest/fhq-server</a></p>'
		+ '<p>Docker-compose example: <a href="https://github.com/freehackquest/fhq-server/blob/master/docker-compose.yml">docker-compose.yml</a></p>'
		+ '<pre>$ docker pull freehackquest/fhq-server</pre>'
		+ '<hr>'
		+ '<h3>' + fhq.t('Source code') + '</h3>'
		+ '<p>frontend (Required fhq-server): <a href="http://github.com/freehackquest/frontend" target="_blank">http://github.com/freehackquest/frontend</a></p>'
		+ '<p>fhq-server: <a href="http://github.com/freehackquest/fhq-server/" target="_blank">http://github.com/freehackquest/fhq-server</a></p>'

		+ '</div>'
		+ '	</div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Developers and designers') + '</div>'
		+ '	<div class="card-body" id="about_developers"></div>'
		+ '</div><br>'
		+ '<div class="card">'
		+ '	<div class="card-header">' + fhq.t('Thanks for') + '</div>'
		+ '	<div class="card-body">'
		+ '		<ul>'
		+ '			<li><a href="http://www.chartjs.org/docs/" target="_blank">Charts.js</a></li>'
		+ '			<li>Sergey Belov (found xss!)</li>'
		+ '			<li>Igor Polyakov</li>'
		+ '			<li>Maxim Samoilov (Nitive)</li>'
		+ '			<li>Dmitrii Mukovkin</li>'
		+ '			<li>Team Keva</li>'
		+ '			<li>Alexey Gulyaev</li>'
		+ '			<li>Alexander Menschikov</li>'
		+ '			<li>Ilya Bokov</li>'
		+ '			<li>Extrim Code</li>'
		+ '			<li>Taisiya Lebedeva</li>'
		+ '		<ul>'
		+ '	</div>'
		+ '</div><br>'
	);
	fhq.ui.hideLoading();
	fhq.ui.loadPublicInfo();
}

fhq.ui.loadPublicInfo = function() {
	fhq.ui.showLoading();
	fhq.ws.public_info().done(function(r){
		fhq.ui.hideLoading();
		console.log(r);
		$('#statistics_users_online').text(r.connectedusers);
		$('#statistics_count_quests').text(r.quests.count);
		$('#statistics_all_attempts').text(r.quests.attempts);
		$('#statistics_already_solved').text(r.quests.solved);

		$('#winners').html('');
		for (var k in r.winners) {
			var winner = r.winners[k];
			$('#winners').append('<p><strong>' + winner.place + '</strong>'
				+ ' [' + winner.rating + ' Points]'
				+ '  - <strong>' + (winner.university != '' ? '[' + winner.university + '] ' : '') + winner.nick + '</strong>'
				+ '</p>');
		}

		var cities = [];
		for (var k in r.cities){
			cities.push(r.cities[k].city + ' (' + r.cities[k].cnt + ')');
		}

		$('#statistics_playing_with_us').text(cities.join(", "));
		$('#statistics_playing_with_us').append('<br><br><a class="btn btn-info" href="./new/map-activity/">' + fhq.t('On Map') + '</a>');

		// fhq-server developers
		var developers = [];
		for (var k in r.developers){
			developers.push(r.developers[k].name + ' (' + r.developers[k].email + ')');
		}
		// TODO frontend developers
		// developers.push('Some (email)')
		developers.push('Used bootstrap-4');

		$('#about_developers').html('<p>' + developers.join("</p><p>") + '</p>')

	}).fail(function(err){
		console.error(err);
		fhq.ui.hideLoading();
	});
};

fhq.ui.deleteNews = function(id){
	fhq.ui.closeModalDialog();
	fhq.ws.deletepublicevent({'eventid': id}).done(function(r){
		fhq.ui.processParams();
	}).fail(function(r){
		console.error(r);
	});
}

fhq.ui.deleteNewsConfirm = function(id){
	fhq.ui.confirmDialog(fhq.t('Are you sure delete news') + ' #' + id + ' ?', 'fhq.ui.deleteNews(' + id + ');');
}

fhq.ui.editNews = function(id){
	alert("TODO " + id);
}

fhq.ui.loadScoreboard = function(){

	fhq.ui.showLoading();
	var el = $("#content_page");
	el.html('Loading...');

	var onpage = 5;
	if(fhq.containsPageParam("onpage")){
		onpage = parseInt(fhq.pageParams['onpage'], 10);
	}

	var page = 0;
	if(fhq.containsPageParam("page")){
		page = parseInt(fhq.pageParams['page'], 10);
	}
	
	window.fhq.changeLocationState({'scoreboard':'', 'onpage': onpage, 'page': page});

	var params = {};
	params.onpage = onpage;
	params.page = page;

	fhq.ws.scoreboard(params).done(function(r){
		el.html('<h1>' + fhq.t('Scoreboard') + '</h1>');
		console.log(r);
		for (var k in r.data) {
			
			var arr = [];
			var row = r.data[k];
			var first_user_logo = ''
			for (var k2 in row.users) {
				var u = row.users[k2];
				first_user_logo = u.logo;
				arr.push(fhq.ui.makeUserIcon(u.userid, u.logo, u.nick, u.university));
			}
			
			el.append(''
				+ '<div class="card">'
				+ '	<div class="card-body rating-left-img" id="place' + k + '">'
				+ '		<h1>' + row.place + ' [' + row.rating + ' Points]</h1> '
				+ '		' + arr.join(' ')
				+ '	</div><br>'
				+ '</div><br>'
			);
			
			if(row.users.length == 1)	{
				$('#place' + k).css({'background-image': 'url(' + u.logo + ')'});
			}else{
				$('#place' + k).css({'background-image': 'url(files/users/0.png)'});
			}
		}
		fhq.ui.hideLoading();
	});
}

fhq.ui.loadUserProfile = function(userid) {
	if(!userid){
		userid = fhq.userinfo ? fhq.userinfo.id : userid;
	}else{
		userid = parseInt(userid,10);
	}

	fhq.ui.showLoading();
	window.fhq.changeLocationState({'user':userid});

	var el = $('#content_page');
	el.html('Loading...')
	
	fhq.ws.user({userid: userid}).done(function(user){
		fhq.ui.hideLoading();
		
		var converter = new showdown.Converter();
		el.html('');

		var placement = ''
			+ (user.data.country ? '<p>' + fhq.t('Country') + ': ' + user.data.country + '</p>' : '')
			+ (user.data.region ? '<p>' + fhq.t('Region') + ': ' + user.data.region + '</p>' : '')
			+ (user.data.city ? '<p>' + fhq.t('City') + ': ' + user.data.city + '</p>' : '')
			+ (user.data.university ? '<p>' + fhq.t('University') + ': ' + user.data.university + '</p>' : '');
		
		if(placement == ""){
			placement = fhq.t('No detected');
		}

		el.append(''
			+ '<div class="card">'
			+ '  <div class="card-body card-left-img " style="background-image: url(' + user.data.logo + ')">'
			+ '    <h4 class="card-title"><div style="display: inline-block;" id="user_nick2">' + user.data.nick + '</div> (Rating: ' + user.data.rating + ')</h4>'
			+ '    <h6 class="card-subtitle mb-2 text-muted">User ' + user.data.status + '. User has ' + user.data.role + ' privileges.</h6>'
			+ '    <p class="card-text"> '
			+ '		</p>'
			+ '  </div>'
			+ '</div><br>'
			+ '<div class="card">'
			+ '	<div class="card-header">' + fhq.t('Location') + '</div>'
			+ '	<div class="card-body">'
			+ placement
			+ '	</div>'
			+ '</div><br>'
			+ '<div class="card">'
			+ '	<div class="card-header">' + fhq.t('About user') + '</div>'
			+ '	<div class="card-body">'
			+ '		<p>' + converter.makeHtml(user.data.about == '' ? fhq.t('Missing information') : user.data.about) + '</p>'
			+ '	</div>'
			+ '</div><br>'
			+ '<div class="card">'
			+ '	<div class="card-header">' + fhq.t('Skills') + '</div>'
			+ '	<div class="card-body">'
			+ '		<div id="user_skills">Loading...</div>'
			+ '	</div>'
			+ '</div><br>'
		);
		if(user.access){
			el.append(''
				+ '<div class="card">'
				+ '	<div class="card-header">' + fhq.t('Change user info') + '</div>'
				+ '	<div class="card-body">'
				+ '		<div class="form-group row">'
				+ '			<label for="edit_nick" class="col-sm-2 col-form-label">' + fhq.t('Nick') + '</label>'
				+ ' 		<div class="col-sm-10">'
				+ '				<input type="text" class="form-control" value="" id="edit_nick">'
				+ '			</div>'
				+ '		</div>'
				+ '		<div class="form-group row">'
				+ '			<label for="edit_university" class="col-sm-2 col-form-label">' + fhq.t('University') + '</label>'
				+ ' 		<div class="col-sm-10">'
				+ '				<input type="text" class="form-control" value="" id="edit_university">'
				+ '			</div>'
				+ '		</div>'
				+ '		<div class="form-group row">'
				+ '			<label for="edit_about" class="col-sm-2 col-form-label">' + fhq.t('About user') + '</label>'
				+ ' 		<div class="col-sm-10">'
				+ '				<textarea type="text" class="form-control" value="" id="edit_about"></textarea>'
				+ '			</div>'
				+ '		</div>'
				+ '		<div class="form-group row">'
				+ '			<label class="col-sm-2 col-form-label"></label>'
				+ ' 		<div class="col-sm-10">'
				+ '				<div class="btn btn-danger" id="change_user_info">' + fhq.t('Change user info') + '</div>'
				+ '				<p id="change_user_info_status"></p>'
				+ '			</div>'
				+ '		</div>'
				+ '	</div>'
				+ '</div><br>'
			);
			
			$('#edit_nick').val(user.data.nick);
			$('#edit_university').val(user.data.university);
			$('#edit_about').val(user.data.about);
			
			$('#change_user_info').unbind().bind('click', function(){
				$('#change_user_info_status').html('Send request...');
				var data = {};
				data.nick = $('#edit_nick').val();
				data.university = $('#edit_university').val();
				data.about = $('#edit_about').val();
				data.userid = userid;
				fhq.ws.user_update(data).done(function(r){
					$('#edit_nick').val(r.data.nick);
					$('#edit_university').val(r.data.university);
					$('#edit_about').val(r.data.about);
					if(fhq.userinfo && r.data.id == fhq.userinfo.id){
						fhq.userinfo.nick = r.data.nick;	
						fhq.ui.updateMenu();
					}

					$('#user_nick2').html(r.data.nick);
					$('#change_user_info_status').html('Changed');
				}).fail(function(err){
					$('#change_user_info_status').html(err.error);
				});
			});
			
			el.append(''
				+ '<div class="card">'
				+ '	<div class="card-header">' + fhq.t('Change password') + '</div>'
				+ '	<div class="card-body">'
				+ '		<div class="form-group row">'
				+ '			<label for="old_password" class="col-sm-2 col-form-label">' + fhq.t('Old password') + '</label>'
				+ ' 		<div class="col-sm-10">'
				+ '				<input type="password" class="form-control" value="" id="old_password">'
				+ '			</div>'
				+ '		</div>'
				+ '		<div class="form-group row">'
				+ '			<label for="new_password" class="col-sm-2 col-form-label">' + fhq.t('New password') + '</label>'
				+ ' 		<div class="col-sm-10">'
				+ '				<input type="password" class="form-control" value="" id="new_password">'
				+ '			</div>'
				+ '		</div>'
				+ '		<div class="form-group row">'
				+ '			<label class="col-sm-2 col-form-label"></label>'
				+ ' 		<div class="col-sm-10">'
				+ '				<div class="btn btn-danger" id="change_password">' + fhq.t('Change password') + '</div>'
				+ '				<p id="change_password_info"></p>'
				+ '			</div>'
				+ '		</div>'
				+ '	</div>'
				+ '</div><br>'
			);
			
			$('#change_password').unbind().bind('click', function(){
				$('#change_password_info').html('Send request...');
				var data = {};
				data.password_old = $('#old_password').val();
				data.password_new = $('#new_password').val();
				fhq.ws.user_change_password(data).done(function(){
					$('#old_password').val('');
					$('#new_password').val('');
					$('#change_password_info').html('Changed');
				}).fail(function(err){
					$('#old_password').val('');
					$('#new_password').val('');
					$('#change_password_info').html(err.error);
				});
			});
		}
		
		fhq.ws.user_skills({userid: user.data.id}).done(function(r){
			
			$('#user_skills').html('');
			console.log(r);
			var anim = {};
			for(var subject in r.skills_max){
				var user_s = r.skills_user[subject] ? r.skills_user[subject] : 0;
				var max_s = r.skills_max[subject];
				var procent = Math.floor((user_s / max_s)*100);
				anim[subject] = procent;
				$('#user_skills').append('<div class="fhq0117">'
					+ '	<div class="fhq0118">' + subject + ' </div>'
					+ '	<div class="fhq0119 ' + subject + '">'
					+ '		<div class="fhq0121"></div>'
					+ '	</div>'
					+ '	<div class="fhq0122">' + procent + '%</div>'
					+ '</div>'
					+ '<div class="fhq0120"></div>');
			}
			setTimeout(function(){
				for(var subject in anim){
					$('.fhq0119.' + subject + ' .fhq0121').css({'width': anim[subject] + '%' });
				}
			},1000);
		
		}).fail(function(r){
			console.error(r);
		});

		fhq.ui.hideLoading();
	}).fail(function(r){
		fhq.ui.hideLoading();
		el.html(r.error);
		return;
	});
}

fhq.ui.confirmDialog = function(msg, onclick_yes){
	fhq.ui.showModalDialog({
		'header' : fhq.t('Confirm'),
		'content' : msg,
		'buttons' : '<div class="fhqbtn" onclick="' + onclick_yes + '">' + fhq.t('Yes') + '</div>'
	});
}

fhq.ui.loadFeedback = function() {
	fhq.ui.showLoading();
	window.fhq.changeLocationState({'feedback':''});
	$('#content_page').html('<div class="fhq0021"></div>');
	var el = $('.fhq0021');
	
	fhq.api.feedback.list().done(function(obj){
		var content = '';
		
		for (var k in obj.data.feedback) {
			content += '';
			if (obj.data.feedback.hasOwnProperty(k)) {
				var f = obj.data.feedback[k];

				content += '\n<div class="fhq0034">\n';
				content += '	<div class="fhq0035">\n';
				content += '		<div class="fhq0036"><div class="fhq0038" style="background-image: url(' + f.logo + ')"></div></div>\n';
				content += '		<div class="fhq0037">\n';
				content += '			<div class="fhq_event_caption">[' + f.type + ', ' + f.dt + ', {' + f.nick + '}]</div>';
				content += '			<div class="fhq_feedback_text"><pre>' + f.text + '</pre></div>';
				content += '			<div class="fhq_event_caption">'; 
				content += '				<div class="fhqbtn" onclick="formInsertFeedbackMessage(' + f.id + ');">Add message</div>';
				if (obj.access == true) {
					content += '				<div class="fhqbtn" onclick="deleteConfirmFeedback(' + f.id + ');">Delete</div>';
					content += '				<div class="fhqbtn" onclick="formEditFeedback(' + f.id + ');">Edit</div>';
				}
				content += '			</div>';
				
				content += '			<div class="fhq_event_caption">'; 
				
				for (var k1 in f.messages) {
					var m = f.messages[k1];
					content += '\n<div class="fhq0039">\n';
					content += '	<div class="fhq0035">\n';
					content += '		<div class="fhq0036"><div class="fhq0038" style="background-image: url(' + m.logo + ')"></div></div>\n';
					content += '		<div class="fhq0037">\n';
					content += '			<div class="fhq0040"></div>';
					content += '			<div class="fhq_event_caption">[' + m.dt + ', {' + m.nick + '}]</div>';
					content += '			<div class="fhq_feedback_text"><pre>' + m.text + '</pre></div>';
					if (obj.access == true) {
						content += '			<div class="fhq_event_caption">'; 
						content += '				<div class="fhqbtn" onclick="deleteConfirmFeedbackMessage(' + m.id + ');">Delete</div>';
						content += '				<div class="fhqbtn" onclick="formEditFeedbackMessage(' + m.id + ');">Edit</div>';
						content += '			</div>';
					}
					content += '		</div>'; // fhq_event_info_cell_content
					content += '	</div>'; // fhq_event_info_row
					content += '</div><br>'; // fhq_event_info
				}
				content += '			</div>';

				content += '		</div>'; // fhq_event_info_cell_content
				content += '	</div>'; // fhq_event_info_row
				content += '</div><br>'; // fhq_event_info
			}
			content += '';
		}
		el.html(content);
		fhq.ui.hideLoading();
	}).fail(function(r){
		console.error(r);
		el.html(r.responseJSON.error.message);
		fhq.ui.hideLoading();
	});
}

fhq.ui.loadUserInfo = function(uuid){
	fhq.ws.user({uuid: uuid}).done(function(response){
		var u = response.data;
		var pt = new FHQParamTable();
		pt.row('ID:', u.id);
		pt.row('Logo:', '<img src="' + u.logo + '">');
		pt.row('UUID:', u.uuid);
		pt.row('Email:', u.email);
		pt.row('Nick:', u.nick);
		pt.row('Role:', u.role);
		pt.row('Last IP:', u.last_ip);
		pt.row('Created:', u.dt_create);
		pt.row('Last Login:', u.dt_last_login);
		pt.skip();
		for(var p in u.profile){
			pt.row('Profile "' + p + '"', u.profile[p]);
		}
		pt.skip();
		
		$('.fhqrightinfo').html(pt.render());
	});
}

window.fhq.ui.updateQuests = function(){

	// todo filters
	var params = {};
	params.name_contains = $('#quests_filter_name_contains').val();
	params.subjects = $('#quests_filter_subject').val();
	var status = $('#quests_filter_status').val();
	params.open = true;
	params.completed = true;

	if(status == "open"){
		params.completed = false;
	}else if(status == "completed"){
		params.open = false;
	}
	
	// params.open
	fhq.api.quests.list(params).done(function(response){
		console.log(response);
		var previous_value = $('#quests_filter_subject').val();
		console.log(previous_value);
		$('#quests_filter_subject').html('');
		$('#quests_filter_subject').append('<option value="">*</option>');
		for(var s in response.subjects){
			$('#quests_filter_subject').append('<option value="' + s + '">' + s + ' (' + response.subjects[s] + ')</option>');
		}
		// $('#quests_filter_subject option:contains(' + previous_value + ')').prop({selected: true});
		$('#quests_filter_subject').val(previous_value);
		
		$('#quests_found').html(fhq.t('Opened') + ": " + response.status.open + "; " + fhq.t('Completed') + ": " + response.status.completed);
		var lastSubject = "";
		var len = response.data.length;
		var qs = response.data;
		var el = $('.fhqleftlist .quests .content');
		el.html('');
		for(var i = 0; i < len; i++){
			var q = qs[i];
			if(q.subject != lastSubject){
				lastSubject = q.subject;
				el.append('<div class="icon ' + q.subject + '">' + q.subject + '</div>');
			}
			$('.fhqleftlist .quests .content').append('<div class="fhqleftitem ' + q.status + '" questid="' + q.questid + '"><div class="name">' + q.name + '</div> <div class="score">+' + q.score + '</div></div>');
		}
		$('.fhqleftlist .quests .content .fhqleftitem').unbind('click').bind('click', function(e){
			fhq.ui.loadQuest($(this).attr("questid"));
		});
	}).fail(function(r){
		console.error(r);
	});
}


fhq.ui.loadProposalQuestForm = function(){
	window.fhq.changeLocationState({'proposal_quest':''});
	fhq.ui.showLoading();
	var el = $('#content_page');
	
	if(!fhq.isAuth()){
		fhq.ui.hideLoading();
		el.html(fhq.t('Please authorize: ') + '<button class="btn btn-default" onclick="fhq.ui.showSignInForm();">Sign In</button>');
		return;
	}
	
	el.html('<h1>' + fhq.t('Proposal Quest') + '</h1>'
		+ '<div class="card">'
		+ '		<div class="card-header">Yet not work now.</div>'
		+ '		<div class="card-body">'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_gameid" class="col-sm-2 col-form-label">' + fhq.t('Game') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" id="newquest_gameid"></select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_name" class="col-sm-2 col-form-label">' + fhq.t('Quest Name') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newquest_name">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_text" class="col-sm-2 col-form-label">' + fhq.t('Text') + '</label>'
		+ ' 			<div class="col-sm-10 newquest-text">'
		+ '					<textarea type="text" class="form-control" style="height: 150px" value="" id="newquest_text"></textarea>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_score" class="col-sm-2 col-form-label">' + fhq.t('Score') + ' (+)</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="number" class="form-control" id="newquest_score" value="100">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_subject" class="col-sm-2 col-form-label">' + fhq.t('Subject') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" value="" id="newquest_subject">'
		+ '						<option value="trivia">Trivia</option>'
		+ '						<option value="hashes">Hashes</option>'
		+ '						<option value="stego">Stego</option>'
		+ '						<option value="reverse">Reverse</option>'
		+ '						<option value="recon">Recon</option>'
		+ '						<option value="crypto">Crypto</option>'
		+ '						<option value="forensics">Forensics</option>'
		+ '						<option value="network">Network</option>'
		+ '						<option value="web">Web</option>'
		+ '						<option value="ppc">PPC</option>'
		+ '						<option value="admin">Admin</option>'
		+ '						<option value="enjoy">Enjoy</option>'
		+ '						<option value="unknown">Unknown</option>'
		+ '					</select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_answer" class="col-sm-2 col-form-label">' + fhq.t('Answer') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" id="newquest_answer" value="">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_answerformat" class="col-sm-2 col-form-label">' + fhq.t('Answer format') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" id="newquest_answerformat" value="">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_author" class="col-sm-2 col-form-label">' + fhq.t('Author') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newquest_author">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_copyright" class="col-sm-2 col-form-label">' + fhq.t('Copyright') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newquest_copyright">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div class="btn btn-danger" onclick="fhq.ui.proposalQuest();">' + fhq.t('Send') + '</div>'
		+ '				</div>'
		+ '			</div>'
		+ '		</div>'
		+ '</div>'
	);
	
	window.simplemde = new SimpleMDE({ element: document.getElementById("newquest_text") });
	fhq.ws.games().done(function(r){
		for(var i in r.data){
			$('#newquest_gameid').append('<option value="' + r.data[i]["local_id"] + '">' + r.data[i]["name"] + '</option>');
		}
		fhq.ui.hideLoading();
	});
}

fhq.ui.proposalQuest = function() {
	fhq.ui.showLoading();
	
	var params = {};
	params["gameid"] = parseInt($("#newquest_gameid").val(),10);
	params["name"] = $("#newquest_name").val();
	params["text"] = window.simplemde.value();
	params["score"] = parseInt($("#newquest_score").val(),10);
	params["subject"] = $("#newquest_subject").val();
	params["copyright"] = $("#newquest_copyright").val();
	params["author"] = $("#newquest_author").val();
	params["answer"] = $("#newquest_answer").val();
	params["answer_format"] = $("#newquest_answerformat").val();
	
	console.log(params);
	fhq.ws.quest_proposal(params).done(function(r){
		var el = $('#content_page');
		el.html(fhq.t("Thanks! Your proposal accepted. Administrator contact this you if will be questions"));
		fhq.ui.hideLoading();
	}).fail(function(r){
		fhq.ui.hideLoading();
		fhq.ui.showError(r.error);
	});
};

fhq.ui.importQuest = function() {
	var files = document.getElementById('importquest_zip').files;
	if (files.length == 0) {
		alert("Please select file");
		return;
	}
	/*for(i = 0; i < files.length; i++)
		alert(files[i].name);*/
	
	send_request_post_files(
		files,
		'api/quests/import/',
		createUrlFromObj({}),
		function (obj) {
			if (obj.result == "fail") {
				alert(obj.error.message);
				return;
			}
			closeModalDialog();
			fhq.ui.updateQuests();
			fhq.ui.loadQuest(obj.data.quest.id);
		}
	);
}
	
fhq.ui.importQuestForm = function(){
	var pt = new FHQParamTable();
	pt.row('', 'ZIP: <input id="importquest_zip" type="file" required/>');
	pt.row('', '<div class="fhqbtn" onclick="fhq.ui.importQuest();">Import</div>');
	pt.skip();
	showModalDialog(pt.render());
}

fhq.ui.capitalizeFirstLetter = function(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

fhq.ui.animateSubjects = function(subject){
	var prev_subject = window.opened_subject;
					
	if(subject){
		window.opened_subject = subject;
		window.opened_subject_scroll_top = Math.floor($(document).scrollTop());
	}else{
		window.opened_subject = null;
	}
	
	var els = $('.card.subject-quest');
	var len = els.length;
	var d_width = $(document).width();
	for(var i = 0; i < len; i++){
		var el = $(els[i]);
		if(!subject || el.hasClass(subject)){
			el.css({'max-height': ''});
			el.css({'margin-bottom': ''});
			el.css({transform: ''});
			if(subject){
				el.addClass("head-quests");
			}else{
				el.removeClass("head-quests");
			}
		}else{
			var r_left = Math.random()>0.5 ? -1 : 1;
			
			r_left = r_left*Math.floor(Math.random()*2000 + 1500);
			r_top = -1*Math.floor(Math.random()*2000 + 1000);
			el.css({transform: 'translate(' + r_left + 'px,' + r_top + 'px)'});
			el.css({'max-height': '0px'});
			el.css({'margin-bottom': '0px'});
			el.removeClass("head-quests");
		}
	}
	if(subject){
		$("HTML, BODY").animate({ scrollTop: 0 }, 500);
	}else{
		$("HTML, BODY").animate({ scrollTop: window.opened_subject_scroll_top }, 500);
	}
}

fhq.ui.loadStatSubjectsQuests = function(){
	fhq.changeLocationState({'quests':''});
	window.opened_subject = null;
	fhq.ui.showLoading();
	var el = $('#content_page');
	el.html('Loading...');
	fhq.ws.quests_subjects().done(function(r){
		console.log(r);
		el.html('');
		el.append(fhq.t('You can') + '  <button class="btn btn-secondary" onclick="fhq.ui.loadProposalQuestForm()">'+ fhq.t('Proposal Quest') + "</button><br><br>");
		
		for(var i in r.data){
			var o = r.data[i];
			// style="background-image: url(images/quests/' + o.subject + '_150x150.png)"
			el.append(''
				+ '<div class="card subject-quest open-subject ' + o.subject + '" subject="' + o.subject + '">'
				+ '  <div class="card-body card-left-img ' + o.subject + '">'
				+ '    <h4 class="card-title">' + fhq.ui.capitalizeFirstLetter(o.subject) + '</h4>'
				+ '    <h6 class="card-subtitle mb-2 text-muted">(' + o.count + ' quests)</h6>'
				+ '    <p class="card-text">' + fhq.t(o.subject + '_description') + '</p>'
				// + '	   <button subject="' + o.subject + '" type="button" class="open-subject btn btn-secondary">' + fhq.t('Open') + '</button>'
				// + '	   <button subject="' + o.subject + '" type="button" class="best-subject-users btn btn-default">' + fhq.t('Best users') + '</button>'
				+ '  </div>'
				+ '</div>'
			);
		}
		
		el.append('<div id="content_quests"></div>');
		
		$('.open-subject').unbind().bind('click', function(){
			if(!window.opened_subject){
				var subject = $(this).attr('subject');
				// $('.open-subject').html('<i class="fa fa-chevron-circle-left"></i>   ' + fhq.t('Open Subjects'));
				fhq.ui.animateSubjects(subject);
				fhq.ui.loadQuestsBySubject(subject, true);
			}else{
				// $('.open-subject').html(fhq.t('Open'));
				fhq.ui.animateSubjects();
				$('#content_quests').html('');
				fhq.changeLocationState({'quests':''});
			}
		})
		
		$('.best-subject-users').unbind().bind('click', function(){
			// fhq.ui.loadQuestsBySubject($(this).attr('subject'));
			alert("TODO");
		})
		fhq.ui.hideLoading();
	}).fail(function(r){
		fhq.ui.hideLoading();
		console.error(r);
		el.html('Failed');
	});
}

fhq.ui.loadQuestsBySubject = function(subject, cq){
	fhq.ui.showLoading();
	fhq.changeLocationState({'subject':subject});
	var el = cq ? $('#content_quests') : $('#content_page');
	el.html('Loading...');
	var params = {};
	params.subject = subject;
	fhq.ws.quests(params).done(function(r){
		el.html('');
		// TODO sorting
		var questsData = r.data;
		var questsLen = questsData.length;
		var bSorted = false;
		while (!bSorted) {
			bSorted = true;
			for (var i = 0; i < questsLen-1; i++) {
				var q1 = questsData[i];
				var q2 = questsData[i+1];
				// console.log(q1, q2);
				if (q2.dt_passed === "" && q1.dt_passed !== "") {
					questsData[i] = q2;
					questsData[i+1] = q1;
					bSorted = false;
				}
			}
		}
		

		for(var i in r.data){
			var q = r.data[i];
			el.append(''
				+ '<div class="card">'
				+ '  <div class="card-body card-right-img ' + q.subject + '" style="background-image: url(images/quests/' + q.subject + '_150x150.png)">'
				+ '    <h4 class="card-title" style="' + (q.status == "completed" ? 'text-decoration: line-through;' : '') + '">' +  q.name + ' (+' + q.score + ')</h4>'
				+ '    <h6 class="card-subtitle mb-2 text-muted">Quest #' + q.questid + '</h6>'
				+ '    <p class="card-text">' + fhq.t('Solved') + ': ' + q.solved + '</p>'
				+ '	   <button questid="' + q.questid + '" type="button" class="open-quest btn btn-secondary">' + fhq.t('Open') + '</button>'
				+ '  </div>'
				+ '</div><br>'
			);
		}

		$('.open-quest').unbind().bind('click', function(){
			fhq.ui.loadQuest($(this).attr('questid'));
		});
		fhq.ui.hideLoading();
	}).fail(function(r){
		fhq.ui.hideLoading();
		console.error(r)
		el.html('Failed');
	});
}

/* fhq_quests.js todo redesign */

// http://stackoverflow.com/questions/11076975/insert-text-into-textarea-at-cursor-position-javascript
function editQuestAddLink(filepath, filename, as) {
	var t = document.getElementById('editquest_text');
	var val = '';
	if (as == 'asfile')
		val = '<a class="fhqbtn" target="_ablank" href="' + filepath + '">Download ' + filename + '</a>';
	else if (as == 'asimg')
		val = '<img width="250px" src="' + filepath + '"/>';
	else
		val = filename;
		
	//IE support
    if (document.selection) {
        t.focus();
        sel = document.selection.createRange();
        sel.text = val;
    }
    //MOZILLA and others
    else if (t.selectionStart || t.selectionStart == '0') {
        var startPos = t.selectionStart;
        var endPos = t.selectionEnd;
        t.value = t.value.substring(0, startPos)
            + val
            + t.value.substring(endPos, t.value.length);
    } else {
        t.value += val;
    }
};

function uploadQuestFiles(questid) {
	var files = document.getElementById('editquest_upload_files').files;
	/*for(i = 0; i < files.length; i++)
		alert(files[i].name);*/
	
	send_request_post_files(
		files,
		'api/quests/files_upload.php',
		createUrlFromObj({"questid": questid}),
		function (obj) {
			if (obj.result == "fail") {
				alert(obj.error.message);
				return;
			}
			alert('uploaded!');
			formEditQuest(questid);
		}
	);
}

function removeQuestFile(id, questid)
{
	var params = {};
	params["fileid"] = id;
	// alert(createUrlFromObj(params));

	send_request_post(
		'api/quests/files_remove.php',
		createUrlFromObj(params),
		function (obj) {
			if (obj.result == "ok") {
				alert("removed!");
				formEditQuest(questid);
			} else {
				alert(obj.error.message);
			}
		}
	);
}

fhq.ui.renderQuestAppendButtons = function(el, q){
	el.append(''
		+ '<div class="card">'
		+ '		<div class="card-body" id="quest_btns">'
		+ '			<div class="btn btn-danger" id="quest_report">' + fhq.t('Report an error') + '</div>'
		+ '		</div>'
		+ '</div><br>'
	);

	$('#quest_report').unbind().bind('click', function(){
		fhq.ui.showFeedbackDialog(
			'error',
			fhq.t('Report an error'),
			'GameID: "' + q.gameid + '"\n'
			+ 'Quest: ' + q.name + ', ID: #' + q.id + '\n'
			+ 'Comment:\n'
		);
	});
}

fhq.ui.renderQuestDetails = function(el, q){
	el.append(''
		+ '<div class="card">'
		+ '		<div class="card-header">' + fhq.t('Details') + '</div>'
		+ '		<div class="card-body">'
		+ '			<div class="row">'
		+ '				<div class="col"><strong>' + fhq.t('Subject') + ':</strong> <a href="?subject=' + q.subject + '">' + q.subject + '</a></div>'
		+ '				<div class="col"><strong>' + fhq.t('Score') + ':</strong> +' + q.score + '</div>'
		+ '				<div class="col"><strong>' + fhq.t('Status') + ':</strong> ' + (q.completed ? fhq.t('status_completed') + ' (' + q.dt_passed + ')' : fhq.t('status_open')) + '</div>'
		+ '			</div>'
		+ '			<div class="row">'
		+ '				<div class="col"><strong>' + fhq.t('State') + ':</strong> ' + fhq.t('state_' + q.state) + '</div>'
		+ '				<div class="col"><strong>' + fhq.t('Author') + ':</strong> ' + q.author + '</div>'
		+ '				<div class="col"><strong>' + fhq.t('Copyright') + ':</strong> ' + q.copyright + '</div>'
		+ '			</div>'
		+ '			<div class="row">'
		+ '				<div class="col"><strong>' + fhq.t('Solved') + ':</strong> ' + q.count_user_solved + ' ' + fhq.t('users_solved') + '</div>'
		+ '				<div class="col"></div>'
		+ '				<div class="col"></div>'
		+ '			</div>'
		+ '		</div>'
		+ '		<div class="card-footer">'
		+ '			<script src="//yastatic.net/es5-shims/0.0.2/es5-shims.min.js"></script>'
		+ '			<script src="//yastatic.net/share2/share.js"></script>'
		+ '			<div class="ya-share2" data-services="collections,vkontakte,facebook,odnoklassniki,moimir,gplus,twitter,blogger,reddit,linkedin,lj,viber,whatsapp,skype,telegram"></div>'
		+ '		</div>'
		+ '</div><br>'
	);
}

fhq.ui.renderQuestDescription = function(el, q){
	var converter = new showdown.Converter();
	el.append(''
		+ '<div class="card">'
		+ '		<div class="card-header">' + fhq.t('Description') + '</div>'
		+ '		<div class="card-body">'
		+ converter.makeHtml(q.text)
		+ '		</div>'
		+ '</div><br>'
	);
}

fhq.ui.refreshHints = function(questid, hints){
	var i = 1;
	$('#quest_hints').html('');
	for(var h in hints){
		var hint = hints[h];
		$('#quest_hints').append(''
			+ '<div class="form-row">'
			+ '		<div class="input-group col-md-12">'
			+ '			<span class="input-group-addon">Hint ' + i + ':</span>'
			+ '			<input type="email" class="form-control" id="hint' + i + '" readonly value="">'
			+ '		</div>'
			+ '</div><br>'
		);
		$('#hint' + i).val(hint.text);
		i++;
	}
}

fhq.ui.renderQuestHints = function(el, hi, q){
	if (hi.length > 0) {
		el.append(''
			+ '<div class="card">'
			+ '		<div class="card-header"><a id="quest_show_hints" href="javascript:void(0);">' + fhq.t('Hints') + ' (' + hi.length + ')</a></div>'
			+ '		<div class="card-body" id="quest_hints"  style="display: none">'
			+ '		</div>'
			+ '</div><br>'
		);
		fhq.ui.refreshHints(q.id, hi);
		$('#quest_show_hints').unbind().bind('click', function(){
			if($('#quest_hints').is(":visible")){
				$('#quest_hints').hide();
			}else{
				$('#quest_hints').show();
			}
		});
	}
}

fhq.ui.updateMyAnswers = function(questid){
	fhq.ws.quests_answers({questid: questid}).done(function(response){
		var h = '';
		for (var i = 0; i < response.data.length; ++i) {
			var a = response.data[i];
			h += '<div class="fhq_task_tryanswer">[' + a.datetime_try + ', levenshtein: ' + a.levenshtein + '] ' + a.answer_try + '</div>';
		}
		$('#quest_my_answers').html(h);
	}).fail(function(err){
		$('#quest_my_answers').html('<div class="alert alert-danger">' + err.error + '</div>');
		console.error(err);
	})
}

fhq.ui.renderMyAnswers = function(el, questid){
	el.append(''
		+ '<div class="card">'
		+ '		<div class="card-header"><a id="quest_show_my_answers2" href="javascript:void(0);">' + fhq.t('My Answers') + '</a></div>'
		+ '		<div class="card-body" id="quest_my_answers"  style="display: none">'
		+ '		</div>'
		+ '</div><br>'
	);
	// fhq.ui.refreshHints(q.id, hi);
	$('#quest_show_my_answers2').unbind().bind('click', function(){
		if($('#quest_my_answers').is(":visible")){
			$('#quest_my_answers').hide();
			$('#quest_my_answers').html('');
		}else{
			$('#quest_my_answers').show();
			$('#quest_my_answers').html('loading...');
			fhq.ui.updateMyAnswers(questid);
		}
	});
}


fhq.ui.renderWriteUps = function(el, q){
	var wrcount = q.writeups_count || 0;
	wrcount = wrcount == 0 ? '' : '(' + wrcount + ')';

	el.append(''
		+ '<div class="card">'
		+ '		<div class="card-header"><a id="quest_show_writeups" href="javascript:void(0);">' + fhq.t('Write Up') + ' ' + wrcount + '</a></div>'
		+ '		<div class="card-body" id="quest_writeups"  style="display: none"></div>'
		+ '</div><br>'
	);

	// fhq.ui.refreshHints(questid, q.hints, perm_edit);
	$('#quest_show_writeups').unbind().bind('click', function() {
		if ($('#quest_writeups').is(":visible")) {
			$('#quest_writeups').hide();
		} else {
			$('#quest_writeups').show();
			fhq.ui.loadWriteUps(q.id);
		}
	});
}

fhq.ui.renderQuestStatistics = function(el, q){
	el.append(''
		+ '<div class="card">'
		+ '<div class="card-header">'
		+ '   <a id="quest_show_statistics" href="javascript:void(0);">' + fhq.t('Statistics') + '</a>'
		+ '</div>'
		+ '	<div class="card-body" id="statistics_content" style="display: none;">'
		+ '    <table><tr><td valign=top><canvas id="quest_chart" width="300" height="300"></canvas></td>'
		+ '     <td valign=top id="quest_stat_users"></td></tr></table>'
		+ '	</div>'
		+ '</div>'
	);

	if (q.solved != 0) {
		$('#quest_show_statistics').unbind().bind('click', function(){
			if($('#statistics_content').is(":visible")){
				$('#statistics_content').hide();
			}else{
				$('#statistics_content').show();
				fhq.ui.updateQuestStatistics(q.id);
			}
		});
	}
}

fhq.ui.loadQuest = function(id){
	fhq.ui.showLoading();
	$('#content_page').html('<div class="fhq0009" style="text-align: left"></div>')
	var el = $('.fhq0009');
	el.html('Loading...');
	var questid = parseInt(id,10);
	fhq.ws.quest({'questid': questid}).done(function(response){
		console.log(response);
		var q = response.quest;
		var g = response.game;
		var fi = response.files;
		var hi = response.hints;

		fhq.changeLocationState({quest: q.id});
		el.html('');
		
		el.append(''
			+ '<div class="card alert-secondary">'
			+ '		<div class="card-body card-left-img text-center" id="quest_head" style="background-image: url(' + g.logo + ');">'
			+ '			<div class="card-text">'
			+ '				<a href="?subject=' + q.subject + '">' + fhq.ui.capitalizeFirstLetter(q.subject) + '</a> / '
			+ '				<a href="?quest=' + q.id + '">Quest ' + q.id + '</a>'
			+ '				<div class="card-subtitle mb-2 text-muted d-inline">(' + (q.completed ? fhq.t('Quest completed') : fhq.t('Quest open')) + ')</div>'
			+ '			</div>'
			+ '			<h2 class="card-title">' + q.name + ' (+' + q.score + ')</h2>'
			+ '		</div>'
			+ '</div><br>');

		fhq.ui.renderQuestAppendButtons(el, q);
		fhq.ui.renderQuestDetails(el, q);
		fhq.ui.renderQuestDescription(el, q);

		if(fi.length > 0){
			var files1 = '';						
			for (var k in fi) {
				files1 += '<a class="btn btn-secondary" href="' + fi[k].filepath + '" target="_blank">'+ fi[k].filename + '</a> ';
			}
			
			el.append( ''
				+ '<div class="card">'
				+ '		<div class="card-header">' + fhq.t('Attachments') + '</div>'
				+ '		<div class="card-body">'
				+ files1
				+ '		</div>'
				+ '</div><br>'
			)
		}

		fhq.ui.renderQuestHints(el, hi, q);
		
		if (!q.completed) {
			if(fhq.isAuth()){
				el.append( ''
					+ '<div class="card">'
					+ '		<div class="card-header">' + fhq.t('Answer') + '</div>'
					+ '		<div class="card-body">'
					+ '			<input id="quest_answer" class="form-control" placeholder="' + fhq.t('Answer') + '..." type="text" onkeydown="if (event.keyCode == 13) this.click();"/> '
					+ '			<p><small>' + fhq.t('Answer format') + ': ' + q.answer_format + '</small><p>'
					+ '			<div class="btn btn-info" id="newquestinfo_pass">' + fhq.t('Pass the quest') + '</div>'
					+ '			<br><br><div class="alert alert-danger" style="display: none" id="quest_pass_error"></div>'
					+ '		</div>'
					+ '</div><br>'
				);
				
				$('#newquestinfo_pass').unbind().bind('click', function(){
					var answer = $('#quest_answer').val();
					$('#quest_pass_error').hide();
					fhq.ui.showLoading();
					fhq.ws.quest_pass({questid: q.id, answer: answer}).done(function(r){
						fhq.ui.loadQuest(q.id);
					}).fail(function(r){
						fhq.ui.hideLoading();
						$('#quest_pass_error').html(r.error);
						$('#quest_pass_error').show();
						/*if (fhq.ui.isShowMyAnswers()) {
							fhq.ui.updateMyAnswers(q.questid);
						}*/
					});
				});
				
				fhq.ui.renderMyAnswers(el, q.questid);

			} else {
				el.append( ''
					+ '<div class="card">'
					+ '		<div class="card-header">' + fhq.t('Answer') + '</div>'
					+ '		<div class="card-body">'
					+ '			' + fhq.t('Please authorize for pass the quest') 
					+ '		</div>'
					+ '</div><br>'
				);
			}
		}

		fhq.ui.renderWriteUps(el, q)
		fhq.ui.renderQuestStatistics(el, q);
		fhq.ui.hideLoading();
	}).fail(function(r){
		console.error(r);
		fhq.ui.hideLoading();
		el.html(r.error);
	})
}

// TODO move to admin panel
fhq.ui.questsWriteUpChangeApproveTo = function(writeupid, approve_new_val) {
	fhq.ui.showLoading();
	fhq.ws.quests_writeups_update({
		writeupid: writeupid,
		approve: approve_new_val
	}).done(function(r){
		fhq.ui.hideLoading();
		fhq.ui.loadWriteUps(r.data.questid);
	}).fail(function(err){
		fhq.ui.hideLoading();
		console.log(err);
		fhq.ui.showError("Error: " + err.error);
	})
}

// TODO move to admin panel
fhq.ui.questsWriteUpDelete = function(questid, writeupid) {
	fhq.ui.showLoading();
	fhq.ws.quests_writeups_delete({
		writeupid: writeupid,
	}).done(function(r){
		fhq.ui.hideLoading();
		fhq.ui.loadWriteUps(questid);
	}).fail(function(err){
		fhq.ui.hideLoading();
		console.log(err);
		fhq.ui.showError("Error: " + err.error);
	})
}



fhq.ui.loadWriteUps = function(questid){
	fhq.ui.showLoading();
	var el = $('#quest_writeups');
	el.html('...');
	fhq.ws.quests_writeups_list({questid: questid}).done(function(r){
		el.html('');

		if (!fhq.isAuth()) {
			el.append(''
				+ fhq.t('For a suggest link please authorize: ') + '<button class="btn btn-default" onclick="fhq.ui.showSignInForm();">Sign In</button>'
				+ '<hr>'
			);
		} else {
			el.append(''
				+ '<input class="form-control" type="url" value="" placeholder="https://www.youtube.com/watch?v=gJeOeTGI7T8" id="quests_writeups_proposal_link"><br>'
				+ '<div class="btn btn-info" id="quests_writeups_proposal_send">' + fhq.t('Suggest a link') + '</div><hr>'
			);
		}
		
		if (r.data.length == 0) {
			el.append(
				fhq.t('No solutions yet')
			);
		} else {
			var writeups = r.data;
			for (var i = 0; i < writeups.length; i++) {
				var writeup = r.data[i];
				el.append('<strong>[writeup#' + writeup.writeupid + ']');
				if (writeup.type == 'youtube_video') {
					if (writeup.userid != 0) {
						el.append('<div class="alert alert-info">'
							+ 'Write Up by user '
							+ fhq.ui.makeUserIcon(writeup.userid, writeup.user_logo, writeup.user_nick)
							+ ' at ' + writeup.dt
							+ '</div>'
						);
					}

					if (writeup.approve == 0) {
						el.append('<div class="alert alert-warning">'
							+ '<strong>Awaiting approval by admin</strong>'
							+ '</div>'
						);
					}

					// TODO move to admin panel
					if (fhq.isAdmin()) {
						var newapproveval = 0;
						var newapproveval_btnname = 0;
						if (writeup.approve == 0) {
							newapproveval = 1;
							newapproveval_btnname = 'Approve';
						} else {
							newapproveval = 0;
							newapproveval_btnname = 'Withdraw approval';
						}
						el.append(''
							+ ' <div class="alert alert-danger">'
							+ ' Admin function: '
							+ ' <button class="btn btn-danger" onclick="fhq.ui.questsWriteUpChangeApproveTo(' + writeup.writeupid + ', ' + newapproveval + ');">' + newapproveval_btnname + '</button> '
							+ ' <button class="btn btn-danger" onclick="fhq.ui.questsWriteUpDelete(' + questid + ', ' + writeup.writeupid + ');">Remove</button> '
							+ ' </div>');
					}

					el.append('<center>'
						+ '<iframe width="560" height="315" src="' + writeup.link + '" frameborder="0" allowfullscreen></iframe>'
						+ '<center>'
						+ '<hr>');
				} else {
					el.append('TODO ' + writeup.type);
				}
				el.append('<hr>');
			}
		}
		$('#quests_writeups_proposal_send').unbind().bind('click', function(){
			var suggest_a_link = $('#quests_writeups_proposal_link').val();
			fhq.ui.showLoading();
			fhq.ws.quests_writeups_proposal({questid: questid, writeup_link: suggest_a_link}).done(function(r){
				fhq.ui.hideLoading();
				fhq.ui.loadWriteUps(questid);
			}).fail(function(err){
				fhq.ui.hideLoading();
				console.log(err);
				fhq.ui.showError("Error: " + err.error);
			})
		})
		fhq.ui.hideLoading();
	}).fail(function(r){
		fhq.ui.hideLoading();
		$('#quest_writeups').html(r.error);
	})
}

window.fhq.ui.updateQuestStatistics = function(questid){
	fhq.ui.showLoading();
	fhq.ws.quest_statistics({questid: questid}).fail(function(err){
		console.error(err);
		fhq.ui.hideLoading();
	}).done(function(response){
		var q = response;
		
		// quest_chart
		var options = {
			segmentShowStroke : true,
			segmentStrokeColor : "#606060",
			segmentStrokeWidth : 1,
			percentageInnerCutout : 35, // This is 0 for Pie charts
			animationSteps : 100,
			animationEasing : "easeOutBounce",
			animateRotate : false,
			animateScale : false,
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
		};
		
		var data = [
			{
				value: q.solved,
				color: "#9f9f9f",
				highlight: "#606060",
				label: "Correct"
			},
			{
				value: q.tries,
				color: "#9f9f9f",
				highlight: "#606060",
				label: "Incorrect answers"
			}
		];
		var ctx = document.getElementById('quest_chart').getContext("2d");
		var myNewChart = new Chart(ctx).Doughnut(data, options);
		
		// quest_stat_users
		var usrs = [];
		for (var u in q.users) {
			usrs.push(fhq.ui.makeUserIcon(q.users[u].userid, q.users[u].logo, q.users[u].nick));
		}
		$('#quest_stat_users').html('Users who solved this quest:<br>' + usrs.join(" "));
		fhq.ui.hideLoading();		
	});
}

fhq.ui.showFeedbackDialog = function(type, title, text){
	$('#modalInfoTitle').html(title);
	var f = fhq.ui.templates.feedback_form(title);
	$('#modalInfoBody').html(f.content);
	$('#modalInfoButtons').html(''
		+ '<div class="btn btn-danger" onclick="fhq.ui.feedbackDialogSend();">' + fhq.t('Send') + '</div>'
		+ '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>');
	$('#modalInfo').modal('show');

	// fhq.ui.showModalDialog(fhq.ui.templates.feedback_form(title));
	$('#feedback-type').val(type);
	if (fhq.userinfo) {
		$('#feedback-from').attr({'readonly': ''});
		$('#feedback-from').val(fhq.userinfo.email);
	}
	$('#feedback-text').attr('prefix', text)
	$('#feedback-text').val('');
}

fhq.ui.feedbackDialogSend = function(){
	var text = $('#feedback-text').attr('prefix') + $('#feedback-text').val();
	var from = $('#feedback-from').val();
	var type = $('#feedback-type').val();
	var params = {};
	params.type = type;
	params.from = from;
	params.text = text;
	fhq.ui.showLoading();
	fhq.ws.feedback_add(params).done(function(){
		fhq.ui.closeModalDialog();
		fhq.ui.hideLoading();
	}).fail(function(r){
		alert(r.error);
		fhq.ui.hideLoading();
	})
}

window.fhq.ui.templates = window.fhq.ui.templates || {};

fhq.ui.templates.dialog_btn_cancel = function(){
	return '<div class="fhqbtn" onclick="fhq.ui.closeModalDialog();">' + fhq.t('Cancel') + '</div>';
}

fhq.ui.templates.feedback_form = function(title_text){
	var content = ''
		+ '<div class="card" id="feedback-form">'
		+ '		<div class="card-header">' + fhq.t("Feedback") + '</div>'
		+ '		<div class="card-body">'
		+ '			<div class="form-group row hide">'
		+ '				<label for="feedback-type" class="col-sm-2 col-form-label">' + fhq.t("Target") + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" id="feedback-type">'
		+ '						<option value="error">' + fhq.t("error") + '</option>'
		+ '					</select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row" id="feedback_from_field">'
		+ '				<label for="feedback-from" class="col-sm-2 col-form-label">' + fhq.t("From") + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="email" placeholder="youmail@domain.com" class="form-control" value="" id="feedback-from">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="feedback-text" class="col-sm-2 col-form-label">' + fhq.t("Message") + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<textarea type="text" placeholder="Message" class="form-control" style="height: 150px" value="" id="feedback-text"></textarea>'
		+ '				</div>'
		+ '			</div>'
		+ '		</div>'
		+ '</div>'
	
	return {
		'header' : title_text,
		'content': content,
		'buttons': '<div class="btn btn-danger" onclick="fhq.ui.feedbackDialogSend();">' + fhq.t('Send') + '</div>'
	};
}


window.fhq.ui.createCopyright = function() {
	$("body").append(''
		+ '<div id="copyright">'
		+ '	<center>'
		+ '		<font face="Arial" size=2>Copyright © 2011-2019 sea-kg. | '
		+ '		<a href="?about">About</a> | '
		+ '		ws-connect: <font id="websocket_state">?</font> | '
		+ '		<font id="server_version">?</font>'
		+ '	</center>'
		+ '</div>'
	);
	fhq.ws.updateServerVersion();
}

fhq.ui.render = function(obj){
	if(!(obj instanceof Array)){
		console.error("[RENDER] expected array ", obj);
		return "Failed render";
	}
	var res = '';
	for(var i = 0; i < obj.length; i++){
		var el = obj[i];
		if(typeof(el) == "undefined"){
			console.error("Element is undefined");
		}else if(typeof(el) == "string"){
			res += el;
		}else{
			var a = true;
			if(el.a !== undefined){
				a = el.a;
			}
			if (a){
				res += '<div';
				res += (el.c ? ' class="' + el.c + '" ':'');
				res += (el.id ? ' id="' + el.id + '" ':'');
				res += (el.s ? ' style="' + el.s + '" ':'');
				res += (el.click ? ' onclick="' + el.click + '" ':'');
				res += '>';
				if(el.r){
					if(typeof(el.r) == "number" || typeof(el.r) == "boolean" || typeof(el.r) == "string"){
						res += el.r;
					}else{
						res += fhq.ui.render(el.r);
					}
				}
				res += '</div>'
			}
		}
	}
	return res;
}

/*fhq.ui.paginator = function(min,max,onpage,page,search) {
	
	var content = ''
		+ '<nav><ul class="pagination">';

	var search_form = ""
		+ "<li class='col-md-auto ml-auto input-group custom-search-form'>"
		+ "<input type='text' class='form-control' name='search' id='search_query' value='" + fhq.escapeHtml(search) + "' autofocus "
		+ "  placeholder='Найти...' style='border-right-width: 0px;'>"
		+ "<span class='input-group-btn'>"
		+ "<button class='btn btn-default btn-lg' id='search_apply'><i class='fa fa-search'></i>"
		+ "</button></span>"
		+ "</li>";

	if (max == 0) {
		content += search_form;

		content += ''
			+ "</ul>"
			+ "</nav>";
		
		content += ''
			+ '<div class="card">'
			+ '	<div class="card-body card-left-img trivia not-found">'
			+ ' 	<p>Good news, everyone!</p>'
			+ '     <h5>' + fhq.t("Server found nothing by your request ") + ' <strong><i>"'
			+ fhq.escapeHtml(search)
			+ '" </i></strong></h5>'
			+ '	</div>'
			+ '</div><br>';

		return content;
	}
		

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
	content += '<div class="row">'

	content += '<li class="page-item disabled"> <div class="page-link" tabindex="-1">' + fhq.t('Found') + ': ' + (max-min) + '</div></li>'
	for (var i = 0; i < pagesInt.length; i++) {
		if (pagesInt[i] == -1) {
			content += "<li style='padding-left: 5px; padding-right: 5px;'>  . . .  </li>";
		} else if (pagesInt[i] == page) {
			content += '<li class="page-item active"><div class="page-link">' + (pagesInt[i]+1) + '</div></li>';
		} else {
			var pi = pagesInt[i];
			content += '<li class="page-item ' + (pi == page ? 'active' : '') + '">'
								+'<div class="page-link" onpage="' + onpage + '" page="' + pi + '" search="' + fhq.escapeHtml(search) + '">' + (pi+1) + '</div></li>';
		}
	}

	content += search_form
		+ "</ul>"
		+ "</div>"
		+ "</nav>";
	
	return content;
}

fhq.ui.bindPaginator = function(search){
	$('#search_query').val(search);
	$('#search_query').focus();
	$('#search_query').val('').val(search); // set carret to end of text
	$('#search_query').unbind().bind('keypress', function(e){
		var code = e.keyCode || e.which;
		if(code == 13) {
			$('#search_apply').click();	
		}
	});

	$('#search_apply').unbind().bind('click', function(){
		fhq.pageParams['onpage'] = 5; // TODO change this to global variable
		fhq.pageParams['page'] = 0; // TODO change this to global variable
		fhq.pageParams['search'] = $('#search_query').val();
		fhq.changeLocationState(fhq.pageParams);
		fhq.ui.processParams();
	});

	$('.page-link').unbind().bind('click',function(){
		fhq.pageParams['onpage'] = parseInt($(this).attr('onpage'),10);
		fhq.pageParams['page'] = parseInt($(this).attr('page'),10);
		fhq.pageParams['search'] = $(this).attr('search');
		fhq.changeLocationState(fhq.pageParams);
		fhq.ui.processParams();
	})

}
*/
$(document).ready(function() {
	fhq.ui.createCopyright();
});

