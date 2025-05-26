import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenId'
})
export class ShortenIdPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  }
}