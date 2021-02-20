import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalNumberPage } from './modal-number.page';

const routes: Routes = [
  {
    path: '',
    component: ModalNumberPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalNumberPageRoutingModule {}
