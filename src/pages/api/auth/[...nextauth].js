import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/faunadb";
import { query as q } from "faunadb";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user",
        },
      },

    }),
  ],
  callbacks: {
    session: async ({session}) =>{
      try{
        const activeSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Match(q.Index("user_by_email"), q.Casefold(session.user?.email))
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active")
                ])
          )
        );

        return { ...session, activeSubscription };
      } catch {
        return { ...session, activeSubscription : null};
      }
    }, 
    async signIn({ user, account, profile }) {
      console.log(user, account, profile);
      const { email } = user;
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index("user_by_email"), q.Casefold(user.email))
              )
            ),
            q.Create(q.Collection("users"), { data: { email } }),
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email)))
          )
        );

        return true;
      } catch {
        return false;
      }
    },
  },
  debug: false,
});