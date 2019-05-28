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
  
  constructor(public locale: LocaleService, public translation: TranslationService) { }

  ngOnInit() {
    this.translation.translationChanged().subscribe(
      () => { this.title = this.translation.translate('title'); }
  );
  }

  selectLanguage(language: string): void {
    this.locale.setCurrentLanguage(language);
  }
}
