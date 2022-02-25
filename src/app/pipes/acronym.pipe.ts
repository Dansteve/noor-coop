import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'acronym'
})
export class AcronymPipe implements PipeTransform {
  transform(value: any): string {
    let str = value.toString();
    str = str.replace('(', '').replace(')', '');
    const firstWords = str.split(' ').slice(0, 2);
    let acronym = '';
    if (firstWords.length === 2) {
      acronym = firstWords[0].split('')[0] + firstWords[1].split('')[0];
    } else {
      acronym = firstWords[0].split('')[0] + firstWords[0].split('')[1];
    }
    return acronym;
  }
}
