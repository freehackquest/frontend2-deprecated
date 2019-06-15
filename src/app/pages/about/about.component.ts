import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { FhqService } from '../../services/fhq.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  errorMessage: string = null;
  statisticsUsersOnline: number = 0;
  statisticsCountQuests: number = 0;
  statisticsAllAttempts: number = 0;
  statisticsAlreadySolved: number = 0;
  winners: Array<any> = [];
  cities: Array<any> = [];
  developers: Array<any> = [];
  darkTheme: boolean = false;

  constructor(
    private _spinnerService: SpinnerService,
    private _cdr: ChangeDetectorRef,
    private _fhq: FhqService,
  ) { }

  ngOnInit() {
    this.updatePublicInfo();
  }

  ngOnDestroy() {
  }

  themeSwitcher() {
    if (this.darkTheme) {
      this.darkTheme = false;
    } else {
      this.darkTheme = true;
    }
    /*
    var dark_switcher = '';
	if (localStorage && localStorage.getItem('dark') != null) {
		dark_switcher = '<a href="javascript:void(0);" onclick="localStorage.removeItem(\'dark\'); window.location.reload();">Default theme</a>'
	} else {
		dark_switcher = '<a href="javascript:void(0);" onclick="localStorage.setItem(\'dark\', true); window.location.reload();">Cyborg theme</a>'
	}
    */
  }

  updatePublicInfo() {
    this._spinnerService.show();
    this.errorMessage = null;
    this.winners = [];
    this.cities = [];
    this.developers = [];

    this._fhq.api().public_info({})
      .done((r: any) => this.successResponse(r))
      .fail((err: any) => this.errorResponse(err));
  }

  successResponse(r: any) {
    console.log("successResponse: ", r);
    this.statisticsUsersOnline = r.connectedusers;
		this.statisticsCountQuests = r.quests.count;
		this.statisticsAllAttempts = r.quests.attempts;
    this.statisticsAlreadySolved = r.quests.solved;
    r.winners.forEach((w: any) => {
      this.winners.push(w);
    });
    
    r.cities.forEach((w: any) => {
      this.cities.push(w);
    });
   
    r.developers.forEach((w: any) => {
      this.developers.push(w.name + ' (' + w.email + ')');
    });
    this.developers.push('Used bootstrap-4');
    this.developers.push('Used angular');

    this._spinnerService.hide();
    this._cdr.detectChanges();
  }

  errorResponse(err: any) {
    console.error("errorResponse: ", err);
    this._spinnerService.hide();
    this.errorMessage = err.error;
    this._cdr.detectChanges();
  }
}
