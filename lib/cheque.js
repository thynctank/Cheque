// accounts table:
// 
// id
// name
// balance
// type
// notes

function Cheque() {
  this.accounts = new Hash();
  // in reality, query accounts table for names/balances
  this.addAccount({name: "Bank of America", balance: 1575});
  this.addAccount({name: "Congressional", balance: 10050});
}

Cheque.prototype = {
  addAccount: function(options) {
    var name = options.name;
    
    if(this.accounts.has(name))
      return false;
    else {
      this.accounts.set(name, new Account(options));
      this.accounts.get(name).save();
      return true;
    }
  },
  removeAccount: function(name) {
    // wipe out all entries for this account number first
    this.accounts.remove(name);
  }
};