import { useWeb3Context } from "../contexts/Web3Context";
import { connectWallet } from "../utils/ConnectWallet";

function Wallet() {
  const { web3State, updateWeb3State } = useWeb3Context();

  const handleWalletConnection = async () => {
    console.log("Button Clicked: Connecting Wallet...");
    const walletData = await connectWallet();
    console.log(walletData);
    if (!walletData) {
      console.error("Wallet connection failed or user rejected request.");
      return;
    }

    const { contractInstance, selectedAccount } = walletData;
    await updateWeb3State({
      contractInstance: contractInstance,
      selectedAccount: selectedAccount,
    });
    console.log("In wallet : ");
    console.log(web3State.contractInstance);
    console.log(web3State.selectedAccount);
  };

  const isConnected = !!web3State.selectedAccount;
  const shortAddress = web3State.selectedAccount
    ? `${web3State.selectedAccount.slice(0, 6)}…${web3State.selectedAccount.slice(-4)}`
    : null;

  return (
    <button
      onClick={handleWalletConnection}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 18px",
        background: isConnected
          ? "rgba(16, 185, 129, 0.12)"
          : "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)",
        border: isConnected
          ? "1px solid rgba(16, 185, 129, 0.35)"
          : "1px solid rgba(99,102,241,0.4)",
        borderRadius: "9px",
        color: isConnected ? "#34d399" : "#a5b4fc",
        fontWeight: 600,
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.25s ease",
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = isConnected
          ? "0 4px 16px rgba(16,185,129,0.25)"
          : "0 4px 16px rgba(99,102,241,0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      {/* MetaMask icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <polygon
          points="21.12,1.18 13.52,6.86 14.97,3.5"
          fill={isConnected ? "#34d399" : "#a5b4fc"}
          opacity="0.9"
        />
        <polygon
          points="2.88,1.18 10.42,6.91 9.03,3.5"
          fill={isConnected ? "#34d399" : "#a5b4fc"}
          opacity="0.7"
        />
        <circle cx="12" cy="13" r="5" fill={isConnected ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)"} />
        <circle cx="12" cy="13" r="2.5" fill={isConnected ? "#34d399" : "#818cf8"} />
      </svg>
      {isConnected ? shortAddress : "Connect Wallet"}
    </button>
  );
}

export default Wallet;
