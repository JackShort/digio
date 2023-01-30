import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>UniStore</title>
        <meta name="description" content="Generate Microstores" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Welcome to <span className="text-[hsl(280,100%,70%)]">UniStore</span>
          </h1>
          <Link href={"/sell"}>
              <button className={ `inline-flex items-center shadow bg-[hsl(280,100%,70%)] disabled:brightness-75 hover:brightness-125 focus:shadow-outline focus:outline-none text-white text-lg font-bold py-2 px-10 rounded-lg`  }type="button">
                Sell on UniStore
              </button>
          </Link>
        </div>
      </main>
    </>
  );
};

export default Home;
