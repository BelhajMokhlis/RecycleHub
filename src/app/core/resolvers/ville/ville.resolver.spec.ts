import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { villeResolver } from './ville.resolver';

describe('villeResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => villeResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
