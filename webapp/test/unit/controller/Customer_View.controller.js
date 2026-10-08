/*global QUnit*/

sap.ui.define([
	"ns/proposalrentelsystem/controller/Customer_View.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Customer_View Controller");

	QUnit.test("I should test the Customer_View controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
