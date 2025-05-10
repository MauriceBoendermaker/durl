const GNOSIS_PARAMS = {
  chainId: '0x64',
  chainName: 'Gnosis Chain',
  nativeCurrency: {
    name: 'xDai',
    symbol: 'xDai',
    decimals: 18
  },
  rpcUrls: ['https://rpc.gnosischain.com'],
  blockExplorerUrls: ['https://gnosisscan.io']
};

export async function switchToGnosis() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: GNOSIS_PARAMS.chainId }]
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [GNOSIS_PARAMS]
        });
      } catch (addError) {
        console.error("Error adding Gnosis Chain:", addError);
      }
    } else {
      console.error("Error switching to Gnosis Chain:", switchError);
    }
  }
}

const SEPOLIA_PARAMS = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_PARAMS.chainId }]
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_PARAMS]
        });
      } catch (addError) {
        console.error("Error adding Sepolia:", addError);
      }
    } else {
      console.error("Error switching to Sepolia:", switchError);
    }
  }
}

