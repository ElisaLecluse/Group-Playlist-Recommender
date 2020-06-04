import { Component, OnInit } from '@angular/core';
import {Consent} from '../../../models/consent.model';
import {LoginService} from '../../../services/login.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.css']
})
export class ConsentComponent implements OnInit {

  consentModel = new Consent('', '', '', false);
  private checked: boolean;

  constructor(private loginSvc: LoginService,
              private router: Router) { }

  onChange($event) {
    this.checked = $event.checked;
    this.consentModel.consent = $event.checked;
  }

  isChecked() {
    return this.checked;
  }

  onClickSave() {
    this.loginSvc.sendConsent(this.consentModel).then(() => {
      this.router.navigate(['/login']);
    });
  }

  ngOnInit(): void {
  }

}
