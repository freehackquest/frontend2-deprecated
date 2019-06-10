import { Component, OnInit, Inject, ChangeDetectorRef, Input } from '@angular/core';
import { LocaleService, TranslationService, Language } from 'angular-l10n';
import { DOCUMENT } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDialogSignInComponent } from './modal-dialog-sign-in/modal-dialog-sign-in.component';

declare var fhq: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  serverHost: string = 'some';
  currentProtocol: string = 'http:';
  userdata: any = {};
  loggined: boolean = false;
  menuLangIcon: string = '';

  constructor(
    public _locale: LocaleService,
    public _translation: TranslationService,
    @Inject(DOCUMENT) private document: Document,
    private _cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
  ) {
    this.serverHost = document.location.hostname;
    this.currentProtocol = document.location.protocol;
  }

  updateUserData(data: any) {
    console.log("updateUserData: ", data);
    this.loggined = data.nick != undefined;
    this.userdata = data;
    this._cdr.detectChanges();
  }

  ngOnInit(): void {
    this.updateLanguage();
    console.log("lang: ", this._locale.getCurrentLanguage());
    // reconnect
    fhq.bind('disconnected', () => this.connectToFhq() );
    fhq.bind('userdata', (data: any) => this.updateUserData(data));
    this.connectToFhq();
  }

  connectToFhq() {
    console.log("connectToFhq");
    let baseUrl = 'ws://' + this.serverHost + ':1234/api-ws/';
    if (this.currentProtocol == "https:") {
      baseUrl = 'wss://' + this.serverHost + ':4613/api-wss/';
    }
    
    if (this.serverHost == 'freehackquest.com') {
      baseUrl = 'wss://freehackquest.com/api-wss/';
    }
    fhq.init({'baseUrl': baseUrl});
  }

  userSignout() {
    fhq.deinit();
    location.reload();
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
    modalRef.componentInstance.name = 'World';
  }

}
