import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { faUserLock, faUserClock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import * as sha256 from 'sha256';

import { TwoFactorAuthComponent } from '../../data-modal/two-factor-auth/two-factor-auth.component';
import { RTLConfiguration } from '../../../models/RTLconfig';
import { LoggerService } from '../../../services/logger.service';

import * as fromRTLReducer from '../../../../store/rtl.reducers';
import * as RTLActions from '../../../../store/rtl.actions';

@Component({
  selector: 'rtl-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('authForm', { static: true }) form: any;
  public faInfoCircle = faInfoCircle;
  public faUserLock = faUserLock;
  public faUserClock = faUserClock;
  public currPassword = '';
  public newPassword = '';
  public confirmPassword = '';
  public errorMsg = '';
  public errorConfirmMsg = '';
  public appConfig: RTLConfiguration;
  unSubs: Array<Subject<void>> = [new Subject(), new Subject()];

  constructor(private store: Store<fromRTLReducer.RTLState>, private logger: LoggerService) {}

  ngOnInit() {
    this.store.select('root')
    .pipe(takeUntil(this.unSubs[0]))
    .subscribe((rtlStore) => {
      this.appConfig = rtlStore.appConfig;
      this.logger.info(rtlStore);
    });
  }

  onChangePassword() {
    if(!this.currPassword || !this.newPassword || !this.confirmPassword || this.currPassword === this.newPassword || this.newPassword !== this.confirmPassword) { return true; }
    this.store.dispatch(new RTLActions.ResetPassword({currPassword: sha256(this.currPassword), newPassword: sha256(this.newPassword)}));
  }

  matchOldAndNewPasswords(): boolean {
    let invalid = false;
    if(this.form.controls.newpassword) {
      if (!this.newPassword) {
        this.form.controls.newpassword.setErrors({invalid: true});
        this.errorMsg = 'New password is required.';
        invalid = true;
      } else if (this.currPassword !== '' && this.newPassword !== '' && this.currPassword === this.newPassword) {
        this.form.controls.newpassword.setErrors({invalid: true});
        this.errorMsg = 'Old and New password cannot be same.';
        invalid = true;
      } else {
        this.form.controls.newpassword.setErrors(null);
        this.errorMsg = '';
        invalid = false;
      }
    }
    return invalid;
  }

  matchNewPasswords(): boolean {
    let invalid = false;
    if (this.form.controls.confirmpassword) {
      if (!this.confirmPassword) {
        this.form.controls.confirmpassword.setErrors({invalid: true});
        this.errorConfirmMsg = 'Confirm password is required.';
        invalid = true;
      } else if (this.newPassword !== '' && this.confirmPassword !== '' && this.newPassword !== this.confirmPassword) {
        this.form.controls.confirmpassword.setErrors({invalid: true});
        this.errorConfirmMsg = 'New and confirm passwords do not match.';
        invalid = true;
      } else {
        this.form.controls.confirmpassword.setErrors(null);
        this.errorConfirmMsg = '';
        invalid = false;
      }
    }
    return invalid;
  }

  resetData() {
    this.currPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  on2FAuth() {
    this.store.dispatch(new RTLActions.OpenAlert({ data: {
      appConfig: this.appConfig,
      component: TwoFactorAuthComponent
    }}));
  }

  ngOnDestroy() {
    this.unSubs.forEach(unsub => {
      unsub.next();
      unsub.complete();
    });
  }

}
