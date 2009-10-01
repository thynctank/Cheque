function EntryAssistant(entry, entryIndex, account) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.entry = entry;
	this.entryIndex = entryIndex;
	this.account = account;
	
	if(this.entry.category)
	  this.entry.originalCategory = this.entry.category;
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
	    Mojo.Controller.errorDialog("Entry requires an amount!");
	    this.controller.get("save").mojo.deactivate();
	    this.controller.get("amount").mojo.focus();
	    return;
	  }
	  
	  if(this.categoryModel.value === "Transfer" && !this.transferModel.value) {
	    Mojo.Controller.errorDialog("Transfer requires a To account!");
	    return;
	  }
	  
	  this.entry.category = this.categoryModel.value;
	  this.entry.type = this.categoryHash.get(this.categoryModel.value).type;
	  this.entry.amount = this.controller.get("amount").mojo.getValue().toCents();
	  this.entry.date = this.dateModel.date.getTime();
	  this.entry.memo = this.memoModel.value;
	  this.entry.cleared = parseInt(this.clearedModel.value, 10);
	  
    // handle transfer
	  if(this.entry.category === "Transfer") {
	    
	    //save using this.account.transfer()
	    var saveEntry = function() {
  	    this.entry.transferAccountName = checkbook.getAccountById(parseInt(this.transferModel.value, 10)).name;
        
  	    this.account.transfer(this.entry, function() {
          this.controller.stageController.popScene();
  	    }.bind(this));
	    }.bind(this);
	    
	    //delete original no matter what
	    if(this.entry.id) {
	      this.account.eraseEntry(this.entry.id, saveEntry);
	    }
	    else
	      saveEntry();
	  }
	  else {
      // handle non-transfer entry
	    this.entry.subject = this.controller.get("subject").mojo.getValue() || this.entry.category;

      //save
      var saveEntry = function() {
        //clear transfer fields
  	    this.entry.transfer_account_id = null;
  	    this.entry.transfer_entry_id = null;
        
    	  this.account.writeEntry(this.entry, function() {
    	    this.controller.stageController.popScene();
    	  }.bind(this));
      }.bind(this);
      
      // erase original if it was a transfer
      if(this.entry.originalCategory && this.entry.originalCategory === "Transfer") {
        this.account.eraseEntry(this.entry.id, saveEntry);
      }
      else
        saveEntry();
	  }

	  
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
	
	this.controller.listen("save", Mojo.Event.tap, this.handleSave);
	this.controller.listen("category", Mojo.Event.propertyChange, this.handlePropChange);
	$("addlDetails").observe("click", this.handleAddlDetailsToggle);
};

EntryAssistant.prototype.activate = function(event) {
  if(this.entry.transfer_account_id)
    $("accountSelector").show();
  
  //load account names and categories
  this.transferModel.choices = [];
  var accounts = checkbook.accountsByName();
  for(var i = 0, j = accounts.length; i < j; i++) {
    acct = accounts[i];
    if(acct.id !== this.account.id)
      this.transferModel.choices.push({label: acct.name, value: acct.id});
  }
  if(this.entry.transfer_account_id)
    this.transferModel.value = this.entry.transfer_account_id;
  this.controller.modelChanged(this.transferModel);

  this.categoryModel.choices = [];
  this.categoryHash = new ChequeHash();
  checkbook.storage.read("categories", null, null, function(rows) {
    this.categoryModel.value = rows[0].name;
    var row = null;
    for(var i = 0, j = rows.length; i < j; i++) {
      row = rows[i];
      // if only one account, disallow transfer
      if(this.transferModel.choices.length || row.name !== "Transfer") {
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
};