function AccountAssistant(account) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.account = account;
}

AccountAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	$("accountName").update(this.account.name + " Entries");
	
	this.runningBalance = 0;
	this.entryListModel = {
	  items: []
	};
	this.entryListAttributes = {
    itemTemplate: "account/entry_template",
    swipeToDelete: true
  };

  this.controller.setupWidget("entryList", this.entryListAttributes, this.entryListModel);
  this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {visible: true, items: [
    {label: "New Entry", icon: "new", command: "newEntry"}
  ]});
	/* add event handlers to listen to events from widgets */
	this.handleListTap = function(event) {
	  var entry = this.account.entries[event.index];
	  this.controller.stageController.pushScene("entry", entry);
	}.bind(this);
	this.handleListDelete = function(event) {
	  this.account.eraseEntry(event.index, function() {
	    this.entryListModel.items = this.account.entries;
	    this.controller.modelChanged(this.entryListModel);
	  }.bind(this));
	}.bind(this);
	this.controller.listen("entryList", Mojo.Event.listTap, this.handleListTap);
	this.controller.listen("entryList", Mojo.Event.listDelete, this.handleListDelete);
};

AccountAssistant.prototype.updateEntries = function() {
  this.account.loadEntries(function() {
    this.entryListModel.items = this.account.entries;
    var j = this.entryListModel.items.length;
    var runningBalance = 0;
    for(var i = 0; i < j; i++) {
      var entry = this.entryListModel.items[i];

      entry.amountString = (entry.amount/100).toFixed(2);
      switch(entry.type) {
        case "credit":
          runningBalance += entry.amount;
          break;
        case "debit":
          entry.amountString = "-" + entry.amountString;
          runningBalance -= entry.amount;
          break;
      }
      entry.runningBalance = runningBalance;
      entry.runningBalanceString = (entry.runningBalance/100).toFixed(2);
    }
    
    this.controller.modelChanged(this.entryListModel);
  }.bind(this));
};

AccountAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.updateEntries();
};


AccountAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AccountAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening("entryList", Mojo.Event.listTap, this.handleListTap);
	this.controller.stopListening("entryList", Mojo.Event.listDelete, this.handleListDelete);
};

AccountAssistant.prototype.handleCommand = function(event) {
  if (event.type === Mojo.Event.command) {
    switch (event.command) {
      case "newEntry":
        this.controller.stageController.pushScene("entry", {});
        break;
    }
  }
};