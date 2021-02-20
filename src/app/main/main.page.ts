import { Component, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { DataService } from '../data.service';
import {  SQLiteObject } from '@ionic-native/sqlite/ngx';
import {IonContent} from '@ionic/angular';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;
@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage {
  // @ts-ignore
  @ViewChild('chatContent') content: IonContent;
  rsa = new cryptico.RSAKey();
  prsa: string;
  act = {
    convid: '',
    uid: '',
    pb: '',
    name: ''
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
              private route: ActivatedRoute, private modalController: ModalController, private eventsService: EventsService,
              public dataService: DataService, private changeDetection: ChangeDetectorRef) {
    route.params.subscribe(val => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.sess.username = '1';
        this.sess.password = '1';
        this.sess.token = this.router.getCurrentNavigation().extras.state.token; // !!!
        console.log(this.router.getCurrentNavigation().extras.state);
        this.rsa.setPrivateEx(
            this.router.getCurrentNavigation().extras.state.n,
            this.router.getCurrentNavigation().extras.state.e,
            this.router.getCurrentNavigation().extras.state.d,
            this.router.getCurrentNavigation().extras.state.p,
            this.router.getCurrentNavigation().extras.state.q,
            this.router.getCurrentNavigation().extras.state.dmp1,
            this.router.getCurrentNavigation().extras.state.dmq1,
            this.router.getCurrentNavigation().extras.state.coeff
        );
        // this.prsa = this.router.getCurrentNavigation().extras.state.prsa;
        console.log(this.rsa);
        console.log(cryptico.publicKeyString(this.rsa));
        this.prsa = cryptico.publicKeyString(this.rsa);
      }
      this.platform.ready().then(async () => {
        if (this.sess.token === '') { this.router.navigateByUrl('/start'); }
        this.platform.backButton.subscribeWithPriority(0, () => {
          navigator['app'].exitApp();

        });
        this.aus();
        this.getFromApi({token: this.sess.token, action: 'downloadMessageRequest'}).subscribe( );
      });
    });
    window.addEventListener('keyboardDidShow', () => {
      this.content.scrollToBottom(100).then( d => {
        this.content.scrollToBottom(100);
      });
    });
    this.eventsService.getObservable().subscribe((data) => {
      if (data.event === 'newMessage') {
            let decryptResult = cryptico.decrypt(data.message, this.rsa);
            if (decryptResult.status === 'success') {
              this.dataService.getUserBySign(decryptResult.publicKeyString).then( e => {
                this.dataService.getLastMessage(e.rows.item(0).id).then( f => {
                  let lastMessageId;
                  if (f.rows.length === 0) { lastMessageId = 0; } else { lastMessageId = f.rows.item(0).cid; }
                  this.dataService.addMessage(data.message, e.rows.item(0).id, lastMessageId + 1, 'notmy').then( x => {
                    if (this.act.pb === decryptResult.publicKeyString) {
                      console.log('entered');
                      this.messages.push({value: decryptResult.plaintext, chip:'notmy', id: lastMessageId + 1});
                      this.changeDetection.detectChanges();
                      this.content.scrollToBottom(100).then( d => {
                        this.content.scrollToBottom(100).then( n => {
                          this.resetUserUc(this.act.pb);
                        });
                      });
                    } else {
                      this.dataService.incrementUserUc(decryptResult.publicKeyString).then( u => {
                        this.aus();
                      });
                    }
                  });
                }).catch( f => {
                  console.log('error');
                });
              }).catch( e => {
                console.log('error');
              });

            }
        this.aus(); // update menu panels
        // // and send notify to bar.
        if (data.moreThanOne === 'yes') { // and send request to download next message
          this.getFromApi({token: this.sess.token, action: 'downloadMessageRequest'}).subscribe( );
        }
      } else if (data.event === 'newMessageNotification') {
        // Download message from server request
        this.getFromApi({token: this.sess.token, action: 'downloadMessageRequest'}).subscribe( );
      }
    });
  }
open() {
  console.log(this.Menu);
  this.menu.enable(true, 'first');
  this.menu.open('first');
}
oc(datas) {
this.menu.close();
this.messages = [];
this.act.pb = datas.pb;
this.act.uid = datas.uid;
this.act.convid = datas.convid;
this.act.name = datas.name;
//console.log(data);
const req = 'https://ssk.rzeszow.pl/api.php';
this.dataService.getMessagess(this.act.uid, 0).then( async data => {
//console.log(data);

for (let i = 0; i < data.rows.length; i++) {
  let mess = cryptico.decrypt(data.rows.item(i).message, this.rsa);
  console.log(mess);
  if (data.rows.item(i).ft === 'my') {
    this.messages.unshift({value: mess.plaintext, div: 'ion-text-end', chip: 'my', id: data.rows.item(i).cid});
  } else {
    this.messages.unshift({value: mess.plaintext, chip:'notmy', id: data.rows.item(i).cid});
  }
  await this.changeDetection.detectChanges();
}
  await this.changeDetection.detectChanges();
  await delay(200);
  this.content.scrollToBottom(100).then( d => {
    this.content.scrollToBottom(100);
  });
  this.resetUserUc(this.act.pb);
});
}
cc(data) {
this.act.pb = '';
this.act.uid = '';
this.act.name = '';
}
async au() {
    await this.presentModal();
}
aus(deff = undefined) {
this.Menu = [ ];
  this.dataService.getUsers().then( resultSet => {
    console.log(resultSet.rows.item(0).id);
    for (let i = 0; i < resultSet.rows.length; i++) {
      this.Menu.push({uid: resultSet.rows.item(i).id, name: resultSet.rows.item(i).name, tp: 'user', pbl: resultSet.rows.item(i).pb, convid: 'NULL', badge: resultSet.rows.item(i).uc});
        if (resultSet.rows.item(i).uc === 0) {
          this.Menu[i].badge = '';
        }
    }
    this.changeDetection.detectChanges();
  }).catch( resultSet => {
    console.log(resultSet.rows.item(0).id);
    for (let i = 0; i < resultSet.rows.length; i++) {
      this.Menu.push({uid: resultSet.rows.item(i).id, name: resultSet.rows.item(i).name, tp: 'user', pbl: resultSet.rows.item(i).pb, convid: 'NULL', badge: resultSet.rows.item(i).uc});
      if (resultSet.rows.item(i).uc === 0) {
        this.Menu[i].badge = '';
      }
    }
    this.changeDetection.detectChanges();
  });
}
async send() {
    // let a = ''; // toSend
   // let b = ''; // Local
    console.log(this.act.uid);
    console.log(this.sess.uid);
    console.log(this.act.pb);
    console.log(this.prsa);
    let a = cryptico.encrypt(this.m.textarea.trim(), this.act.pb, this.rsa);
    let b = cryptico.encrypt(this.m.textarea.trim(), this.prsa);
      // else {
    //   let encrypt = new JSEncrypt();
    //   encrypt.setPublicKey(this.act.pb);
    //   b = encrypt.encrypt(this.m.textarea.trim());
    //   encrypt.setPublicKey(this.sess.pb);
    //   a = encrypt.encrypt(this.m.textarea.trim());
    // }

  if (this.m.textarea.trim() !== '') {
    this.getFromApi({token: this.sess.token, too: this.act.pb, action: 'send-message',
    message: a.cipher}).subscribe( data => {
      if (data['status'] === 'success') {
        this.dataService.getLastMessage(this.act.uid).then( d => {
          if (d.rows.length === 0) {
            this.dataService.addMessage(b.cipher, this.act.uid, 1, 'my').then( async f => {
              this.messages.push({value: this.m.textarea.trim(), div: 'ion-text-end', chip: 'my', id: d.rows.item(0).cid + 1});
              this.m.textarea = '';
              console.log(this.messages[this.messages.length - 1]['id']);
              await this.changeDetection.detectChanges();
              await delay(200);
              this.content.scrollToBottom(100).then( d => {
                this.content.scrollToBottom(100).then( n => {
                  this.resetUserUc(this.act.pb);
                });
              });
            });
          } else {
            this.dataService.addMessage(b.cipher, this.act.uid, d.rows.item(0).cid + 1, 'my').then( async f => {
              this.messages.push({value: this.m.textarea.trim(), div: 'ion-text-end', chip: 'my', id: d.rows.item(0).cid + 1});
              this.m.textarea = '';
              console.log(this.messages[this.messages.length - 1]['id']);
              await this.changeDetection.detectChanges();
              await delay(200);
              this.content.scrollToBottom(100).then( d => {
                this.content.scrollToBottom(100).then( n => {
                  this.resetUserUc(this.act.pb);
                });
              });
            });
          }
        });

      }
    });
  }

}

  getMoreMessages(event) {
    this.dataService.getMessagess(this.act.uid, this.messages.length).then( async data => {
//console.log(data);

      for (let i = 0; i < data.rows.length; i++) {
        let mess = cryptico.decrypt(data.rows.item(i).message, this.rsa);
        console.log(mess);
        if (data.rows.item(i).ft === 'my') {
          this.messages.unshift({value: mess.plaintext, div: 'ion-text-end', chip: 'my', id: data.rows.item(i).cid});
        } else {
          this.messages.unshift({value: mess.plaintext, chip:'notmy', id: data.rows.item(i).cid});
        }
        await this.changeDetection.detectChanges();
      }
      event.target.complete();
      await this.changeDetection.detectChanges();
    });
  }
  getFromApi(body) {
    const req = 'https://ssk.rzeszow.pl/api.php';
    return this.http.post(req, body);
  }
  resetUserUc(pb) {
    this.dataService.setUserUc(pb, 0).then(m => {
      this.dataService.updateUserTs(pb).then( e => {
        this.aus();
      });
    });
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalNumberPage,
      componentProps: {prsa: this.prsa}
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    this.dataService.addUser(data.pb, data.displayName, cryptico.publicKeyID(data.pb)).then( d => {
      this.aus();
    });
  }
}
function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
