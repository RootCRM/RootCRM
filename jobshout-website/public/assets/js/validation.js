/*
	Validation object
	Written by David Abdul 
	17/12/09
*/

/*Validation Object*/
function validator() {
	// Properties
	this.error = "";
	this.Regex = //;
	this.Result = true;
	this.Error = "";
	this.Fields = [];
	this.Highlight = "#ffe2e2";
	this.executed = false;
	
	//Methods
	this.init = init;
	this.nameField = nameField;
	this.textField = textField;
	this.dateField = dateField;
	this.requiredField = requiredField;
	this.numberField = numberField;
	this.emailField = emailField;
	this.loadRegex = loadRegex;
	this.testPattern = testPattern;
	this.getValues = getValues;
	this.complete = complete;
	this.cleanFields = cleanFields;
	
	function init(Form) {
		if (this.executed) {
			this.cleanFields();
		}
		var Inputs = Form.getElementsByTagName("input");
		for (var i=0; i<Inputs.length; i++) {
			if(Inputs[i].alt != "") {
				values = this.getValues(Inputs[i].alt);
				switch(values[0]) {
					case "Name": 
						this.nameField(Inputs[i],values[1]); 
					break;
					case "Text": 
						this.textField(Inputs[i],values[1]); 
					break;
					case "Numbers": 
						this.numberField(Inputs[i],values[1]); 
					break;
					case "Email": 
						this.emailField(Inputs[i],values[1]); 
					break;
					case "Date": 
						this.dateField(Inputs[i],values[1]); 
					break;
					case "Required": 
						this.requiredField(Inputs[i],values[1]); 
					break;
				}
			}
		};
		return this.complete();
	}
	
	function getValues(string) {
		return string.split(":::");
	}
	
	function nameField(node,label) {
		this.loadRegex(/^[a-zA-Z_\s-,]+$/);
		msg = label+" field is invalid.\nOnly letters and spaces are allowed.\n\n";
		this.testPattern(node,msg);
	}
	
	function textField(node,label) {
		this.Regex = /^[a-zA-Z0-9_£\s-,]+$/;
		msg = label+" field is invalid.\nOnly letters and spaces are allowed.\n\n";
		this.testPattern(node,msg);
	}
	
	function dateField(node,label) {
		this.loadRegex(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
		msg = label+" field is invalid.\nThe date must be typed in dd/mm/yyyy format.\n\n";
		this.testPattern(node,msg);
	}
	
	function numberField(node,label) {
		this.loadRegex(/^[0-9\s-]+$/);
		msg = label+" field is invalid.\nOnly numbers are allowed.\n\n";
		this.testPattern(node,msg);
	}
	
	function emailField(node,label) {
		this.loadRegex(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/);
		msg = label+" field is invalid. Only email address are allowed.\n\n";
		this.testPattern(node,msg);
	}
	
	function requiredField(node,label) {
		if (!node.checked) {
			msg = label+" must be selected.\n\n";
			this.Result = false;
			this.Error = this.Error + msg;
			this.Fields.push(node);
		}
		//this.loadRegex(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
		//msg = label+" must be selected.\n\n";
		//this.testPattern(node,msg);
	}
	
	function loadRegex(pattern) {
		this.Regex = pattern;
	}
	
	function testPattern(node,msg) {
		if (!this.Regex.test(node.value)) {
			this.Result = false;
			this.Error = this.Error + msg;
			this.Fields.push(node);
		}
	}
	
	function cleanFields() {
		for (var i = 0; i < this.Fields.length; i++) {
			this.Fields[i].style.backgroundColor = "#FFFFFF";
		}
		this.Fields = [];
	}
	
	function complete() {
		if (this.Result == false) { 
			alert(this.Error);
			this.Error = "";
			this.Result = true;
			for (var i=0; i<this.Fields.length; i++) {
				this.Fields[i].style.backgroundColor = this.Highlight;
			};
			this.executed = true;
			return false;
		}
		else return true;
	}
}
var validator = new validator();