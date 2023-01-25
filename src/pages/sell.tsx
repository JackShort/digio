import { type NextPage } from "next";
import Head from "next/head";
import { atom, useAtom } from "jotai";

import { api } from "../utils/api";
import type { FormEvent} from "react";
import { useEffect } from "react";

const titleAtom = atom("Example") 

const SellPage: NextPage = () => {
  const [title, setTitle] = useAtom(titleAtom)
  const assetMutation = api.createAsset.create.useMutation()
  const handleTitleChange = (e: FormEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)
  const submitForm = () => {
    assetMutation.mutate({ title })
  }

  return (
    <>
      <Head>
        <title>Sell</title>
        <meta name="description" content="Selling on Digio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
                    Asset Name
                </label>
                </div>
                <div className="md:w-2/3">
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" value={title} onChange={handleTitleChange} />
                </div>
            </div>
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
                    Zip File
                </label>
                </div>
                <div className="md:w-2/3">
                <input type="file" className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" />
                </div>
            </div>
            <div className="md:flex md:items-center">
                <div className="md:w-1/3"></div>
                <div className="md:w-2/3">
                <button className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button" onClick={() => submitForm()}>
                    Sell
                </button>
                </div>
            </div>
          <div className="text-white">
            {assetMutation.isLoading && <p>Loading...</p>}
            {assetMutation.isSuccess && <p>{assetMutation.data.asset.name + ': ' + assetMutation.data.asset.id.toString()}</p>}
          </div>
        </div>
      </main>
    </>
  );
};

export default SellPage;