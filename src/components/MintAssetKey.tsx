import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
 
export function MintAssetKey() {
  const { config } = usePrepareContractWrite({
    address: '0x7414C6D63b518672E447cF33974EfbF271fdBeD1',
    abi: [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_projectId",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "_to",
                    "type": "address"
                }
            ],
            "name": "mint",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "_tokenId",
                    "type": "uint256"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        }
    ],
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