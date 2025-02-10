import { TestBed } from '@angular/core/testing';
import { CurrentUserResolver } from './current-user.resolver';

describe('UserService', () => {
  let service: CurrentUserResolver;


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentUserResolver);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
