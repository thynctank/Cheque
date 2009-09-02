function DashboardAssistant() {
	/* passed all the additional parameters (after the scene name) that were passed to pushScene. Reference
	   to the scene controller (this.controller) has not be established yet */
}

DashboardAssistant.prototype.setup = function() {
  this.accountListModel = {
	  items: checkbook.accountsByName()
	};
	this.accountListAttributes = {
    itemTemplate: "dashboard/account_template"
  };
  this.appMenuAttributes = {
    omitDefaultItems: true
  };
  this.appMenuModel = {
    visible: true,
    items: [ 
      {label: "About", command: "about"},
      {label: "Manage Accounts", command: "accounts"},
      {label: "Help", command: "help"}
    ]
  };
  
	this.controller.setupWidget("accountList", this.accountListAttributes, this.accountListModel);
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttributes, this.appMenuModel);
  this.controller.setupWidget("newAccountButton", {}, {label: "Set up your first account!"});
  this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {
    visible: true,
    items: [
      {label: "Add Account", command: "newAccount"}
    ]
  });

	this.handleListTap = function(event) {
    var acct = event.item;
    this.controller.stageController.pushScene("account", acct);
  }.bind(this);
  this.handleNewAccountTap = function(event) {
    this.controller.stageController.pushScene("account-management", {newAccount: true});
  }.bind(this);
  
	this.controller.listen("accountList", Mojo.Event.listTap, this.handleListTap);
  this.controller.listen("newAccountButton", Mojo.Event.tap, this.handleNewAccountTap);
};


DashboardAssistant.prototype.updateAccounts = function() {
  this.accountListModel.items = checkbook.accountsByName();
  if(this.accountListModel.items.length === 0) {
    this.controller.get("totalLine").hide();
    this.controller.get("accountListContainer").hide();
    this.controller.get("firstTimeBox").show();
  }
  else {
    this.controller.get("firstTimeBox").hide();
    this.controller.get("accountListContainer").show();
    this.controller.get("totalLine").show();
    var cummulativeBalance = 0;
    for(var i = 0, j = this.accountListModel.items.length; i < j; i++) {
      var item = this.accountListModel.items[i];
      item.balanceString = item.balance.toFinancialString();
      cummulativeBalance += item.balance;
    }
    this.controller.modelChanged(this.accountListModel);
    this.controller.get("total").update(cummulativeBalance.toFinancialString());
  }
};

DashboardAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.updateAccounts();
};

DashboardAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DashboardAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening("accountList", Mojo.Event.listTap, this.handleListTap);
  this.controller.stopListening("newAccountButton", Mojo.Event.tap, this.handleFirstAccountTap);
};

DashboardAssistant.prototype.handleCommand = function(event) {
  if (event.type === Mojo.Event.command) {
    switch (event.command) {
      case "newAccount":
        this.controller.stageController.pushScene("account-management", {newAccount: true});
        break;
    }
  }
};