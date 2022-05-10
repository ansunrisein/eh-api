import {BaseEntity, Column, UpdateDateColumn, Entity, ObjectIdColumn} from 'typeorm'
import {ObjectId} from 'mongodb'

@Entity({name: 'board-views'})
export class BoardView extends BaseEntity {
  @ObjectIdColumn()
  _id!: ObjectId

  @Column()
  boardId!: ObjectId

  @Column()
  userId!: ObjectId

  @Column()
  count!: number

  @UpdateDateColumn({type: 'timestamp'})
  updatedAt!: Date
}
