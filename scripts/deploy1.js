async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    TentacleKnockout = await ethers.getContractFactory("TentacleKnockout");
    tentacleKnockout = await TentacleKnockout.deploy(
        "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/",
        "0x6F84Fa72Ca4554E0eEFcB9032e5A4F1FB41b726C"
    );
    await tentacleKnockout.deployed();
  
    console.log("NFT deployed to:", tentacleKnockout.address);
    const StakingPool = await ethers.getContractFactory("StakingPool");
    const stakingpool = await StakingPool.deploy(
      tentacleKnockout.address
    );
    await stakingpool.deployed();
    await tentacleKnockout.setStakingPool(stakingpool.address);
    console.log("StakingPool deployed to:", stakingpool.address);
  
    const Ink = await ethers.getContractFactory("UtilityToken");
    const ink = await Ink.deploy(stakingpool.address);
    await ink.deployed();
    console.log("Ink deployed to:", ink.address);
    await stakingpool.setUtilitytoken(ink.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  