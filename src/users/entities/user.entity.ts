import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserRole } from '../roles/roles.enum';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => String)
  role: UserRole;

  @Field()
  age?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
