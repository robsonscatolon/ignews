import { RichText } from "prismic-dom";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { getPrismicClient } from "../../services/prismic";
import styles from "./post.module.scss";
import Head from "next/head";

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}
export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title}|ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.posts}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const session = await getSession({ req });

  if (!session?.activeSubscription) {
    return {
        redirect: {
            destination: `/posts/preview/${params.slug}`,
            permanent:false,
        }
    };
  }
  const { slug } = params;

  const response = await getPrismicClient().getByUID("posts", String(slug));

  const post = {
    slug: slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };
  return {
    props: { post },
  };
};
