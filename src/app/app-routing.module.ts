import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ClassbookComponent } from './classbook/classbook.component';
import { LanguagesComponent } from './languages/languages.component';
import { ServerApiComponent } from './server-api/server-api.component';
import { MapActivityComponent } from './map-activity/map-activity.component';
import { NewsComponent } from './news/news.component';
import { ChatComponent } from './chat/chat.component';
import { AutomationUssrComponent } from './automation-ussr/automation-ussr.component';

const routes: Routes = [
  // { path: 'crisis-center', component: CrisisListComponent },
  {
    path: 'languages',
    component: LanguagesComponent,
    data: { title: 'Change Language' }
  }, {
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
  },  {
    path: 'chat',
    component: ChatComponent
  },  {
    path: 'automation-ussr',
    component: AutomationUssrComponent
  }, 
  /*{ path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },*/
  {
    path: '**',
    component: PageNotFoundComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
