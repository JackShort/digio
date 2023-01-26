import axios from 'axios'
import { type NextPage } from "next";
import Head from "next/head";
import { atom, useAtom } from "jotai";
import { useAccount, useContractRead, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { FormEvent} from "react";
import { BigNumber, ethers } from 'ethers';

import { useDebounce } from '../hooks/useDebounce';
import { api } from "../utils/api";
import abi from '../abi/v0abi.json';
import { env } from '../env/client.mjs';
import Link from 'next/link';

const nameAtom = atom("") 
const fileAtom = atom<File | undefined>(undefined)
const priceAtom = atom("")
const executedSellAtom = atom(false)
const assetHashAtom = atom("")

const SellPage: NextPage = () => {
  const [name, setName] = useAtom(nameAtom)
  const [file, setFile] = useAtom(fileAtom)
  const [price, setPrice] = useAtom(priceAtom)
  const [executedSell, setExecutedSell] = useAtom(executedSellAtom)
  const [assetHash, setAssetHash] = useAtom(assetHashAtom)

  const debouncedPrice = useDebounce(price, 500)

  const { isConnected, address } = useAccount()

  const presignedUrlMutation = api.presignedUrl.generate.useMutation({
    onSuccess: (data) => {
      const { key, url } = data
      console.log("this would theoretically upload to: " + key + " at " + url )

      //TODO: enable this when we want to do uploads
      axios.put(url, file).then(() => {console.log('uploaded at: ' + key)}).catch((err) => {console.log(err)})
    }
  })

  const assetMutation = api.createAsset.create.useMutation({
    onSuccess: (data) => {
      presignedUrlMutation.mutate({slug: data.slug})
      setExecutedSell(true)
      setAssetHash(data.slug)
    }
  })

  const { data: nextProjectIdData, isSuccess: nextProjectIdSuccess } = useContractRead({
    address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
    abi: abi,
    functionName: 'nextProjectId',    
  })

  const { config } = usePrepareContractWrite({
    address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
    abi: abi,
    args: ["likewhocarestho", "0xaDd287e6d0213e662D400d815C481b4b2ddE5d65", debouncedPrice ? ethers.utils.parseEther(debouncedPrice).toString() : BigNumber.from(0)],
    enabled: Boolean(debouncedPrice),
    functionName: 'addProject',
  })

  const { data, write } = useContractWrite(config)

  const { isLoading: transactionLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      if ( !file || !address || !nextProjectIdSuccess || !nextProjectIdData ) return
      assetMutation.mutate({ name, slug: address.toLowerCase() + name.replace(/\s/g, "").toLowerCase(), creator: address, projectId: (nextProjectIdData as BigNumber).toNumber().toString(), priceInWei: ethers.utils.parseEther(debouncedPrice).toString() })
    }
  })
  
  const handleTitleChange = (e: FormEvent<HTMLInputElement>) => setName(e.currentTarget.value)
  const handlePriceChange = (e: FormEvent<HTMLInputElement>) => setPrice(e.currentTarget.value)
  const handleFileChange = (e: FormEvent<HTMLInputElement>) => setFile(e.currentTarget.files?.[0])

  const canSubmit = !( !file || !address || !nextProjectIdSuccess || !nextProjectIdData || !name || !price || transactionLoading || assetMutation.isLoading)

  const submitForm = () => {
    if (!canSubmit) return
    write?.()
  }

  return (
    <>
      <Head>
        <title>Sell</title>
        <meta name="description" content="Selling on Digio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-zinc-200 pt-96">
        <h1 className="text-6xl font-bold text-zinc-900 mb-12">Listing on UniStore</h1>
        <div className="rounded bg-zinc-100 border-zinc-900 border-2 flex flex-col items-center justify-center gap-8 px-4 py-10">
            <div className="flex items-center gap-6 w-full">
                <label className="block w-24 shrink-0 text-zinc-500 font-bold text-right" htmlFor="inline-full-name">
                    Asset Name
                </label>
                <input className="bg-zinc-200 appearance-none border-2 border-zinc-200 rounded w-full py-2 px-4 text-zinc-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-400" id="inline-full-name" type="text" value={name} onChange={handleTitleChange} placeholder="Example" />
            </div>
            <div className="flex items-center w-full">
                <label className="block w-24 shrink-0 text-zinc-500 font-bold text-right mr-6" htmlFor="inline-price">
                  Price
                </label>
                <input className="bg-zinc-200 appearance-none border-2 border-zinc-200 rounded w-full py-2 px-4 text-zinc-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-400" id="inline-price" type="text" value={price} onChange={handlePriceChange} placeholder="0.01" />
                <label className="block shrink-0 text-zinc-500 font-bold text-left ml-4" htmlFor="inline-price">
                  ETH
                </label>
            </div>
            <div className="flex items-center gap-6 w-full">
                <label className="block w-24 text-zinc-500 font-bold shrink-0 text-right" htmlFor="inline-full-name">
                    File
                </label>
                <input type="file" className="bg-zinc-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" onChange={handleFileChange} />
            </div>
            {executedSell ? 
              (
                <Link href={`/asset/${assetHash}`}>
                  <button className="inline-flex items-center shadow bg-blue-500 disabled:bg-zinc-400 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white text-lg font-bold py-2 px-10 rounded-lg" type="button">
                    Access Asset Page
                  </button>
                </Link>
              )
              : isConnected ?
                (
                  <div className="flex items-center">
                      <button className="inline-flex items-center shadow bg-purple-500 disabled:bg-zinc-400 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white text-lg font-bold py-2 px-10 rounded-lg" type="button" onClick={() => submitForm()} disabled={!canSubmit}>
                        <>
                          {transactionLoading || assetMutation.isLoading ?
                            (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                Sell
                              </>
                            )
                          }
                        </>
                      </button>
                  </div>
                )
              :
              <ConnectButton />
            }
        </div>
      </main>
    </>
  );
};

export default SellPage;
