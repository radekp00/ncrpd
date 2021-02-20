import { Component, OnInit} from '@angular/core';
import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPINPage } from '../modal-pin/modal-pin.page';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Platform } from '@ionic/angular';
// import {JSEncrypt} from '';
import * as Crypto from 'crypto-js';
@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})

export class LoginPage implements OnInit {
  a: any;
  results: string[];
  platformdet: any;
  logine = {
    username: '',
    password: '',
    token: ''
  };
  res = {};
  constructor(private http: HttpClient, public storage: Storage, private router: Router, public toastController: ToastController,
              public modalController: ModalController, private uniqueDeviceID: UniqueDeviceID, private platform: Platform,
              ) {  }
  ngOnInit() {
    this.a = 'ss';
    //Crypto.SHA512(this.a)
    this.platform.ready().then(() => {
      // 'hybrid' detects both Cordova and Capacitor
      if (this.platform.is('hybrid')) {
        this.platformdet = 1;
      } else {
        this.platformdet = 0;
      }
    });
    this.storage.get('pv10').then((val) => {
      if (val === null) { this.router.navigateByUrl('/start'); }
    });
  }

  login(form) {
    this.getFromApi({user: form.value.username, password: Crypto.SHA512(form.value.password).toString(), action: 'auth'})
        .subscribe(data => {
      // Read the result field from the JSON response.
      console.log(data);
      if (data['status'] === 'success') {
        this.logine.token = data['token'];
        this.presentModal();
        this.router.navigateByUrl('/main', {state: {token: this.logine.token, username: form.value.username,
            password: Crypto.SHA512(form.value.password).toString()}});
      } else if (data['status'] === 'error') {
        this.toPresentToast({message: "Błąd logowania, jeżeli nie masz konta możesz założyć je klikając tutaj", duration: -1});
        console.log(Crypto.SHA3(this.a).toString());
      }
    }, error => this.presentToast({message: "Usługi są chwilowo niedostępne", duration: 4000}));
  }
  getFromApi(body) {
    const req = 'https://ssk.rzeszow.pl/auth.php';
    return this.http.post(req, body);
  }
  public async presentToast(data) {
    const toast = await this.toastController.create({
      message: data.message,
      duration: data.duration,
    });
    await toast.present();
  }
  public async toPresentToast(data) {
    const toast = await this.toastController.create({
      message: data.message,
      duration: data.duration,
    });
    toast.addEventListener('click', ev => {
      if (this.platformdet) {
      this.uniqueDeviceID.get()
          .then((uid: any) => {
            this.getFromApi({uuid: uid, action: 'cnd'}).subscribe(data => {
              if (data['status'] === 'success') {
                this.storage.set('b', data['token']);
                this.storage.set('a', '1');
                toast.dismiss();
                this.presentToast({message: "Podanie do utworzenia konta dla tego urządzenia zostało zlecone", duration: 5000});
                this.router.navigateByUrl('/start');
              } else {
                this.presentToast({message: "Wystąpił błąd", duration: 5000});
              }
            });
          })
          .catch((error: any) => console.log(error));
    } else {
        this.getFromApi({ action: 'cnd'}).subscribe(data => {
          if (data['status'] === 'success') {
            this.storage.set('b', data['token']);
            this.storage.set('a', '1');
            toast.dismiss();
            this.presentToast({message: "Podanie do utworzenia konta dla tego urządzenia zostało zlecone", duration: 5000});
            setTimeout(() => this.router.navigateByUrl('/start'), 5100);
          } else {
            this.presentToast({message: "Wystąpił błąd", duration: 5000});
          }
        });
      }
    });
    await toast.present();
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPINPage
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    await this.storage.set('a', '3');
    await this.storage.set('b', Crypto.AES.encrypt(this.logine.token, data).toString());
    await this.storage.set('c', Crypto.SHA512(this.logine.token).toString());
    await this.storage.set('d', Crypto.AES.encrypt(this.logine.username, data).toString());
    await this.storage.set('e', Crypto.AES.encrypt(this.logine.password, data).toString());
    await this.storage.set('f', Crypto.AES.encrypt('success', data).toString());
  }


}

