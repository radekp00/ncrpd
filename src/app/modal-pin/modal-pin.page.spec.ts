import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalPINPage } from './modal-pin.page';

describe('ModalPINPage', () => {
  let component: ModalPINPage;
  let fixture: ComponentFixture<ModalPINPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPINPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalPINPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
