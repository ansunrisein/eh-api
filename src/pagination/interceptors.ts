import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common'
import {ObjectID} from 'mongodb'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {Connection, Page} from './model'

@Injectable()
export class ConnectionInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const args = context.getArgByIndex<{page?: Page}>(1)

    const page = args.page

    if (!page) {
      return next.handle()
    }

    page.first += 1
    page.after = page.after && new ObjectID(page.after)

    return next.handle().pipe(map(list => this.makeConnection(list || [], page)))
  }

  makeConnection<T extends {_id: ObjectID}>(list: T[], page?: Page): Connection<T> {
    if (page?.first) {
      const nodes = list.slice(0, page.first - 1)

      return {
        edges: nodes.map(node => ({cursor: node._id, node})),
        pageInfo: {
          hasPreviousPage: !!page.after,
          startCursor: nodes[0]?._id,
          endCursor: nodes[nodes.length - 1]?._id,
          hasNextPage: nodes.length < list.length,
        },
      }
    }

    return {
      edges: list.map(node => ({cursor: node._id, node})),
      pageInfo: {
        endCursor: list[list.length - 1]?._id,
        startCursor: list[0]?._id,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}
