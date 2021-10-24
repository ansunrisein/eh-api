import Firebase from 'firebase-admin'
import * as jwt from 'jsonwebtoken'
import {Injectable} from '@nestjs/common'

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

  constructor() {
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

  async authenticate(token: string | undefined): Promise<FirebaseUser | undefined> {
    if (!token) {
      return undefined
    }

    return this.decodeToken(token)
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
}
