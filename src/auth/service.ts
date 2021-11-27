import Firebase from 'firebase-admin'
import * as jwt from 'jsonwebtoken'
import {ExecutionContext, Injectable} from '@nestjs/common'
import {adjectives, animals, colors, starWars, uniqueNamesGenerator} from 'unique-names-generator'
import {UserService} from '../user/service'
import {User} from '../user/model'
import {ObjectId} from 'mongodb'

export type FirebaseUser = {
  uid?: string
  user_id?: string
  displayName?: string
  photoUrl?: string
  name?: string
  picture?: string
}

@Injectable()
export class AuthService {
  private admin: Firebase.app.App

  constructor(private userService: UserService) {
    this.admin = Firebase.initializeApp(
      !process.env.FIREBASE_AUTH_EMULATOR_HOST
        ? {
            credential: Firebase.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              privateKey: process.env.FIREBASE_PRIVATE_KEY,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
          }
        : {
            projectId: process.env.FIREBASE_PROJECT_ID,
          },
    )
  }

  static extractUserId(context: ExecutionContext): ObjectId | undefined {
    return context.getArgByIndex(2).user?._id
  }

  async authenticate(token: string | undefined): Promise<User | undefined> {
    if (!token) {
      return undefined
    }

    return this.decodeToken(token).then(user => user && this.getOrCreateUser(user))
  }

  private async decodeToken(token: string): Promise<FirebaseUser | undefined> {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      return jwt.decode(token) as FirebaseUser
    }

    return this.admin
      .auth()
      .verifyIdToken(token, true)
      .catch(() => undefined)
  }

  private async getOrCreateUser(firebaseUser: FirebaseUser): Promise<User | undefined> {
    const providerId = firebaseUser.uid || firebaseUser.user_id

    if (!providerId) {
      return undefined
    }

    const user = await this.userService.getUserByProviderId(providerId)

    if (user) {
      return user
    }

    return this.userService.create({
      providerId: providerId,
      nickname: uniqueNamesGenerator({
        dictionaries: [colors, starWars, animals, adjectives],
        length: 1,
      }),
      name: firebaseUser.name,
      avatar: firebaseUser.picture,
    })
  }
}
