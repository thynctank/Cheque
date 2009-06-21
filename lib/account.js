// entries table:
// 
// id
// account_id
// type
// subject (required)
// amount (required)
// date
// memo
// transfer_account_id (for lookup of entry when deleting)
// transfer_entry_id (for lookup of entry when deleting)
// pending
// check_number

// entries is an array of obj literals with properties matching entries table cols

function Account(options) {
  if(!options || !options.name || !options.cheque)
    throw("Error. Minimum data for account (name, cheque) not present");
  else {
    this.name = options.name;
    this.cheque = options.cheque;
    this.id = options.id || null;
    this.balance = options.balance || 0;
    this.entries = [];
  }
}

Account.prototype = {
  // if data exists, fill in entries
  loadEntries: function() {
    // this.entries = Storage.read(sql, success, failure);
  },
  // save balance for reporting purposes (as in dashboard)
  save: function() {
    if(this.entries.length === 0 && this.balance > 0)
      this.credit({subject: "Opening Balance", amount: this.balance, calledFromSave: true});
    if(this.entries.length === 0 && this.balance < 0)
      this.debit({subject: "Opening Balance", amount: this.balance, calledFromSave: true});

    // assign auto-increment ID to this.id if not exist
    if(!this.id)
      this.id = 1;
    
    this.balance = this.getBalance();
  },
  // options for getBalance allow for filtering by type, actual vs cleared
  getBalance: function(options) {
    var balance = 0;
    for(var i = 0, j = this.entries.length; i < j; i++) {
      if(this.entries[i].type == "credit")
        balance += this.entries[i].amount;
      else
        balance -= this.entries[i].amount;
    }
    return balance;
  },
  // all three functions call transact
  debit: function(options) {
    options = options ? options : {};
    options.type = "debit";
    this._writeEntry(options);
  },
  credit: function(options) {
    options = options ? options : {};
    options.type = "credit";
    this._writeEntry(options);
  },
  // takes regular options obj but also takes transferAccountName
  transfer: function(options) {
    // setup a debit on this acct and a credit on the other acct
    if(!options || !options.transferAccountName)
      throw("Error. Minimum data for transfer (transferAccountName) not present");
    else {
      var thatAccount = this.cheque.getAccount(options.transferAccountName);
      if(!thatAccount)
        throw("Error. Transfer account does not exist");
      else {
        options.subject = options.subject ? options.subject : "Transfer: " + this.name + " to " + thatAccount.name;

        var theseOptions = options;
        theseOptions.transfer_account_id = thatAccount.id;
        // get ID from this _writeEntry call, index
        this.debit(theseOptions);

        var thoseOptions = options;
        
        thoseOptions.transfer_account_id = this.id;
        // set to ID obtained from first _writeEntry
        thoseOptions.transfer_entry_id = null;
        
        // get this ID for third db hit
        thatAccount.credit(thoseOptions);
        
        // use second obtained ID
        theseOptions.transfer_entry_id = null;
        // this.credit(theseOptions, index);
      }
    }
  },
  eraseEntry: function(index, success, failure) {
    this.entries.splice(index, 1);
    
    // build sql
    // Storage.erase(sql, success, failure);
    this.save();
  },
  // utility functions
  // transact should be able to rollback if something goes wrong, save if all works
  _writeEntry: function(options, index) {
    if(!options || !options.type || !options.subject || !options.amount)
      throw("Error. Minimum data for entry (subject, amount) not present");
    else {
      if(index) {
        this.entries[index] = options;
      }
      else {
        // require minimum options of type, subject, amount
        options = {
          account_id: this.id,
          type: options.type,
          subject: options.subject,
          amount: options.amount,
          date: options.date || (new Date().getTime()),
          memo: options.memo || null,
          transfer_account_id: options.transfer_account_id || null,
          transfer_entry_id: options.transfer_entry_id || null,
          pending: options.pending || true,
          check_number: options.check_number || null
        };
        this.entries.push(options);
      }

      // build appropriate sql
      Storage.transact(function() {
        var sql = "";
        if(options.id)
          ;// update
        else
          ;// insert
        Storage.write(sql, function() {
          
        }, function(){});
      });
      
      if(options.calledFromSave)
        return;
      else
        this.save();
    }
  },
  sort: function(column) {}
};

// tie into universal search?