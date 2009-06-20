// entries is an array of obj literals (sorted by date) in format:
// {date: date (automatically today), type: debit/credit, subject: to/from (autocompleted), memo: "", amount: 100 (cents in int not float), transferAccountName: "" (two transfer entries exist for any given transfer), id: uniqueID, pending: true/false}

function Account(name) {
  this.name = name;
  this.balance = 0;
  this.entries = [];
}

Account.prototype = {
  // if data exists, fill in entries
  load: function() {},
  // save entries and cache balance for reporting purposes (as in dashboard). Save after every entry entry/edit
  save: function() {},
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
  eraseEntry: function(entry, success, failure) {
    
    Cheque.erase(entry.id, success, failure);
  },
  // utility functions
  // transact should be able to rollback if something goes wrong, save if all works
  writeEntry: function(options) {
    // merge defaults with options
    Cheque.transact(function() {
      Cheque.write(sql, success, failure);
    });
  },
  sort: function(column) {},
  filter: function(text) {}
};

// tie into universal search?