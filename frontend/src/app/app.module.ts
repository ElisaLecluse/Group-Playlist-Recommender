import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HomeComponent, TaskDialogComponent} from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { YourRecommendationsComponent } from './components/your-recommendations/your-recommendations.component';
import { GroupRecommendationsComponent } from './components/group-recommendations/group-recommendations.component';
import {HttpClientModule} from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {AuthGuard} from './guard/auth.guard';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';
import { ConsentComponent } from './components/userstudy/consent/consent.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FinalplaylistComponent } from './components/userstudy/finalplaylist/finalplaylist.component';
import { FairnessComponent } from './components/userstudy/fairness/fairness.component';
import {MatRadioModule} from '@angular/material/radio';
import {MatDialogModule} from '@angular/material/dialog';
import { ObjectiveComponent } from './components/userstudy/objective/objective.component';
import {TutorialComponent, TutorialDialogComponent} from './components/userstudy/tutorial/tutorial.component';
import { UsertaskComponent } from './components/userstudy/usertask/usertask.component';
import { EndComponent } from './components/userstudy/end/end.component';
import { SelecttopComponent } from './components/userstudy/selecttop/selecttop.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { TokencheckComponent } from './components/tokencheck/tokencheck.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    PlaylistComponent,
    YourRecommendationsComponent,
    GroupRecommendationsComponent,
    LoginComponent,
    RecommendationsComponent,
    ConsentComponent,
    FinalplaylistComponent,
    FairnessComponent,
    TaskDialogComponent,
    ObjectiveComponent,
    TutorialComponent,
    TutorialDialogComponent,
    UsertaskComponent,
    EndComponent,
    SelecttopComponent,
    TokencheckComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
