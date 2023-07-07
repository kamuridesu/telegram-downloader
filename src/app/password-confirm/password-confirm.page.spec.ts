import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordConfirmPage } from './password-confirm.page';

describe('PasswordConfirmPage', () => {
  let component: PasswordConfirmPage;
  let fixture: ComponentFixture<PasswordConfirmPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PasswordConfirmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
