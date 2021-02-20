import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalPINPage } from './modal-pin.page';

const routes: Routes = [
  {
    path: '',
    component: ModalPINPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalPINPageRoutingModule {}
