import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from 'chai';
import hre from 'hardhat';

describe('Savings Contract', () => {

    async function deploySavingsContract() {
        const [owner, account1] = await hre.ethers.getSigners();
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

        const Save = await hre.ethers.getContractFactory('Savings');
        const save = await Save.deploy(unlockTime)

        return { save, unlockTime, owner, account1 };
    }

    describe('Deployment', () => {
        it('Should set the owner', async () => {
            const { save, owner } = await loadFixture(deploySavingsContract);
            expect(await save.owner()).to.equal(owner.address);
        });

        it('Should set the unlock time in the future', async () => {
            const { save, unlockTime } = await loadFixture(deploySavingsContract);
            expect(await save.unlockTime()).to.be.greaterThan((await time.latest()));
        });
    });

    describe('Save', () => {
        it('Should not accept 0 tokens', async () => {
            const { save, owner } = await loadFixture(deploySavingsContract);
            await expect(save.save({ value: 0 })).to.be.revertedWith("You can't save nothing");
        });

        it('Should allow the owner to save Ether', async () => {
            const { save, owner } = await loadFixture(deploySavingsContract);
            const amount = hre.ethers.parseEther('1');
            await save.save({ value: amount });
            expect(await save.getBalance()).to.equal(amount);
        });

        it('Should not allow non-owners to save Ether', async () => {
            const { save, account1 } = await loadFixture(deploySavingsContract);
            const amount = hre.ethers.parseEther('1');
            await expect(save.connect(account1).save({ value: amount })).to.be.revertedWith("Only the owner can perform this action");
        });
    });

    describe('Withdraw', () => {
        it('Should revert if trying to withdraw before unlock time', async () => {
            const { save, owner } = await loadFixture(deploySavingsContract);
            await save.save({ value: hre.ethers.parseEther('1') });
            await expect(save.withdraw(hre.ethers.parseEther('1'))).to.be.revertedWith("Wait Some More");
        });

        it('Should allow withdrawal after unlock time', async () => {
            const { save, owner, unlockTime } = await loadFixture(deploySavingsContract);
            await save.save({ value: hre.ethers.parseEther('1') });
            await time.increaseTo(unlockTime);
            const balanceBefore = await hre.ethers.provider.getBalance(owner.address);
            await save.withdraw(hre.ethers.parseEther('1'));
            const balanceAfter = await hre.ethers.provider.getBalance(owner.address);
            expect(balanceAfter).to.be.greaterThan(balanceBefore);
        });

        it('Should revert if withdrawal amount exceeds total savings', async () => {
            const { save, owner, unlockTime } = await loadFixture(deploySavingsContract);
            await save.save({ value: hre.ethers.parseEther('1') });
            await time.increaseTo(unlockTime);
            await expect(save.withdraw(hre.ethers.parseEther('2'))).to.be.revertedWith("Insufficient balance");
        });
    });
});