// hash of accounts should ensure new accounts cannot overwrite old ones, making unique. Copy hash func over from Jazz

function Cheque() {
  this.accounts = new Hash();
}

Cheque.prototype = {
  addAccount: function(name) {
    if(this.accounts.has(name))
      return false;
    else {
      this.accounts.write(name, new Account(name));
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

// following three functions are called upon in Account
Cheque.read = function(sql, success, failure) {
  PlatformStorage.read(sql, success, failure);
};

Cheque.write = function(sql, success, failure) {
  PlatformStorage.write(sql, success, failure);
};

Cheque.erase = function(id) {
  PlatformStorage.erase(id, success, failure);
};

Cheque.transact = function(func, success, failure) {
  PlatformStorage.transact(func, success, failure);
};
