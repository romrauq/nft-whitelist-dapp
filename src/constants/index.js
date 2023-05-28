export const WHITELIST_CONTRACT_ADDRESS = "0x4E6E0Ed54Ce9b3b15bFA15D5f092335A242ac1bF";
export const abi = [
	{
		inputs: [
			{
				internalType: "uint8",
				name: "_maxWhitelistedAddresses",
				type: "uint8",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [],
		name: "addAddressToWhitelist",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "maxWhitelistedAddresses",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "numAddressesWhitelisted",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "whitelistedAddresses",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];
