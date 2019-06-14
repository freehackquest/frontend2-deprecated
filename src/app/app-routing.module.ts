import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ServerApiComponent } from './server-api/server-api.component';
import { MapActivityComponent } from './map-activity/map-activity.component';
import { NewsComponent } from './news/news.component';
import { ChatComponent } from './chat/chat.component';
import { AutomationUssrComponent } from './automation-ussr/automation-ussr.component';
import { AutomationUssrPresentationComponent } from './automation-ussr-presentation/automation-ussr-presentation.component';
import { AutomationUssrRatingComponent } from './automation-ussr-rating/automation-ussr-rating.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DonateComponent } from './donate/donate.component';
import { UsefulLinksComponent } from './useful-links/useful-links.component';
import { GamesComponent } from './games/games.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ConfidencialComponent } from './confidencial/confidencial.component';
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';

const routes: Routes = [{
    path: 'knowledge-base',
    component: KnowledgeBaseComponent
  }, {
    path: 'knowledge-base/:id',
    component: KnowledgeBaseComponent
  }, {
    path: 'server-api',
    component: ServerApiComponent
  }, {
    path: 'map-activity',
    component: MapActivityComponent
  }, {
    path: 'news',
    component: NewsComponent
  }, {
    path: 'news/:id',
    component: NewsComponent
  }, {
    path: 'user-profile',
    component: UserProfileComponent
  }, {
    path: 'chat',
    component: ChatComponent
  }, {
    path: 'automation-ussr',
    component: AutomationUssrComponent
  }, {
    path: 'automation-ussr-presentation',
    component: AutomationUssrPresentationComponent
  }, {
    path: 'automation-ussr-rating',
    component: AutomationUssrRatingComponent
  }, {
    path: 'registration',
    component: RegistrationComponent
  }, {
    path: 'reset-password',
    component: ResetPasswordComponent
  }, {
    path: 'donate',
    component: DonateComponent
  }, {
    path: 'useful-links',
    component: UsefulLinksComponent
  }, {
    path: 'games',
    component: GamesComponent
  }, {
    path: 'games/:id',
    component: GamesComponent
  }, {
    path: 'confidencial',
    component: ConfidencialComponent
  }, {
    path: 'feedback',
    component: FeedbackComponent
  }, {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
