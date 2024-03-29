import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Platform} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { register } from 'ts-node';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BackgroundMode } from '@ionic-native/background-mode';
import { HTTP } from '@ionic-native/http/ngx';
import { ModalController } from '@ionic/angular';
import {ModalPINPage} from '../modal-pin/modal-pin.page';
import * as Crypto from 'crypto-js';
import * as cryptico from 'cryptico-js/dist/cryptico.browser.js';
import {EventsService} from '../events.service';
import { DataService } from '../data.service';
import { IonSlides } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import {
    Plugins,
    PushNotification,
    PushNotificationToken,
    PushNotificationActionPerformed } from '@capacitor/core';
const { PushNotifications } = Plugins;
@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
    // @ts-ignore
    @ViewChild( 'mySlider' ) slider: IonSlides;

  hideIntroduction = 1;
  platformdet: any;
  token: any;
  logines = {
    username: '',
    password: '',
    token: '',
    state: ''
  };
  rsa = {
      n: '',
      e: '',
      d: '',
      p: '',
      q: '',
      dmp1: '',
      dmq1: '',
      coeff: ''
  };
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
  constructor(private storage: Storage, public router: Router, public toastController: ToastController, private platform: Platform,
              private http: HttpClient, route: ActivatedRoute, private httpn: HTTP, private modalController: ModalController,
              private eventsService: EventsService, public dataService: DataService) {
      this.startWorker();
      PushNotifications.addListener('pushNotificationReceived',
          (notification: PushNotification) => {
              // LocalNotifications.schedule({
              //     id: notification.data.id,
              //     text: notification.data.id,
              //     data: { secret: 'key' }
              // });
              // alert('Push received: ' + JSON.stringify(notification));
              switch (notification.data.type) {
                  case 'message':
                          this.eventsService.publishSomeData({
                              event: 'newMessage',
                              message: notification.data.message,
                              moreThanOne: notification.data.moreThanOne
                          });
                          console.log('success, got message');
                          break;
                  case 'notification':
                      this.eventsService.publishSomeData({
                          event: 'newMessageNotification'
                      });
                      break;
                  case 'command':
                      break;
                  case 'recKey':
                      break;
              }
          }
      );
    route.params.subscribe(val => {
      this.platform.ready().then(() => {
          console.log('tutej');
        // 'hybrid' detects both Cordova and Capacitor
        if (this.platform.is('hybrid')) {
          this.platformdet = 1;
        } else {
          this.platformdet = 0;
        }
      });
      if (this.platformdet) {

      }
      this.storage.get('pv10').then(async (val) => {
        switch (val) {
          case null:
            // Slide introduction, navigate to /register at end
              this.dataService.addUsersTable();
              this.dataService.addMessagesTable();
              this.dataService.addBufferTable();
              this.hideIntroduction = 0;
              this.slider.update()
                  .catch(e => console.log(e));
             //this.router.navigateByUrl('/register');
              //const pv = cryptico.generateRSAKey('asd', 2048);
              //const pb = cryptico.publicKeyString(pv);
              //this.storage.set('pb', pb);
              // let rsa = new cryptico.RSAKey();
              // rsa.setPrivateEx(val.n, val.e, val.d, val.p, val.q, val.dmp1, val.dmq1, val.coeff);
              // console.log(cryptico.decrypt(idr.cipher, rsa));
              break;
            default:
            do {
              await this.presentModal();
              await delay(500);
              console.log(this.logines.state);
            } while (this.logines.state !== 'success');
            /* const navigationExtras: NavigationExtras = {
              state: {
                user: 'this.user'
              }
            }; */
            // await delay(1000);
            console.log(this.rsa);
            this.router.navigate(['main'], {state: {
                    n: this.rsa.n,
                    e: this.rsa.e,
                    d: this.rsa.d,
                    p: this.rsa.p,
                    q: this.rsa.q,
                    dmp1: this.rsa.dmp1,
                    dmq1: this.rsa.dmq1,
                    coeff: this.rsa.coeff,
                    token: this.token
            }});
            break;
        }
      });

    });
  }
  ngOnInit(): void {

    // this.storage.get('a').then((val) => {
    //   if (val === '3') {
    //     this.startWorker();
    // }
    // });
  }

  public async presentToast(data) {
    const toast = await this.toastController.create({
      message: data.message,
      duration: data.duration,
    });
    await toast.present();
  }
  getFromApi(body) {
      const req = 'https://ssk.rzeszow.pl/lp/' + body.token;
      this.http.get(req).subscribe(data => {
        if (data['text'] === 'register') {
          this.storage.set('a', '2');
          this.toastController.dismiss();
          this.router.navigateByUrl('/register');
        } else {
          this.getFromApi({token: this.token});
        }
        console.log(data);
  }, async error => {
        if (error.status === 304) {
          this.getFromApi({token: this.token});
        } else {
          console.log(error);
          await delay(10000);
          this.getFromApi({token: this.token});
        }
      });
      // this.getFromApi({token: this.token});
  }
  worker() {
    this.storage.get('c').then((val) => {
    const req = 'https://ssk.rzeszow.pl/lp/' + val;
    if (this.platformdet) {
      this.httpn.setRequestTimeout(600.0);
      this.httpn.get(req, {}, {})
          .then(data => {

            console.log(data.status);
            console.log(data.data); // data received by server
            console.log(data.headers);
            if (data.data['text'] === 'fine') {

            } else if (data.data['text'] !== '' && BackgroundMode.isActive()) {
              LocalNotifications.schedule({
                title: 'Nowe powiadomienie',
                text: 'przejdź do aplikacji aby uzyskać więcej informacji',
                foreground: true,
                lockscreen: true
              });
            } else if (data.data['text'] !== '' && !BackgroundMode.isActive()) {
              this.eventsService.publishSomeData({
                event: 'notify',
                data: data['text']
              });
            } else {
              this.worker();
            }
            this.worker();
          })
          .catch(async error => {

            console.log(error.status);
            console.log(error.error); // error message as string
            console.log(error.headers);
            if (error.status === 304) {
              this.worker();
            } else {
              console.log(error);
              await delay(10000);
              this.worker();
            }

          });
    } else {
      this.http.get(req).subscribe(data => {
        if (data['text'] === 'fine') {

        } else if (data['text'] !== '') {
          this.eventsService.publishSomeData({
            event: 'notify',
            data: data['text']
          });
        } else {
          this.worker();
        }
        console.log(BackgroundMode.isActive());
        console.log(data);
        this.worker();
      }, async error => {
        if (error.status === 304) {
          this.worker();
        } else {
          console.log(error);
          await delay(10000);
          this.worker();
        }
      });
    }
    });
    // this.getFromApi({token: this.token});
  }
  startWorker() {
    BackgroundMode.overrideBackButton();
    BackgroundMode.excludeFromTaskList();
    BackgroundMode.enable();
    BackgroundMode.on('activate').subscribe(() => {
    BackgroundMode.disableWebViewOptimizations();
      // BackgroundMode.disableBatteryOptimizations(); //disable Battery optimizations
    console.log("background activate !!!!");
    });
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPINPage
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    await this.storage.get('pv9').then( val => {
        this.logines.state = Crypto.AES.decrypt(val, data).toString(Crypto.enc.Utf8);
        if (this.logines.state === 'success') {
          // this.rsa.setPrivateEx(val.n, val.e, val.d, val.p, val.q, val.dmp1, val.dmq1, val.coeff);
          this.storage.get('pv1').then( pv1 => {
              this.storage.get('pv2').then( pv2 => {
                  this.storage.get('pv3').then( pv3 => {
                      this.storage.get('pv4').then( pv4 => {
                          this.storage.get('pv5').then( pv5 => {
                              this.storage.get('pv6').then( pv6 => {
                                  this.storage.get('pv7').then( pv7 => {
                                      this.storage.get('pv8').then( pv8 => {
                                          this.storage.get('pv11').then( pv11 => {
                                              this.rsa.n = Crypto.AES.decrypt(pv6, data).toString(Crypto.enc.Utf8); // n
                                              this.rsa.e = Crypto.AES.decrypt(pv5, data).toString(Crypto.enc.Utf8); // e
                                              this.rsa.d = Crypto.AES.decrypt(pv2, data).toString(Crypto.enc.Utf8); // d
                                              this.rsa.p =  Crypto.AES.decrypt(pv7, data).toString(Crypto.enc.Utf8); // p
                                              this.rsa.q = Crypto.AES.decrypt(pv8, data).toString(Crypto.enc.Utf8); // q
                                              this.rsa.dmp1 =  Crypto.AES.decrypt(pv3, data).toString(Crypto.enc.Utf8); // dmp1
                                              this.rsa.dmq1 =  Crypto.AES.decrypt(pv4, data).toString(Crypto.enc.Utf8); // dmq1
                                              this.rsa.coeff =  Crypto.AES.decrypt(pv1, data).toString(Crypto.enc.Utf8); // coeff
                                              this.token = Crypto.AES.decrypt(pv11, data).toString(Crypto.enc.Utf8); // token
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
        }
    });
  }
}
function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}



