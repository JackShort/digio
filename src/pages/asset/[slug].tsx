import { useRouter } from "next/router"
import type { ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { BigNumber, ethers } from "ethers";

import { api } from "../../utils/api";
import { env } from "../../env/client.mjs";
import abi from '../../abi/v0abi.json';

const Container = ({ children }: { children: ReactNode}) => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
            <div className="container text-white flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                {children}
            </div>
        </main>
    )
}

const Asset = () => {
    const router = useRouter()
    const slug = router.query.slug

    const { isConnected, address } = useAccount()

    const {data, isLoading} = api.asset.get.useQuery({ slug: slug?.toString() ?? "" })
    const presignedUrl = api.presignedUrl.get.useQuery({ slug: slug?.toString() ?? "" })

    const { data: ownsProjectTokenData, isSuccess: ownsProjectTokenSuccess } = useContractRead({
        address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
        abi: abi,
        functionName: 'userBoughtProject',    
        args: [address, data?.projectId]
    })

    const { config } = usePrepareContractWrite({
        address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
        abi: abi,
        args: [data?.projectId, "0xaDd287e6d0213e662D400d815C481b4b2ddE5d65"],
        overrides: {value: data ? BigNumber.from(data?.priceInWei) : BigNumber.from(0)},
        enabled: Boolean(data),
        functionName: 'mint',
    })

    const { write } = useContractWrite(config) 

    console.log(ownsProjectTokenData)

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
            {!isConnected && <ConnectButton />}
            <p>{data.name}</p>
            {ownsProjectTokenSuccess && (ownsProjectTokenData as boolean) && 
                (
                    <button className="text-2xl bg-white text-[#6D59FF] py-2 px-6 rounded-full disabled:bg-slate-400" disabled={!presignedUrl.data}>
                        <a target="_blank" href={presignedUrl.data} rel="noopener noreferrer">
                            Download
                        </a>
                    </button>
                )
            }
            {!(ownsProjectTokenData as boolean) && isConnected && 
                (
                    <button className="text-2xl bg-white text-[#6D59FF] py-2 px-6 rounded-full disabled:bg-slate-400" onClick={() => write?.()}>
                        Buy
                    </button>
                )
            }
        </Container>
    );
}

export default Asset