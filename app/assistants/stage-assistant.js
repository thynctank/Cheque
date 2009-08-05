function StageAssistant() {
}

checkbook = {};

StageAssistant.prototype.setup = function() {
  checkbook = new Checkbook("cheque", function(c) {
  	this.controller.pushScene("dashboard");
  }.bind(this));
};
