enyo.kind({
	name: 'ActionSheetContent',
	tag: null,
	layoutKind: 'enyo.FittableColumnsLayout',
	published: {
		actions: "",
		title: ""
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
		title: "",
		actions: [],
		autoClose: false,
		hideOnAction: true
	},
	events: {
		onOpen: "",
		onClose: "",
		onAction: ""
	},
	handlers: {
		onresize: "handleResize"
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
		this.actionsChanged();
	},
	actionsChanged: function () {
		var slider = this.$.slider;
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
	setSlider: function (value) {
		var slider = this.$.slider;
		var d = this.getDimentions();
		var o = {
			top: { axis: 'v', max: d.ty,	min: -d.ph, unit: 'px'},
			bottom: { axis: 'v', max: d.ty, min: d.ph, unit: 'px' },
			left: { axis: 'h', max: d.tx, min: -d.pw, unit: 'px' },
			right: { axis: 'h', max: d.tx, min: d.pw, unit: 'px' }
		}[this.edge];
		slider.setProperty('unit', o.unit);
		slider.setProperty('axis', o.axis);
		slider.setProperty('max', o.max);
		slider.setProperty('min', o.min);
		slider.setProperty('value', value || o.min);
	},
	handleResize: function () {
		var value = this.$.slider.getProperty('value');
		enyo.asyncMethod(this, "setSlider", value);
	},
	getDimentions: function () {
		var popup = this.hasNode();
		var pw = popup.clientWidth;
		var ph = popup.clientHeight;
		var node = this.$.slider.hasNode();
		var w = node.clientWidth;
		var h = node.clientHeight;
		var axis, unit, min, max;
		var ty = (ph - h) / 2;
		var tx = (pw - w) / 2;
		return { pw: pw, ph: ph, w: w, h: h, tx: tx, ty: ty };
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