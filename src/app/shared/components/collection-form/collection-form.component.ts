import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { CollectionRequestStatus } from '../../../core/models/CollectionRequest.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.model';
import { CollectionService } from '../../../core/services/Collection/collection.service';


@Component({
  selector: 'app-collection-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './collection-form.component.html',
  styleUrl: './collection-form.component.scss'
})
export class CollectionFormComponent implements OnInit {
  collectionForm!: FormGroup;
  @Output() closeForm = new EventEmitter<void>();
  @Input() villes: string[] = [];
  @Input() user!: User;
  @Input() weight!: number;
  imagePreview: string | ArrayBuffer | null = null;
  newWeight:number=0;



  constructor(private fb: FormBuilder, 
    private service: CollectionService
  ) {}

  ngOnInit(): void {
    this.collectionForm = this.fb.group({
      wasteItems: this.fb.array([this.createWasteItem()]),
      ville: ['', Validators.required],
      collectionAddress: ['', Validators.required],
      preferredDateTime: this.fb.group({

        date: ['', [Validators.required, this.futureDateValidator()]],
        timeSlot1: ['', Validators.required],
        timeSlot2: ['', Validators.required]
      }, { validators: this.timeSlotValidator() }),
      status: [CollectionRequestStatus.Pending, Validators.required],
      particulierId: [this.user.id],
      totalWeight: [this.weight]
    });
  


    // Access the wasteItems FormArray
    const wasteItemsArray = this.wasteItems;

    // Subscribe to value changes of each waste item
    console.log("wasteItemsArray", wasteItemsArray);
    wasteItemsArray.controls.forEach((control, index) => {
      control.valueChanges.subscribe(value => {
        console.log(`Waste item ${index} value changed:`, value);
      });
    });

    // Iterate over the wasteItems to get their values
    const wasteItemsValues = wasteItemsArray.controls.map(control => control.value);

    console.log("All wasteItemsValues:", wasteItemsValues);
  }


  createWasteItem(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      estimatedWeight: [0, [Validators.required, this.Weightvalidator()]]
    });
  }

  

  



  get wasteItems(): FormArray {
    return this.collectionForm ? (this.collectionForm.get('wasteItems') as FormArray) : new FormArray([] as any[]);
  }

  addWasteItem(): void {
    this.wasteItems.push(this.createWasteItem());
    console.log("wasteItemsArray", this.wasteItems);
  }

  onSubmit(): void {
    this.service.createCollectionRequest(this.collectionForm).subscribe({
      next: () => {
        this.closeForm.emit();
      },
      error: (error) => {
        console.error('Error creating collection request:', error);
        alert(error.message);
      }
    });
  }



  close(): void {
    this.closeForm.emit();
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          this.imagePreview = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Custom validator to check if the date is in the future
  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const currentDate = new Date();
      const inputDate = new Date(control.value);
      return inputDate > currentDate ? null : { 'notFutureDate': { value: control.value } };
    };
  }

  // Custom validator to check if timeSlot1 is before timeSlot2
  timeSlotValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const timeSlot1 = group.get('timeSlot1')?.value;
      const timeSlot2 = group.get('timeSlot2')?.value;
      if (timeSlot1 && timeSlot2 && timeSlot1 >= timeSlot2) {
        return { 'invalidTimeSlot': true };
      }
      return null;
    };
  }

  // Custom validator to check if a number is positive
  combinedValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value??0;
      
     
      const totalWasteItemsWeight = this.wasteItems.controls
      .map(control =>
       control.value.estimatedWeight=value)
      .reduce((sum, weight) => sum + weight, 0);
      const totalWeight = this.weight + totalWasteItemsWeight;

      console.log("totalWasteItemsWeight", totalWasteItemsWeight);



      console.log("totalWeight00", totalWeight);

      if (value <= 1000) {
        return { 'notPositive': { value: control.value } };
      }

      if (totalWeight > 10000) {
        return { 'invalidWeight': { value: control.value } };
      }

      return null;
    };
  }

  Weightvalidator(): ValidatorFn {
 
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value??0;
      if (value < 1000) {
        return { 'notPositive': { value: control.value } };
      }
      return null;
    };

  }

}
