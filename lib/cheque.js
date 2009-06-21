// hash of accounts should ensure new accounts cannot overwrite old ones, making unique. Copy hash func over from Jazz

function Cheque() {
  this.accounts = new Hash();
}

Cheque.prototype = {
  addAccount: function(name) {
    if(this.accounts.has(name))
      return false;
    else {
      this.accounts.set(name, new Account(name));
      this.accounts.get(name).save();
      return true;
    }
  },
  removeAccount: function(name) {
    // wipe out all entries for this account number first
    this.accounts.remove(name);
  },
  // util
  // load account names and last-saved balances
  init: function(data) {}
};