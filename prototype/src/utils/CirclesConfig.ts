import type {CirclesConfig} from "@circles-sdk/sdk";
import { Sdk } from '@circles-sdk/sdk';
import {BrowserProviderContractRunner} from "@circles-sdk/adapter-ethers"
import { GroupProfile } from "@circles-sdk/profiles";

export const GnosisChainConfig: CirclesConfig = {
  circlesRpcUrl: 'https://static.94.138.251.148.clients.your-server.de/rpc/',
  pathfinderUrl: 'https://pathfinder.aboutcircles.com',
  profileServiceUrl: 'https://static.94.138.251.148.clients.your-server.de/profiles/',
  v1HubAddress: '0x29b9a7fbb8995b2423a71cc17cf9810798f6c543',
  v2HubAddress: '0x3D61f0A272eC69d65F5CFF097212079aaFDe8267',
  nameRegistryAddress: '0x8D1BEBbf5b8DFCef0F7E2039e4106A76Cb66f968',
  migrationAddress: '0x28141b6743c8569Ad8B20Ac09046Ba26F9Fb1c90',
  baseGroupMintPolicy: '0x79Cbc9C7077dF161b92a745345A6Ade3fC626A60',
  standardTreasury: '0x3545955Bc3900bda704261e4991f239BBd99ecE5',
  coreMembersGroupDeployer: '0x7aD59c08A065738e34f13Ac94542867528a1D328',
  baseGroupFactory:'0x452C116060cBB484eeDD70F32F08aD4F0685B5D2'
};

const adapter = new BrowserProviderContractRunner();
await adapter.init();

export const sdk = new Sdk (adapter, GnosisChainConfig);