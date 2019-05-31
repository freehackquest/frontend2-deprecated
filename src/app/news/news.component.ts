import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SpinnerService } from '../spinner.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

declare var fhq: any;

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  countPages = 50;
  currentPage = 0;
  onPage = 10;
  errorMessage: string = null;
  dataList: Array<any> = [];

  constructor(
    private _spinnerService: SpinnerService,
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
    this._route.params.subscribe( (params) => this.loadData(params));
  }

  loadData(params) {
    // console.log(params['id']);
    if (!params['id']) {
      this._router.navigate(['/news', 0]);
      return;
    }
    this.currentPage = parseInt(params['id'], 10);

    const _data = {
      "page": this.currentPage,
      "onpage": this.onPage
    }
    this._spinnerService.show();
    fhq.ws.publiceventslist(_data)
      .done((r: any) => this.successResponse(r))
      .fail((err: any) => this.errorResponse(err));
  }

  successResponse(r: any) {
    console.log(r);
    this._spinnerService.hide();
    
    this.dataList = []
    r.data.forEach((el: any) => {
      this.dataList.push(el);
    });
    this._cdr.detectChanges();
  }

  errorResponse(err: any) {
    this._spinnerService.hide();
    this.errorMessage = err.error;
    this._cdr.detectChanges();
    console.error(err);
  }

}
