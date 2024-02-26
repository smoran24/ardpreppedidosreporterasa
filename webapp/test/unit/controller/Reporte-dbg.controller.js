/*global QUnit*/

sap.ui.define([
	"AR_DP_REP_PEDIDOSREPORTE_RASA/AR_DP_REP_PEDIDOSREPORTE_RASA/controller/Reporte.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Reporte Controller");

	QUnit.test("I should test the Reporte controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});