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





