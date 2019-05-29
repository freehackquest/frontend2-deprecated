import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ClassbookComponent } from './classbook/classbook.component';
import { LanguagesComponent } from './languages/languages.component';
import { ServerApiComponent } from './server-api/server-api.component';

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
