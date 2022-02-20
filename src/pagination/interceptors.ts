import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common'
import {ObjectId} from 'mongodb'
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

    return next.handle().pipe(map(list => this.makeConnection(list || [], page)))
  }

  makeConnection<T extends {_id: ObjectId; _cursor?: string | Record<string, unknown>}>(
    list: T[],
    page?: Page,
  ): Connection<T> {
    if (page?.first) {
      const nodes = list.slice(0, page.first - 1)

      return {
        edges: nodes.map(node => ({cursor: this.extractCursor(node), node})),
        pageInfo: {
          hasPreviousPage: !!page.after,
          startCursor: nodes.length ? this.extractCursor(nodes[0]) : undefined,
          endCursor: nodes.length ? this.extractCursor(nodes[nodes.length - 1]) : undefined,
          hasNextPage: nodes.length < list.length,
        },
      }
    }

    return {
      edges: list.map(node => ({cursor: this.extractCursor(node), node})),
      pageInfo: {
        endCursor: list.length ? this.extractCursor(list[list.length - 1]) : undefined,
        startCursor: list.length ? this.extractCursor(list[0]) : undefined,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }

  extractCursor(obj: {_id: ObjectId; _cursor?: string | Record<string, unknown>}) {
    if (!obj._cursor) {
      return String(obj._id)
    }

    return typeof obj._cursor === 'string' ? obj._cursor : JSON.stringify(obj._cursor)
  }
}
