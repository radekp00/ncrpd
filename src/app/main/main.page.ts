import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Platform} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as Crypto from 'crypto-js';
import JSEncrypt from 'JSEncrypt';
import {ModalPINPage} from '../modal-pin/modal-pin.page';
import {ModalNumberPage} from '../modal-number/modal-number.page';
import {EventsService} from '../events.service';
import {LocalNotifications} from '@ionic-native/local-notifications';
import * as cryptico from 'cryptico-js/dist/cryptico.browser.js';
@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage {
  rsa = new cryptico.RSAKey();
  act = {
    convid: '',
    uid: '',
    pb: '',
  };
  sess = {
    uid: '',
    pb: '',
    pv: '',
    token: '',
    password: '',
    username: '',
  };
  m = {
    textarea: '',
  };
  Menu: any[] = [ ];
  messages: any[] = [ ];
  constructor(private menu: MenuController, private http: HttpClient, private router: Router, private platform: Platform,
              private route: ActivatedRoute, private modalController: ModalController, private eventsService: EventsService) {
    this.eventsService.getObservable().subscribe((data) => {
      if (data.event === 'notify') {
        this.getNotify();
      }
    });
    route.params.subscribe(val => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.sess.username = this.router.getCurrentNavigation().extras.state.username;
        this.sess.password = this.router.getCurrentNavigation().extras.state.password;
        this.sess.token = this.router.getCurrentNavigation().extras.state.token;
        console.log(this.sess);
        this.rsa =  this.router.getCurrentNavigation().extras.state.rsa; // Klucz RSA
        console.log(cryptico.publicKeyString(this.rsa));
      }
      this.platform.ready().then(async () => {
        if (this.sess.token === '') { this.router.navigateByUrl('/start'); }
        await this.getFromApi({user: this.sess.username, token: this.sess.token, password: this.sess.password, action: 'get-own-key'})
            .subscribe(async data => {
              console.log(data);
              if (data['status'] === 'success') {
                this.sess.uid = data['id'];
                for (let i = 0;  4 > this.sess.uid.length; i++) {
                  this.sess.uid = '0' + this.sess.uid;
                }
                this.sess.pb = data['pb'];
                this.sess.pv = data['pv'];
                console.log(this.sess);
              }
              });
        await this.getNotify();
      });
    });
  }
open() {
  console.log(this.Menu);
  this.menu.enable(true, 'first');
  this.menu.open('first');
}
async oc(datas) {
this.menu.close();
this.messages = [];
this.act.pb = datas.pb;
this.act.uid = datas.uid;
this.act.convid = datas.convid;
//console.log(data);
const req = 'https://ssk.rzeszow.pl/api.php';
this.http.post(req, {token: this.sess.token, action: 'get-messages', convid: this.act.convid, user: this.sess.username}).subscribe( async data => {
//console.log(data);
let encrypt = new JSEncrypt();

for (const element of data['data']) {
  let mess = '';
  await encrypt.setPrivateKey(this.sess.pv);
  mess = await encrypt.decrypt(element['message']);
  console.log(mess);
  if (element.from === this.sess.uid) {
    this.messages.push({value: mess, div: 'ion-text-end', chip: 'my', id: element['id']});
  } else {
    this.messages.push({value: mess, chip:'notmy', id: element['id']});
  }
console.log(element);
}
  for ( let i = this.Menu.length - 1; i >= 0; i -= 1) {
    if (this.Menu[i].convid === datas.convid) {
      this.Menu[i].badge = '';
    }
  }
  await delay(400);
  document.querySelector('ion-content').scrollToBottom(200);
});
console.log(this.messages);
}
cc(data) {
this.act.pb = '';
this.act.uid = '';
}
async au() {
    const id = await this.presentModal();
    this.aus({ids: id, badge: ''});
}
aus(a) {
this.getFromApi({user: this.sess.username, token: this.sess.token, action: 'get-conv', convid: a.ids}).subscribe( data => {
  if (data['status'] === 'success') {
    for ( let i = this.Menu.length - 1; i >= 0; i -= 1) {
      if (this.Menu[i].uid === data['id']) {
        this.Menu.splice(i, 1);
      }
    }
    this.Menu.unshift({uid: data['id'], name: '', tp: 'user', pbl: data['pb'], convid: a.ids, badge: a.badge});

  }
});
console.log(a);
}
async send() {
    let a = '';
    let b = '';
    console.log(this.act.uid);
    console.log(this.sess.uid);
    if(this.act.uid > this.sess.uid){
      let encrypt = new JSEncrypt();
      encrypt.setPublicKey(this.act.pb);
      a = encrypt.encrypt(this.m.textarea.trim());
      encrypt.setPublicKey(this.sess.pb);
      b = encrypt.encrypt(this.m.textarea.trim());
    } else {
      let encrypt = new JSEncrypt();
      encrypt.setPublicKey(this.act.pb);
      b = encrypt.encrypt(this.m.textarea.trim());
      encrypt.setPublicKey(this.sess.pb);
      a = encrypt.encrypt(this.m.textarea.trim());
    }

  if (this.m.textarea.trim() !== '') {
    this.getFromApi({token: this.sess.token, user: this.sess.username, action: 'send-message', convid: this.act.convid,
    messagea: a, messageb: b}).subscribe( data => {
      if (data['status'] === 'success') {
        this.messages.push({value: this.m.textarea.trim(), div: 'ion-text-end', chip: 'my', id: data['id']});
        this.m.textarea = '';
        console.log(this.messages[this.messages.length - 1]['id']);

      }
    });
  }
  await delay(200);
  document.querySelector('ion-content').scrollToBottom(200);
}
getNotify() {
    console.log('get notify started!');
    this.getFromApi({token: this.sess.token, user: this.sess.username, action: 'get-notify'}).subscribe( data => {
      if (data['status']==='success') {
        data['data'].forEach(element => {
          if (element.id === this.act.convid){
            this.aus({ids: element.id, badge: ''});
          } else {
            this.aus({ids: element.id, badge: element.count});
            LocalNotifications.schedule({
              title: 'Nowe powiadomienie',
              text: 'przejdź do aplikacji aby uzyskać więcej informacji',
              foreground: true,
              lockscreen: true
            });
          }
          if (element.id === this.act.convid) {
            const req = 'https://ytconverter.online/api.php';
            this.http.post(req, {token: this.sess.token, action: 'get-messages', convid: this.act.convid, user: this.sess.username,
            lastid: this.messages[this.messages.length - 1].id})
                .subscribe( async data => {
                  let encrypt = new JSEncrypt();
                  for (const element of data['data']) {
                    let mess = '';
                    await encrypt.setPrivateKey(this.sess.pv);
                    mess = await encrypt.decrypt(element['message']);
                   if (element.from === this.sess.uid) {
                   await this.messages.push({value: mess, div: 'ion-text-end', chip: 'my', id: element['id']});
                   await delay(200);
                   document.querySelector('ion-content').scrollToBottom(1000);
                 } else {
                   await this.messages.push({value: mess, chip:'notmy', id: element['id']});
                   await delay(200);
                   document.querySelector('ion-content').scrollToBottom(200);
                 }
               }
             //  for ( let i = this.Menu.length - 1; i >= 0; i -= 1) {
             //    if (this.Menu[i].convid === datas.convid) {
             //       this.Menu[i].badge = '';
              //    }
               // }
             });
           }
         });
       }
    });
}
  getFromApi(body) {
    const req = 'https://ssk.rzeszow.pl/api.php';
    return this.http.post(req, body);
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalNumberPage
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data.b === 'H') {
      if (data.a > this.sess.uid) {
        return data.b + data.a + this.sess.uid;
      } else {
        return data.b + this.sess.uid + data.a;
      }
    }
  }
}
function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
