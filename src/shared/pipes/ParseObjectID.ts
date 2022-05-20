import {Injectable, PipeTransform} from '@nestjs/common'
import {ObjectId} from 'mongodb'

@Injectable()
export class ParseObjectID implements PipeTransform {
  private fields?: string[]

  transform(
    value: string | Record<string, string | Array<string>> | Array<string> | undefined,
  ):
    | ObjectId
    | string
    | Record<string, string | ObjectId | Array<ObjectId | string>>
    | Array<ObjectId | string>
    | undefined {
    if (!value) {
      return value
    }

    if (typeof value === 'string') {
      return ObjectId.isValid(value) ? new ObjectId(value) : value
    }

    if (Array.isArray(value)) {
      return value.map(item => (ObjectId.isValid(item) ? new ObjectId(item) : item))
    }

    return this.fields?.reduce<Record<string, string | ObjectId | Array<ObjectId | string>>>(
      (value, field) => {
        const v = value[field]

        if (v) {
          if (Array.isArray(v)) {
            return {
              ...value,
              [field]: v.map(item => (ObjectId.isValid(item) ? new ObjectId(item) : item)),
            }
          }

          if (ObjectId.isValid(v)) {
            return {...value, [field]: new ObjectId(v)}
          }
        }

        return value
      },
      value,
    )
  }

  static for(fields: string[] | string) {
    const pipe = new ParseObjectID()
    pipe.fields = Array.isArray(fields) ? fields : [fields]
    return pipe
  }
}
