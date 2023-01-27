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
import { RenderStore } from "../../components/RenderStore";

const awsImages = 'https://uniservingimages.s3.amazonaws.com/'

const Container = ({ children, backgroundColor }: { children: ReactNode, backgroundColor: string }) => {
    return (
        <>
            <Head>
                <title>Asset</title>
                <meta name="description" content="Selling on Digio" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={ `flex min-h-screen flex-col items-center bg-[${backgroundColor}]` }>
                <div className="rounded flex flex-col items-center justify-center px-4 py-10 max-w-[960px] min-w-[720px]">
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
            <Container backgroundColor="#242424">
                <p>Loading...</p>
            </Container>
        )
    }

    if (!data) {
        return (
            <Container backgroundColor="#242424">
                <p>Asset not found</p>
            </Container>
        )
    }

    const backgroundColor = data.backgroundColor as string
    const textColor = data.textColor as string
    const accentColor = data.accentColor as string

    return (
        <Container backgroundColor={backgroundColor}>
            <RenderStore
                name={data.name}
                description={data.description as string}
                headerSrc={data.headerImageKey ? data.headerImageKey as string : undefined}
                footerSrc={data.footerImageKey ? data.footerImageKey as string : undefined}
                useAws={true}
                textColor={textColor}
                accentColor={accentColor}
                ownsAsset={ownsAsset}
                downloadUrl={presignedUrl.data ? presignedUrl.data : undefined}
                isConnected={isConnected}
                isLoading={isLoading}
                transactionLoading={transactionLoading}
                priceInWei={data.priceInWei as string}
                write={write}
            />
        </Container>
    );
}

export default Asset