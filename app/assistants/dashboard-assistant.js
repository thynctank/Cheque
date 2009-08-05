function DashboardAssistant() {
	/* passed all the additional parameters (after the scene name) that were passed to pushScene. Reference
	   to the scene controller (this.controller) has not be established yet */
}

DashboardAssistant.prototype.setup = function() {
  var self = this;

  this.accountListModel = {
	  items: checkbook.accounts.getValues()
	};

	this.accountListAttributes = {
    addItemLabel: "New Account",
    itemTemplate: "dashboard/account_template",
    swipeToDelete: true
  };
	this.controller.setupWidget("accountList", this.accountListAttributes, this.accountListModel);

	this.controller.listen("accountList", Mojo.Event.listAdd, function(event) {
	  this.controller.stageController.pushScene("new-account", checkbook);
	}.bind(this));

	this.controller.listen("accountList", Mojo.Event.listDelete, function(event) {
	  checkbook.removeAccount(event.item.name, function() {
  	  this.accountListModel.items = checkbook.accounts.getValues();
  	  this.controller.modelChanged(this.accountListModel);
	  }.bind(this));
	}.bind(this));
	
};

DashboardAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


DashboardAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DashboardAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
