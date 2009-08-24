function StageAssistant() {
}

checkbook = {};
Number.prototype.toFinancialString = function() {
  return (this.valueOf()/100).toFixed(2);
};
String.prototype.toCents = function() {
  return parseFloat(this.valueOf()) * 100;
};
numericOnly = function(entry) {
  var character = String.fromCharCode(entry);
  var parsedChar = parseInt(character, 10);
  if(typeof parsedChar === "number" && !isNaN(parsedChar))
    return true;
  else if(character === "." || character === "-")
    return true;
  else
    return false;
};

StageAssistant.prototype.setup = function() {
  checkbook = new Checkbook("cheque", function() {
  	this.controller.pushScene("dashboard");
  }.bind(this));
};
