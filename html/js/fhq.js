if(!window.fhq) window.fhq = {};
if(!window.fhq.api) window.fhq.api = {};

window.fhq.createUrlFromObj = function(obj) {
	var str = "";
	for (k in obj) {
		if (str.length > 0)
			str += "&";
		str += encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
	}
	return str;
};

window.fhq.setTokenToCookie = function(token) {
	var date = new Date( new Date().getTime() + (7 * 24 * 60 * 60 * 1000) ); // cookie on week
	document.cookie = "fhqtoken=" + encodeURIComponent(token) + "; path=/; expires="+date.toUTCString();
}

window.fhq.removeTokenFromCookie = function() {
	document.cookie = "fhqtoken=; path=/;";
}

window.fhq.getTokenFromCookie = function() {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + "fhqtoken".replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : '';
}

window.fhq.client = "fhq.js";
fhq.token = fhq.getTokenFromCookie();

		
window.fhq.profile = {
	lastEventId: 0,
	bInitUserProfile: false
};
fhq.cache = {};
fhq.cache.gameid = 0;

window.fhq.supportsHtml5Storage = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

fhq.isAuth = function(){
	return fhq.token && fhq.token != "";
}

fhq.isAdmin = function(){
	if(fhq.userinfo){
		return fhq.userinfo.role == "admin";
	}
	return false;
}

fhq.api.cleanuptoken = function(){
	fhq.token = "";
	fhq.removeTokenFromCookie();
}

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();
