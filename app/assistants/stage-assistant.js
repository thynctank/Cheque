function StageAssistant() {
}

checkbook = {};
Number.prototype.toFinancialString = function() {
  return (this.valueOf()/100).toFixed(2);
};
String.prototype.toCents = function() {
  return parseFloat(this.valueOf()) * 100;
};

StageAssistant.prototype.setup = function() {
  checkbook = new Checkbook("cheque", function() {
  	this.controller.pushScene("dashboard");
  }.bind(this));
};
