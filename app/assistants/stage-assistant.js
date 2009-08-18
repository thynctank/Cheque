function StageAssistant() {
}

checkbook = {};

StageAssistant.prototype.setup = function() {
  checkbook = new Checkbook("cheque", function() {
  	this.controller.pushScene("dashboard");
  }.bind(this));
};
