import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-modal-number',
  templateUrl: './modal-number.page.html',
  styleUrls: ['./modal-number.page.scss'],
})
export class ModalNumberPage {
  a: string;
  b: string;
  lock = {
    a: 'true',
    b: 'false'
  }
  checkbox: boolean[];
  constructor(private navparams: NavParams, private modalController: ModalController) {
    this.checkbox = [false, false, false, false, false];
    this.a = '';
    this.b = '';
  }

  hi(data) {
    switch (data) {
      case 'del':
        if (this.a.length === 0) {
          this.b = '';
          this.checkbox[0] = false;
        }
        this.a = this.a.slice(0, -1);
        this.checkbox[this.a.length+1] = false;
        break;
      case 'enter':
        if (this.a.length === 4 && (this.b === 'H' || this.b === 'G')) {this.modalController.dismiss({b: this.b, a: this.a}); }
        break;
      case 'H':
        this.b = 'H';
        this.checkbox[0] = true;
        break;
      case 'G':
        this.b = 'G';
        this.checkbox[0] = true;
        break;
      default:
        if (this.a.length < 4) {
          this.a = this.a + data;
          for (let i = 0; i < this.a.length; i++) { this.checkbox[i+1] = true; }
          console.log(this.a.length);
        }
        break;

    }
    if (!!(this.b === 'H' || this.b === 'G')) {
      this.lock.a = 'false';
      this.lock.b = 'true';
    } else {
      this.lock.a = 'true';
      this.lock.b = 'false';
    }
  }

}
