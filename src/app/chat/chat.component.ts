import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SpinnerService } from '../spinner.service';

declare var fhq: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  dataList: Array<any> = [];
  errorMessage: string = null;

  constructor(
    private _spinnerService: SpinnerService,
    private _cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }

  loadData() {
    const _data = {}
    this._spinnerService.show();
    fhq.ws.chat_latest_messages(_data)
      .done((r: any) => this.successResponse(r))
      .fail((err: any) => this.errorResponse(err));
    // 
  }

  successResponse(r: any) {
    console.log(r);
    this._spinnerService.hide();

    this.dataList = []
    /*r.data.forEach((el: any) => {
      this.dataList.push(el);
    });*/
    this._cdr.detectChanges();
  }

  errorResponse(err: any) {
    this._spinnerService.hide();
    this.errorMessage = err.error;
    this._cdr.detectChanges();
    console.error(err);
  }

}
