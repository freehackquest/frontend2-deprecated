import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FhqService } from '../../services/fhq.service';
import { SpinnerService } from '../../services/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDialogSignInComponent } from '../../modal-dialog-sign-in/modal-dialog-sign-in.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  errorMessage: string = null;
  subscription: any;

  userId: number = 0;
  userAbout: string = "";
  userCountry: string = "";
  userRegion: string = "";
  userCity: string = "";
  userDtCreate: string = "";
  userDtLastLogin: string = "";
  userEmail: string = "";
  userLastIp: string = "";
  userLogo: string = "";
  userNick: string = "";
  userRating: number = 0;
  userRole: string = "";
  userStatus: string = "";
  userUniversity: string = "";
  userUuid: string = "";
  userSkills: Array<any> = [];
  resultOfUserSkills: string = null;

  @ViewChild('userNewNick') userNewNick : ElementRef;
  @ViewChild('userNewUniversity') userNewUniversity : ElementRef;
  @ViewChild('userNewAbout') userNewAbout : ElementRef;
  resultOfChangeUserInfo: string = null;

  @ViewChild('userOldPassword') userOldPassword : ElementRef;
  @ViewChild('userNewPassword') userNewPassword : ElementRef;
  resultOfChangePassword: string = null;
  

  constructor(
    private _spinnerService: SpinnerService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _fhq: FhqService,
  ) {

  }

  ngOnInit() {
    this.updatePage();
    this.subscription = this._fhq.changedState
      .subscribe(() => this.updatePage());
  }

  ngOnDestroy() {
	  this.subscription.unsubscribe();
  }

  updatePage() {
    if (this._fhq.isAuthorized) {
      this.userId = parseInt(this._fhq.userdata.id, 10);
      this.userAbout = this._fhq.userdata.about;
      this.userCity = this._fhq.userdata.city;
      this.userCountry = this._fhq.userdata.country;
      this.userDtCreate = this._fhq.userdata.dt_create;
      this.userDtLastLogin = this._fhq.userdata.dt_last_login;
      this.userEmail = this._fhq.userdata.email;
      this.userLastIp = this._fhq.userdata.last_ip;
      this.userLogo = this._fhq.userdata.logo;
      this.userNick = this._fhq.userdata.nick;
      this.userRating = this._fhq.userdata.rating;
      this.userRegion = this._fhq.userdata.region;
      this.userRole = this._fhq.userdata.role;
      this.userStatus = this._fhq.userdata.status;
      this.userUniversity = this._fhq.userdata.university;
      this.userUuid = this._fhq.userdata.uuid;  
      this._cdr.detectChanges();
      this.loadUserSkills();
    } else {
      this.userId = 0;
      this.userSkills = [];
    }
  }

  openDialogSignIn() {
    const modalRef = this._modalService.open(ModalDialogSignInComponent);
    modalRef.componentInstance.name = 'SignIn';
  }

  doChangeUserInfo() {
    this.resultOfChangeUserInfo = null;
    this._cdr.detectChanges();

    const userNewNickValue = this.userNewNick.nativeElement.value.trim();
    const userNewUniversityValue = this.userNewUniversity.nativeElement.value.trim();
    const userNewAboutValue = this.userNewAbout.nativeElement.value.trim();

    this._spinnerService.show();
    this._fhq.api().user_update({
      "nick": userNewNickValue,
      "university": userNewUniversityValue,
      "about": userNewAboutValue,
      "userid": this.userId,
    })
      .done((r: any) => this.successChangedUserInfo(r))
      .fail((err: any) => this.errorChangedUserInfo(err));
  }
  
  successChangedUserInfo(r: any) {
    // console.log("successResponse: ", r);
    this.userNick = r.data.nick;
    this.userUniversity = r.data.university;
    this.userAbout = r.data.about;
    this._cdr.detectChanges();
    this._spinnerService.hide();
  }

  errorChangedUserInfo(err: any) {
    console.error("errorResponse: ", err);
    this._spinnerService.hide();
    this.resultOfChangeUserInfo = err.error;
    this._cdr.detectChanges();
  }

  doChangePassword() {
    this.resultOfChangePassword = null;
    this._cdr.detectChanges();

    const userOldPasswordValue = this.userOldPassword.nativeElement.value;
    const userNewPasswordValue = this.userNewPassword.nativeElement.value;

    this._spinnerService.show();
    this._fhq.api().user_change_password({
      "password_old": userOldPasswordValue,
      "password_new": userNewPasswordValue,
    })
      .done((r: any) => this.successChangedPassword(r))
      .fail((err: any) => this.errorChangedPassword(err));
  }

  successChangedPassword(r: any) {
    // console.log("successResponse: ", r);
    this.userOldPassword.nativeElement.value = "";
    this.userNewPassword.nativeElement.value = "";
    this._cdr.detectChanges();
    this._spinnerService.hide();
  }

  errorChangedPassword(err: any) {
    console.error("errorResponse: ", err);
    this._spinnerService.hide();
    this.resultOfChangePassword = err.error;
    this._cdr.detectChanges();
  }

  loadUserSkills() {
    this._fhq.api().user_skills({
      "userid": this.userId,
    }).done((r: any) => this.successUserSkills(r))
      .fail((err: any) => this.errorUserSkills(err));
  }

  successUserSkills(r: any) {
    // console.log("successUserSkills: ", r);
    this.userSkills = [];
    for (let i in r.skills_user) {
      let skill = {};
      skill['name'] = i;
      skill['max'] = r.skills_max[i];
      skill['val'] = r.skills_user[i];
      skill['procent'] = Math.floor(100 * (skill['val'] / skill['max']));
      this.userSkills.push(skill);
    }
    this._cdr.detectChanges();
  }

  errorUserSkills(err: any) {
    console.error("errorUserSkills: ", err);
    // this._cdr.detectChanges();
  }
}
