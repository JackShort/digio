import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import abi from '../abi/v0abi.json'
 
export function MintAssetKey() {
  const { config } = usePrepareContractWrite({
    address: '0x7414C6D63b518672E447cF33974EfbF271fdBeD1',
    abi: abi,
    args: [BigNumber.from('0'), "0xaDd287e6d0213e662D400d815C481b4b2ddE5d65"],
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