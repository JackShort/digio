import { useRouter } from "next/router"

import { api } from "../../utils/api";

const Asset = () => {
    const router = useRouter()
    const slug = router.query.slug

    const assetQuery = api.asset.get.useQuery({ slug: slug?.toString() ?? "" })
    const presignedUrl = api.presignedUrl.get.useQuery({ slug: slug?.toString() ?? "" })

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <h1 className="text-white">Asset {slug}</h1>
            </div>
        </main>
    );
}

export default Asset