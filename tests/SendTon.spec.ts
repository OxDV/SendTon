import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { fromNano, toNano } from 'ton-core';
import { SendTon } from '../wrappers/SendTon';
import '@ton-community/test-utils';
import { send } from 'process';
import { log } from 'console';

describe('SendTon', () => {
    let blockchain: Blockchain;
    let sendTon: SandboxContract<SendTon>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sendTon = blockchain.openContract(await SendTon.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sendTon.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sendTon.address,
            deploy: true,
            success: true,
        });

        await sendTon.send(
            deployer.getSender(),
            {
                value: toNano("500")
            }, null
        )
    });

    it('should deploy and receive ton', async () => {
        const balance = await sendTon.getBalance()
    });

    it("should withdraw all", async () => {
        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance()

        await sendTon.send(user.getSender(), {
            value: toNano("0.2")
        }, 'withdraw all')
        const balanceAfterUser = await user.getBalance()

        expect(balanceBeforeUser).toBeGreaterThanOrEqual(balanceAfterUser)

        const balanceBeforeDeployer = await deployer.getBalance();

        await sendTon.send(deployer.getSender(), {
            value: toNano("0.2")
        }, 'withdraw all')
        const balanceAfterDeployer = await deployer.getBalance();

        expect(balanceAfterDeployer).toBeGreaterThan(balanceBeforeDeployer)


    });

    it("should withdraw safe", async () => {
        const user = await blockchain.treasury('user');
        const balanceBeforeUser = await user.getBalance()

        await sendTon.send(user.getSender(), {
            value: toNano("0.2")
        }, 'withdraw safe')
        const balanceAfterUser = await user.getBalance()

        expect(balanceBeforeUser).toBeGreaterThanOrEqual(balanceAfterUser)

        const balanceBeforeDeployer = await deployer.getBalance();

        await sendTon.send(deployer.getSender(), {
            value: toNano("0.2")
        }, 'withdraw safe')
        const balanceAfterDeployer = await deployer.getBalance();

        expect(balanceAfterDeployer).toBeGreaterThan(balanceBeforeDeployer)

        const balance = await sendTon.getBalance();
        expect(balance).toBeGreaterThan(0n)

    });

});
