import { useRouter } from "next/router"
import { useEffect } from "react";

import { api } from "../../utils/api";

const Asset = () => {
    const router = useRouter()
    const id = router.query.id

    const assetQuery = api.asset.get.useQuery({ id: id?.toString() ?? "" })

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <h1 className="text-white">Asset {id}</h1>
            </div>
        </main>
    );
}

export default Asset