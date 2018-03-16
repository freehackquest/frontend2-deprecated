var fs = require('fs');
var CleanCSS = require('clean-css');
var UglifyJS = require("uglify-js");

// detect version
var version = 'unknown';
var pattern = new RegExp(/^[\d]+\.[\d]+\.[\d]+$/);
process.argv.forEach(function (val, index, array) {
	if(pattern.test(val)){
		version = val;
	}
});

// make  datebuild
var date = new Date();
var datebuild = ("" + date.getFullYear()).slice(-2)
				+ ("0" + (date.getMonth()+1)).slice(-2)
				+ ("0" + (date.getDate())).slice(-2);


var minifier_js = [
	'src/admin/js/fhq.ws.admin.js',
	'src/admin/js/fhq.admin.localization.js',
	'src/admin/js/fhq.admin.js',
	'src/admin/js/fhq.admin.users.js',
	'src/admin/js/fhq.admin.games.js',
	'src/admin/js/fhq.admin.mails.js',
	'src/admin/js/fhq.admin.settings.js',
	'src/admin/js/fhq.admin.quests.js',
	'src/admin/js/fhq.admin.orchestra.js',
	'src/admin/js/fhq.admin.version.js'
];

var minifier_css = [
	'src/admin/css/fhq.admin.css'
]

var tasks = [];

// Print build version
tasks.push(function (resolve, reject) {
	console.log("Building version of " + version + " (Build at: " + datebuild + ")");
	resolve();
});

// Autogenaration fhq.version.js
tasks.push(function (resolve, reject) {
	data_version =  "// Automaticlly generated FHQ Admin Version\n";
	data_version += "fhq.version = '" + version + "';\n";
	data_version += "console.log('fhq.version='+fhq.version);\n";
	fs.writeFileSync('src/admin/js/fhq.admin.version.js', data_version);
	resolve("OK");
});

// Build minifier version for js
var comment_js_copyright = "/* Ver: " + version + " Copyright (c) FreeHackQuest */\n\n";
tasks.push(function (resolve, reject) {
	var filename_dst = 'html/admin/js/fhq.admin.min.js'
	console.log("Minifier js-file from '" + minifier_js + "' to '" + filename_dst + "' ... ");
	var result = UglifyJS.minify(minifier_js);
	fs.writeFileSync(filename_dst, comment_js_copyright + result.code);

	// debug version
	var debug_version = comment_js_copyright;
	for(var t in minifier_js){
		debug_version += fs.readFileSync(minifier_js[t]);
	}

	var nfn = filename_dst.replace('.min.', '.debug.');
	fs.writeFileSync(nfn, debug_version);
	
	resolve("OK");
});


// CSS minifies
tasks.push(function (resolve, reject) {

	var filename_src = minifier_css;
	var filename_dst = ['html/admin/css/fhq.admin.min.css'];
	
	console.log("Minifier css-file from '" + filename_src + "' to '" + filename_dst + "' ... ");
	
	var cleancss = new CleanCSS({'rebase': false}).minify(filename_src);
	for(var di in filename_dst){
		fs.writeFileSync(filename_dst[di], cleancss.styles);
	}

	resolve("OK");
});

// RUN ALL TASKS
var currentTask = 0;
function runNextTask(){
	var prom = new Promise(tasks[currentTask]);
	prom.then(function(){
		currentTask++;
		if(currentTask < tasks.length) {
			runNextTask();
		}else{
			console.log('Done.');
		}
	},function(err){
		console.log('Fail.\n' + err);
	});
}
runNextTask();
