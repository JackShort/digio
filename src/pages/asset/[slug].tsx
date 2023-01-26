import { useRouter } from "next/router"
import type { ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { api } from "../../utils/api";

const ONE_MILLION = 1_000_000

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

    const {data, isLoading} = api.asset.get.useQuery({ slug: slug?.toString() ?? "" })
    const presignedUrl = api.presignedUrl.get.useQuery({ slug: slug?.toString() ?? "" })

    console.log(data)

    const { isConnected } = useAccount()

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
        </Container>
    );
}

export default Asset