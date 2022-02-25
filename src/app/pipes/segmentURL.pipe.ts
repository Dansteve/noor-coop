import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'segmentURL'
})
export class SegmentURLPipe implements PipeTransform {
  transform(text: any): string {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    //var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url: string, b: any, c: string) => {
      const url2 = (c === 'www.') ? 'http://' + url : url;
      return '<a href="' + url2 + '" target="_blank">' + url + '</a>';
    });
  }
}
