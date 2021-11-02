import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharData} from '../../constants';
import './Arena.css'
import sopproGame from '../../utils/SopproGame.json';
import { Flex, Heading, Image, Progress, Button } from '@chakra-ui/react';
import LoadingIndicator from '../LoadingIndicator';

// @params: characterNFT - character metadata
const Arena = ({ characterNFT, setCharacterNFT }) => {
  // State
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Actions
  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log(attackTxn);
        setAttackState('hit');

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Attack Boss :: Error :: ', error);
      setAttackState('');
      setShowToast(false);
    }
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

  // Get boss and attach attack listener
  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBossL1();
      console.log('Boss: ', bossTxn);
      setBoss(transformCharData(bossTxn));
    }

    const onAttackComplete = (newBossHP, newPlayerHP) => {
      const bossHP = newBossHP.toNumber();
      const playerHP = newPlayerHP.toNumber();

      setBoss((prevState) => {
        return {...prevState, hp: bossHP}
      })
      setCharacterNFT((prevState) => {
        return {...prevState, hp: playerHP}
      })
    }

    if (gameContract) {
      fetchBoss();
      gameContract.on('Attacked', onAttackComplete)
    }

    return () => {
      if (gameContract) {
        gameContract.off('Attacked', onAttackComplete);
      }
    }
  }, [gameContract])

  return (
    <div className="arena-container">
      {boss && (
        <div id="toast" className="show">
          <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
      )}

      <Flex p="5%" flexDir="column" alignItems="center">
      <Heading as="h2" size="2xl" bgGradient="linear(to-bl, #7928CA, #FF0080)" bgClip="text">Here's the boss you'll fight.</Heading></Flex>
      {/* Boss */}
      {boss && (
      <div className="boss-container">
        <div className={`boss-content ${attackState}`}>
          <Heading size="xl" bgGradient="linear(to-bl, #e5f2d0, #9fe339)" bgClip="text">🔥 {boss.name} 🔥</Heading>
          <div className="image-content">
            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
            <div className="health-bar">
              <progress value={boss.hp} max={boss.maxHp} />
              <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
            </div>
          </div>
        </div>
        <div className="attack-container">
          <button className="cta-button" onClick={runAttackAction}>
            {`💥 Attack ${boss.name}`}
          </button>
        </div>
        {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Attacking ⚔️</p>
        </div>
      )}
      </div>
    )}

      {/* Character NFT */}
      {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default Arena;