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
  return numericFilter(entry, true);
};
positiveNumericOnly = function(entry) {
  return numericFilter(entry);
};
numericFilter = function(entry, negativeAllowed) {
  var character = String.fromCharCode(entry);
  var parsedChar = parseInt(character, 10);
  if(typeof parsedChar === "number" && !isNaN(parsedChar))
    return true;
  else if(character === "." || (negativeAllowed && character === "-"))
    return true;
  else
    return false;
};

StageAssistant.prototype.setup = function() {
  checkbook = new Checkbook("cheque", function() {
    // checkbook.storage.logging = true;
  	this.controller.pushScene("dashboard");
  }.bind(this));
  
  // make a preference
  this.controller.setWindowOrientation("free");
};

StageAssistant.prototype.handleCommand = function(event) {
  this.controller = Mojo.Controller.stageController;
  if(event.type === Mojo.Event.command) {
    switch(event.command) {
      case "about":
        break;
      case "accounts":
        this.controller.pushScene("account-management");
        break;
      case "help":
        break;
    }
  }
};