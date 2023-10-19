import "@stdlib/deploy";


message: Withdraw{
    amount: Int as coins;
}

contract SendTon with Deployable {
    const minimumTonForStorage: Int = ton("0.01");
    owner: Address;

    init() {
        self.owner = sender();
    }

    fun onlyOwner() {
        require(sender() == self.owner, "only owner is allowed to withdraw");
    }

    receive() {
        
    }

    receive("withdraw all") {
        self.onlyOwner();
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    receive("withdraw safe") {
        self.onlyOwner();

        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - context().value - self.minimumTonForStorage,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }

    receive(msg: Withdraw){
        self.onlyOwner();
        let amount: Int = min(msg.amount, myBalance() - context().value -self. )
    }

    get fun balance(): Int{
        return myBalance();
    }
}
