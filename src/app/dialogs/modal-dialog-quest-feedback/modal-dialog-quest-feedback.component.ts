import { Component, OnInit, Input, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { SpinnerService } from '../../services/spinner.service';
import { EmailValidatorService } from '../../email-validator.service';

@Component({
  selector: 'app-modal-dialog-quest-feedback',
  templateUrl: './modal-dialog-quest-feedback.component.html',
  styleUrls: ['./modal-dialog-quest-feedback.component.css']
})
export class ModalDialogQuestFeedbackComponent implements OnInit {

  constructor(
    public _activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {
  }

}
