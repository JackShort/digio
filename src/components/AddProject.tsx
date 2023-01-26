import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { BigNumber } from 'ethers'
import abi from '../abi/v0abi.json'
 
export function AddProject() {
  const { config } = usePrepareContractWrite({
    address: '0x7414C6D63b518672E447cF33974EfbF271fdBeD1',
    abi: abi,
    args: ["testing", "0xaDd287e6d0213e662D400d815C481b4b2ddE5d65", BigNumber.from("10000000000000000")],
    functionName: 'addProject',
  })

  const { write } = useContractWrite(config) 
 
  return (
        <div>
            <button onClick={() => write?.()}>Sell</button>
        </div>
  )
}