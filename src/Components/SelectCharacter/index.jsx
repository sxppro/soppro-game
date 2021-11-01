import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import {Flex, Heading} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharData} from '../../constants';
import sopproGame from '../../utils/SopproGame.json';

const SelectCharacter = ({setCharacter}) => {
  const [characters, setCharacters] = useState([]); // Hold metadata of all default characters
  const [gameContract, setGameContract] = useState(null); // Represents our smart contract

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
          onClick
        >{`Mint ${char.name}`}</button>
      </div>
    ))
  }

  // Fetch contract object on page load
  useEffect(() => {
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

    if (gameContract) {
      getChars();
    }
  }, [gameContract]);

  return (
    <Flex p="5%" flexDir="column" alignItems="flex-start" className="select-character-container">
      <Heading as="h2" size="2xl">Welcome. Time to select your character.</Heading>
      {characters.length > 0 && (<div className="character-grid">{renderChars()}</div>)}
    </Flex>
  )
}

export default SelectCharacter;