import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalNumberPage } from './modal-number.page';

describe('ModalNumberPage', () => {
  let component: ModalNumberPage;
  let fixture: ComponentFixture<ModalNumberPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalNumberPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalNumberPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
