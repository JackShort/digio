import axios from 'axios'
import { type NextPage } from "next";
import Head from "next/head";
import { atom, useAtom } from "jotai";
import { useAccount, useContractRead } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { FormEvent} from "react";
import type { BigNumber } from 'ethers';

import { api } from "../utils/api";
import abi from '../abi/v0abi.json';
import { env } from '../env/client.mjs';

const nameAtom = atom("Example") 
const fileAtom = atom<File | undefined>(undefined)

const SellPage: NextPage = () => {
  const [name, setName] = useAtom(nameAtom)
  const [file, setFile] = useAtom(fileAtom)

  const { isConnected, address } = useAccount()

  const assetMutation = api.createAsset.create.useMutation()
  const presignedUrlMutation = api.presignedUrl.generate.useMutation({
    onSuccess: (data) => {
      const { key, url } = data
      console.log("this would theoretically upload to: " + key + " at " + url )

      //TODO: enable this when we want to do uploads
      // axios.put(url, file).then(() => {console.log('uploaded at: ' + key)}).catch((err) => {console.log(err)})
    }
  })

  const { data: nextProjectIdData, isSuccess } = useContractRead({
    address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
    abi: abi,
    functionName: 'nextProjectId',    
  })
  
  const handleTitleChange = (e: FormEvent<HTMLInputElement>) => setName(e.currentTarget.value)
  const handleFileChange = (e: FormEvent<HTMLInputElement>) => setFile(e.currentTarget.files?.[0])

  const submitForm = () => {
    if ( !file || !address || !isSuccess ) return
    assetMutation.mutate({ name, slug: address + name, creator: address })
    // presignedUrlMutation.mutate({slug: address.toString() + name})
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
                <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" value={name} onChange={handleTitleChange} />
                </div>
            </div>
            <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
                    Zip File
                </label>
                </div>
                <div className="md:w-2/3">
                <input type="file" className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" onChange={handleFileChange} />
                </div>
            </div>
            {isConnected ?
                (
                  <div className="md:flex md:items-center">
                      <div className="md:w-1/3"></div>
                      <div className="md:w-2/3">
                      <button className="shadow bg-purple-500 disabled:bg-slate-400 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button" onClick={() => submitForm()} disabled={!file || !isSuccess}>
                          Sell
                      </button>
                      </div>
                  </div>
                )
              :
              <ConnectButton />
            }
          <div className="text-white">
            {assetMutation.isLoading && <p>Loading...</p>}
            {assetMutation.isSuccess && <p>{assetMutation.data.slug}</p>}
          </div>
        </div>
      </main>
    </>
  );
};

export default SellPage;
