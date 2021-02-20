import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPINPage } from '../modal-pin/modal-pin.page';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
  results: string[];
  constructor(private http: HttpClient, public storage: Storage, private router: Router, public toastController: ToastController,
              public modalController: ModalController) {
  }
  logine = {
    username: '',
    password: ''
  };

  res = {};
  login(form) {
    this.getFromApi(form).subscribe(data => {
      // Read the result field from the JSON response.
      this.res = data;
      console.log(data);
      console.log(this.res);
      if (data['status'] === 'success') {
        this.toastController.dismiss()
        this.presentModal();
        // this.router.navigateByUrl('/main');
      } else if (data['status'] === 'error') {
        this.toPresentToast({message: "Błąd logowania, jeżeli nie masz konta możesz założyć je tutaj", duration: -1, to: '/main'});
      }
    }, error => console.log(error));
  }
  getFromApi(form) {
    const req = 'https://ssk.rzeszow.pl/auth.php';
    return this.http.post(req,
        {
          user: form.value.username,
          password: form.value.password
        });
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
      this.router.navigateByUrl(data.to);
      toast.dismiss();
    });
    await toast.present();
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPINPage
    });
    return await modal.present();
  }

}
