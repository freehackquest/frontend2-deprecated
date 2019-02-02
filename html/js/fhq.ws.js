if(!window.fhq) window.fhq = {};
if(!window.fhq.ws) window.fhq.ws = {};
fhq.ws.lastm = 0;

// WebSocket protocol

window.fhq.ws.handlerReceivedChatMessage = function(response){
	fhq.handlerReceivedChatMessage(response);
};
window.fhq.ws.listeners = {}
window.fhq.ws.addListener = function(m, d){
	fhq.ws.listeners[m] = d;
}

fhq.ws.updateServerVersion = function() {
	var el = document.getElementById('server_version');
	if (el && fhq.ws.serverName && fhq.ws.serverVersion) {
		el.innerHTML = fhq.ws.serverName + ': ' + fhq.ws.serverVersion;
	}
}

fhq.ws.handleCommand = function(response){
	if(fhq.ws.listeners[response.m]){
		if(response['error']){
			setTimeout(function(){
				fhq.ws.listeners[response.m].reject(response);
				delete fhq.ws.listeners[response.m];
			},1);
		} else {
			setTimeout(function(){
				fhq.ws.listeners[response.m].resolve(response);
				delete fhq.ws.listeners[response.m];
			},1);
		}
	}else if(response.cmd == "server"){
		fhq.ws.serverName = response.app;
		fhq.ws.serverVersion = response.version;
		console.warn("App: " + response.app);
		console.warn("Version: " + response.version);
		console.warn("All: ", response);
		fhq.ws.updateServerVersion();
	}else if(response.cmd == "notify"){
        fhq.ui.showNotification(response.type, response.section, response.message);
	}else if(response.cmd == "chat"){
		fhq.ws.handlerReceivedChatMessage(response);
	}else{
		console.error("Not found handler for '" + response.cmd + "/" + response.m + "'");
	}
};

window.fhq.ws.WSState = "?";

window.fhq.ws.getWSState = function(){
	return fhq.ws.WSState;
}

window.fhq.ws.setWSState = function(s) {
	fhq.ws.WSState = s;
	var el = document.getElementById('websocket_state');
	if (el) {
		el.innerHTML = s;
	}
}

window.fhq.ws.onconnect = function(){
	
};

window.fhq.ws.initWebsocket = function(){

	fhq.ws.socket = new WebSocket(fhq.ws.base_url);
	window.fhq.ws.socket.onopen = function() {
		console.log('WS Opened');
		setTimeout(window.fhq.ws.onconnect,1);
		fhq.ws.setWSState("OK");
		fhq.ws.token();
	};

	window.fhq.ws.socket.onclose = function(event) {
		console.log('Closed');
		
		if(fhq.ui && fhq.ui.onwsclose){
			fhq.ui.onwsclose();
		}
		
		if (event.wasClean) {
			fhq.ws.setWSState("CLOSED");
		} else {
			fhq.ws.setWSState("BROKEN");
			setTimeout(function(){
				fhq.ws.setWSState("RECONN");
				fhq.ws.initWebsocket();
			}, 10000);
		  // Try reconnect after 5 sec
		}
		console.log('Code: ' + event.code + ' Reason: ' + event.reason);
	};
	fhq.ws.socket.onmessage = function(event) {
		// console.log('Received: ' + event.data);
		try{
			var response = JSON.parse(event.data);
			fhq.ws.handleCommand(response);
		}catch(e){
			console.error(e);
		}
		
	};
	fhq.ws.socket.onerror = function(error) {
		console.log('Error: ' + error.message);
	};
}

fhq.ws.initWebsocket();

window.fhq.ws.send = function(obj, def){
	var d = def || $.Deferred();
	fhq.ws.lastm++;
	obj.m = "m" + fhq.ws.lastm;
	fhq.ws.listeners[obj.m] = d;
	try{
		if(fhq.ws.socket.readyState == 0){
			setTimeout(function(){
				fhq.ws.send(obj, d);
			},1000);
		}else{
			// console.log("ReadyState " + fhq.ws.socket.readyState);
			// console.log("Send " + JSON.stringify(obj));
			fhq.ws.socket.send(JSON.stringify(obj));
		}
	}catch(e){
		console.error(e);
	}
	return d;
}

window.fhq.ws.public_info = function(data){
	data = data || {};
	data.cmd = 'public_info';
	return fhq.ws.send(data);
}

window.fhq.ws.getmap = function(data){
	data = data || {};
	data.cmd = 'getmap';
	return fhq.ws.send(data);
}

window.fhq.ws.sendChatMessage = function(params){
	params = params || {};
	params.cmd = 'sendchatmessage';
	return fhq.ws.send(params);
}

window.fhq.ws.sendMessageToAll = function(type, message){
	return fhq.ws.send({
		'cmd': 'sendmessagetoall',
		'type': type,
		'message': message
	});
}

window.fhq.ws.sendLettersToSubscribers = function(message){
	return fhq.ws.send({
		'cmd': 'send_letters_to_subscribers',
		'message': message
	});
}

fhq.ws.updateUserProfileAsync = function(){
	setTimeout(function(){
		fhq.ws.user().done(function(r){
			fhq.profile.bInitUserProfile == true;
			fhq.profile.university = r.data.university;
			fhq.profile.country = r.data.country;
			fhq.profile.city = r.data.city;
			fhq.userinfo = {};
			fhq.userinfo.id = r.data.id;
			fhq.userinfo.nick = r.data.nick;
			fhq.userinfo.email = r.data.email;
			fhq.userinfo.role = r.data.role;
			fhq.userinfo.logo = r.data.logo;
			fhq.ui.processParamsOnReady();
		}).fail(function(){
			fhq.api.cleanuptoken();
			localStorage.removeItem('userinfo');
			fhq.ui.processParamsOnReady();
		});
	},10);
}

fhq.ws.token = function(){
	var d = $.Deferred();
	fhq.ws.send({
		'cmd': 'token',
		'token': fhq.getTokenFromCookie()
	}).done(function(r){
		// fhq.ui.processParamsOnReady();
		fhq.ws.updateUserProfileAsync();
	}).fail(function(r){
		fhq.api.cleanuptoken();
		fhq.ui.processParamsOnReady();
	});
	return d;
}

fhq.ws.login = function(params){
	var d = $.Deferred();
	params = params || {};
	params.cmd = 'login';
	fhq.ws.send(params).done(function(r){
		fhq.token = r.token;
		console.log(fhq.token);
		fhq.userinfo = r.user;
		localStorage.setItem('userinfo', JSON.stringify(fhq.userinfo));
		fhq.setTokenToCookie(r.token);
		// fhq.ui.processParamsOnReady();
		fhq.ws.updateUserProfileAsync();	
		d.resolve(r);
		// try{fhq.ws.socket.close();fhq.ws.initWebsocket()}catch(e){console.error(e)};
	}).fail(function(err){
		fhq.api.cleanuptoken();
		localStorage.removeItem('userinfo');
		fhq.userinfo = {};
		d.reject(err);
	})
	return d;
}

fhq.ws.users = function(params){
	params = params || {};
	params.cmd = 'users';
	return fhq.ws.send(params);
}

fhq.ws.classbook_list = function(params){
	params = params || {};
	params.cmd = 'classbook_list';
	return fhq.ws.send(params);
}

fhq.ws.classbook_info = function(params){
	params = params || {};
	params.cmd = 'classbook_info';
	return fhq.ws.send(params);
}

fhq.ws.classbook_add_record = function(params){
	params = params || {};
	params.cmd = 'classbook_add_record';
	return fhq.ws.send(params);
}

fhq.ws.classbook_delete_record = function(params){
	params = params || {};
	params.cmd = 'classbook_delete_record';
	return fhq.ws.send(params);
}

fhq.ws.classbook_update_record = function(params){
	params = params || {};
	params.cmd = 'classbook_update_record';
	return fhq.ws.send(params);
}

fhq.ws.classbook_localization_info = function(data){
	data = data || {};
	data.cmd = 'classbook_localization_info';
	return fhq.ws.send(data);
}

fhq.ws.classbook_localization_add_record = function(params){
	params = params || {};
	params.cmd = 'classbook_localization_add_record';
	return fhq.ws.send(params);
}

fhq.ws.classbook_localization_delete_record = function(params){
	params = params || {};
	params.cmd = 'classbook_localization_delete_record';
	return fhq.ws.send(params);
}

fhq.ws.classbook_localization_update_record = function(params){
	params = params || {};
	params.cmd = 'classbook_localization_update_record';
	return fhq.ws.send(params);
}

fhq.ws.addhint = function(params){
	params = params || {};
	params.cmd = 'addhint';
	return fhq.ws.send(params);
}

fhq.ws.deletehint = function(params){
	params = params || {};
	params.cmd = 'deletehint';
	return fhq.ws.send(params);
}

fhq.ws.hints = function(params){
	params = params || {};
	params.cmd = 'hints';
	return fhq.ws.send(params);
}

// for all
fhq.ws.quests_writeups_list = function(params) {
	params = params || {};
	params.cmd = 'quests_writeups_list';
	return fhq.ws.send(params);
}

// only for authorized users
fhq.ws.quests_writeups_proposal = function(params){
	params = params || {};
	params.cmd = 'quests_writeups_proposal';
	return fhq.ws.send(params);
}

// TODO move to admin panel admin function
fhq.ws.quests_writeups_update = function(params){
	params = params || {};
	params.cmd = 'quests_writeups_update';
	return fhq.ws.send(params);
}

// TODO move to admin panel admin function
fhq.ws.quests_writeups_delete = function(params){
	params = params || {};
	params.cmd = 'quests_writeups_delete';
	return fhq.ws.send(params);
}

fhq.ws.scoreboard = function(params){
	params = params || {};
	params.cmd = 'scoreboard';
	return fhq.ws.send(params);
}

fhq.ws.server_info = function(params){
	params = params || {};
	params.cmd = 'server_info';
	return fhq.ws.send(params);
}

fhq.ws.server_settings = function(params){
	params = params || {};
	params.cmd = 'server_settings';
	return fhq.ws.send(params);
}

fhq.ws.server_settings_update = function(params){
	params = params || {};
	params.cmd = 'server_settings_update';
	return fhq.ws.send(params);
}

fhq.ws.publiceventslist = function(params){
	params = params || {};
	params.cmd = 'publiceventslist';
	return fhq.ws.send(params);
}

fhq.ws.createpublicevent = function(params){
	params = params || {};
	params.cmd = 'createpublicevent';
	return fhq.ws.send(params);
}

fhq.ws.deletepublicevent = function(params){
	params = params || {};
	params.cmd = 'deletepublicevent';
	return fhq.ws.send(params);
}

fhq.ws.server_api = function(params){
	params = params || {};
	params.cmd = 'server_api';
	return fhq.ws.send(params);
}

fhq.ws.games = function(params){
	params = params || {};
	params.cmd = 'games';
	return fhq.ws.send(params);
}

fhq.ws.game_info = function(data){
	data = data || {};
	data.cmd = 'game_info';
	return fhq.ws.send(data);
}

fhq.ws.quest_proposal = function(params){
	params = params || {};
	params.cmd = 'quest_proposal';
	return fhq.ws.send(params);
}

fhq.ws.quest_update = function(params){
	params = params || {};
	params.cmd = 'quest_update';
	return fhq.ws.send(params);
}

fhq.ws.quest = function(params){
	params = params || {};
	params.cmd = 'quest';
	return fhq.ws.send(params);
}

fhq.ws.user = function(params){
	params = params || {};
	params.cmd = 'user';
	return fhq.ws.send(params);
}

fhq.ws.registration = function(params){
	params = params || {};
	params.cmd = 'registration';
	return fhq.ws.send(params);
}

fhq.ws.user_reset_password = function(params){
	params = params || {};
	params.cmd = 'user_reset_password';
	return fhq.ws.send(params);
}

fhq.ws.user_answers = function(params){
	params = params || {};
	params.cmd = 'user_answers';
	return fhq.ws.send(params);
}

fhq.ws.user_skills = function(params){
	params = params || {};
	params.cmd = 'user_skills';
	return fhq.ws.send(params);
}

fhq.ws.quests_subjects = function(data){
	data = data || {};
	data.cmd = 'quests_subjects';
	return fhq.ws.send(data);
}

fhq.ws.quests = function(data){
	data = data || {};
	data.cmd = 'quests';
	return fhq.ws.send(data);
}

fhq.ws.user_change_password = function(data){
	data = data || {};
	data.cmd = 'user_change_password';
	return fhq.ws.send(data);
}

fhq.ws.user_update = function(data){
	data = data || {};
	data.cmd = 'user_update';
	return fhq.ws.send(data);
}

fhq.ws.feedback_add = function(data){
	data = data || {};
	data.cmd = 'feedback_add';
	return fhq.ws.send(data);
}

fhq.ws.quest_pass = function(data){
	data = data || {};
	data.cmd = 'quest_pass';
	return fhq.ws.send(data);
}

fhq.ws.quest_statistics = function(data){
	data = data || {};
	data.cmd = 'quest_statistics';
	return fhq.ws.send(data);
}
