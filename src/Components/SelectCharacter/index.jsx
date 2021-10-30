import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import {Flex, Heading} from '@chakra-ui/react';

const SelectCharacter = ({setCharacter}) => {
  return (
    <Flex p="5%" flexDir="column" alignItems="flex-start" className="select-character-container">
      <Heading as="h2" size="2xl">Welcome. Time to select your character.</Heading>
    </Flex>
  )
}

export default SelectCharacter;