import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import abi from '../abi/v0abi.json'
import { env } from '../env/client.mjs'
 
export function MintAssetKey() {
  const { config } = usePrepareContractWrite({
    address: `0x${env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
    abi: abi,
    args: [BigNumber.from('5'), "0xaDd287e6d0213e662D400d815C481b4b2ddE5d65"],
    overrides: {value: ethers.utils.parseEther("0.01")},
    functionName: 'mint',
  })

  const { write } = useContractWrite(config) 
 
  return (
        <div>
            <button onClick={() => write?.()}>Mint</button>
        </div>
  )
}