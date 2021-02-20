import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-modal-pin',
  templateUrl: './modal-pin.page.html',
  styleUrls: ['./modal-pin.page.scss'],
})
export class ModalPINPage {
@Input() text: string;
a: string;
checkbox: boolean[];
  constructor(private navparams: NavParams, private modalController: ModalController) {
    this.checkbox = [false, false, false, false, false];
    this.a = '';
  }

hi(data) {
switch (data) {
  case 'del':
    this.a = this.a.slice(0, -1);
    this.checkbox[this.a.length] = false;
    break;
  case 'enter':
    if (this.a.length === 5) {this.modalController.dismiss(this.a); }
    break;
  default:
    if (this.a.length < 5) {
    this.a = this.a + data;
    for (let i = 0; i < this.a.length; i++) { this.checkbox[i] = true; }
    console.log(this.a.length);
}
    break;

}

}

}
