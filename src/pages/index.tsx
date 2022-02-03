import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import styles from "./home.module.scss";
import { stripe } from "../services/stripe";
import { GetServerSideProps } from "next";

interface HomeProps {
  product: {
    priceId: String;
    amount: number;
  };
}
export default function Home(props: HomeProps) {
  return (
    <>
      <Head>
        <title>Home / ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome </span>
          <h1>
            New About the <span>React</span> world.
          </h1>
          <p>
            Get acess to all the publications.
            <br />
            <span>for {props.product.amount} month</span>
          </p>
          <SubscribeButton />
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const price = await stripe.prices.retrieve("price_1KMbQgG4D1WtPTlM7yE596Yw");
  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100),
  };

  return {
    props: {
      product,
    },
  };
};
