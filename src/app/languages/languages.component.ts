import { Component, OnInit } from '@angular/core';
import { LocaleService, TranslationService, Language } from 'angular-l10n';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.css']
})
export class LanguagesComponent implements OnInit {

  @Language() lang: string;

  title: string = 'FreeHackQuest';
  
  constructor(
    public _locale: LocaleService,
    public _translation: TranslationService
  ) { }

  ngOnInit() {
    this._translation.translationChanged().subscribe(
      () => {
        this.title = this._translation.translate('title');
    });
  }

  selectLanguage(language: string): void {
    this._locale.setCurrentLanguage(language);
  }
}
