import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionFormComponent } from './collection-form.component';

describe('CollectionFormComponent', () => {
  let component: CollectionFormComponent;
  let fixture: ComponentFixture<CollectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
