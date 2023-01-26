import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import { BigNumber } from 'ethers'
 
export function AddProject() {
  const { config } = usePrepareContractWrite({
    address: '0x7414C6D63b518672E447cF33974EfbF271fdBeD1',
    abi: [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_projectName",
                    "type": "string"
                },
                {
                    "internalType": "address payable",
                    "name": "_creatorAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_pricePerTokenInWei",
                    "type": "uint256"
                }
            ],
            "name": "addProject",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
    ],
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