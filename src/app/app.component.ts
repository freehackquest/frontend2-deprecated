import { Component, OnInit } from '@angular/core';
import { LocaleService, TranslationService, Language } from 'angular-l10n';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title: string = 'FreeHackQuest';

  constructor(public locale: LocaleService, public translation: TranslationService) {
    // nothing
  }

  ngOnInit(): void {
  }
}
