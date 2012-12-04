enyo.kind({
	name: 'ActionSheetContent',
	tag: null,
	layoutKind: 'enyo.FittableColumnsLayout',
	published: {
		actions: "",
		title: "hooool"
	},
	components: [{
		name: "actionSheetWrapper", classes: 'wrapper',  components: [
			{name: "actionSheetTitle", classes: "actionsheet-title", content: "Select action"},
			{name: "client", classes: "actionsheet-content", components: [
				//{kind: onyx.Button, content: "Cancel", style: "background-color: #CCC; height: 60px; width: 100%;", edge: "left"}
			]}
		]
	}],
	titleChanged: function () {
		this.$.actionSheetTitle.setContent(this.title);
		this.$.actionSheetTitle.setShowing(!!this.title);
	}
});

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
	//autoHide: true,
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
		this.actionQueue = null;
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
		this.addClass("horizontal");
		this.inherited(arguments);
	},
	rendered: function () {
		this.inherited(arguments);
		enyo.asyncMethod(this, "setSlider");
	},
	createClient: function () {
		var owner = this.getInstanceOwner();
		if (this.$.slider) {
			this.destroyClientControls();
			this.destroyClientControls();
		}
		var slider = this.createComponent({
			name: 'slider',
			kind: enyo.Slideable,
			classes: "slider enyo-stretch",
			onAnimateFinish: 'animateFinished',
			layoutKind: 'enyo.FittableColumnsLayout',
			overMoving: false,
			owner: this
		});
		slider.destroyClientControls();
		slider.createComponent({
			name: 'actionsheet',
			kind: 'ActionSheetContent',
			components: this.actions,
			ontap: 'executeAction',
			owner: this
		});
		slider.resized();
	},
	titleChanged: function () {
		this.$.actionsheet.setTitle(this.title);
	},
	setSlider: function () {
		var slider = this.$.slider;
		var node = slider.hasNode();
		var width = node.clientWidth;
		var height = node.clientHeight;
		var axis, unit, min, max;
		if (this.edge === 'top') {
			axis = 'v';
			max = 10;
			min = -150;
			value = -150;
		} else if (this.edge === 'bottom') {
			axis = 'v';
			max = 40;
			min = 250;
			value = 250;
		}  else if (this.edge === 'left') {
			axis = 'h';
			max = 0;
			min = -150;
			value = -150;
		} else if (this.edge === 'right') {
			axis = 'h';
			max = 0;
			min = 150;
			value = 150;
		}
		slider.setProperty('unit', '%');
		slider.setProperty('axis', axis);
		slider.setProperty('min', min);
		slider.setProperty('max', max);
		slider.setProperty('value', value);
	},
	executeAction: function (inSource, inEvent) {
		if (inEvent.target.tagName === 'BUTTON') {
			this.action = inEvent.dispatchTarget.name;
			if (this.hideOnAction) {
				this.$.slider.animateToMin();
			} else {
				if (this.action) {
					enyo.asyncMethod(this, this.doAction, { action: this.action });
					this.action = null;
				}
			}
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
		if (this.action) {
			enyo.asyncMethod(this, this.doAction, { action: this.action });
			this.action = null;
		}
		this.actionSheetOpened = !this.actionSheetOpened;
	}
});