import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import {Flex, Heading} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharData} from '../../constants';
import sopproGame from '../../utils/SopproGame.json';
import LoadingIndicator from '../LoadingIndicator';

const SelectCharacter = ({setCharacter}) => {
  const [characters, setCharacters] = useState([]); // Hold metadata of all default characters
  const [gameContract, setGameContract] = useState(null); // Represents our smart contract
  const [mintingChar, setMintingChar] = useState(false); // Denotes whether in minting phase or not

  // Selects character (mints NFT)
  const mintChar = (characterID) => async () => {
    try {
      if (gameContract) {
        setMintingChar(true);
        const mintTxn = await gameContract.mintCharacter(characterID);
        await mintTxn.wait();
        console.log(`Transaction :: Character Mint :: ${mintTxn}`)
        setMintingChar(false);
      }
    } catch (error) {
      console.warn(`Transaction :: Character Mint :: Error :: ${error}`);
      setMintingChar(false);
    }
  }

  // Renders character selection view
  const renderChars = () => {
    return characters.map((char, index) => (
      <div className="character-item" key={char.name}>
        <div className="name-container">
          <p>{char.name}</p>
        </div>
        <img src={char.imageURI} alt={char.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintChar(index)}
        >{`Mint ${char.name}`}</button>
      </div>
    ))
  }

  // Fetch contract object on page load
  useEffect(() => {
    // Initialise contract object
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, sopproGame.abi, signer);

      setGameContract(gameContract);
    } else {
      console.error("ethereum object not found");
    }
  }, [])

  // Fetch default characters on page load
  useEffect(() => {
    const getChars = async () => {
      try {
        const txn = await gameContract.getDefaultChars();
        console.log(txn);

        const chars = txn.map((charData) => {
          return transformCharData(charData);
        })
        console.log(chars);
        setCharacters(chars);
      } catch (error) {
        console.error("Fetching characters failed: ", error);
      }
    }

    // Event handler for character creation
    const onMintChar = async (sender, tokenID, charIndex) => {
      console.log(`Event :: Character Minted :: sender - ${sender} :: tokenID - ${tokenID} :: charIndex - ${charIndex}`)

      if (gameContract) {
        const userChar = await gameContract.hasNFT();
        console.log(`User character: ${userChar}`);
        setCharacter(transformCharData(userChar));
      }
    }

    if (gameContract) {
      getChars();
      gameContract.on('CharacterMinted', onMintChar);
    }

    // Cleanup listener
    return () => {
      if (gameContract) {
        gameContract.off('CharacterMinted', onMintChar);
      }
    }
  }, [gameContract]);

  return (
    <Flex p="5%" flexDir="column" alignItems="flex-start" className="select-character-container">
      <Heading as="h2" size="2xl">Welcome. Time to select your character.</Heading>
      {characters.length > 0 && (<div className="character-grid">{renderChars()}</div>)}
      {mintingChar && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Minting In Progress...</p>
        </div>
        <img
          src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
          alt="Minting loading indicator"
        />
      </div>
    )}
    </Flex>
    
  )
}

export default SelectCharacter;