import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
// import { UserInputError } from 'apollo-server-express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Page } from './Page';
import { Connection } from './Connection';
import { ObjectID } from 'mongodb';

@Injectable()
export class ConnectionInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const args = context.getArgByIndex<{ page?: Page }>(1);

    const page = args.page;

    if (!page) return next.handle();

    if (page.first) page.first += 1;
    return next
      .handle()
      .pipe(map((list) => this.makeConnection(list || [], page)));
  }

  makeConnection<T extends { _id: ObjectID }>(
    list: T[],
    page?: Page,
  ): Connection<T> {
    if (page?.first) {
      const nodes = list.slice(0, page.first);

      return {
        edges: nodes.map((node) => ({ cursor: String(node._id), node })),
        pageInfo: {
          hasPreviousPage: !!page.after,
          startCursor: String(nodes[0]?._id),
          endCursor: String(nodes[nodes.length - 1]?._id),
          hasNextPage: nodes.length > list.length,
        },
      };
    }

    return {
      edges: list.map((node) => ({ cursor: String(node._id), node })),
      pageInfo: {
        endCursor: String(list[list.length - 1]?._id),
        startCursor: String(list[0]?._id),
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}
