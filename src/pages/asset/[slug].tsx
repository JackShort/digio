import Head from "next/head"
import Image from 'next/image'
import { useRouter } from "next/router"
import type { ReactNode} from "react";
import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { atom, useAtom } from "jotai";

import { api } from "../../utils/api";
import { env } from "../../env/client.mjs";
import abi from '../../abi/v0abi.json';

const awsImages = 'https://uniservingimages.s3.amazonaws.com/'

const Container = ({ children }: { children: ReactNode}) => {
    return (
        <>
            <Head>
                <title>Asset</title>
                <meta name="description" content="Selling on Digio" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center bg-[#242424]">
                <div className="rounded flex flex-col items-center justify-center px-4 py-10 max-w-[960px]">
                    {children}
                </div>
            </main>
        </>
    )
}

const ownsAssetAtom = atom(false)

const Asset = () => {
    const router = useRouter()
    const slug = router.query.slug

    const [ownsAsset, setOwnsAsset] = useAtom(ownsAssetAtom)

    const { isConnected, address } = useAccount()

    const {data, isLoading} = api.asset.get.useQuery({ slug: slug?.toString() ?? "" })
    const presignedUrl = api.presignedUrl.get.useQuery({ slug: slug?.toString() ?? "" })

    const { data: ownsProjectTokenData, isSuccess: ownsProjectTokenSuccess } = useContractRead({
        address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
        abi: abi,
        functionName: 'userBoughtProject',    
        args: [address, data?.projectId],
        watch: true,
    })

    const { config } = usePrepareContractWrite({
        address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
        abi: abi,
        args: [data?.projectId, "0xaDd287e6d0213e662D400d815C481b4b2ddE5d65"],
        overrides: {value: data ? BigNumber.from(data?.priceInWei) : BigNumber.from(0)},
        enabled: Boolean(data),
        functionName: 'mint',
    })

    const { data: transactionData, write } = useContractWrite(config)

    const { isLoading: transactionLoading } = useWaitForTransaction({
        hash: transactionData?.hash,
    })

    useEffect(() => {
        if (Boolean(ownsProjectTokenData) && ownsProjectTokenData as boolean) {
            setOwnsAsset(true)
        }
    }, [ownsProjectTokenData, setOwnsAsset])

    if (isLoading) {
        return (
            <Container>
                <p>Loading...</p>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container>
                <p>Asset not found</p>
            </Container>
        )
    }

    return (
        <Container>
            <>
                {data.headerImageKey &&
                    <Image src={awsImages + ( data.headerImageKey as string )} width={960} height={370} alt="idk" />
                }
                <div className={`w-full text-2xl text-white font-bold border-solid border-b-4 border-[#fa5c5c] mb-12`}>{data.name}</div>
                <div className="text-lg font-bold text-white mb-12">{data.description}</div>
                {data.footerImageKey &&
                    <Image src={awsImages + ( data.footerImageKey as string )} width={960} height={480} alt="idk" />
                }
                <div className="flex mt-12 flex-col w-full">
                    <div className={`w-full text-2xl text-white font-bold border-solid border-b-2 border-[#fa5c5c] mb-8`}>{ownsAsset ? "Download" : "Purchase"}</div>
                    {ownsAsset &&
                        (
                            <button className="inline-flex w-min items-center shadow bg-[#fa5c5c] disabled:brightness-75 hover:brightness-125 focus:shadow-outline focus:outline-none text-white text-lg font-bold py-2 px-10 rounded-lg" type="button" disabled={!presignedUrl.data}>
                                <a target="_blank" href={presignedUrl.data} rel="noopener noreferrer">
                                    Download
                                </a>
                            </button>
                        )
                    }
                    {!ownsAsset &&
                        (
                            <div className="flex gap-8 items-center">
                                {isConnected ?
                                        <button className="inline-flex items-center shadow bg-[#fa5c5c] disabled:brightness-75 hover:brightness-125 focus:shadow-outline focus:outline-none text-white text-lg font-bold py-2 px-10 rounded-lg" type="button" disabled={transactionLoading || isLoading} onClick={() => write?.()}>
                                            {isLoading ?
                                                (
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )
                                                : transactionLoading ?
                                                    (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Processing...
                                                        </>
                                                    )
                                                :
                                                    <>
                                                        Buy Now
                                                    </>
                                            }
                                        </button>
                                    : <ConnectButton />
                                }
                                <div className="text-white text-xl">
                                    {ethers.utils.formatEther(BigNumber.from(data.priceInWei))} ETH
                                </div>
                            </div>
                        )
                    }
                </div>
            </>
        </Container>
    );
}

export default Asset