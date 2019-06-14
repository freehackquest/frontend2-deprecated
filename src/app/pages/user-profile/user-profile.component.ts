import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FhqService } from '../../services/fhq.service';
import { SpinnerService } from '../../services/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  userCity: string = "";
  userCountry: string = "";
  userDtCreate: string = "";
  userDtLastLogin: string = "";
  userEmail: string = "";
  userLastIp: string = "";
  userLogo: string = "";
  userNick: string = "";
  userRating: number = 0;
  userRegion: string = "";
  userRole: string = "";
  userStatus: string = "";
  userUniversity: string = "";
  userUuid: string = "";

  constructor(
    private _spinnerService: SpinnerService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _fhq: FhqService,
  ) {

  }

  ngOnInit() {
    this._route.params.subscribe( (params) => {
      this.userId = parseInt(params['id'], 10);
      this.updatePage();
    });

    this.subscription = this._fhq.changedState
      .subscribe(() => this.updatePage());
  }

  ngOnDestroy() {
	  this.subscription.unsubscribe();
  }

  updatePage() {
    if (this._fhq.isAuthorized) {
      this._route.params.subscribe( (params) => {
        if (!params['id']) {
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


          this._router.navigate(['/user-profile', this.userId]);
          return;
        }
      });
    }
    this._cdr.detectChanges();
  }

}
