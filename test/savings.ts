import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from 'chai';
import hre from 'hardhat';


describe('Savings Contract', () => {

    async function deploySavingsContract() {

        const [owner, account1] = await hre.ethers.getSigners();
        const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;

        const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    
    
        const Save = await hre.ethers.getContractFactory('Savings');
        const save = await Save.deploy(unlockTime)
    
        return { save, unlockTime,  owner, account1, ADDRESS_ZERO };
      }

    describe('deployment', () => {
        it('Should Set The Owner', async () => {

            const{save,owner} = await loadFixture(deploySavingsContract);

            expect(await save.owner()).to.equal(owner.address)
        })
        it('should not be address zero', async() => {
            let {save, ADDRESS_ZERO} = await loadFixture(deploySavingsContract);

            expect(save.target).to.not.be.equal(ADDRESS_ZERO);
        });

    describe('Save', () => {
        it('Should not accept 0 tokens', async () => {
            const {owner,save} = await loadFixture(deploySavingsContract);

            // const balanceBefore = (save.totalSavings);

            // await save.connect(owner).save({ value: 0 });

            // const balanceAfter = (save.totalSavings);

            // expect(balanceAfter).to.be.greaterThan(balanceBefore);

            expect(save.save({ value: 0 })).to.be.revertedWith("You can't save nothing");
        })
        it('Should Allow Me Save Ether', async () => {
            const {save,owner} = await loadFixture(deploySavingsContract);
            const amount = hre.ethers.parseEther('1');

            await save.save({value: amount});

            const balance = await save.getBalance({ from: owner.address });
            expect(balance).to.be.equal(amount);
        })
    })
    })
})