if(!window.fhq) window.fhq = {};

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
  
fhq.escapeHtml = function (str) {
	return String(str).replace(/[&<>"'`=\/]/g, function (s) {
		return {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'/': '&#x2F;',
			'`': '&#x60;',
			'=': '&#x3D;'
		}[s];
	});
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
