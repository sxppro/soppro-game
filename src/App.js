import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { ChakraProvider, Button, Image, Flex, Heading } from "@chakra-ui/react";
import { ethers } from 'ethers';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharData }from './constants';
import sopproGame from './utils/SopproGame.json';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = 'Sopproo';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [hasMetaMask, setMetaMask] = useState(false);
  const [currAccount, setCurrentAccount] = useState("");
  const [currChar, setCurrentChar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine user account
  const checkWalletConnection = () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("MetaMask must be installed");
      return;
    } else {
      setMetaMask(true);
      console.log("Ethereum object: ", ethereum);
    }

    getCurrentAccount();
  };

  // Retrieve user account
  const getCurrentAccount = () => {
    const { ethereum } = window;

    // Check wallet authorisation
    ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length !== 0) {
        // Grab first account (public wallet address)
        const account = accounts[0];
        console.log(`Authorised account: ${account}`);
        // Store public wallet address
        setCurrentAccount(account);
        // Do something
      } else {
        console.log("No authorised account found");
      }
    });
  };

  // Connect to user's first account
  const connectWallet = () => {
    const { ethereum } = window;
    if (!hasMetaMask) {
      alert("Please install MetaMask");
      return;
    }

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        console.log(`Connected: ${accounts[0]}`);
        setCurrentAccount(accounts[0]);
        // Do something
      })
      .catch((err) => console.error(err));
  };

  // Check for wallets on page load
  useEffect(() => {
    checkWalletConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for user character
  useEffect(() => {
    const fetchNFTMetaData = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, sopproGame.abi, signer);

      let txn = await gameContract.hasNFT();
      if (txn.name) {
        console.log(txn);
        setCurrentChar(transformCharData(txn));
      } else {
        // Handle no character
        alert("Error: no character exists");
      }

      setIsLoading(false);
    }

    if (currAccount) {
      fetchNFTMetaData()
    }
  }, [currAccount])

  // Determine what content to render
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />
    }
    if (!currAccount) {
      return <>
        <Image
                m="5%"
                borderRadius="base"
                src="https://media2.giphy.com/media/FyoaJE2iah7WYeyxWr/giphy.gif?cid=ecf05e47exzaqcbqfjc2v8qbfwvke8z9vky24xc15v4j79p7&rid=giphy.gif&ct=g"
                alt="Blue gradients flowing"
              />
        <Button
                className="walletButton"
                cursor="pointer"
                border="0px"
                borderRadius="base"
                bgGradient="linear(
                    to-r,
                    #a06eda 0%,
                    #a474db 0%,
                    #ae87db 21%,
                    #a271da 52%,
                    #9d68d9 78%,
                    #965bda 100%
                  );"
                mt={3}
                rounded={6}
                onClick={connectWallet}
                _hover={{ backgroundColor: 'transparent' }}
              >
                Connect Wallet
              </Button>
      </>
    } else if (currAccount && !currChar) {
      return <SelectCharacter setCharacter={setCurrentChar} />
    } else if (currAccount && currChar) {
      return <Arena characterNFT={currChar} setCharacterNFT={setCurrentChar} />
    }
  }


  return (
    <ChakraProvider>
      <div className="App">
        <div className="container">
          <div className="header-container">
            <p className="header gradient-text">⚔️ Soppro Game ⚔️</p>
            <p className="sub-text">Team up to defeat mobs and bosses in an exhilarating new game!</p>
            <div className="connect-wallet-container">
              {renderContent()}
            </div>
          </div>
          <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </ChakraProvider>
  );
};

export default App;
