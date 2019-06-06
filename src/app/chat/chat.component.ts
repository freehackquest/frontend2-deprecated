import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { SpinnerService } from '../spinner.service';

declare var fhq: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  dataList: Array<any> = [];
  dataReverseList: Array<any> = [];
  errorMessage: string = null;
  @ViewChild('yourMessage') yourMessage : ElementRef;
  @ViewChild('chatMessages') private chatMessages: ElementRef;
  
  constructor(
    private _spinnerService: SpinnerService,
    private _cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const _data = {}
    this._spinnerService.show();
    fhq.chat_latest_messages(_data)
      .done((r: any) => this.successResponse(r))
      .fail((err: any) => this.errorResponse(err));
    // 
  }

  sendMessage() {
    const msg = this.yourMessage.nativeElement.value;
    console.log(msg);
    fhq.chat_send_message({
      "type": "chat",
      "message": msg
    }).done(function(r: any) {
        console.log('Success: ', r);
    }).fail(function(err: any){
        console.error('Error:', err);
    });
    this.yourMessage.nativeElement.value = '';
  }

  successResponse(r: any) {
    console.log(r);
    this._spinnerService.hide();
    this.dataList = []
    this.dataReverseList = [];
    r.data.forEach((el: any) => {
      this.dataList.push(el);
    });
    this.dataReverseList = this.dataList.reverse();
    this._cdr.detectChanges();
    this.chatScrollToBottom();
  }

  chatScrollToBottom() {
    try {
      this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
    } catch(err) { }   
  }

  errorResponse(err: any) {
    this._spinnerService.hide();
    this.errorMessage = err.error;
    this._cdr.detectChanges();
    console.error(err);
  }

}
