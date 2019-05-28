import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ClassbookComponent } from './classbook/classbook.component';
import { LanguagesComponent } from './languages/languages.component';

const routes: Routes = [
  // { path: 'crisis-center', component: CrisisListComponent },
  // { path: 'hero/:id',      component: HeroDetailComponent },
  {
    path: 'languages',
    component: LanguagesComponent,
    data: { title: 'Change Language' }
  },
  {
    path: 'classbook',
    component: ClassbookComponent,
    data: { title: 'Classbook' }
  },
  /*{ path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },*/
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
