import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {APP_BASE_HREF} from '@angular/common';

import { L10nConfig, L10nLoader, TranslationModule, StorageStrategy, ProviderType, LogLevel } from 'angular-l10n';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ServerApiComponent } from './pages/server-api/server-api.component';
import { MapActivityComponent } from './pages/map-activity/map-activity.component';
import { NewsComponent } from './pages/news/news.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './pages/chat/chat.component';
import { AutomationUssrComponent } from './pages/automation-ussr/automation-ussr.component';
import { AutomationUssrPresentationComponent } from './pages/automation-ussr-presentation/automation-ussr-presentation.component';
import { AutomationUssrRatingComponent } from './pages/automation-ussr-rating/automation-ussr-rating.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { DonateComponent } from './pages/donate/donate.component';
import { UsefulLinksComponent } from './pages/useful-links/useful-links.component';
import { GamesComponent } from './pages/games/games.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ConfidencialComponent } from './pages/confidencial/confidencial.component';
import { KnowledgeBaseComponent } from './pages/knowledge-base/knowledge-base.component';
import { ModalDialogSignInComponent } from './modal-dialog-sign-in/modal-dialog-sign-in.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { AboutComponent } from './pages/about/about.component';
import { QuestProposalComponent } from './pages/quest-proposal/quest-proposal.component';
import { UserChangePasswordComponent } from './pages/user-change-password/user-change-password.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { AceModule } from 'ngx-ace-wrapper';
import { ACE_CONFIG } from 'ngx-ace-wrapper';
import { AceConfigInterface } from 'ngx-ace-wrapper';
import hljs from 'highlight.js';
import { ScoreboardComponent } from './pages/scoreboard/scoreboard.component';
import { QuestsComponent } from './pages/quests/quests.component';
import { QuestsBySubjectComponent } from './pages/quests-by-subject/quests-by-subject.component';

/*import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);*/

const DEFAULT_ACE_CONFIG: AceConfigInterface = {
};

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
    FeedbackComponent,
    ConfidencialComponent,
    KnowledgeBaseComponent,
    ModalDialogSignInComponent,
    UserProfileComponent,
    AboutComponent,
    QuestProposalComponent,
    UserChangePasswordComponent,
    ScoreboardComponent,
    QuestsComponent,
    QuestsBySubjectComponent,
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
    AceModule,
    LMarkdownEditorModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/new/'
    }, {
      provide: ACE_CONFIG,
      useValue: DEFAULT_ACE_CONFIG
    }],
  bootstrap: [AppComponent],
  entryComponents: [
    SpinnerComponent,
    ModalDialogSignInComponent,
  ],
})

export class AppModule {
  constructor(public l10nLoader: L10nLoader) {
    this.l10nLoader.load();
  }
}
