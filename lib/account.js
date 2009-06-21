// entries table:
// 
// id
// account_id
// type
// subject
// amount
// date
// memo
// transfer_account_id
// transfer_entry_id
// pending
// check_number

// entries is an array of obj literals with properties matching entries table cols

function Account(name) {
  this.name = name;
  this.balance = 0;
  this.entries = [];
}

Account.prototype = {
  // if data exists, fill in entries
  load: function() {
    // assign existing ID to this.id
    this.id = null;
  },
  // save balance for reporting purposes (as in dashboard)
  save: function() {
    // assign auto-increment ID to this.id
    this.id = null;
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
    options.type = "debit";
    this.writeEntry(options);
  },
  credit: function(options) {
    options.type = "credit";
    this.writeEntry(options);
  },
  transfer: function(options) {
    // setup a credit on this acct and a debit on the other acct
    this.writeEntry(options);
  },
  eraseEntry: function(index, success, failure) {
    this.entries[index].splice(index, 1);
    
    // build sql
    Cheque.erase(sql, success, failure);
  },
  // utility functions
  // transact should be able to rollback if something goes wrong, save if all works
  writeEntry: function(options, index) {
    if(!options.type || !options.subject || !options.amount)
      throw("Error. Minimum data for entry (type, subject, amount) not present");
    else {
      if(index) {
        this.entries[index] = options;
      }
      else {
        // require minimum options of type, subject, amount
        this.entries.push({
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
        });
      }

      // build appropriate sql
      Cheque.transact(function() {
        Cheque.write(sql, success, failure);
      });
    }
  },
  sort: function(column) {}
};

// tie into universal search?