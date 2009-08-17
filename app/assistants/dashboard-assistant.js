function DashboardAssistant() {
	/* passed all the additional parameters (after the scene name) that were passed to pushScene. Reference
	   to the scene controller (this.controller) has not be established yet */
	   asst = this;
}

DashboardAssistant.prototype.setup = function() {
  this.accountListModel = {
	  items: checkbook.accountsByName()
	};
	this.accountListAttributes = {
    addItemLabel: "New Account",
    itemTemplate: "dashboard/account_template",
    swipeToDelete: true
  };
  for(var i = 0, j = this.accountListModel.items.length; i < j; i++) {
    var item = this.accountListModel.items[i];
    item.balanceString = (item.balance/100).toFixed(2);
  }
	this.controller.setupWidget("accountList", this.accountListAttributes, this.accountListModel);

	this.handleListAdd = function(event) {
	  this.controller.showDialog({
	    template: "dashboard/new-account-dialog",
	    assistant: new AccountDialogAssistant(this)
	  });
	}.bind(this);
	this.handleListTap = function(event) {
    var acct = event.item;
    acct.loadEntries(function() {
      var j = acct.entries.length;
      var runningBalance = 0;
      for(var i = 0; i < j; i++) {
        var entry = acct.entries[i];

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
      this.controller.stageController.pushScene("account", acct);
    }.bind(this));
  }.bind(this);
  this.handleListDelete = function(event) {
	  checkbook.removeAccount(event.item.name, function() {
  	  this.accountListModel.items = checkbook.accountsByName();
  	  this.controller.modelChanged(this.accountListModel);
	  }.bind(this));
	}.bind(this);
  
	this.controller.listen("accountList", Mojo.Event.listAdd, this.handleListAdd);
	this.controller.listen("accountList", Mojo.Event.listTap, this.handleListTap);
	this.controller.listen("accountList", Mojo.Event.listDelete, this.handleListDelete);
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
 	this.controller.stopListening("accountList", Mojo.Event.listAdd, this.handleListAdd);
	this.controller.stopListening("accountList", Mojo.Event.listTap, this.handleListTap);
	this.controller.stopListening("accountList", Mojo.Event.listDelete, this.handleListDelete);
};

var AccountDialogAssistant = Class.create({
  initialize: function(sceneAssistant) {
    this.sceneAssistant = sceneAssistant;
    this.controller = sceneAssistant.controller;
  },
  setup: function(widget) {
    this.widget = widget;
    this.controller.setupWidget("newAccountName", {}, {
      value: ""
    });
    this.controller.setupWidget("newAccountBalance", {enterSubmits: true, requiresEnterKey: true, changeOnKeyPress: true, modifierState: Mojo.Widget.numLock}, {
      value: ""
    });
    this.controller.setupWidget("saveAccountButton", {type: Mojo.Widget.activityButton}, {buttonLabel: "Save"});
    
    this.saveNewAccount = function() {
      var options = {};
      if(this.controller.get("newAccountName").mojo.getValue()) {
        options.name = this.controller.get("newAccountName").mojo.getValue();
        if(this.controller.get("newAccountBalance").mojo.getValue())
          options.balance = parseFloat(this.controller.get("newAccountBalance").mojo.getValue()) * 100;
        checkbook.addOrAccessAccount(options, function() {
          this.sceneAssistant.accountListModel.items = checkbook.accountsByName();
          for(var i = 0, j = this.sceneAssistant.accountListModel.items.length; i < j; i++) {
            var item = this.sceneAssistant.accountListModel.items[i];
            item.balanceString = (item.balance/100).toFixed(2);
          }
          this.sceneAssistant.controller.modelChanged(this.sceneAssistant.accountListModel);
          this.widget.mojo.close();
        }.bind(this));
      }
      else
        this.widget.mojo.close();
    }.bind(this);
    this.handleEnter = function(event) {
      if(event && event.originalEvent && event.originalEvent.keyCode && Mojo.Char.isEnterKey(event.originalEvent.keyCode))
        this.saveNewAccount(event);
    }.bind(this);
    
    this.controller.listen("saveAccountButton", Mojo.Event.tap, this.saveNewAccount);
    this.controller.listen("newAccountBalance", Mojo.Event.propertyChange, this.handleEnter);
  },
  cleanup: function() {
    this.controller.stopListening("saveAccountButton", Mojo.Event.tap, this.saveNewAccount);
    this.controller.stopListening("newAccountBalance", Mojo.Event.propertyChange, this.handleEnter);
  }
});