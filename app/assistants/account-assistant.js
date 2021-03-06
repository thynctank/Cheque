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
	$("accountName").insert({
	  bottom: this.account.name + " Entries"
	});
	
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
    {label: "New Entry", command: "newEntry"}
  ]});

	/* add event handlers to listen to events from widgets */
	this.handleListTap = function(event) {
	  var entry = this.account.entries[event.index];
	  this.controller.stageController.pushScene("entry", entry, event.index, this.account);
	}.bind(this);
	this.handleListDelete = function(event) {
	  this.account.eraseEntry(event.item.id, function() {
	    this.updateEntries();
	  }.bind(this));
	}.bind(this);

  this.handleBalanceToggle = function() {
    $$(".balance").invoke("toggle");
  };
	
	$("totalLine").observe("click", this.handleBalanceToggle);
	this.controller.listen("entryList", Mojo.Event.listTap, this.handleListTap);
	this.controller.listen("entryList", Mojo.Event.listDelete, this.handleListDelete);
};

AccountAssistant.prototype.updateEntries = function() {
  this.account.loadEntries(function() {
    this.entryListModel.items = [];
    if(this.account.entries.length === 0) {
      this.controller.get("totalLine").hide();
      this.controller.get("info").hide();
      this.controller.get("accountListContainer").hide();
      this.controller.get("firstTimeBox").show();
    }
    else {
      var runningBalance = 0;
      var actualBalance = 0;
      this.controller.get("info").show();
      this.controller.get("firstTimeBox").hide();
      this.controller.get("accountListContainer").show();
      this.controller.get("totalLine").show();
      this.controller.get("pendingBalance").show();
      this.controller.get("actualBalance").hide();
      for(var i = 0, j = this.account.entries.length; i < j; i++) {
        this.entryListModel.items[i] = Object.clone(this.account.entries[i]);
        var entry = this.entryListModel.items[i];
        entry.amountString = entry.amount.toFinancialString();
        switch(entry.type) {
          case "credit":
            runningBalance += entry.amount;
            if(entry.cleared)
              actualBalance += entry.amount;
            break;
          case "debit":
            entry.amountString = "-" + entry.amountString;
            runningBalance -= entry.amount;
            if(entry.cleared)
              actualBalance -= entry.amount;
            break;
        }
        entry.runningBalance = runningBalance;
        entry.runningBalanceString = entry.runningBalance.toFinancialString();
      }
      this.controller.modelChanged(this.entryListModel);
      this.controller.get("pendingTotal").update(runningBalance.toFinancialString());
      this.controller.get("actualTotal").update(actualBalance.toFinancialString());
    }
    
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
 	$("totalLine").stopObserving("click", this.handleBalanceToggle);
	this.controller.stopListening("entryList", Mojo.Event.listTap, this.handleListTap);
	this.controller.stopListening("entryList", Mojo.Event.listDelete, this.handleListDelete);
};

AccountAssistant.prototype.handleCommand = function(event) {
  if (event.type === Mojo.Event.command) {
    switch (event.command) {
      case "newEntry":
        this.controller.stageController.pushScene("entry", {}, null, this.account);
        break;
    }
  }
};