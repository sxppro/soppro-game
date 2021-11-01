const CONTRACT_ADDRESS = "0x15d8E00E625b618C65eB138F3d77d54d31555f9B";

const transformCharData = (data) => {
  
  return {
    name: data.name,
    imageURI: data.imageURI,
    hp: data.hp.toNumber(),
    maxHp: data.maxHP.toNumber(),
    attackDamage: data.attackDamage.toNumber()
  }
}

export { CONTRACT_ADDRESS, transformCharData };