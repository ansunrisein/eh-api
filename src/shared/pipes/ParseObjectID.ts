import {Injectable, PipeTransform} from '@nestjs/common'
import {ObjectId} from 'mongodb'

@Injectable()
export class ParseObjectID implements PipeTransform {
  private fields?: string[]

  transform(
    value: string | Record<string, string> | undefined,
  ): ObjectId | string | Record<string, string | ObjectId> | undefined {
    if (!value) {
      return value
    }

    if (typeof value === 'string') {
      return ObjectId.isValid(value) ? new ObjectId(value) : value
    }

    return this.fields.reduce((value, field) => {
      if (value[field] && ObjectId.isValid(value[field])) {
        return {...value, [field]: new ObjectId(value[field])}
      }

      return value
    }, value)
  }

  static for(fields?: string[] | string) {
    return Object.assign({}, new ParseObjectID(), {
      fields: Array.isArray(fields) ? fields : [fields],
    })
  }
}
