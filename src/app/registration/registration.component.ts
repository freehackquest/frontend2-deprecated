import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { LocaleService, TranslationService, Language } from 'angular-l10n';
import { SpinnerService } from '../spinner.service';

declare var fhq: any;

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  errorMessage: string = null;
  successRegistered: boolean = false;
  @ViewChild('registrationEmail') registrationEmail : ElementRef;
  @ViewChild('registrationUniversity') private registrationUniversity: ElementRef;

  constructor(
    public _translation: TranslationService,
    private _spinnerService: SpinnerService,
    private _cdr: ChangeDetectorRef,
  ) { }
 
  ngOnInit() {
  }

  registryTry() {
    this.errorMessage = null;
    this._cdr.detectChanges();

    const email = this.registrationEmail.nativeElement.value.toLowerCase().trim();
    if (email == '') {
      this.errorMessage = 'E-mail required';
      this._cdr.detectChanges();
      return;
    }
    
    const university = this.registrationUniversity.nativeElement.value.toLowerCase().trim();
    const r = this.checkEmail(email);
    if (!r.result) {
      this.errorMessage = r.error;
      this._cdr.detectChanges();
      return;
    }
    this._spinnerService.show();
    fhq.registration({
      "email": email,
      "university": university
    })
      .done((r: any) => this.successResponse(r))
      .fail((err: any) => this.errorResponse(err));
  }

  successResponse(r: any) {
    console.log("successResponse: ", r);
    this.successRegistered = true;
    this._cdr.detectChanges();
    this._spinnerService.hide();
  }

  errorResponse(err: any) {
    console.error("errorResponse: ", err);
    this._spinnerService.hide();
    this.errorMessage = err.error;
    this._cdr.detectChanges();
  }

  checkEmail(email: string) {
    let emailWrongDomains = {};
    emailWrongDomains['yndex.ru'] = {prop: ["yandex.ru"]};
    emailWrongDomains['gmail.ru'] = {prop: ["gmail.com"]};
    emailWrongDomains['gmial.com'] = {prop: ["gmail.com"]};

    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let ret = {result: false, error: ""}
    ret.result = re.test(email);
    if (!ret.result) {
      ret.result = false;
      ret.error = "Format email wrong";
      return ret;
    }
    let domain = email.split("@")[1];
    domain = domain.toLowerCase();

    if (emailWrongDomains[domain]) {
      var t = emailWrongDomains[domain];
      ret.result = false;
      ret.error = this._translation.translate('wrongDomainMaybeMeen') + t.prop.join(",");
    }
    return ret;
  }

}

/*
fhq.ui.registry = function() {
	$('#registration_error').html('');
	var data = {};
	data.email = $('#registration_email').val();
	data.university = $('#registration_university').val();
	fhq.ui.showLoading();
	fhq.ws.registration(data).done(function(r){
		console.log(r);
		
		$('#signup-email').val('');
		$('#signup-captcha').val('');
		$('#signup-info-message').html('');
		$('#signup-error-message').html('');
		fhq.ui.hideLoading();
		$('#content_page').html('Please check your mailbox (also look in spam)');
	}).fail(function(r){
		console.error(r);
		$('#registration_error').html(fhq.t(r.error));
		fhq.ui.hideLoading();
	})
		
}

fhq.ui.loadRegistrationPage = function() {
	fhq.ui.hideLoading();
	fhq.changeLocationState({'registration':''});
	$('#content_page').html('');
	
	$('#content_page').append(''
		+ '<div class="card">'
		+ '  <div class="card-header">' + fhq.t('Registration') + '</div>'
		+ '    <div class="card-body">'
		+ '	<div class="form-group row">'
		+ ' 	<div class="col-sm-4"></div>'
		+ ' 	<div class="col-sm-4">'
		+ '			<label for="registration_email" class="col-form-label">E-mail (required):</label>'
		+ '			<input type="email" placeholder="your@email.com" class="form-control" value="" id="registration_email"/>'
		+ '			<div class="alert alert-danger" style="display: none" id="registration_email_alert">' + fhq.t('Required field email') + '</div>'
		+ '		</div>'
		+ ' 	<div class="col-sm-4"></div>'
		+ '	</div>'
		+ '	<div class="form-group row">'
		+ ' 	<div class="col-sm-4"></div>'
		+ ' 	<div class="col-sm-4">'
		+ '			<label for="registration_university" class="col-form-label">University:</label>'
		+ '			<input type="text" placeholder="university" class="form-control" value="" id="registration_university"/>'
		+ '		</div>'
		+ ' 	<div class="col-sm-4"></div>'
		+ '	</div>'
		+ '	<div class="form-group row">'
		+ ' 	<div class="col-sm-4"></div>'
		+ ' 	<div class="col-sm-4 text-center">'
		+ '			<div class="btn btn-success" onclick="fhq.ui.registry();">Registry</div>'
		+ '		</div>'
		+ ' 	<div class="col-sm-4"></div>'
		+ '	</div>'
		+ '	<div class="form-group row">'
		+ ' 	<div class="col-sm-4"></div>'
		+ ' 	<div class="col-sm-4 text-center" id="registration_error">'
		+ '		</div>'
		+ ' 	<div class="col-sm-4"></div>'
		+ '	</div>'
		+ '  </div>'
		+ '</div>'
	);
	function registrationChangedEmailField() {
		var val = $('#registration_email').val();
		if (val == "") {
			$('#registration_email_alert').hide();
			return;
		}
		var t = fhq.ui.checkEmail(val);
		if (t.result) {
			$('#registration_email_alert').hide();
		} else {
			$('#registration_email_alert').html(t.error);
			$('#registration_email_alert').show();
		}
	}
	$('#registration_email').unbind().bind('change', registrationChangedEmailField);
	$('#registration_email').unbind().bind('keyup', registrationChangedEmailField);
	// fhq.ui.checkEmail

}
*/