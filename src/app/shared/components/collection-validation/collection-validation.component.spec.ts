import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionValidationComponent } from './collection-validation.component';

describe('CollectionValidationComponent', () => {
  let component: CollectionValidationComponent;
  let fixture: ComponentFixture<CollectionValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionValidationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
