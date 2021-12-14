import {createParamDecorator, ExecutionContext} from '@nestjs/common'

export const InjectLinkToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.getArgByIndex(2).linkToken,
)
