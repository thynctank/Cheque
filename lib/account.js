// Transaction is an array of obj literals (sorted by date) in format:
// {date: date (automatically today), type: debit/credit, subject: to/from (autocompleted), memo: "", amount: 100 (cents in int not float), transferAccount: "" (two transfer transactions exist for any given transfer), id: uniqueID, pending: true/false}

function Account(transactions) {
  this.transactions = transactions;
}

Account.prototype = {
  load: function() {},
  // cache balance for reporting purposes (as in dashboard). Save after every transaction entry/edit
  save: function() {},
  // all three functions should be able to rollback if something goes wrong
  debit: function() {},
  credit: function() {},
  transfer: function() {},
  // utility functions
  sort: function() {},
  filter: function() {}
};

// tie into universal search?