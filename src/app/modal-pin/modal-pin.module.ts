import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalPINPageRoutingModule } from './modal-pin-routing.module';

import { ModalPINPage } from './modal-pin.page';

import { AutofocusModule } from 'angular-autofocus-fix';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalPINPageRoutingModule,
    AutofocusModule
  ],
  declarations: [ModalPINPage]
})
export class ModalPINPageModule {}
