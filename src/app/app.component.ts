import { Component, OnInit, Inject, ChangeDetectorRef, Input } from '@angular/core';
import { LocaleService, TranslationService, Language } from 'angular-l10n';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDialogSignInComponent } from './modal-dialog-sign-in/modal-dialog-sign-in.component';
import { FhqService } from './services/fhq.service';

declare var fhq: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  menuLangIcon: string = '';
  subscription: any;

  constructor(
    public _locale: LocaleService,
    public _translation: TranslationService,
    private _cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _fhq: FhqService,
  ) {
    //
  }

  ngOnInit(): void {
    this.updateLanguage();
    console.log("lang: ", this._locale.getCurrentLanguage());

    this.subscription = this._fhq.changedState
      .subscribe(() => this._cdr.detectChanges());
    this._fhq.connectToServer();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  userSignout() {
    this._fhq.logout();
  }

  selectLanguage(language: string): void {
    this._locale.setCurrentLanguage(language);
    this.updateLanguage();
  }

  updateLanguage() {
    const l = this._locale.getCurrentLanguage();
    this.menuLangIcon = "assets/img/lang_" + l + ".png";
    this._cdr.detectChanges();
  }

  openDialogSignIn() {
    const modalRef = this._modalService.open(ModalDialogSignInComponent);
    modalRef.componentInstance.name = 'SignIn';
  }

}
