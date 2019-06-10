import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {APP_BASE_HREF} from '@angular/common';

import { L10nConfig, L10nLoader, TranslationModule, StorageStrategy, ProviderType, LogLevel } from 'angular-l10n';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ClassbookComponent } from './classbook/classbook.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ServerApiComponent } from './server-api/server-api.component';
import { MapActivityComponent } from './map-activity/map-activity.component';
import { NewsComponent } from './news/news.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { AutomationUssrComponent } from './automation-ussr/automation-ussr.component';
import { AutomationUssrPresentationComponent } from './automation-ussr-presentation/automation-ussr-presentation.component';
import { AutomationUssrRatingComponent } from './automation-ussr-rating/automation-ussr-rating.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DonateComponent } from './donate/donate.component';
import { UsefulLinksComponent } from './useful-links/useful-links.component';
import { GamesComponent } from './games/games.component';
import { NewFeedbackComponent } from './new-feedback/new-feedback.component';
import { ConfidencialComponent } from './confidencial/confidencial.component';

const l10nConfig: L10nConfig = {
    logger: {
        level: LogLevel.Warn
    },
    locale: {
        languages: [
            { code: 'en', dir: 'ltr' },
            { code: 'it', dir: 'ltr' }
        ],
        language: 'en',
        storage: StorageStrategy.Cookie
    },
    translation: {
        providers: [
            { type: ProviderType.Static, prefix: './assets/locale-' }
        ],
        caching: true,
        composedKeySeparator: '.',
        missingValue: 'No key',
    }
};

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    ClassbookComponent,
    SpinnerComponent,
    ServerApiComponent,
    MapActivityComponent,
    NewsComponent,
    ChatComponent,
    AutomationUssrComponent,
    AutomationUssrPresentationComponent,
    AutomationUssrRatingComponent,
    RegistrationComponent,
    ResetPasswordComponent,
    DonateComponent,
    UsefulLinksComponent,
    GamesComponent,
    NewFeedbackComponent,
    ConfidencialComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    NgbModule,
    HttpClientModule,
    TranslationModule.forRoot(l10nConfig),
    AppRoutingModule,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [{provide: APP_BASE_HREF, useValue: '/new/'}],
  bootstrap: [AppComponent],
  entryComponents: [SpinnerComponent],
})

export class AppModule {
  constructor(public l10nLoader: L10nLoader) {
    this.l10nLoader.load();
  }
}
