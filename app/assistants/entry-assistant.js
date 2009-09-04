function EntryAssistant(entry, account) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.entry = entry;
	this.account = account;
	asst = this;
}

EntryAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
  var disableFieldsValue = (this.entry.category && this.entry.category.indexOf("Starting balance") > -1); 
  this.controller.setupWidget("category", {label: "Category"}, this.categoryModel = {choices: [], value: this.entry.category || ""});
  this.controller.setupWidget("subject", {}, this.subjectModel = {value: this.entry.subject || "", disabled: disableFieldsValue});
  this.controller.setupWidget("amount", {focus: true, charsAllow: positiveNumericOnly, modifierState: Mojo.Widget.numLock}, this.amountModel = {value: this.entry.amount ? this.entry.amount.toFinancialString() : "", disabled: disableFieldsValue});
  this.controller.setupWidget("date", {}, this.dateModel = {date: this.entry.date ? new Date(this.entry.date) : new Date(), disabled: disableFieldsValue});
  this.controller.setupWidget("memo", {}, this.memoModel = {value: this.entry.memo || ""});
  this.controller.setupWidget("cleared", {trueValue: "1", falseValue: "0"}, this.checkBoxModel = {value: this.entry.cleared || "0", disabled: disableFieldsValue});
  this.controller.setupWidget("save", {type: Mojo.Widget.activityButton}, {buttonLabel: "Save"});

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
	  this.entry.cleared = parseInt(this.checkBoxModel.value, 10);
	  console.log(this.entry.cleared);
	  this.account.writeEntry(this.entry, function() {
	    this.controller.stageController.popScene();
	  }.bind(this));
	}.bind(this);
	
	this.controller.listen("save", Mojo.Event.tap, this.handleSave);
};

EntryAssistant.prototype.activate = function(event) {
  this.categoryModel.choices = [];
  this.categoryHash = new ChequeHash();
  checkbook.storage.read("categories", null, null, function(rows) {
    this.categoryModel.value = rows[0].name;
    for(var i = 0, j = rows.length; i < j; i++) {
      row = rows[i];
      this.categoryHash.set(row.name, row);
      this.categoryModel.choices.push({label: row.name, value: row.name});
    }
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
};
