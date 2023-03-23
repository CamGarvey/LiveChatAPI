import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Hashids from 'hashids/cjs/hashids';
import hashConfig from 'src/config/hash.config';

@Injectable()
export class HashService extends Hashids {
  constructor(
    @Inject(hashConfig.KEY)
    configuration: ConfigType<typeof hashConfig>,
  ) {
    super(configuration.salt, configuration.minLenth);
  }
}
