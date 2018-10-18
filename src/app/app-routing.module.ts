import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LiveComponent } from './live/live.component';
import { SummaryComponent } from './summary/summary.component';
import { HistoryComponent } from './history/history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'clearance_dashboard', pathMatch: 'full' },
  {
    path: 'clearance_dashboard',
    children: [
      {
        path: 'summary/:context',
        component: SummaryComponent
      },
      {
        path: 'history/:context',
        component: HistoryComponent,
      },
      {
        path: 'live/:context',
        component: LiveComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
