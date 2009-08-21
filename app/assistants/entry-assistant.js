function EntryAssistant(entry) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.entry = entry;
}

EntryAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
  this.controller.setupWidget("type", {
    choices: [
      {label: "Debit", value: "debit"},
      {label: "Credit", value: "credit"}
    ]
  }, {
    value: "debit"
  });
  this.controller.setupWidget("subject", {}, {value: ""});
  this.controller.setupWidget("amount", {
    modifierState: Mojo.Widget.numLock
  }, {
    value: ""
  });
  this.controller.setupWidget("date", {labelPlacement: Mojo.Widget.labelPlacementRight}, {date: new Date()});
  this.controller.setupWidget("memo", {}, {value: ""});
  this.controller.setupWidget("save", {type: Mojo.Widget.activityButton}, {
    buttonLabel: "Save"
  });

	var entryState;
	if(this.entry.id) {
	  entryState = "Edit";
    // set widget values for existing entry
	}
  else
	  entryState = "New";
	  
	this.controller.get("entryState").update(entryState);
	/* add event handlers to listen to events from widgets */
};

EntryAssistant.prototype.activate = function(event) {
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
};
