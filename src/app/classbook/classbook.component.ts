import { Component, OnInit } from '@angular/core';
import { SpinnerService } from '../spinner.service';

declare var fhq: any;

@Component({
  selector: 'app-classbook',
  templateUrl: './classbook.component.html',
  styleUrls: ['./classbook.component.css']
})

export class ClassbookComponent implements OnInit {
  constructor(private _spinnerService: SpinnerService) {
    
  }

  ngOnInit() {
    const _data = {
      'parentid': 1
    }
    this._spinnerService.show();
    fhq.ws.classbook_list(_data)
    .done((r: any) => this.successResponse(r))
    .fail((err: any) => this.errorResponse(err));
  }

  successResponse(r: any) {
    this._spinnerService.hide();
    console.log(r);
    r.data.array.forEach(el => {
      
    });
  }

  errorResponse(err: any) {
    this._spinnerService.hide();
    console.error(err);
  }

}
