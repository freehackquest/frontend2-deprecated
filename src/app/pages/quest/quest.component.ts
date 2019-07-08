import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { FhqService } from 'src/app/services/fhq.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

import { ModalDialogQuestFeedbackComponent } from '../../dialogs/modal-dialog-quest-feedback/modal-dialog-quest-feedback.component';
import * as marked from 'marked';

@Component({
  selector: 'app-quest',
  templateUrl: './quest.component.html',
  styleUrls: ['./quest.component.css']
})
export class QuestComponent implements OnInit {
  errorMessage: string = null;
  dataList: Array<any> = [];
  questid: number = 0;
  subscription: any = null;
  game: any = {};
  questFiles: any = [];
  questHints: any = [];
  showHints: boolean = false;
  quest: any = [];
  questDescription: String = '';

  constructor(
    private _spinner: SpinnerService,
    private _cdr: ChangeDetectorRef,
    private _fhq: FhqService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _modalService: NgbModal,
  ) { }

  ngOnInit() {
    this._route.params.subscribe( (params) => {
      if (!params['id']) {
        this._router.navigate(['/quests']);
        return;
      }
      this.questid = parseInt(params['id'],10);
      // TODO check possible subjects
      this.loadData();

      this.subscription = this._fhq.changedState
        .subscribe(() => this.loadData());
    });
  }

  ngOnDestroy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
  }

  loadData() {
    const _data = {
      questid: this.questid
    }
    this._spinner.show();
    this._fhq.api().quest(_data)
      .done((r: any) => this.successResponse(r))
      .fail((err: any) => this.errorResponse(err));
  }

  successResponse(r: any) {
    console.log(r);
    this._spinner.hide();
    this.game = r.game;
    this.questFiles = r.files;
    this.questHints = r.hints;
    this.quest = r.quest;
    this.questDescription = marked(r.quest.text);
    this._cdr.detectChanges();
  }

  errorResponse(err: any) {
    this._spinner.hide();
    this.errorMessage = err.error;
    this._cdr.detectChanges();
    console.error(err);
  }

  openQuest(questid: number) {
    window.open("/?quest=" + questid, "_blank");
  }

  switchShowHints() {
    this.showHints = !this.showHints;
  }

  openDialogFeedback() {
    const modalRef = this._modalService.open(ModalDialogQuestFeedbackComponent);
    modalRef.componentInstance.questId = this.quest.id;
    modalRef.componentInstance.questName = this.quest.name;
    modalRef.componentInstance.questUrl = window.location.href;
  }
}
