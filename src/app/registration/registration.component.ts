import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { TranslationService } from 'angular-l10n';
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
