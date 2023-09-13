import * as jsondiffpatch from 'jsondiffpatch'
let patcher = jsondiffpatch.create({
	objectHash: function (obj) {
		return obj.hash;
	}
});

export default class graphicalTPS {
    constructor() {
        this.transactions = [];
        this.numTransactions = 0;
        this.mostRecentTransaction = -1;
        this.performingDo = false;
        this.performingUndo = false;
    }

    hasTransactionToRedo() { return (this.mostRecentTransaction+1) < this.numTransactions; }
    hasTransactionToUndo() { return this.mostRecentTransaction >= 0; }

    addTransaction(oldMap, newMap, oldMarkers, newMarkers, oldTextPositions, newTextPositions, type = "edit") {
        if (jsondiffpatch.diff(oldMap, newMap) == undefined && jsondiffpatch.diff(oldMarkers, newMarkers) == undefined && jsondiffpatch.diff(oldTextPositions, newTextPositions) == undefined) {
            return null;
        }
        if ((this.mostRecentTransaction < 0) || (this.mostRecentTransaction < (this.transactions.length - 1))) {
                for (let i = this.transactions.length - 1; i > this.mostRecentTransaction; i--) {
                    this.transactions.splice(i, 1);
                }
                this.numTransactions = this.mostRecentTransaction + 2;
        }
        else {
            this.numTransactions++;
        }
        /* let transaction = {
			delta1: jsondiffpatch.diff(oldMap, newMap),
			delta2: jsondiffpatch.diff(oldMarkers, newMarkers),
			oldTextPositions: oldTextPositions,
            newTextPositions: newTextPositions,
			type: type
            
		}; */
        console.log(jsondiffpatch.diff(oldMap, newMap))
        let transaction = {
			delta1: jsondiffpatch.diff(oldMap, newMap),
			delta2: jsondiffpatch.diff(oldMarkers, newMarkers),
			delta3: jsondiffpatch.diff(oldTextPositions, newTextPositions),
			type: type
		};
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