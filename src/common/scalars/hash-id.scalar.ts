import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { HashService } from 'src/hash/hash.service';

@Scalar('HashId')
export class HashIdScalar implements CustomScalar<string, number> {
  constructor(private readonly hashService: HashService) {}
  description = 'Hash Id custom scalar type';

  parseValue(value: string): number {
    return +this.hashService.decode(value);
  }

  serialize(value: number): string {
    return this.hashService.encode(value);
  }

  parseLiteral(ast: ValueNode): number {
    if (ast.kind === Kind.INT) {
      return +this.hashService.decode(ast.value);
    }
    return null;
  }
}
