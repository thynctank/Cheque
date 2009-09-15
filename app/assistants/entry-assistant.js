function EntryAssistant(entry, account) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.entry = entry;
	this.account = account;
}

EntryAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
  this.controller.setupWidget("category", {label: "Category"}, this.categoryModel = {choices: [], value: this.entry.category || ""});
  this.controller.setupWidget("transferToAccount", {label: "To Account"}, this.transferModel = {choices: [], value: this.entry.transfer_account_id || ""});
  this.controller.setupWidget("subject", {}, this.subjectModel = {value: this.entry.subject || ""});
  this.controller.setupWidget("amount", {focus: true, charsAllow: positiveNumericOnly, modifierState: Mojo.Widget.numLock}, this.amountModel = {value: this.entry.amount ? this.entry.amount.toFinancialString() : ""});
  this.controller.setupWidget("cleared", {choices: [
      {label: "Pending", value: "0"},
      {label: "Cleared", value: "1"}
    ]}, this.clearedModel = {value: this.entry.cleared || "0"});
  this.controller.setupWidget("memo", {}, this.memoModel = {value: this.entry.memo || ""});
  this.controller.setupWidget("date", {labelPlacement: Mojo.Widget.labelPlacementRight}, this.dateModel = {date: this.entry.date ? new Date(this.entry.date) : new Date()});
  this.controller.setupWidget("save", {type: Mojo.Widget.activityButton}, {buttonLabel: "Save"});
  this.controller.setupWidget("detailsDrawer", {}, {open: false});

	var entryState;
	if(this.entry.id) {
	  entryState = "Edit";
    // set widget values for existing entry
	}
  else
	  entryState = "New";
	  
	this.controller.get("entryState").update(entryState);
	/* add event handlers to listen to events from widgets */
	
	this.handleSave = function() {
	  if(isNaN(parseInt(this.controller.get("amount").mojo.getValue(), 10))) {
	    Mojo.Controller.errorDialog("Entry requires amount!");
	    this.controller.get("save").mojo.deactivate();
	    this.controller.get("amount").mojo.focus();
	    return;
	  }
	  this.entry.category = this.categoryModel.value;
	  this.entry.subject = this.controller.get("subject").mojo.getValue() || this.entry.category;
	  this.entry.type = this.categoryHash.get(this.categoryModel.value).type;
	  this.entry.amount = this.controller.get("amount").mojo.getValue().toCents();
	  this.entry.date = this.dateModel.date.getTime();
	  this.entry.memo = this.memoModel.value;
	  this.entry.cleared = parseInt(this.clearedModel.value, 10);
	  
	  if(this.categoryModel.value === "Transfer") {
	    this.entry.transfer_account_id = this.transferModel.value;
	    //if transfer_account_id changed, delete original other end of existing transfer
	    //save using this.account.transfer()
	  }
	  else {
	    //wipe out other end of existing transfer if previously-existing
      //clear transfer fields
      //save
	  }

	  this.account.writeEntry(this.entry, function() {
	    this.controller.stageController.popScene();
	  }.bind(this));
	  
	}.bind(this);
	
	this.handleAddlDetailsToggle = function() {
	  var arrow = this.controller.get("addlDetailsArrow");
	  if(arrow.hasClassName("palm-arrow-closed")) {
	    arrow.addClassName("palm-arrow-expanded");
	    arrow.removeClassName("palm-arrow-closed");
	  }
	  else {
	    arrow.addClassName("palm-arrow-closed");
	    arrow.removeClassName("palm-arrow-expanded");
	  }
	  this.controller.get("detailsDrawer").mojo.toggleState();
	}.bind(this);
	
	this.handlePropChange = function(evt) {
	  if(evt.value === "Transfer") {
	    $("accountSelector").show();
	  }
	  else {
	    $("accountSelector").hide();
	  }
	}.bind(this);
	
	this.handleEnter = function(event) {
    if(event && event.originalEvent && event.originalEvent.keyCode && Mojo.Char.isEnterKey(event.originalEvent.keyCode))
      this.handleSave();
  }.bind(this);
	
	this.controller.listen("save", Mojo.Event.tap, this.handleSave);
	this.controller.listen("category", Mojo.Event.propertyChange, this.handlePropChange);
	$("addlDetails").observe("click", this.handleAddlDetailsToggle);
	this.controller.listen("amount", Mojo.Event.propertyChange, this.handleEnter);
};

EntryAssistant.prototype.activate = function(event) {
  //load account names and categories
  this.transferModel.choices = [];
  this.transferHash = new ChequeHash();
  checkbook.storage.read("accounts", null, null, function(rows) {
    this.transferModel.value = rows[0].id;
    var row = null;
    for(var i = 0, j = rows.length; i < j; i++) {
      row = rows[i];
      if(row.id !== this.entry.account.id) {
        this.transferHash.set(row.name, row);
        this.transferModel.choices.push({label: row.name, value: row.id});
      }
    }
    if(this.entry.transfer_account_id)
      this.transferModel.value = this.entry.transfer_account_id;
    this.controller.modelChanged(this.transferModel);
  }.bind(this));

  // TODO: need to move this into callback of transfer read above, but not working...
  this.categoryModel.choices = [];
  this.categoryHash = new ChequeHash();
  checkbook.storage.read("categories", null, null, function(rows) {
    this.categoryModel.value = rows[0].name;
    var row = null;
    var numberOfAccounts = this.transferHash.getLength();
    for(var i = 0, j = rows.length; i < j; i++) {
      row = rows[i];
      // if only one account, disallow transfer
      if(numberOfAccounts > 1 || row.name !== "Transfer") {
        this.categoryHash.set(row.name, row);
        this.categoryModel.choices.push({label: row.name, value: row.name});
      }
    }
    if(this.entry.category)
      this.categoryModel.value = this.entry.category;
    this.controller.modelChanged(this.categoryModel);
  }.bind(this));
  
  
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

EntryAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

EntryAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening("save", Mojo.Event.tap, this.handleSave);
	this.controller.stopListening("category", Mojo.Event.propertyChange, this.handlePropChange);
	$("addlDetails").stopObserving("click", this.handleAddlDetailsToggle);
	this.controller.stopListening("amount", Mojo.Event.propertyChange, this.handleEnter);
};