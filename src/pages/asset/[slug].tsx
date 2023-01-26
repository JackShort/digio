import Head from "next/head"
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

const Container = ({ children }: { children: ReactNode}) => {
    return (
        <>
            <Head>
                <title>Asset</title>
                <meta name="description" content="Selling on Digio" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center bg-zinc-200 pt-48">
                <div className="rounded bg-zinc-100 border-zinc-900 border-2 flex flex-col items-center justify-center gap-8 px-4 py-10">
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
                <div className="text-lg font-bold">{data.name}</div>
                {ownsAsset && 
                    (
                    <button className="inline-flex items-center shadow bg-blue-500 disabled:bg-zinc-400 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white text-lg font-bold py-2 px-10 rounded-lg" type="button" disabled={!presignedUrl.data}>
                        <a target="_blank" href={presignedUrl.data} rel="noopener noreferrer">
                            Download
                        </a>
                    </button>
                    )
                }
                {!ownsAsset &&
                    (
                        <div className="flex flex-col">
                            {!isLoading && (
                                <div className="w-full">
                                    {ethers.utils.formatEther(BigNumber.from(data.priceInWei))} ETH
                                </div>
                            )}
                            {isConnected ?
                                    <button className="inline-flex items-center shadow bg-blue-500 disabled:bg-zinc-400 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white text-lg font-bold py-2 px-10 rounded-lg" type="button" disabled={transactionLoading || isLoading} onClick={() => write?.()}>
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
                                                    Buy
                                                </>
                                        }
                                    </button>
                                : <ConnectButton />
                            }
                        </div>
                    )
                }
            </>
        </Container>
    );
}

export default Asset