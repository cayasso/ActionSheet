enyo.kind({
	name: "ActionSheet",
	kind: "onyx.Popup",
	centered: false,
	modal: false,
	floating: true,
	scrim: true,
	autoDismiss: false,
	edge: "bottom",
	classes: "actionsheet enyo-unselectable",
	actionSheetOpened: false,
	autoHide: true,
	published: {
		actions: "",
		hideOnAction: true,
		title: ""
	},
	events: {
		onAction: "",
		onClose: "",
		onOpen: ""
	},
	create: function () {
		this.inherited(arguments);
		this.titleChanged();
	},
	initComponents: function () {
		var i, e, edges = ["top", "right", "bottom", "left"];
		for (i = 0; e = edges[i]; i++) { this.removeClass(e); }
		this.removeClass("horizontal");
		this.removeClass("vertical");
		this.createClient();
		this.addClass(this.edge);
		this.$.actionSheetWrapper.setLayoutKind(enyo.FittableColumnsLayout);
		this.addClass("horizontal");
		this.$.slider.setLayoutKind(enyo.FittableRowsLayout);
		this.inherited(arguments);
	},
	rendered: function () {
		this.inherited(arguments);
		enyo.asyncMethod(this, "setSlider");
	},
	createClient: function () {
		var owner = this.getInstanceOwner();
		var components = [];
		if (this.$.slider) {
			this.destroyClientControls();
		}
		this.createComponent({
			name: 'slider', onAnimateFinish: 'animateFinished', ontap: "executeAction",
			kind: enyo.Slideable, overMoving: false, classes: "slider enyo-stretch"
		});
		components = [{
			name: "actionSheetWrapper",  components: [
			{name: "actionSheetTitle", classes: "actionsheet-title"}, {tag: "br"},
			{name: "contentComponents", components: this.actions /*owner: owner*/}]
		}];
		this.$.slider.destroyClientControls();
		this.$.slider.createComponents(components, {owner: this});
		this.$.slider.resized();
	},
	titleChanged: function () {
		if (this.title) {
			this.$.actionSheetTitle.setContent(this.title);
			this.$.actionSheetTitle.setShowing(true);
		} else {
			this.$.actionSheetTitle.setShowing(false);
		}
	},
	setSlider: function () {
		var slider = this.$.slider;
		var node = slider.hasNode();
		var width = node.clientWidth;
		var height = node.clientHeight;
		var axis, unit, min, max;
		axis = 'v';
		unit = 'px';
		max = 0;
		min = height + 10;
		value = min;
		slider.setProperty('axis', axis);
		slider.setProperty('unit', unit);
		slider.setProperty('min', min);
		slider.setProperty('max', max);
		slider.setProperty('value', value);
	},
	executeAction: function (inSource, inEvent) {
		/*if (this.autoHide) {
			this.close(inSource, inEvent);
		}*/
		if (inEvent.target.tagName === 'BUTTON') {
			this.$.slider.animateToMin();
			this.doAction(inEvent);
			this.hideOnAction && this.close(inSource, inEvent);
			//return true;
		}
	},
	close: function () {
		this.$.slider.animateToMin();
	},
	open: function () {
		this.show();
		enyo.asyncMethod(this.$.slider, "animateToMax");
	},
	animateFinished: function () {
		if (this.actionSheetOpened) {
			this.hide();
			this.doClose(this);
		} else {
			this.show();
			this.doOpen(this);
		}
		this.actionSheetOpened = !this.actionSheetOpened;
	}
});