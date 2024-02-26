sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/odata/v2/ODataModel"
], function (JSONModel, Device, ODataV2) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createHanaModel: function(){
			var appModulePath = jQuery.sap.getModulePath("AR_DP_REP_PEDIDOSREPORTE_RASA/AR_DP_REP_PEDIDOSREPORTE_RASA");
			 let oModel = new ODataV2({"serviceUrl":appModulePath +  "/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/"});
			 oModel.setUseBatch(false);
			 return oModel;
		 },

	};
});