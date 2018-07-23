if(!window.fhq) window.fhq = {};
if(!window.fhq.ui) window.fhq.ui = {};

window.fhq.ui.paginator = function(min,max,onpage,page,search) {
	
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

window.fhq.ui.bindPaginator = function(search){
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