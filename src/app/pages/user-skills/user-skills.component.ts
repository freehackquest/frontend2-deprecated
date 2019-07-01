import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-skills',
  templateUrl: './user-skills.component.html',
  styleUrls: ['./user-skills.component.css']
})
export class UserSkillsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  updatePage() {
    if (this._fhq.isAuthorized) {

      this.loadUserSkills();
    }
    else {
      this.userSkills = [];
    }
  }

  loadUserSkills() {
    this._fhq.api().user_skills({
      "userid": this.userId,
    }).done((r: any) => this.successUserSkills(r))
      .fail((err: any) => this.errorUserSkills(err));
  }

  successUserSkills(r: any) {
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
  }
}
