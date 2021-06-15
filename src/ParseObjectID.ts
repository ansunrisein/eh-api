import { Injectable, PipeTransform } from '@nestjs/common';
import { ObjectID } from 'mongodb';

@Injectable()
export class ParseObjectID implements PipeTransform {
  private fields?: string[];

  transform(
    value: string | Record<string, string> | undefined,
  ): ObjectID | string | Record<string, string | ObjectID> | undefined {
    if (!value) {
      return value;
    }

    if (typeof value === 'string') {
      return ObjectID.isValid(value) ? new ObjectID(value) : value;
    }

    return this.fields.reduce((value, field) => {
      if (value[field] && ObjectID.isValid(value[field])) {
        return { ...value, [field]: new ObjectID(value[field]) };
      }

      return value;
    }, value);
  }

  static for(fields?: string[] | string) {
    const pipe = new ParseObjectID();
    pipe.fields = Array.isArray(fields) ? fields : [fields];
    return pipe;
  }
}
