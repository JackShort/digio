import { type NextPage } from "next";
import { AddProject } from "../components/AddProject";
import { MintAssetKey } from "../components/MintAssetKey";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const TestPage: NextPage = () => {
    return (
        <div>
            <ConnectButton />
            <AddProject />
            <MintAssetKey />
        </div>
    )
}

export default TestPage;