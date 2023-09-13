import * as jsondiffpatch from 'jsondiffpatch'
let patcher = jsondiffpatch.create({
	objectHash: function (obj) {
		return obj.hash;
	}
});

export default class jsTPS {
    constructor() {
        this.transactions = [];
        this.numTransactions = 0;
        this.mostRecentTransaction = -1;
        this.performingDo = false;
        this.performingUndo = false;
    }

    hasTransactionToRedo() { return (this.mostRecentTransaction+1) < this.numTransactions; }
    hasTransactionToUndo() { return this.mostRecentTransaction >= 0; }

    addTransaction(oldMap, newMap, type = "edit") {
        if ((this.mostRecentTransaction < 0) || (this.mostRecentTransaction < (this.transactions.length - 1))) {
                for (let i = this.transactions.length - 1; i > this.mostRecentTransaction; i--) {
                    this.transactions.splice(i, 1);
                }
                this.numTransactions = this.mostRecentTransaction + 2;
        }
        else {
            this.numTransactions++;
        }

        let transaction = { delta: patcher.diff(oldMap, newMap), type: type };
        this.transactions[this.mostRecentTransaction+1] = transaction;
        this.mostRecentTransaction++;
    }

    redo() {
        if (this.hasTransactionToRedo()) {
            this.performingDo = true;
            let transaction = this.transactions[this.mostRecentTransaction+1];
            this.mostRecentTransaction++;
            this.performingDo = false;
            return transaction;
        }
    }

    undo() {
        if (this.hasTransactionToUndo()) {
            this.performingUndo = true;
            let transaction = this.transactions[this.mostRecentTransaction];
            this.mostRecentTransaction--;
            this.performingUndo = false;
            return transaction;
        }
    }

    clearAllTransactions() {
        this.transactions = [];
        this.mostRecentTransaction = -1;      
        this.numTransactions = 0; 
    }
}