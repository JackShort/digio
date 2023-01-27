import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { BigNumber, ethers } from "ethers";

const awsImages = 'https://uniservingimages.s3.amazonaws.com/'

export const RenderStore = ({ 
    name,
    description,
    headerSrc,
    footerSrc,
    useAws,
    textColor,
    accentColor,
    ownsAsset,
    downloadUrl, 
    isConnected,
    isLoading,
    transactionLoading,
    priceInWei,
    write,
}: {
    name?: string,
    description?: string,
    headerSrc?: string,
    footerSrc?: string,
    useAws: boolean,
    textColor: string,
    accentColor: string,
    ownsAsset: boolean,
    downloadUrl?: string,
    isConnected: boolean,
    isLoading: boolean,
    transactionLoading: boolean,
    priceInWei: string,
    write: ((overrideConfig?: undefined) => void) | undefined,
}) => {
    return (
        <>
            {headerSrc &&
                <Image src={useAws ? awsImages + headerSrc : headerSrc} width={960} height={370} alt="idk" />
            }
            <div className={`w-full text-2xl text-[${textColor}] font-bold border-solid border-b-4 border-[${accentColor}] mb-12 mt-4`}>{name ?? "Example"}</div>
            <div className={ `text-lg font-bold text-[${textColor}] mb-12` }>{description ?? "..."}</div>
            {footerSrc &&
                <Image src={useAws ? awsImages + footerSrc : footerSrc} width={960} height={480} alt="idk" />
            }
            <div className="flex mt-12 flex-col w-full">
                <div className={`w-full text-2xl text-[${textColor}] font-bold border-solid border-b-2 border-[${accentColor}] mb-8`}>{ownsAsset ? "Download" : "Purchase"}</div>
                {ownsAsset &&
                    (
                        <button className={ `inline-flex w-min items-center shadow bg-[${accentColor}] disabled:brightness-75 hover:brightness-125 focus:shadow-outline focus:outline-none text-[${textColor}] text-lg font-bold py-2 px-10 rounded-lg`  }type="button" disabled={!downloadUrl}>
                            <a target="_blank" href={downloadUrl} rel="noopener noreferrer">
                                Download
                            </a>
                        </button>
                    )
                }
                {!ownsAsset &&
                    (
                        <div className="flex gap-8 items-center">
                            {isConnected ?
                                    <button className={ `inline-flex items-center shadow bg-[${accentColor}] disabled:brightness-75 hover:brightness-125 focus:shadow-outline focus:outline-none text-[${textColor}] text-lg font-bold py-2 px-10 rounded-lg`  }type="button" disabled={transactionLoading || isLoading} onClick={() => write?.()}>
                                        {isLoading ?
                                            (
                                                <svg className={ `animate-spin -ml-1 mr-3 h-5 w-5 text-[${textColor}]`  }xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )
                                            : transactionLoading ?
                                                (
                                                    <>
                                                        <svg className={ `animate-spin -ml-1 mr-3 h-5 w-5 text-[${textColor}]`  }xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </>
                                                )
                                            :
                                                <>
                                                    Buy Now
                                                </>
                                        }
                                    </button>
                                : <ConnectButton />
                            }
                            <div className={ `text-[${textColor}] text-xl` }>
                                {ethers.utils.formatEther(BigNumber.from(priceInWei))} ETH
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    )
}