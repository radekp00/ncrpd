import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
@Component({
  selector: 'app-modal-number',
  templateUrl: './modal-number.page.html',
  styleUrls: ['./modal-number.page.scss'],
})
export class ModalNumberPage {
  @Input() prsa: string;
  data: string;

  checkbox: boolean[];
  constructor(private navparams: NavParams, private modalController: ModalController, private barcodeScanner: BarcodeScanner,
              private alertController: AlertController) {

    this.data = '';
  }

  scan() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.presentAlertPrompt().then(data => {
        if (data.ok === 1 && data.displayName !== '') {
          this.modalController.dismiss({displayName: data.displayName, pb: barcodeData.text});
        } else if (data.displayName === '' && data.ok === 1) {
          this.presentAlert();
        }
      });
    }).catch(err => {
      console.log('Error', err);
    });
  }

  encode() {
    console.log(this.prsa);
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, this.prsa).then(barcodeData => {
      console.log('Barcode data', barcodeData);
    }).catch(err => {
      console.log('Error', err);
    });
  }
  async presentAlertPrompt() {
    let x = 0;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Enter displayname',
      inputs: [
        {
          name: 'displayName',
          type: 'text'
        }
      ],
      buttons: [{
          text: 'Cancel',
          handler: () => {
            x = 0;
          }
        },
        {
          text: 'Add User',
          handler: () => {
            x = 1;
          }
        }
      ]
    });

    await alert.present();
    const { data } = await alert.onWillDismiss();
    return {ok: x, displayName: data.values.displayName};
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Displayname cannot be empty',
      buttons: [{
        text: 'Ok',
        handler: () => { }
      }]
    });

    await alert.present();
  }
  async presentAlertError() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Invalid QR code',
      buttons: [{
        text: 'Ok',
        handler: () => { }
      }]
    });

    await alert.present();
  }
}
