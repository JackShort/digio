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
import { RenderStore } from '../components/RenderStore';

const nameAtom = atom("") 
const descriptionAtom = atom("") 
const fileAtom = atom<File | undefined>(undefined)
const headerFileAtom = atom<File | undefined>(undefined)
const footerFileAtom = atom<File | undefined>(undefined)
const priceAtom = atom("")
const executedSellAtom = atom(false)
const assetHashAtom = atom("")

const backgroundColorAtom = atom("#000000") //#242424
const textColorAtom = atom("#ffffff")
const accentColorAtom = atom("#FB118E") //#fa5c5c

const headerImageAtom = atom("")
const footerImageHeader = atom("")

const SellPage: NextPage = () => {
  const [name, setName] = useAtom(nameAtom)
  const [description, setDescription] = useAtom(descriptionAtom)
  const [file, setFile] = useAtom(fileAtom)
  const [headerFile, setHeaderFile] = useAtom(headerFileAtom)
  const [footerFile, setFooterFile] = useAtom(footerFileAtom)
  const [price, setPrice] = useAtom(priceAtom)
  const [executedSell, setExecutedSell] = useAtom(executedSellAtom)
  const [assetHash, setAssetHash] = useAtom(assetHashAtom)
  const [backgroundColor, setBackgroundColor] = useAtom(backgroundColorAtom)
  const [textColor, setTextColor] = useAtom(textColorAtom)
  const [accentColor, setAccentColor] = useAtom(accentColorAtom)

  const [headerImage, setHeaderImage] = useAtom(headerImageAtom)
  const [footerImage, setFooterImage] = useAtom(footerImageHeader)

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

  const presignedHeaderImageUrlMutation = api.presignedUrl.uploadImage.useMutation({
    onSuccess: (data) => {
      const { key, url } = data
      console.log("this would theoretically upload the header image to: " + key + " at " + url )

      //TODO: enable this when we want to do uploads
      axios.put(url, headerFile).then(() => {console.log('uploaded at: ' + key)}).catch((err) => {console.log(err)})
    }
  })
  const presignedFooterImageUrlMutation = api.presignedUrl.uploadImage.useMutation({
    onSuccess: (data) => {
      const { key, url } = data
      console.log("this would theoretically upload the footer image to: " + key + " at " + url )

      //TODO: enable this when we want to do uploads
      axios.put(url, footerFile).then(() => {console.log('uploaded at: ' + key)}).catch((err) => {console.log(err)})
    }
  })

  const assetMutation = api.createAsset.create.useMutation({
    onSuccess: (data) => {
      if (headerFile) {
        presignedHeaderImageUrlMutation.mutate({slug: data.slug + 'header.' + (headerFile.name.split('.').pop() ?? '')})
      }

      if (footerFile) {
        presignedFooterImageUrlMutation.mutate({slug: data.slug + 'footer.' + (footerFile.name.split('.').pop() ?? '')})
      }

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
      assetMutation.mutate({ 
        name,
        description,
        slug: address.toLowerCase() + name.replace(/\s/g, "").toLowerCase(),
        creator: address,
        projectId: (nextProjectIdData as BigNumber).toNumber().toString(),
        priceInWei: ethers.utils.parseEther(debouncedPrice).toString(),
        headerImageKey: headerFile ? address.toLowerCase() + name.replace(/\s/g, "").toLowerCase() + 'header.' + (headerFile.name.split('.').pop() ?? '') : null,
        footerImageKey: footerFile ? address.toLowerCase() + name.replace(/\s/g, "").toLowerCase() + 'footer.' + (footerFile.name.split('.').pop() ?? '') : null ,
        backgroundColor,
        textColor,
        accentColor,
      })
    }
  })
  
  const handleTitleChange = (e: FormEvent<HTMLInputElement>) => setName(e.currentTarget.value)
  const handleDescriptionChange = (e: FormEvent<HTMLTextAreaElement>) => setDescription(e.currentTarget.value)
  const handlePriceChange = (e: FormEvent<HTMLInputElement>) => setPrice(e.currentTarget.value)
  const handleFileChange = (e: FormEvent<HTMLInputElement>) => setFile(e.currentTarget.files?.[0])
  const handleHeaderFileChange = (e: FormEvent<HTMLInputElement>) => { 
    setHeaderFile(e.currentTarget.files?.[0])

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      setHeaderImage(
        URL.createObjectURL(e.currentTarget.files[0])
      );
    }
  }
  const handleFooterFileChange = (e: FormEvent<HTMLInputElement>) => {
    setFooterFile(e.currentTarget.files?.[0])

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      setFooterImage(
        URL.createObjectURL(e.currentTarget.files[0])
      );
    }
  }
  const handleBackgroundColorChange = (e: FormEvent<HTMLInputElement>) => setBackgroundColor(e.currentTarget.value)
  const handleTextColorChange = (e: FormEvent<HTMLInputElement>) => setTextColor(e.currentTarget.value)
  const handleAccentColorChange = (e: FormEvent<HTMLInputElement>) => setAccentColor(e.currentTarget.value)

  const canSubmit = !( !file || !address || !nextProjectIdSuccess || !nextProjectIdData || !name || !price || !description || transactionLoading || assetMutation.isLoading)

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
      <div className="flex">
        <div className="flex w-1/2 min-h-screen flex-col items-center bg-zinc-200 pt-48">
          <h1 className="text-6xl font-bold text-zinc-900 mb-12">Create a Store</h1>
          <div className="rounded bg-zinc-100 border-zinc-900 border-2 flex flex-col items-center justify-center gap-8 px-4 py-10">
              <div className="flex items-center gap-6 w-full">
                  <label className="block w-24 shrink-0 text-zinc-500 font-bold text-right" htmlFor="inline-full-name">
                      Asset Name
                  </label>
                  <input className="bg-zinc-200 appearance-none border-2 border-zinc-200 rounded w-full py-2 px-4 text-zinc-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-400" id="inline-full-name" type="text" value={name} onChange={handleTitleChange} placeholder="Example" />
              </div>
              <div className="flex items-center gap-6 w-full">
                  <label className="block w-24 shrink-0 text-zinc-500 font-bold text-right" htmlFor="inline-description">
                    Description
                  </label>
                  <textarea className="bg-zinc-200 appearance-none border-2 border-zinc-200 rounded w-full py-2 px-4 text-zinc-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-400" id="inline-description" value={description} onChange={handleDescriptionChange} placeholder="..." />
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
                  <label className="block w-24 shrink-0 text-zinc-500 font-bold text-right" htmlFor="background-color">
                    Background Color
                  </label>
                  <input className="bg-zinc-200 appearance-none border-2 border-zinc-200 rounded w-full py-2 px-4 text-zinc-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-400" id="background-color" type="text" value={backgroundColor} onChange={handleBackgroundColorChange} placeholder="#000000" />
              </div>
              <div className="flex items-center gap-6 w-full">
                  <label className="block w-24 shrink-0 text-zinc-500 font-bold text-right" htmlFor="text-color">
                    Text Color
                  </label>
                  <input className="bg-zinc-200 appearance-none border-2 border-zinc-200 rounded w-full py-2 px-4 text-zinc-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-400" id="text-color" type="text" value={textColor} onChange={handleTextColorChange} placeholder="#ffffff" />
              </div>
              <div className="flex items-center gap-6 w-full">
                  <label className="block w-24 shrink-0 text-zinc-500 font-bold text-right" htmlFor="accent-color">
                    Accent Color
                  </label>
                  <input className="bg-zinc-200 appearance-none border-2 border-zinc-200 rounded w-full py-2 px-4 text-zinc-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-400" id="accent-color" type="text" value={accentColor} onChange={handleAccentColorChange} placeholder="#ffffff" />
              </div>
              <div className="flex items-center gap-6 w-full">
                  <label className="block w-24 text-zinc-500 font-bold shrink-0 text-right" htmlFor="header-image-input">
                      Header Image
                  </label>
                  <input type="file" className="bg-zinc-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="header-image-input" onChange={handleHeaderFileChange} />
              </div>
              <div className="flex items-center gap-6 w-full">
                  <label className="block w-24 text-zinc-500 font-bold shrink-0 text-right" htmlFor="footer-image-input">
                      Footer Image
                  </label>
                  <input type="file" className="bg-zinc-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="footer-image-input" onChange={handleFooterFileChange} />
              </div>
              <div className="flex items-center gap-6 w-full">
                  <label className="block w-24 text-zinc-500 font-bold shrink-0 text-right" htmlFor="inline-full-name">
                      Asset File
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
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
        </div>
        <div className={ `flex w-1/2 bg-[${backgroundColor}] items-center flex-col` }>
          <div className={ `rounded flex flex-col items-center justify-center px-4 py-10 max-w-[960px] min-w-[720px]` }>
                <RenderStore 
                  name={name.length === 0 ? 'Example' : name}
                  description={description.length === 0 ? '...' : description}
                  headerSrc={headerImage}
                  footerSrc={footerImage}
                  useAws={false}
                  textColor={textColor}
                  accentColor={accentColor}
                  ownsAsset={false}
                  downloadUrl={undefined}
                  isConnected={true}
                  isLoading={false}
                  transactionLoading={false}
                  priceInWei={ethers.utils.parseEther(debouncedPrice ? debouncedPrice.length === 0 ? '1' : debouncedPrice : '1').toString()}
                  write={undefined}
                />
          </div>
        </div>
      </div>
    </>
  );
};

export default SellPage;
