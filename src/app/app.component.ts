import { Component, OnInit, Inject } from '@angular/core';
import { LocaleService, TranslationService, Language } from 'angular-l10n';
import { DOCUMENT } from '@angular/platform-browser';

declare var fhq: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title: string = 'FreeHackQuest';
  serverHost: string = 'some';
  currentProtocol: string = 'http:';
  userdata: any = {};

  constructor(
    public locale: LocaleService,
    public translation: TranslationService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.serverHost = document.location.hostname;
    this.currentProtocol = document.location.protocol;
  }

  updateUserData(data) {
    this.userdata = data;
  }

  ngOnInit(): void {
    let baseUrl = 'ws://' + this.serverHost + ':1234/api-ws/';
    if (this.currentProtocol == "https:") {
      baseUrl = 'wss://' + this.serverHost + ':4613/api-wss/';
    }
    
    if (this.serverHost == 'freehackquest.com') {
      baseUrl = 'wss://freehackquest.com/api-wss/';
    }
    // baseUrl = 'ws://freehackquest.com/api-ws/';
    // baseUrl = 'ws://localhost/api-ws/';
    fhq.bind('userdata', (data) => this.updateUserData(data));
    fhq.init({'baseUrl': baseUrl});
  }
}
