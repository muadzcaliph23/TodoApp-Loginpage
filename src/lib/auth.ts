import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import { db } from "./db"
import { compare } from "bcrypt";
import GoogleProvider from "next-auth/providers/google";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export const authOptions: NextAuthOptions ={
    adapter: PrismaAdapter(db),
    secret:process.env.NEXTAUTH_SECRET,
    session:{
        strategy:'jwt'
    },
    pages:{
        signIn:'/sign-in',
    },
    providers: [
        CredentialsProvider({
          name: "Credentials",
          credentials: {
            email: { label: "Email", type: "email", placeholder: "muadz@gmail.com" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials) {
            if(credentials?.email || !credentials?.password){
                return null
            }

            const existingUser = await db.user.findUnique({
                where: {email: credentials?.email}
            });
            if(!existingUser){
                return null;
            }

            const passwordMatch = await compare(credentials.password,
                existingUser.password);
            
            if(!passwordMatch){
                return null;
            }

            return{
                id: `${existingUser.id}`,
                username: existingUser.username,
                email: existingUser.email,
            }
          }
        }),
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET
        })
      ],
      callbacks:{
        async jwt({ token, user}) {
            if(user){
                return{
                    ...token,
                    username: user.username
                }
            }
            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                user:{
                    ...session.user,
                    username: token.username
                }
            }
        }
      }
}