import {createParamDecorator, ExecutionContext} from '@nestjs/common'

export const InjectUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.getArgByIndex(2).user,
)
