import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ClassbookComponent } from './classbook/classbook.component';
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

const routes: Routes = [{
    path: 'classbook',
    component: ClassbookComponent
  }, {
    path: 'classbook/:id',
    component: ClassbookComponent
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
    path: '**',
    component: PageNotFoundComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
