import { Resolve, ResolveFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';


interface CityResolver {
  results: {
    objectId: string;
    asciiname: string;
    createdAt: string;
    updatedAt: string;
  }[];
}


@Injectable({
  providedIn: 'root'
})
export class VilleResolver implements Resolve<CityResolver> {
  
  
  constructor(private http: HttpClient) {}

  resolve(): Observable<CityResolver> {
    return this.http.get<CityResolver>('https://parseapi.back4app.com/classes/List_of_Morroco_cities?order=asciiname&keys=asciiname', {
      headers: {


        'X-Parse-Application-Id': '2ZOfB60kP39M5kE4WynRqyP7lNGKZ9MB8fVWqAM9',
        'X-Parse-Master-Key': 'Qq7lEIoEEzRris3IM6POE5ewvYuzACVyA6VKtiVb'
      }
    });
  }
}
