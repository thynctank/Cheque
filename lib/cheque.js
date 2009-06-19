// hash of accounts should ensure new accounts cannot overwrite old ones, making unique. Copy hash func over from Jazz

function Cheque() {
  this.accounts = {};
}

Cheque.prototype = {
  // load account names and last-saved balances
  init: function() {}
};