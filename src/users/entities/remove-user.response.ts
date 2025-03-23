import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class RemoveUserResponse {
  @Field()
  success: boolean;

  @Field(() => User, { nullable: true })
  user: User;
}
