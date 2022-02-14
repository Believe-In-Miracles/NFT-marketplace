async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const StakingPool = await ethers.getContractFactory("StakingPool");
  const stakingpool = await StakingPool.deploy(
    "0x82994dff990b80ee01a90a9c2f5afccc1f5e32f5"
  );
  await stakingpool.deployed();
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
