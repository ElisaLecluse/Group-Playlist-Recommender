import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './guard/auth.guard';
import {ConsentComponent} from './components/userstudy/consent/consent.component';
import {FinalplaylistComponent} from './components/userstudy/finalplaylist/finalplaylist.component';
import {FairnessComponent} from './components/userstudy/fairness/fairness.component';
import {ObjectiveComponent} from './components/userstudy/objective/objective.component';
import {TutorialComponent} from './components/userstudy/tutorial/tutorial.component';
import {UsertaskComponent} from './components/userstudy/usertask/usertask.component';
import {EndComponent} from './components/userstudy/end/end.component';
import {SelecttopComponent} from './components/userstudy/selecttop/selecttop.component';
import {TokencheckComponent} from './components/tokencheck/tokencheck.component';


const routes: Routes = [
  {path: '', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'tokencheck', component: TokencheckComponent},
  {path: 'consent', component: ConsentComponent},
  {path: 'objective', component: ObjectiveComponent},
  {path: 'task', component: UsertaskComponent},
  {path: 'tutorial', component: TutorialComponent, canActivate: [AuthGuard]},
  {path: 'final', component: FinalplaylistComponent},
  {path: 'selecttop', component: SelecttopComponent},
  {path: 'fairness', component: FairnessComponent},
  {path: 'end', component: EndComponent},
  {path: '**', component: ObjectiveComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
