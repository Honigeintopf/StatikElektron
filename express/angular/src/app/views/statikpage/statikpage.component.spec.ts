import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatikpageComponent } from './statikpage.component';

describe('StatikpageComponent', () => {
  let component: StatikpageComponent;
  let fixture: ComponentFixture<StatikpageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatikpageComponent]
    });
    fixture = TestBed.createComponent(StatikpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
