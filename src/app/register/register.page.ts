import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import * as Crypto from 'crypto-js';
import {ModalPINPage} from '../modal-pin/modal-pin.page';
import {ModalController} from '@ionic/angular';
import * as cryptico from 'cryptico-js/dist/cryptico.browser.js';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registere = {
    username: '',
    password: '',
    rpassword: ''
  };
  constructor(private route: ActivatedRoute, private http: HttpClient, private storage: Storage, private router: Router,
              public modalController: ModalController, public toastController: ToastController,
              public loadingController: LoadingController) {
    route.params.subscribe(val => {

    });
  }

  ngOnInit() {
    this.presentModal();
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPINPage,
      componentProps: { text: 'Create a PIN for unlock your account'}
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    await this.presentLoading();
    //console.log(data);
    const pv = cryptico.generateRSAKey('UNIQUE DEVICE ID!!!', 2048);
    const pb = cryptico.publicKeyString(pv);
    this.storage.set('pv1', Crypto.AES.encrypt(pv.toJSON().coeff, data).toString());
    this.storage.set('pv2', Crypto.AES.encrypt(pv.toJSON().d, data).toString());
    this.storage.set('pv3', Crypto.AES.encrypt(pv.toJSON().dmp1, data).toString());
    this.storage.set('pv4', Crypto.AES.encrypt(pv.toJSON().dmq1, data).toString());
    this.storage.set('pv5', Crypto.AES.encrypt(pv.toJSON().e, data).toString());
    this.storage.set('pv6', Crypto.AES.encrypt(pv.toJSON().n, data).toString());
    this.storage.set('pv7', Crypto.AES.encrypt(pv.toJSON().p, data).toString());
    this.storage.set('pv8', Crypto.AES.encrypt(pv.toJSON().q, data).toString());
    this.storage.set('pv9', Crypto.AES.encrypt('success', data).toString());
    this.storage.set('pv10', Crypto.AES.encrypt('0', 'UNIQUE DEVICE ID!!!').toString());
    this.storage.set('pb', Crypto.AES.encrypt(pb, data).toString());
    await delay(1000);
    this.loadingController.dismiss();
    this.router.navigateByUrl('/start');
  }
  public async presentToast(data) {
    const toast = await this.toastController.create({
      message: data.message,
      duration: data.duration,
    });
    await toast.present();
  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Please wait until key generate',
      duration: -1
    });
    await loading.present();
  }
}

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
