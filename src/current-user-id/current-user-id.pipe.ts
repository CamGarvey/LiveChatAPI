import { Injectable, PipeTransform } from '@nestjs/common';
import { HashService } from 'src/hash/hash.service';

const USER_ID_KEY = 'http://localhost:4000/user_id';

@Injectable()
export class CurrentUserIdPipe implements PipeTransform {
  constructor(private hashService: HashService) {}

  transform(value: any): number {
    return +this.hashService.decode(value[USER_ID_KEY]);
  }
}
