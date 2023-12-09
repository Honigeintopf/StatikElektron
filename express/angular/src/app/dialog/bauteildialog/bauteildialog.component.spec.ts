import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BauteildialogComponent } from './bauteildialog.component';

describe('BauteildialogComponent', () => {
  let component: BauteildialogComponent;
  let fixture: ComponentFixture<BauteildialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BauteildialogComponent]
    });
    fixture = TestBed.createComponent(BauteildialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
