
export async function switchToGnosis() {
  try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x64' }],
            });
        } catch (err: any) {
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: '0x64',
                            chainName: 'Gnosis Chain',
                            nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
                            rpcUrls: ['https://rpc.gnosischain.com'],
                            blockExplorerUrls: ['https://gnosisscan.io'],
                        },
                    ],
                });
            } else {
                throw err;
            }
        }
}
