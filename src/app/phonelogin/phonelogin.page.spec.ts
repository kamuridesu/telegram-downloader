import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhoneloginPage } from './phonelogin.page';

describe('PhoneloginPage', () => {
  let component: PhoneloginPage;
  let fixture: ComponentFixture<PhoneloginPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PhoneloginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
