import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers, Contract, BrowserProvider } from "ethers";
import { toast } from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

interface WalletConnection {
  contractInstance: Contract;
  selectedAccount: string;
}

export const connectWallet = async (): Promise<
  WalletConnection | undefined
> => {
  try {
    if (!window.ethereum) {
      throw new Error("No Wallet Found, Install Metamask");
    }

    console.log("Connected to Metamask");

    const accounts: string[] = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    console.log("Connected Account: " + accounts[0]);

    const selectedAccount: string = accounts[0];
    const provider: BrowserProvider = new ethers.BrowserProvider(
      window.ethereum
    );
    const signer = await provider.getSigner();
    const contractInstance: Contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    //console.log(contractInstance, selectedAccount);
    toast.success("Wallet Connected Successfully");

    return { contractInstance, selectedAccount };
  } catch (error) {
    toast.error("Wallet Connection Failed");
    console.error("Connect Wallet Error: ", error);
    return undefined;
  }
};
