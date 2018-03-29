/* Ver: 1.0.0 Copyright (c) FreeHackQuest */

if(!window.fhq) window.fhq = {};
if(!window.fhq.ws) window.fhq.ws = {};
fhq.ws.lastm = 0;

// helpers

window.fhq.ws.setTokenToCookie = function(token) {
	var date = new Date( new Date().getTime() + (7 * 24 * 60 * 60 * 1000) ); // cookie on week
	document.cookie = "fhqtoken=" + encodeURIComponent(token) + "; path=/; expires="+date.toUTCString();
}

window.fhq.ws.removeTokenFromCookie = function() {
	document.cookie = "fhqtoken=; path=/;";
}

window.fhq.ws.cleanuptoken = function(){
	fhq.token = "";
	fhq.userinfo = {};
	localStorage.removeItem('userinfo');
	fhq.ws.removeTokenFromCookie();
}

window.fhq.ws.getTokenFromCookie = function() {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + "fhqtoken".replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : '';
}

// WebSocket protocol

window.fhq.ws.handlerReceivedChatMessage = function(response){
	fhq.handlerReceivedChatMessage(response);
};
window.fhq.ws.listeners = {}
window.fhq.ws.addListener = function(m, d){
	fhq.ws.listeners[m] = d;
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

window.fhq.ws.setWSState = function(s){
	fhq.ws.WSState = s;
	var el = document.getElementById('websocket_state');
	if(el){
		document.getElementById('websocket_state').innerHTML = s;
	}
}

window.fhq.ws.onconnect = function(){
	
};

window.fhq.ws.initWebsocket = function(){

	fhq.ws.socket = new WebSocket(fhq.ws.base_url);
	// fhq.ws.socket = new WebSocket(protocol + "//freehackquest.com:" + port + "/");
	window.fhq.ws.socket.onopen = function() {
		console.log('WS Opened');
		setTimeout(window.fhq.ws.onconnect,1);
		fhq.ws.setWSState("OK");
		fhq.ws.token();
		fhq.hideLoader();
	};

	window.fhq.ws.socket.onclose = function(event) {
		console.log('Closed');
		fhq.showLoader();
		
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

fhq.ws.send = function(obj, def){
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

fhq.ws.public_info = function(data){
	data = data || {};
	data.cmd = 'public_info';
	return fhq.ws.send(data);
}

fhq.ws.getmap = function(data){
	data = data || {};
	data.cmd = 'getmap';
	return fhq.ws.send(data);
}

fhq.ws.sendChatMessage = function(params){
	params = params || {};
	params.cmd = 'sendchatmessage';
	return fhq.ws.send(params);
}

fhq.ws.sendMessageToAll = function(type, message){
	return fhq.ws.send({
		'cmd': 'sendmessagetoall',
		'type': type,
		'message': message
	});
}

fhq.ws.sendLettersToSubscribers = function(message){
	return fhq.ws.send({
		'cmd': 'send_letters_to_subscribers',
		'message': message
	});
}

fhq.ws.updateUserProfileAsync = function(){
	setTimeout(function(){
		fhq.ws.user().done(function(r){
			fhq.userinfo = {};
			fhq.userinfo.id = r.data.id;
			fhq.userinfo.nick = r.data.nick;
			fhq.userinfo.email = r.data.email;
			fhq.userinfo.role = r.data.role;
			fhq.userinfo.logo = r.data.logo;
			$(document).ready(function(){
				fhq.processParams();
			});
		}).fail(function(){
			fhq.ws.cleanuptoken();
			$(document).ready(function(){
				fhq.processParams();
			});
		});
	},10);
}

fhq.ws.token = function(){
	var d = $.Deferred();
	fhq.ws.send({
		'cmd': 'token',
		'token': fhq.ws.getTokenFromCookie()
	}).done(function(r){
		fhq.ws.updateUserProfileAsync();
	}).fail(function(r){
		fhq.ws.cleanuptoken();
		$(document).ready(function(){
			fhq.processParams();
		});
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
		fhq.ws.setTokenToCookie(r.token);
		$(document).ready(function(){
			fhq.processParams();
		});
		fhq.ws.updateUserProfileAsync();	
		d.resolve(r);
		// try{fhq.ws.socket.close();fhq.ws.initWebsocket()}catch(e){console.error(e)};
	}).fail(function(err){
		fhq.ws.cleanuptoken();
		d.reject(err);
	})
	return d;
}

fhq.ws.users = function(params){
	params = params || {};
	params.cmd = 'users';
	return fhq.ws.send(params);
}

fhq.ws.mails_list = function(params){
	params = params || {};
	params.cmd = 'mails_list';
	return fhq.ws.send(params);
}

fhq.ws.mail_send = function(params){
	params = params || {};
	params.cmd = 'mail_send';
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

fhq.ws.writeups = function(params){
	params = params || {};
	params.cmd = 'writeups';
	return fhq.ws.send(params);
}

fhq.ws.answerlist = function(params){
	params = params || {};
	params.cmd = 'answerlist';
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

fhq.ws.api = function(params){
	params = params || {};
	params.cmd = 'api';
	return fhq.ws.send(params);
}

fhq.ws.games = function(params){
	params = params || {};
	params.cmd = 'games';
	return fhq.ws.send(params);
}

fhq.ws.createquest = function(params){
	params = params || {};
	params.cmd = 'createquest';
	return fhq.ws.send(params);
}

fhq.ws.quest_delete = function(params){
	params = params || {};
	params.cmd = 'quest_delete';
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

fhq.ws.game_create = function(data){
	data = data || {};
	data.cmd = 'game_create';
	return fhq.ws.send(data);
}

fhq.ws.game_delete = function(data){
	data = data || {};
	data.cmd = 'game_delete';
	return fhq.ws.send(data);
}

fhq.ws.game_export = function(data){
	data = data || {};
	data.cmd = 'game_export';
	return fhq.ws.send(data);
}

fhq.ws.game_import = function(data){
	data = data || {};
	data.cmd = 'game_import';
	return fhq.ws.send(data);
}

fhq.ws.game_info = function(data){
	data = data || {};
	data.cmd = 'game_info';
	return fhq.ws.send(data);
}

fhq.ws.game_update = function(data){
	data = data || {};
	data.cmd = 'game_update';
	return fhq.ws.send(data);
}

fhq.ws.game_update_logo = function(data){
	data = data || {};
	data.cmd = 'game_update_logo';
	return fhq.ws.send(data);
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

fhq.ws.quests_proposal_list = function(data){
	data = data || {};
	data.cmd = 'quests_proposal_list';
	return fhq.ws.send(data);
}

fhq.ws.user_change_password = function(data){
	data = data || {};
	data.cmd = 'user_change_password';
	return fhq.ws.send(data);
}

fhq.ws.user_create = function(data){
	data = data || {};
	data.cmd = 'user_create';
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
if(!window.fhq) window.fhq = {};

fhq.localization = {
	'News' : {
		'en': 'News',
		'ru': 'Новости'
	},
	'Quests' : {
		'en': 'Quests',
		'ru': 'Задачи'
	},
	'Tools' : {
		'en': 'Tools',
		'ru': 'Инструменты'
	},
	'Classbook' : {
		'en': 'Classbook',
		'ru': 'Учебник'
	},
	'Archive' : {
		'en': 'Archive',
		'ru': 'Архив'
	},
	'About' : {
		'en': 'About',
		'ru': 'О проекте'
	},
	'Create' : {
		'en': 'Create',
		'ru': 'Создать'
	},
	'Import' : {
		'en': 'Import',
		'ru': 'Импортировать'
	},
	'Account' : {
		'en': 'Account',
		'ru': 'Аккаунт'
	},
	'Sign-in': {
		'en': 'Sign-in',
		'ru': 'Вход'
	},
	'Sign-in with Google': {
		'en': 'Sign-in with Google',
		'ru': 'Вход через Google'
	},
	'Sign-up': {
		'en': 'Sign-up',
		'ru': 'Регистрация'
	},
	'Forgot password?': {
		'en': 'Forgot password?',
		'ru': 'Забыли пароль?'
	},
	'Sign-out': {
		'en': 'Sign-out',
		'ru': 'Выход'
	},
	'Statistics': {
		'en': 'Statistics',
		'ru': 'Статистика'
	},
	'Top 10': {
		'en': 'Top 10',
		'ru': 'Топ 10'
	},
	'License': {
		'en': 'License',
		'ru': 'Лицензия'
	},
	'Virtual Machine': {
		'en': 'Virtual Machine',
		'ru': 'Виртуальная машина'
	},
	'Developers and designers':{
		'en': 'Developers and designers',
		'ru': 'Разработчики и дизайнеры'
	},
	'Join the dark side...':{
		'en': 'Join the dark side...',
		'ru': 'На темную сторону!'
	},
	'You are on the dark side. Turn back?': {
		'en': 'You are on the dark side. Turn back?',
		'ru': 'Вернуться на светлую сторону?'
	},
	'This is an open source platform for competitions in computer security.':{
		'en': 'This is an open source platform for competitions in computer security.',
		'ru': 'Это платформа с открытым исходным кодом для проведения соревнований по компьютерной безопасности.'
	},
	'All attempts':{
		'en': 'All attempts',
		'ru': 'Всего попыток'
	},
	'Already solved':{
		'en': 'Already solved',
		'ru': 'Уже решено'
	},
	'Users online':{
		'en': 'Users online',
		'ru': 'Пользователей онлайн'
	},
	'Playing with us':{
		'en': 'Playing with us',
		'ru': 'С нами играют'
	},
	'team':{
		'en': 'team',
		'ru': 'команда'
	},
	'Contacts':{
		'en': 'Contacts',
		'ru': 'Контакты'
	},
	'Thanks for':{
		'en': 'Thanks for',
		'ru': 'Благодарности'
	},
	'Source code':{
		'en': 'Source code',
		'ru': 'Исходный код'
	},
	'Distribution': {
		'en': 'Distribution',
		'ru': 'Распространение'
	},
	'Deb package':{
		'en': 'Deb package',
		'ru': 'Deb пакет'
	},
	'Donate':{
		'en': 'Donate',
		'ru': 'пожертвования'
	},
	'Contacts':{
		'en': 'Contacts',
		'ru': 'Контакты'
	},
	'Light': {
		'en': 'Light',
		'ru': 'Светлый'
	},
	'Dark': {
		'en': 'Dark',
		'ru': 'Темный'
	},
	'Subject': {
		'en': 'Subject',
		'ru': 'Раздел'
	},
	'Status': {
		'en': 'Status',
		'ru': 'Статус'
	},
	'Opened': {
		'en': 'Opened',
		'ru': 'Открытые'
	},
	'Completed': {
		'en': 'Completed',
		'ru': 'Завершенные'
	},
	'Quest completed': {
		'en': 'Quest completed',
		'ru': 'Задача завершена'
	},
	'Quest open': {
		'en': 'Quest open',
		'ru': 'Задача не решена'
	},
	'Search': {
		'en': 'Search',
		'ru': 'Найти'
	},
	'Details':{
		'en': 'Details',
		'ru': 'Детали'
	},
	'Description':{
		'en': 'Description',
		'ru': 'Описание'
	},
	'Attachments':{
		'en': 'Attachments',
		'ru': 'Прикрепленные файлы'
	},
	'Hints':{
		'en': 'Hints',
		'ru': 'Подсказки'
	},
	'Statistics':{
		'en': 'Statistics',
		'ru': 'Статистика'
	},
	'Export':{
		'en': 'Export',
		'ru': 'Экспорт'
	},
	'Delete':{
		'en': 'Delete',
		'ru': 'Удалить'
	},
	'Edit':{
		'en': 'Edit',
		'ru': 'Изменить'
	},
	'Loading...':{
		'en': 'Loading...',
		'ru': 'Загрузка...'
	},
	'Score': {
		'en': 'Score',
		'ru': 'Очки'
	},
	'State': {
		'en': 'State',
		'ru': 'Состояние'
	},
	'Solved': {
		'en': 'Solved',
		'ru': 'Решили'
	},
	'Author': {
		'en': 'Author',
		'ru': 'Автор'
	},
	'Copyright': {
		'en': 'Copyright',
		'ru': 'Авторские права'
	},
	'Min-Score': {
		'en': 'Minimal Score',
		'ru': 'Минимальные очки'
	},
	'users_solved':{
		'en': 'users',
		'ru': 'пользователей'
	},
	'My Answers':{
		'en': 'My Answers',
		'ru': 'Мои ответы',
	},
	'Answer': {
		'en': 'Answer',
		'ru': 'Ответ'
	},
	'state_closed':{
		'en': 'Not available',
		'ru': 'Недоступна'
	},
	'state_open':{
		'en': 'Available',
		'ru': 'Доступна'
	},
	'status_open':{
		'en': 'open',
		'ru': 'не решена'
	},
	'status_completed':{
		'en': 'completed',
		'ru': 'решена'
	},
	'Pass the quest': {
		'en': 'Pass the quest',
		'ru': 'Проверить ответ'
	},
	'Report an error':{
		'en': 'Report an error',
		'ru': 'Сообщить об ошибке'
	},
	'Your Profile': {
		'en': 'Your Profile',
		'ru': 'Ваш Профиль'
	},
	'Reset': {
		'en': 'Reset',
		'ru': 'Сбросить'
	},
	'Reset password': {
		'en': 'Reset password',
		'ru': 'Сбросить пароль'
	},
	'Cancel': {
		'en': 'Cancel',
		'ru': 'Отмена'
	},
	'Game': {
		'en': 'Game',
		'ru': 'Игра'
	},
	'Other': {
		'en': 'Other',
		'ru': 'Еще...'
	},
	'admin_description':{
		'en': 'Administration',
		'ru': 'Администрирование'
	},
	'crypto_description':{
		'en': 'Сryptography',
		'ru': 'Криптография'
	},
	'enjoy_description':{
		'en': 'Quests for fun',
		'ru': 'Задачи для удовольствия'
	},
	'forensics_description':{
		'en': 'Computer forensic examination',
		'ru': 'Компьютерно-криминалистическая экспертиза'
	},
	'hashes_description':{
		'en': 'Data recovery by their hash values',
		'ru': 'Восстановление данных по их хэш значениям'
	},
	'network_description':{
		'en': 'Knowledge of network infrastructure and protocols',
		'ru': 'Знание сетевой инфраструктуры и протоколов'
	},
	'ppc_description':{
		'en': 'Professional programming and coding',
		'ru': 'Олимпиадное программирование'
	},
	'recon_description':{
		'en': 'Competitive intelligence',
		'ru': 'Конкурентная разведка'
	},
	'reverse_description':{
		'en': '(Reverse engineering) Analysis of the binary code',
		'ru': '(Reverse engineering) Анализ бинарного кода'
	},
	'stego_description':{
		'en': 'Steganography',
		'ru': 'Стеганография'
	},
	'trivia_description':{
		'en': 'Simple quests for warming up',
		'ru': 'Простые задачи для разогрева'
	},
	'web_description':{
		'en': 'Search and use of web vulnerabilities',
		'ru': 'Поиск и использование веб-уязвимостей'
	},
	'misc_description':{
		'en': 'Miscellaneous',
		'ru': 'Разное'
	},
	'Please authorize for pass the quest':{
		'en': 'Please authorize for pass the quest',
		'ru': 'Пожалуйста авторизуйтесь для проверки ответа'
	},
	'A set of useful articles':{
		'en': 'A set of useful articles',
		'ru': 'Набор полезных статей'
	},
	'Useful tools':{
		'en': 'Useful tools',
		'ru': 'Полезные инструменты'
	},
	'Games':{
		'en': 'Games',
		'ru': 'Игры'
	},
	'List of games':{
		'en': 'List of games',
		'ru': 'Список игр'
	},
	'Feedback':{
		'en': 'Feedback',
		'ru': 'Обратная связь'
	},
	'Send feedback':{
		'en': 'Send feedback',
		'ru': 'Отправить отзыв'
	},
	'Users':{
		'en': 'Users',
		'ru': 'Пользователи'
	},
	'Rating of users':{
		'en': 'Rating of users',
		'ru': 'Рейтинг пользователей'
	},
	'Create Game':{
		'en': 'Create Game',
		'ru': 'Создать игру'
		
	},
	'Import Game':{
		'en': 'Import Game',
		'ru': 'Импортировать игру'
	},
	'Organizators':{
		'en': 'Organizators',
		'ru': 'Организаторы'
	},
	'complaint':{
		'en': 'Complaint',
		'ru': 'Жалоба'
	},
	'defect':{
		'en': 'Defect',
		'ru': 'Недочет'
	},
	'error':{
		'en': 'Error',
		'ru': 'Ошибка'
	},
	'approval':{
		'en': 'Approval',
		'ru': 'Одобрение'
	},
	'proposal':{
		'en': 'Proposal',
		'ru': 'Предложение'
	},
	'question':{
		'en': 'Question',
		'ru': 'Вопрос'
	},
	'Target':{
		'en': 'Target',
		'ru': 'Назначение'
	},
	'From':{
		'en': 'From',
		'ru': 'От'
	},
	'Message':{
		'en': 'Message',
		'ru': 'Сообщение'
	},
	'Error':{
		'en': 'Error',
		'ru': 'Ошибка'
	},
	'Send':{
		'en': 'Send',
		'ru': 'Отправить'
	},
	'New Feedback':{
		'en': 'New Feedback',
		'ru': 'Написать отзыв'
	},
	'Write Up':{
		'en': 'Write Up',
		'ru': 'Решение'
	},
	'No solutions yet':{
		'en': 'No solutions yet',
		'ru': 'Пока нет ни одного решения'
	},
	'Add':{
		'en': 'Add',
		'ru': 'Добавить'
	},
	'Scoreboard':{
		'en': 'Scoreboard',
		'ru': 'Рейтинг'
	},
	'Answer List':{
		'en': 'Answer List',
		'ru': 'Ответы пользователей'
	},
	'Server Info':{
		'en': 'Server Info',
		'ru': 'Информация о сервере'
	},
	'User':{
		'en': 'User',
		'ru': 'Пользователь'
	},
	'Quest':{
		'en': 'Quest',
		'ru': 'Задача'
	},
	'Passed':{
		'en': 'Passed',
		'ru': 'Сдан'
	},
	'Found':{
		'en': 'Found',
		'ru': 'Найдено'
	},
	'Create News':{
		'en': 'Create News',
		'ru': 'Создать новость'
	},
	'Type':{
		'en': 'Type',
		'ru': 'Тип'
	},
	'Warning':{
		'en': 'Warning',
		'ru': 'Предупреждение'
	},
	'Information':{
		'en': 'Information',
		'ru': 'Информация'
	},
	'Confirm':{
		'en': 'Confirm',
		'ru': 'Подтверждение'
	},
	'Are you sure delete news':{
		'en': 'Are you sure delete news',
		'ru': 'Уверены что хотите удалить новость'
	},
	'Yes':{
		'en': 'Yes',
		'ru': 'Да'
	},
	'If you found old version please contact me by mrseakg@gmail.com for get newest version':{
		'en': 'If you found old version please contact me by mrseakg@gmail.com for get newest version',
		'ru': 'Если там старая версия пожалуйста напишите на ящик mrseakg@gmail.com с просьбой обновить версию',
	},
	'API':{
		'en': 'API',
		'ru': 'API'
	},
	'Create Quest':{
		'en': 'Create Quest',
		'ru': 'Создать задачу',
	},
	'Skills':{
		'en': 'Skills',
		'ru': 'Навыки',
	},
	'UUID':{
		'en': 'UUID',
		'ru': 'UUID',
	},
	'Text':{
		'en': 'Text',
		'ru': 'Текст',
	},
	'Input\'s parameters':{
		'en': 'Input\'s parameters',
		'ru': 'Входные параметры'
	},
	'Access':{
		'en': 'Access',
		'ru': 'Доступ'
	},
	'Description State':{
		'en': 'Description State',
		'ru': 'Коментарий к состоянию'
	},
	'Name':{
		'en': 'Name',
		'ru': 'Имя'
	},
	'Answer format':{
		'en': 'Answer format',
		'ru': 'Формат ответа'
	},
	'About user':{
		'en': 'About user',
		'ru': 'О пользователе'
	},
	'Server Settings':{
		'en': 'Server Settings',
		'ru': 'Настройки сервера'
	},
	'settings_group_google_map':{
		'en': 'Google Map Settings',
		'ru': 'Google Map Settings'
	},
	'settings_group_mail':{
		'en': 'Mail Settings',
		'ru': 'Mail Settings'
	},
	'settings_group_profile':{
		'en': 'Profile Settings',
		'ru': 'Profile Settings'
	},
	'setting_name_google_map_api_key':{
		'en': 'API Key',
		'ru': 'API Key'
	},
	'setting_name_mail_allow':{
		'en': 'Allow sending',
		'ru': 'Allow sending'
	},
	'setting_name_mail_auth':{
		'en': 'Auth',
		'ru': 'Auth'
	},
	'setting_name_mail_from':{
		'en': 'From',
		'ru': 'From'
	},
	'setting_name_mail_host':{
		'en': 'Host',
		'ru': 'Host'
	},
	'setting_name_mail_password':{
		'en': 'Password',
		'ru': 'Password'
	},
	'setting_name_mail_port':{
		'en': 'Port',
		'ru': 'Port'
	},
	'setting_name_mail_username':{
		'en': 'Username',
		'ru': 'Username'
	},
	'setting_name_mail_system_message_admin_email':{
		'en': 'Admin mail',
		'ru': 'Admin mail'
	},
	'setting_name_profile_change_nick':{
		'en': 'Change nick',
		'ru': 'Change nick'
	},
	'settings_group_server_folders':{
		'en': 'Server folders',
		'ru': 'Server folders'
	},
	'setting_name_server_folder_games':{
		'en': 'Folder for Games Logo on server',
		'ru': 'Folder for Games Logo on server'
	},
	'setting_name_server_folder_games_url':{
		'en': 'Games Logo Files URL',
		'ru': 'Games Logo Files URL'
	},
	'Open':{
		'en': 'Open',
		'ru': 'Открыть'
	},
	'Map':{
		'en': 'Map',
		'ru': 'Карта'
	},
	'Unauthorized': {
		'en': 'Unauthorized',
		'ru': 'Не авторизованный'
	},
	'Admin': {
		'en': 'Admin',
		'ru': 'Администратор'
	},
	'Tester': {
		'en': 'Tester',
		'ru': 'Тестировщик'
	},
	'FreeHackQuest API':{
		'en': 'FreeHackQuest API',
		'ru': 'FreeHackQuest API'
	},
	'Chat':{
		'en': 'Chat',
		'ru': 'Общение'
	},
	'Change password':{
		'en': 'Change password',
		'ru': 'Изменить пароль'
	},
	'Missing information':{
		'en': 'Missing information',
		'ru': 'Информация отсутсвует'
	},
	'Location':{
		'en': 'Location',
		'ru': 'Местонахождение'
	},
	'Country':{
		'en': 'Country',
		'ru': 'Страна',
	},
	'Region':{
		'en': 'Region',
		'ru': 'Регион',
	},
	'City':{
		'en': 'City',
		'ru': 'Город',
	},
	'University':{
		'en': 'University',
		'ru': 'Университет',
	},
	'No detected':{
		'en': 'No detected',
		'ru': 'Не обнаружено',
	},
	'Change user info':{
		'en': 'Change user info',
		'ru': 'Изменить информацию о пользователе',
	},
	'Nick':{
		'en': 'Nick',
		'ru': 'Никнейм',
	},
	'Old password':{
		'en': 'Old password',
		'ru': 'Старый пароль',
	},
	'New password':{
		'en': 'New password',
		'ru': 'Новый пароль',
	},
	'Maximum score':{
		'en': 'Maximum score',
		'ru': 'Максимально очков'
	},
	'Update Logo':{
		'en': 'Update Logo',
		'ru': 'Обновить логотип',
	},
	'On Map':{
		'en': 'On Map',
		'ru': 'На карте',
	},
	'Content':{
		'en': 'Content',
		'ru': 'Содержание',
	},
	'Save':{
		'en': 'Save',
		'ru': 'Сохранить',
	},
	'Admin area':{
		'en': 'Admin area',
		'ru': 'Область администратора'
	},
	'Add record':{
		'en': 'Add record',
		'ru': 'Добавить запись',
	},
	'Classbook Add Record': {
		'en': 'Add record',
		'ru': 'Добавить запись',
	},
	'Classbook Localization Add Record': {
		'en': 'Classbook Localization Add Record',
		'ru': 'Добавить перевод статьи',
	},
	'Language': {
		'en': 'Language',
		'ru': 'Язык',
	},
	'Add localization':{
		'en': 'Add localization',
		'ru': 'Добавить перевод'
	},
	'Delete localization':{
		'en': 'Delete localization',
		'ru': 'Удалить перевод'
	},
	'Edit localization':{
		'en': 'Edit localization',
		'ru': 'Изменить перевод'
	},
	'Close':{
		'en': 'Close',
		'ru': 'Закрыть'
	},
	'Email address':{
		'en': 'Email address',
		'ru': 'Адрес электронной почты'
	},
	'Password':{
		'en': 'Password',
		'ru': 'Пароль'
	},
	'Proposal Quest':{
		'en': 'Proposal Quest',
		'ru': 'Предложить квест'
	},
	'Quest Name':{
		'en': 'Quest Name',
		'ru': 'Название квеста'
	},
	'Please authorize: ':{
		'en': 'Please authorize: ',
		'ru': 'Пожалуйста авторизуйтесь: '
	},
	'Thanks! Your proposal accepted. Administrator contact this you if will be questions':{
		'en': 'Thanks! Your proposal accepted. Administrator contact this you if will be questions',
		'ru': 'Спасибо! Ваше предложение принято. Администратор свяжется с вами через email, если будут вопросы.'
	},
	'You can':{
		'en': 'You can',
		'ru': 'Вы можете'
	}
}
if(!window.fhq) window.fhq = {};

fhq.showLoader = function(){
	$('.fhq-page-loader').show();
}

fhq.s4 = function() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }

fhq.guid = function() {
  return fhq.s4() + fhq.s4() + '-' + fhq.s4() + '-' + fhq.s4() + '-' + fhq.s4() + '-' + fhq.s4() + fhq.s4() + fhq.s4();
};

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
if(!window.fhq) window.fhq = {};
if(!fhq.pages) fhq.pages = [];

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

if(!window.fhq) window.fhq = {};

fhq.createGame = function()  {
	fhq.showLoader();
	$('#game_create_error').hide();

	var data = {};
	data["uuid"] = $("#newgame_uuid").val();
	data["name"] = $("#newgame_name").val();
	data["state"] = $("#newgame_state").val();
	data["form"] = $("#newgame_form").val();
	data["type"] = $("#newgame_type").val();
	data["date_start"] = $("#newgame_date_start").val();
	data["date_stop"] = $("#newgame_date_stop").val();
	data["date_restart"] = $("#newgame_date_restart").val();
	data["description"] = $("#newgame_description").val();
	data["organizators"] = $("#newgame_organizators").val();

	fhq.ws.game_create(data).done(function(r){
		fhq.hideLoader();
		fhq.pages['games']();
	}).fail(function(err){
		fhq.hideLoader();
		console.error(err);
		$('#game_create_error').show();
		$('#game_create_error').html(err.error);
		
	})
};

fhq.pages['game_create'] = function() {
	fhq.changeLocationState({'game_create':''});
	$('#page_name').html('Game Create');
	$('#page_content').html('');
	var el = $('#page_content');
	el.html('');
	fhq.hideLoader();
	
	// TODO game uuid -> generate to backend
	
	el.html(''
		+ '<div class="card">'
		+ '		<div class="card-header">New Game</div>'
		+ '		<div class="card-body">'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_uuid" class="col-sm-2 col-form-label">UUID</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="' + fhq.guid() + '" id="newgame_uuid">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_name" class="col-sm-2 col-form-label">Name</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newgame_name">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_state" class="col-sm-2 col-form-label">State</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" value="" id="newgame_state">'
		+ '						<option value="original">Original</option>'
		+ '						<option value="copy">Copy</option>'
		+ '						<option value="unlicensed-copy">Unlicensed Copy</option>'
		+ '					</select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_form" class="col-sm-2 col-form-label">Form</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" value="" id="newgame_form">'
		+ '						<option value="online">Online</option>'
		+ '						<option value="offline">Offline</option>'
		+ '					</select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_type" class="col-sm-2 col-form-label">Type</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" value="" id="newgame_type">'
		+ '						<option value="jeopardy">Jeopardy</option>'
		+ '					</select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_date_start" class="col-sm-2 col-form-label">Date Start</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" id="newgame_date_start" value="0000-00-00 00:00:00">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_date_stop" class="col-sm-2 col-form-label">Date Stop</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" id="newgame_date_stop" value="0000-00-00 00:00:00">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_date_restart" class="col-sm-2 col-form-label">Date Restart</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" id="newgame_date_restart" value="0000-00-00 00:00:00">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_description" class="col-sm-2 col-form-label">Description</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<textarea type="text" class="form-control" style="height: 150px" value="" id="newgame_description"></textarea>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newgame_organizators" class="col-sm-2 col-form-label">Organizators</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newgame_organizators">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div class="btn btn-secondary" onclick="fhq.createGame();">Create</div>'
		+ '					<div class="btn btn-secondary game-create-cancel">Cancel</div>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div id="game_create_error" class="alert alert-danger" style="display: none"></div>'
		+ '				</div>'
		+ '			</div>'
		+ '		</div>'
		+ '</div>'
	);
	
	$('#newgame_date_start').datetimepicker({
		format:'Y-m-d H:i:s',
		inline:false
	});
	
	$('#newgame_date_stop').datetimepicker({
		format:'Y-m-d H:i:s',
		inline:false
	});
	
	$('#newgame_date_restart').datetimepicker({
		format:'Y-m-d H:i:s',
		inline:false
	});

	$('.game-create-cancel').unbind().bind('click', function(){
		fhq.pages['games']();
	})
}

fhq.updateGame = function()  {
	fhq.showLoader();

	var data = {};
	data["uuid"] = $("#editgame_uuid").val();
	data["name"] = $("#editgame_name").val();
	data["state"] = $("#editgame_state").val();
	data["form"] = $("#editgame_form").val();
	data["type"] = $("#editgame_type").val();
	data["date_start"] = $("#editgame_date_start").val();
	data["date_stop"] = $("#editgame_date_stop").val();
	data["date_restart"] = $("#editgame_date_restart").val();
	data["description"] = $("#editgame_description").val();
	data["organizators"] = $("#editgame_organizators").val();

	fhq.ws.game_update(data).done(function(r){
		fhq.hideLoader();
		fhq.pages['games']();
	}).fail(function(err){
		fhq.hideLoading();
		console.error(err);
	});
};

fhq.pages['game_edit'] = function(gameuuid) {
	$('#page_name').html('Game Edit');
	$('#page_content').html('');
	fhq.showLoader();
	if(!gameuuid){
		gameuuid = fhq.pageParams['game_edit'];
	}
	window.fhq.changeLocationState({'game_edit':gameuuid});
	var el = $('#page_content');
	el.html('Loading... ' + gameuuid);

	fhq.ws.game_info({uuid: gameuuid}).done(function(r){
		fhq.hideLoader();
		el.html(''
			+ '<div class="card">'
			+ '		<div class="card-header">Game Edit</div>'
			+ '		<div class="card-body">'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_uuid" class="col-sm-2 col-form-label">UUID</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<input type="text" readonly class="form-control" value="" id="editgame_uuid">'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_name" class="col-sm-2 col-form-label">Name</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<input type="text" class="form-control" value="" id="editgame_name">'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_state" class="col-sm-2 col-form-label">State</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<select class="form-control" value="" id="editgame_state">'
			+ '						<option value="original">Original</option>'
			+ '						<option value="copy">Copy</option>'
			+ '						<option value="unlicensed-copy">Unlicensed Copy</option>'
			+ '					</select>'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_form" class="col-sm-2 col-form-label">Form</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<select class="form-control" value="" id="editgame_form">'
			+ '						<option value="online">Online</option>'
			+ '						<option value="offline">Offline</option>'
			+ '					</select>'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_type" class="col-sm-2 col-form-label">Type</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<select class="form-control" value="" id="editgame_type">'
			+ '						<option value="jeopardy">Jeopardy</option>'
			+ '					</select>'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_date_start" class="col-sm-2 col-form-label">Date Start</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<input type="text" class="form-control" id="editgame_date_start" value="0000-00-00 00:00:00">'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_date_stop" class="col-sm-2 col-form-label">Date Stop</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<input type="text" class="form-control" id="editgame_date_stop" value="0000-00-00 00:00:00">'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_date_restart" class="col-sm-2 col-form-label">Date Restart</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<input type="text" class="form-control" id="editgame_date_restart" value="0000-00-00 00:00:00">'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_description" class="col-sm-2 col-form-label">Description</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<textarea type="text" class="form-control" style="height: 150px" value="" id="editgame_description"></textarea>'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label for="editgame_organizators" class="col-sm-2 col-form-label">Organizators</label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<input type="text" class="form-control" value="" id="editgame_organizators">'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="form-group row">'
			+ '				<label class="col-sm-2 col-form-label"></label>'
			+ ' 			<div class="col-sm-10">'
			+ '					<div class="btn btn-secondary" onclick="fhq.updateGame();">' + fhq.t('Save') + '</div>'
			+ '					<div class="btn btn-secondary edit-game-cancel">' + fhq.t('Cancel') + '</div>'
			+ '				</div>'
			+ '			</div>'
			+ '		</div>'
			+ '</div>'
		);
		
		$('#editgame_uuid').val(r.data.uuid);
		$('#editgame_name').val(r.data.title);
		$('#editgame_state').val(r.data.state);
		$('#editgame_form').val(r.data.form);
		$('#editgame_type').val(r.data.type_game);
		$('#editgame_date_start').val(r.data.date_start);
		$('#editgame_date_stop').val(r.data.date_stop);
		$('#editgame_date_restart').val(r.data.date_restart);
		$('#editgame_description').val(r.data.description);
		$('#editgame_organizators').val(r.data.organizators);

		$('.edit-game-cancel').unbind().bind('click', function(){
			fhq.pages['games']();
		});

	}).fail(function(err){
		console.error(err);
		fhq.hideLoader();
		el.html(err.error);
	})
}


fhq.gameExport = function(gameuuid){
	fhq.showLoader();
	fhq.ws.game_export({uuid: gameuuid}).done(function(r){
		fhq.hideLoader();
		console.log(r);
		var a = window.document.createElement('a');
		a.href = 'data:application/octet-stream;base64,'  + r.data.zipfile_base64;
		a.download = r.data.zipfile_name;
		// Append anchor to body.
		document.body.appendChild(a);
		a.click();
		// Remove anchor from body
		document.body.removeChild(a);
	}).fail(function(err){
		fhq.hideLoader();
		console.error(err);
	});
}

fhq.gameDelete = function(el){
	var gameuuid = $(el).attr('gameuuid');
	var admin_password = $('#game_delete_admin_password').val();
	fhq.ws.game_delete({uuid: gameuuid, admin_password: admin_password}).done(function(r){
		fhq.pages['games']();
		$('#modalInfo').modal('hide');
	}).fail(function(err){
		console.error(err);
		$('#game_delete_error').show();
		$('#game_delete_error').html(err.error);
	});	
}

fhq.gameUpdateLogo = function(gameid){
	var data = {};
	data.image_png_base64 = $('#game_update_logo_img').attr('src');
	// remove prefix
	data.image_png_base64 = data.image_png_base64.replace("data:image/png;base64,", "");
	data.gameid = gameid;
	fhq.ws.game_update_logo(data).done(function(){
		$('#modalInfo').modal('hide');
		fhq.pages['games']();
	}).fail(function(err){
		$('#game_update_logo_error').show();
		$('#game_update_logo_error').html(err.error);
	});
	
}

fhq.gameUpdateLogoForm = function(gameid){
	$('#modalInfoTitle').html('Game #' + gameid + ' Update Logo');
	$('#modalInfo').modal('show');
	$('#modalInfoBody').html('');
	$('#modalInfoBody').append('<br><center>'
		+ '<input id="game_update_logo_file" type="file"><br>'
		+ '<div class=" alert alert-danger" style="display: none" id="game_update_logo_error"></div>'
		+ '<br>'
		+ '<img id="game_update_logo_img" src="" width=170px height=170px/><br><br>'
		+ '</center>');
	$('#modalInfoButtons').html(
		'<button type="button" class="btn btn-secondary" style="display: none" id="game_update_logo_btn" onclick="fhq.gameUpdateLogo(' + gameid + ');">Update</button> '
		+ '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'
	);
	
	$('#game_update_logo_file').change(function(){
		$('#game_update_logo_error').hide();
		var file = document.getElementById('game_update_logo_file').files[0];
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			var res = reader.result;
			if(res.indexOf("data:image/png;base64,") != 0){
				$('#game_update_logo_btn').hide();
				$('#game_update_logo_error').show();
				$('#game_update_logo_error').html("Only png expected");
			}else{
				$('#game_update_logo_img').attr({
					src: reader.result
				})
				$('#game_update_logo_img').unbind().bind('error', function(){
					$('#game_update_logo_btn').hide();
					$('#game_update_logo_error').show();
					$('#game_update_logo_error').html("Only png expected");
				}).bind('load', function(){
					$('#game_update_logo_btn').show();
				});
			}
		};
	})
}

/*var perms = game.permissions;

				if (fhq.isAdmin()){
					buttons += '<div class="btn btn-danger delete-game" gameuuid="' + game.uuid + '">' + fhq.t('Delete') + '</div>';
					buttons += ' <div class="btn btn-danger edit-game" gameuuid="' + game.uuid + '">' + fhq.t('Edit') + '</div>';
					buttons += ' <div class="btn btn-danger export-game" gameuuid="' + game.uuid + '">' +  fhq.t('Export') + '</div>';
					buttons += ' <div class="btn btn-danger" onclick="fhq.gameUpdateLogoForm(' + game.id + ');">' + fhq.t('Update Logo') + '</div>';
				}
*/

fhq.pages['games'] = function(){
	$('#page_name').html('Games');
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
	
	window.fhq.changeLocationState({'games': '', 'onpage': onpage, 'page': page});

	fhq.ws.games({'onpage': onpage, 'page': page}).done(function(r){
		fhq.hideLoader();
		console.log(r);
		el.html('');
		
		el.append('<button id="game_create" class="btn btn-secondary">Create Game</button>');
		$('#game_create').unbind().bind('click', fhq.pages['game_create']);
		
		el.append('<button id="game_import" class="btn btn-secondary">Import Game</button>');
		$('#game_import').unbind().bind('click', function(){
			alert("TODO");
		});
		
		el.append('<hr>');
		

		el.append(fhq.paginator(0, r.count, r.onpage, r.page));
		el.append('<table class="table table-striped">'
			+ '		<thead>'
			+ '			<tr>'
			+ '				<th>#</th>'
			+ '				<th>Info</th>'
			+ '				<th>Action</th>'
			+ '			</tr>'
			+ '		</thead>'
			+ '		<tbody id="list">'
			+ '		</tbody>'
			+ '</table>'
		)
		for(var i in r.data){
			var g = r.data[i];
			$('#list').append('<tr>'
				+ '	<td> '
				+ '		<image width=100 height=100 src="' + g.logo + '"/><br><br>'
				+ '		<p><button class="btn btn-secondary game-update-logo" gameuuid="' + g.uuid + '" onclick="fhq.gameUpdateLogoForm(' + g.id + ');">Update logo</button></p>'
				+ '</td>'
				+ '	<td>'
				+'		<p>ID: ' + g.id + '</p>'
				+'		<p>uuid: ' + g.uuid + '</p>'
				+'		<p>Title: ' + g.title + '</p>'
				+'		<p>Logo: ' + g.logo + '</p>'
				+ '		<p>Max Score: ' + g.maxscore + '</p>'
				+ '		<p>Type: '  + g.type_game + '</p>'
				+ '		<p>Form: ' + g.form + '</p>'
				+ '		<p>Date Start: '  + g.date_start + '</p>'
				+ '		<p>Date Stop: '  + g.date_stop + '</p>'
				+ '		<p>Date Restart: '  + g.date_restart + '</p>'
				+ '		<p>Organizators: '  + g.organizators + '</p>'
				+ '		<p>State: '  + g.state + '</p>'
				+ '		<p>Description:</p><p>'  + g.description + '</p>'
				+ '</td>'
				+ '	<td>'
				+ '		<p><button class="btn btn-secondary game-remove" gameuuid="' + g.uuid + '">Remove</button></p>'
				+ '		<p><button class="btn btn-secondary game-edit" gameuuid="' + g.uuid + '">Edit</button></p>'
				+ '		<p><button class="btn btn-secondary game-export" gameuuid="' + g.uuid + '">Export</button></p>'
				+ '</td>'
				+ '</tr>'
			);
		}
		
		$('.game-edit').unbind().bind('click', function(){
			var gameuuid = $(this).attr('gameuuid');
			fhq.pages['game_edit'](gameuuid);
		});
		
		$('.game-export').unbind().bind('click', function(){
			var gameuuid = $(this).attr('gameuuid');
			fhq.gameExport(gameuuid);
		})
		
		$('.game-remove').unbind().bind('click', function(){
			console.warn('game_remove');
			var gameuuid = $(this).attr('gameuuid');
			
			$('#modalInfoTitle').html('Game {' + gameuuid + '} confirm deletion');
			$('#modalInfoBody').html('');
			$('#modalInfoBody').append(''
				+ 'Admin password:'
				+ '<input class="form-control" id="game_delete_admin_password" type="password"><br>'
				+ '<div class=" alert alert-danger" style="display: none" id="game_delete_error"></div>'
			);
			$('#modalInfoButtons').html(''
				+ '<button type="button" class="btn btn-secondary" id="game_delet_btn" gameuuid="' + gameuuid + '" onclick="fhq.gameDelete(this);">Delete</button> '
				+ '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'
			);
			$('#modalInfo').modal('show');
		});
	}).fail(function(r){
		fhq.hideLoader();
		console.error(r);
		el.append(r.error);
	})
}
if(!window.fhq) window.fhq = {};
if(!fhq.pages) fhq.pages = [];


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
if(!window.fhq) window.fhq = {};
if(!fhq.pages) fhq.pages = [];

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




if(!window.fhq) window.fhq = {};
if(!fhq.pages) fhq.pages = [];

fhq.pages['quests'] = function(){
	window.fhq.changeLocationState({'quests':''});
	fhq.hideLoader();
	$('#page_name').html('Quests');
	var el = $('#page_content');
	el.html('');
	el.append('<button id="quest_create" class="btn btn-secondary">Quest Create</button>');
	$('#quest_create').unbind().bind('click', fhq.pages['quest_create']);
	
	el.append('<hr>');
}

fhq.pages['quest_create'] = function(){
	$('#page_name').html('Create Quest');
	var el = $('#page_content');
	el.html('');

	window.fhq.changeLocationState({'quest_create':''});
	fhq.hideLoader();
	
	el.html('');
	el.html(''
		+ '<div class="card">'
		+ '		<div class="card-header">' + fhq.t('Create Quest') + '</div>'
		+ '		<div class="card-body">'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_quest_uuid" class="col-sm-2 col-form-label">' + fhq.t('UUID') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="' + fhq.guid() + '" id="newquest_quest_uuid">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_gameid" class="col-sm-2 col-form-label">' + fhq.t('Game') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" id="newquest_gameid"></select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_name" class="col-sm-2 col-form-label">' + fhq.t('Name') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="text" class="form-control" value="" id="newquest_name">'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_text" class="col-sm-2 col-form-label">' + fhq.t('Text') + ' (Use markdown format)</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<textarea type="text" class="form-control" style="height: 150px" value="" id="newquest_text"></textarea>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_score" class="col-sm-2 col-form-label">' + fhq.t('Score') + ' (+)</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<input type="number" class="form-control" id="newquest_score">'
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
		+ '				<label for="newquest_state" class="col-sm-2 col-form-label">' + fhq.t('State') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<select class="form-control" value="" id="newquest_state">'
		+ '						<option value="open">Open</option>'
		+ '						<option value="closed">Closed</option>'
		+ '						<option value="broken">Broken</option>'
		+ '					</select>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label for="newquest_description_state" class="col-sm-2 col-form-label">' + fhq.t('Description State') + '</label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<textarea type="text" class="form-control" style="height: 150px" value="" id="newquest_description_state"></textarea>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div class="btn btn-secondary" onclick="fhq.createQuest();">Create</div>'
		+ '				</div>'
		+ '			</div>'
		+ '			<div class="form-group row">'
		+ '				<label class="col-sm-2 col-form-label"></label>'
		+ ' 			<div class="col-sm-10">'
		+ '					<div id="quest_create_error" class="alert alert-danger" style="display: none"></div>'
		+ '				</div>'
		+ '			</div>'
		+ '		</div>'
		+ '</div>'
	);
	
	fhq.ws.games().done(function(r){
		for(var i in r.data){
			$('#newquest_gameid').append('<option value="' + r.data[i]["id"] + '">' + r.data[i]["title"] + '</option>');
		}
	})
}

fhq.createQuest = function() {
	fhq.showLoader();
	var params = {};
	params["uuid"] = $("#newquest_quest_uuid").val();
	params["gameid"] = parseInt($("#newquest_gameid").val(),10);
	params["name"] = $("#newquest_name").val();
	params["text"] = $("#newquest_text").val();
	params["score"] = parseInt($("#newquest_score").val(),10);
	params["subject"] = $("#newquest_subject").val();
	params["copyright"] = $("#newquest_copyright").val();
	params["author"] = $("#newquest_author").val();
	params["answer"] = $("#newquest_answer").val();
	params["answer_format"] = $("#newquest_answerformat").val();
	params["state"] = $("#newquest_state").val();
	params["description_state"] = $("#newquest_description_state").val();

	fhq.ws.createquest(params).done(function(r){
		fhq.hideLoader();
		// fhq.loadQuest(r.questid);
		fhq.pages['quests']();
	}).fail(function(err){
		fhq.hideLoader();
		console.error(err);
		$('#quest_create_error').show();
		$('#quest_create_error').html(err.error);
		
	});
};
if(!window.fhq) window.fhq = {};
if(!fhq.pages) fhq.pages = [];

fhq.pages['quests_proposal'] = function(){
	$('#page_name').html('Quests Proposal');
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
	
	window.fhq.changeLocationState({'quests_proposal': '', 'onpage': onpage, 'page': page});

	fhq.ws.quests_proposal_list({'onpage': onpage, 'page': page}).done(function(r){
		fhq.hideLoader();
		console.log(r);
		el.html('');
		
		el.append('<hr>');
		

		el.append(fhq.paginator(0, r.count, r.onpage, r.page));
		el.append('<table class="table table-striped">'
			+ '		<thead>'
			+ '			<tr>'
			+ '				<th>#</th>'
			+ '				<th>User</th>'
			+ '				<th>Quest</th>'
			+ '				<th>Confirmed</th>'
			+ '				<th>Action</th>'
			+ '			</tr>'
			+ '		</thead>'
			+ '		<tbody id="list">'
			+ '		</tbody>'
			+ '</table>'
		)
		for(var i in r.data){
			var qp = r.data[i];
			console.log(qp);
			$('#list').append('<tr>'
				+ '	<td> ' + qp.id + '</td>'
				+ '	<td> '
				+ '		<p> UserID: ' + qp.userid + '</p>'
				+ '		<p> Email: ' + qp.email + '</p>'
				+ '		<p> Nick: ' + qp.nick + '</p>'
				+ '</td>'
				+ '	<td> '
				+ '		<p> GameID: ' + qp.gameid + '</p>'
				+ '		<p> Game Title: ' + qp.game_title + '</p>'
				+ '		<p> Subject: ' + qp.subject + '</p>'
				+ '		<p> Name: ' + qp.name + '</p>'
				+ '		<p> Created: ' + qp.created + '</p>'
				+ '</td>'
				+ '	<td> ' + ( qp.confirmed == 0 ? 'pending' : '?') + '</td>'
				+ '	<td>'
				+ '		<p><button class="btn btn-secondary quest-proposal-open" gameuuid="' + qp.uuid + '">Edit</button></p>'
				+ '		<p><button class="btn btn-secondary quest-proposal-remove" gameuuid="' + qp.uuid + '">Remove</button></p>'
				+ '</td>'
				+ '</tr>'
			);
		}

	}).fail(function(r){
		fhq.hideLoader();
		console.error(r);
		el.append(r.error);
	})
}
if(!window.fhq) window.fhq = {};
if(!fhq.pages) fhq.pages = [];

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





// Automaticlly generated FHQ Admin Version
fhq.version = '1.0.0';
console.log('fhq.version='+fhq.version);
