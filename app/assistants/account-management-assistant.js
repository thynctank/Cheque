function AccountManagementAssistant(options) {
	/* passed all the additional parameters (after the scene name) that were passed to pushScene. Reference
	   to the scene controller (this.controller) has not be established yet */
	if(options && options.newAccount)
	  this.newAccount = true;
}

AccountManagementAssistant.prototype.setup = function() {
  this.accountListModel = {
	  items: checkbook.accountsByName()
	};
	this.accountListAttributes = {
    itemTemplate: "account-management/account_template",
    swipeToDelete: true
  };
	this.controller.setupWidget("accountList", this.accountListAttributes, this.accountListModel);
	this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {visible: true, items: [
    {label: "New Entry", icon: "new", command: "newEntry"}
  ]});

	this.addAccount = function() {
	  this.controller.showDialog({
	    template: "account-management/new-account-dialog",
	    assistant: new AccountDialogAssistant(this)
	  });
	}.bind(this);

	this.handleListTap = function(event) {
    var acct = event.item;
    this.controller.stageController.popScenesTo("dashboard");
    this.controller.stageController.pushScene("account", acct);
  }.bind(this);
  this.handleListDelete = function(event) {
	  checkbook.removeAccount(event.item.name, function() {
  	  this.accountListModel.items = checkbook.accountsByName();
  	  this.controller.modelChanged(this.accountListModel);
	  }.bind(this));
	}.bind(this);
  
	this.controller.listen("accountList", Mojo.Event.listAdd, this.addAccount);
	this.controller.listen("accountList", Mojo.Event.listTap, this.handleListTap);
	this.controller.listen("accountList", Mojo.Event.listDelete, this.handleListDelete);
};

AccountManagementAssistant.prototype.updateAccounts = function() {
  this.accountListModel.items = checkbook.accountsByName();
  if(this.accountListModel.items.length === 0) {
    this.controller.get("totalLine").hide();
    this.controller.get("accountListContainer").hide();
  }
  else {
    this.controller.get("totalLine").show();
    this.controller.get("accountListContainer").show();
    for(var i = 0, j = this.accountListModel.items.length; i < j; i++) {
      var item = this.accountListModel.items[i];
      item.balanceString = item.balance.toFinancialString();
    }
    this.controller.modelChanged(this.accountListModel);
  }
};

AccountManagementAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.updateAccounts();
  if(this.newAccount)
    this.addAccount();
};

AccountManagementAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AccountManagementAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
 	this.controller.stopListening("accountList", Mojo.Event.listAdd, this.addAccount);
	this.controller.stopListening("accountList", Mojo.Event.listTap, this.handleListTap);
	this.controller.stopListening("accountList", Mojo.Event.listDelete, this.handleListDelete);
};

AccountManagementAssistant.prototype.handleCommand = function(event) {
  if (event.type === Mojo.Event.command) {
    switch (event.command) {
      case "newEntry":
        this.addAccount();
        break;
    }
  }
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
    this.controller.setupWidget("newAccountBalance", {requiresEnterKey: true, charsAllow: numericOnly, modifierState: Mojo.Widget.numLock}, {
      value: ""
    });
    this.controller.setupWidget("saveAccountButton", {type: Mojo.Widget.activityButton}, {buttonLabel: "Save"});
    
    this.saveNewAccount = function() {
      var options = {};
      if(this.controller.get("newAccountName").mojo.getValue()) {
        options.name = this.controller.get("newAccountName").mojo.getValue();
        if(this.controller.get("newAccountBalance").mojo.getValue())
          options.balance = this.controller.get("newAccountBalance").mojo.getValue().toCents();
        checkbook.addOrAccessAccount(options, function() {
          this.sceneAssistant.updateAccounts();
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