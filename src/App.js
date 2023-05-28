// import logo from "./logo.svg";
import "./App.css";

import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "./constants/index";

// CSS styles:
const title_styles = {
	fontSize: "2rem",
	margin: "2rem 0",
};

const description_styles = {
	lineHeight: "1",
	margin: "2rem 0",
	"font-size": "1.2rem",
};

const button_styles = {
	borderRadius: "4px",
	backgroundColor: "blue",
	border: "none",
	color: "#ffffff",
	fontSize: "15px",
	padding: "20px",
	width: "200px",
	cursor: "pointer",
	marginBottom: "2%",
};

const main_styles = {
	padding: "20px 50px",
	minHeight: "90vh",
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	alignItems: "center",
	fontFamily: "Courier New, Courier, monospace",
};

const image_styles = {
	width: "70%",
	height: "50%",
	marginLeft: "20%",
};

const footer_styles = {
	display: "flex",
	padding: "2rem 0",
	borderTop: "1px solid #eaeaea",
	justifyContent: "center",
	alignItems: "center",
};

function App() {
	// walletConnected keep track of whether the user's wallet is connected or not
	const [walletConnected, setWalletConnected] = useState(false);
	// joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
	const [joinedWhitelist, setJoinedWhitelist] = useState(false);
	// loading is set to true when we are waiting for a transaction to get mined
	const [loading, setLoading] = useState(false);
	// numberOfWhitelisted tracks the number of addresses's whitelisted
	const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
	// Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
	const web3ModalRef = useRef();

	/**
	 - Returns a Provider or Signer object representing the Ethereum RPC with or without the signing capabilities of metamask attached
	
	 - A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
	 
	 - A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to request signatures from the user using Signer functions.
	 *
	 */
	// * Params: `needSigner` - True if you need the signer, default false otherwise
	const getProviderOrSigner = async (needSigner = false) => {
		// Connect to Metamask
		// Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
		const provider = await web3ModalRef.current.connect();
		const web3Provider = new providers.Web3Provider(provider);

		// If user is not connected to the Goerli network, let them know and throw an error
		const { chainId } = await web3Provider.getNetwork();
		if (chainId !== 5) {
			window.alert("Change the network to Goerli");
			throw new Error("Change network to Goerli");
		}

		if (needSigner) {
			const signer = web3Provider.getSigner();
			return signer;
		}
		return web3Provider;
	};

	/**
	 * addAddressToWhitelist: Adds the current connected address to the whitelist
	 */
	const addAddressToWhitelist = async () => {
		try {
			// We need a Signer here since this is a 'write' transaction.
			const signer = await getProviderOrSigner(true);
			// Create a new instance of the Contract with a Signer, which allows
			// update methods
			const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
			// call the addAddressToWhitelist from the contract
			const tx = await whitelistContract.addAddressToWhitelist();
			setLoading(true);
			// wait for the transaction to get mined
			await tx.wait();
			setLoading(false);
			// get the updated number of addresses in the whitelist
			await getNumberOfWhitelisted();
			setJoinedWhitelist(true);
		} catch (err) {
			console.error(err);
		}
	};

	/**
	 * getNumberOfWhitelisted:  gets the number of whitelisted addresses
	 */
	const getNumberOfWhitelisted = async () => {
		try {
			// Get the provider from web3Modal, which in our case is MetaMask
			// No need for the Signer here, as we are only reading state from the blockchain
			const provider = await getProviderOrSigner();
			// We connect to the Contract using a Provider, so we will only
			// have read-only access to the Contract
			const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);
			// call the numAddressesWhitelisted from the contract
			const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
			setNumberOfWhitelisted(_numberOfWhitelisted);
		} catch (err) {
			console.error(err);
		}
	};

	/**
	 * checkIfAddressInWhitelist: Checks if the address is in whitelist
	 */
	const checkIfAddressInWhitelist = async () => {
		try {
			// We will need the signer later to get the user's address
			// Even though it is a read transaction, since Signers are just special kinds of Providers,
			// We can use it in it's place
			const signer = await getProviderOrSigner(true);
			const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
			// Get the address associated to the signer which is connected to  MetaMask
			const address = await signer.getAddress();
			// call the whitelistedAddresses from the contract
			const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
			setJoinedWhitelist(_joinedWhitelist);
		} catch (err) {
			console.error(err);
		}
	};

	/*
    connectWallet: Connects the MetaMask wallet
  */
	const connectWallet = async () => {
		try {
			// Get the provider from web3Modal, which in our case is MetaMask
			// When used for the first time, it prompts the user to connect their wallet
			await getProviderOrSigner();
			setWalletConnected(true);

			checkIfAddressInWhitelist();
			getNumberOfWhitelisted();
		} catch (err) {
			console.error(err);
		}
	};

	/*
    renderButton: Returns a button based on the state of the dapp
  */
	const renderButton = () => {
		if (walletConnected) {
			if (joinedWhitelist) {
				return <div style={description_styles}>Thanks for joining the Whitelist!</div>;
			} else if (loading) {
				return <button style={button_styles}>Loading...</button>;
			} else {
				return (
					<button onClick={addAddressToWhitelist} style={button_styles}>
						Join the Whitelist
					</button>
				);
			}
		} else {
			return (
				<button onClick={connectWallet} style={button_styles}>
					Connect your wallet
				</button>
			);
		}
	};

	// In this case, whenever the value of `walletConnected` changes - this effect will be called
	useEffect(() => {
		// if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
		if (!walletConnected) {
			// Assign the Web3Modal class to the reference object by setting it's `current` value
			// The `current` value is persisted throughout as long as this page is open
			web3ModalRef.current = new Web3Modal({
				network: "goerli",
				providerOptions: {},
				disableInjectedProvider: false,
			});
			connectWallet();
		}
	}, [walletConnected]);
	// The array at the end of function call represents what state changes will trigger this effect

	useEffect(() => {
		document.title = "Whitelist Dapp";
		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.content = "Whitelist-Dapp";
		} else {
			const newMetaDescription = document.createElement("meta");
			newMetaDescription.setAttribute("name", "description");
			newMetaDescription.content = "Whitelist-Dapp";
			document.head.appendChild(newMetaDescription);
		}
	}, []);

	return (
		<div>
			<div style={main_styles}>
				<div>
					<h1 style={title_styles}>Welcome to Crypto Devs!</h1>
					<div style={description_styles}>
						{/* Using HTML Entities for the apostrophe */}
						We are offering a of interesting NTFs collections for developers in Crypto.
					</div>
					<div style={description_styles}>
						{numberOfWhitelisted} have already joined the Whitelist
					</div>
					{renderButton()}
				</div>
				<div>
					<img style={image_styles} alt={""} src="./crypto-devs.svg" />
				</div>
			</div>

			<footer style={footer_styles}>Made with &#10084; by Crypto Devs</footer>
		</div>
	);
}

export default App;
