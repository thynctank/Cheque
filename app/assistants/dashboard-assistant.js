function DashboardAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	   window.assistant = this;
}

DashboardAssistant.prototype.setup = function() {
  var self = this;

	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	/* setup widgets here */
  this.accountListModel = {
	  items: []
	};

	this.accountListAttributes = {
    addItemLabel: "New Account",
    itemTemplate: "dashboard/account_template",
    swipeToDelete: true
  };
	this.controller.setupWidget("accountList", this.accountListAttributes, this.accountListModel);

	/* add event handlers to listen to events from widgets */
	this.controller.listen("accountList", Mojo.Event.listAdd, function(event) {
	  this.checkbook.addOrAccessAccount({name: "Test Account" + new Date().toString(), balance: 23000}, 
	    function() {
    	  this.accountListModel.items = this.checkbook.accounts.getValues();
    	  this.controller.modelChanged(this.accountListModel);
  	  }.bind(this));
	}.bind(this));

	this.controller.listen("accountList", Mojo.Event.listDelete, function(event) {
	  this.checkbook.removeAccount(event.item.name, function() {
  	  this.accountListModel.items = this.checkbook.accounts.getValues();
  	  this.controller.modelChanged(this.accountListModel);
	  }.bind(this));
	}.bind(this));
	
};

DashboardAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
  this.checkbook = new Checkbook("cheque", function(c) {
    this.accountListModel.items = c.accounts.getValues();
  	this.controller.modelChanged(this.accountListModel);
  }.bind(this));

};


DashboardAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DashboardAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
