import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  @Output() loading = new EventEmitter<boolean>();
  countPages = 50;
  currentPage = 0;
  onPage = 10;
  errorMessage: string = null;
  dataList: Array<any> = [];
  searchField: FormControl; 
  @ViewChild('searchText') searchText: ElementRef;

  constructor(
    private _spinnerService: SpinnerService,
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
    private _el: ElementRef,
  ) { }

  ngOnInit() {
    this._route.params.subscribe( (params) => this.loadData(params));

    /*fromEvent(this._el.nativeElement, 'keyup').pipe(
      map((e: any) => e.target.value), // extract the value of the input
      filter(text => text.length > 1), // filter out if empty
      debounceTime(500), // only once every 500ms
      // tap(() => this.loading.emit(true)), // enable loading
      //map((query: string) => this.youtube.search(query)), // search
      switchAll()) // produces values only from the most recent inner sequence ignoring previous streams
      .subscribe(  // act on the return of the search
        _results => {
          // this.loading.emit(false);
          // this.results.emit(_results);
        },
        err => {
          // console.log(err);
          // this.loading.emit(false);
        },
        () => {
          // this.loading.emit(false);
        }
      );*/
  }

  goSearch(val: String) {
    console.log(val);
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
