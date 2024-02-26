sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/MessageBox",

], function (Controller, Button, Dialog, List, StandardListItem, Text, mobileLibrary, IconPool, JSONModel, SimpleType, ValidateException,
	Export, ExportTypeCSV, MessageBox
) {

	var oView, oSAPuser, t, isNissanUser, nombreUsuario;
	return Controller.extend("AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.controller.principal", {
		onInit: function () {
			t = this;
			oView = this.getView();
			this._oDataHanaModel = this.getOwnerComponent().getModel("ODataHana");
			//Sentencia para minimizar contenido
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  			var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
                dataType:"json",
				url:appModulePath +  "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					oSAPuser = dataR.name;
					// oSAPuser = "P001442";
					t.leerUsuario(oSAPuser);
				},
				error: function (jqXHR, textStatus, errorThrown) {}
			});
			//t.leerUsuario(oSAPuser);
			t.ConsultaSolicitante();

			t.ConsultaTpedido();

		},
		leerUsuario: function (oSAPuser) {
			var flagperfil = true;
			var flag2 = true;
			var company;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  var appModulePath = jQuery.sap.getModulePath(appid);
			var url = appModulePath + '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
			//Consulta
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
					if (dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"] === undefined) {
						var custom = "";
					} else {
						var custom = dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes;
					}
					for (var i = 0; i < dataR.groups.length; i++) {

						if (dataR.groups[i].value === "AR_DP_ADMINISTRADORDEALER" || dataR.groups[i].value === "AR_DP_USUARIODEALER") {
							for (var x = 0; x < custom.length; x++) {
								if (custom[x].name === "customAttribute6") {
									company = "0000" + custom[x].value;
								}
							}
							flagperfil = false;

						}
						if (dataR.groups[i].value === "AR_DP_REP_SEGUIMIENTO_VOR") {
							flag2 = false;
						}
					}

					if (!flag2) {
						oView.byId("Agregar").setVisible(true);
						oView.byId("tMaestra").setMode("MultiSelect");
					} else {
						oView.byId("Agregar").setVisible(false);
						oView.byId("tMaestra").setMode("None");
					}

					if (!flagperfil) {

						oView.byId("dealer").setSelectedKey(company);
						oView.byId("dealer").setEditable(false);
						oView.byId("dealer1").setVisible(false);
						oView.byId("espacio1").setVisible(false);
						oView.byId("solicitantev").setVisible(false);

						t.ConsultaDestinatario();

					} else {
						oView.byId("dealer").setEditable(true);
						oView.byId("dealer1").setVisible(true);
						oView.byId("espacio1").setVisible(true);
						oView.byId("solicitantev").setVisible(true);
						t.ConsultaDestinatarioTotal();
					}
					isNissanUser = flagperfil;
					nombreUsuario = dataR.name.givenName + " " + dataR.name.familyName;
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});

		},
		// consulta solicitante
		ConsultaSolicitante: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  var appModulePath = jQuery.sap.getModulePath(appid);
			var UrlSolicitante = appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/solicitante';
			//Consulta
			$.ajax({
				type: 'GET',
				url: UrlSolicitante,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					var cliente = new sap.ui.model.json.JSONModel(dataR.d.results);
					oView.setModel(cliente, "cliente");
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});
		},
		//consulta destinatario
		ConsultaDestinatarioTotal: function () {
			// var key = '%27' + oView.byId("dealer").getSelectedKey() + '%27'; //aqui rescatas el valor 
			var Destinatario = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/destinatario';
			var url = Destinatario; // aca juntas la url con el filtro que quiere hacer 
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			//Consulta
			$.ajax({
				type: 'GET',
				url: appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Destinatarios = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Destinatarios, "Destinatarios");
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});
		},
		ConsultaDestinatario: function () {
			var key = '%27' + oView.byId("dealer").getSelectedKey() + '%27'; //aqui rescatas el valor 
			var Destinatario = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/destinatario?$filter=SOLICITANTE%20eq%20';
			var url = Destinatario + key; // aca juntas la url con el filtro que quiere hacer 
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			//Consulta
			$.ajax({
				type: 'GET',
				url:appModulePath +  url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Destinatarios = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Destinatarios, "Destinatarios");
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});
		},
		// consulta tipo pedido 
		ConsultaTpedido: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta =appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/clasePedido';
			//Consulta
			$.ajax({
				type: 'GET',
				url: consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Tpedido = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Tpedido, "Tpedido");
				},

				error: function (jqXHR, textStatus, errorThrown) {

				},
			});
		},

		BusquedaPedido: function () {
			var NOMBREDEALER;

			if ((oView.byId("Fecha").getValue() === null || oView.byId("Fecha").getValue() === "") && oView.byId("NPedido").getValue() === "") {
				var obj2 = {
					codigo: "03",
					descripcion: "Debe seleccionar un rango de Fecha  o Ingresar un Número de Pedido"
				};
				var arr2 = [];
				arr2.push(obj2);
				t.popSuccesCorreo(arr2, "ERROR");
			} else {
				var arr = [];
				var semanaEnMilisegundos = (1000 * 60 * 60 * 24 * 90);
				var hoy = new Date() - semanaEnMilisegundos;

				hoy = new Date(hoy).toISOString().slice(0, 10);
				var desde = oView.byId("Fecha").getDateValue();
				var hasta = oView.byId("Fecha").getSecondDateValue();
				desde = new Date(desde).toISOString().slice(0, 10);
				hasta = new Date(hasta).toISOString().slice(0, 10);

				t.popCarga();
				var arryT = [];

				if (oView.byId("Fecha").getValue() !== "" && oView.byId("Fecha").getValue() !== null) {
					var desde = oView.byId("Fecha").getDateValue();
					var hasta = oView.byId("Fecha").getSecondDateValue();
					desde = new Date(desde).toISOString().slice(0, 10).replace(/\-/g, "");

					hasta = new Date(hasta).toISOString().slice(0, 10).replace(/\-/g, "");

				} else {
					desde = "";
					hasta = "";

				}

				var json = {
					"HeaderSet": {
						"Header": {
							"Pedido": "",
							"Nav_Header_Pedidos": {
								"Pedidos": [{

									"Tipo": oView.byId("TPedido").getSelectedKey(),
									"Pedido": oView.byId("NPedido").getValue(),
									"Fechahasta": hasta,
									"Destinatario": oView.byId("Destinatario").getSelectedKey(),
									"Fechadesde": desde,
									"Etapapedido": oView.byId("Epedido").getSelectedKey(),
									"Dealer": oView.byId("dealer").getSelectedKey()
								}]
							}
						}
					}
				};
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				//Consulta
				$.ajax({
					type: 'POST',
					url: appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Pedido/Reporte',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify(json),
					success: function (dataR, textStatus, jqXHR) {
						t.cerrarPopCarga2();
						var NOMBREDestinatario;
						var json4 = oView.getModel("Destinatarios").oData;
						console.log(dataR.HeaderSet.Header.Nav_Header_Pedidos)
						if (dataR.HeaderSet.Header.Nav_Header_Pedidos !== undefined) {
							var datos = dataR.HeaderSet.Header.Nav_Header_Pedidos.Pedidos;
							if (datos.length === undefined) {
								if (datos.Pcm !== "") {

									console.log(json4);
									for (var j = 0; j < json4.length; j++) {
										if (Number(datos.Dealer) === Number(json4[j].SOLICITANTE)) {

											NOMBREDEALER = json4[j].NOMBRE_SOLICITANTE;
										}
										if (Number(datos.Destinatario) === Number(json4[j].DESTINATARIO)) {

											NOMBREDestinatario = json4[j].DIRECCION;
										}

									}
									var dia = datos.Fecha.substring(6, 8);
									var mes = datos.Fecha.substring(4, 6);
									var year = datos.Fecha.substring(0, 4);
									var fecha = dia + "/" + mes + "/" + year;
									datos.Fecha = fecha;
									//convertir clase
									if (datos.Tipo === "YNCI") {
										datos.Tipo = "Pedido Inmovilizado";
									}
									if (datos.Tipo === "YNCS") {
										datos.Tipo = "Pedido  Stock";
									}
									if (datos.Tipo === "YNCU") {
										datos.Tipo = "Pedido  Urgente";
									}
									if (datos.Tipo === "YNPI") {
										datos.Tipo = "Pedido Interno";
									}
									if (datos.Tipo === "YNCA") {
										datos.Tipo = "Pedido Anormal";
									}
									if (datos.Tipo === "YNCK") {
										datos.Tipo = "Pedido Kit";
									}
									if (datos.Tipo === "YNCD") {
										datos.Tipo = "Pedido Diferido";
									}
									if (Number(datos.Pcm) > 0) {
										datos.Pcm = datos.Pcm + " ARS";
									}
									if (datos.Etapapedido === "01") {
										datos.Etapapedido = "Diferido";
									}
									if (datos.Etapapedido === "02") {
										datos.Etapapedido = "Pendiente";
									}
									if (datos.Etapapedido === "03") {
										datos.Etapapedido = "Preparación";
									}
									if (datos.Etapapedido === "04") {
										datos.Etapapedido = "Preparado";
									}
									if (datos.Etapapedido === "05") {
										datos.Etapapedido = "Remitido";
									}
									if (datos.Etapapedido === "06") {
										datos.Etapapedido = " Próximo a Fact";
									}
									if (datos.Etapapedido === "07") {
										datos.Etapapedido = "Facturado";
									}
									if (datos.Etapapedido === "08") {
										datos.Etapapedido = "Rechazado";
									}
									if (Number(datos.Pcm) > 0) {
										datos.Pcm = datos.Pcm + " ARS";
									}
									// datos.Pcm = (datos.Pcm).replace(/\./g, ",");
									arryT.push({
										Bulto: isNaN(datos.Bulto) ? datos.Bulto : Number(datos.Bulto),
										Cantidad: Number(datos.Cantidad),
										Dealer: datos.Dealer,
										Despacho: datos.Despacho,
										Destinatario: datos.Destinatario,
										Nombre: NOMBREDEALER,
										NOMBREDestinatario: NOMBREDestinatario,
										Etapapedido: datos.Etapapedido,
										Fecha: datos.Fecha,
										Fechadesde: datos.Fechadesde,
										Fechahasta: datos.Fechahasta,
										Material: datos.Material,
										Descripcion: datos.Descripcion,
										Pcm: datos.Pcm,
										Pedido: datos.Pedido,
										Pedidodealer: datos.Pedidodealer,
										Remito: datos.Remito,
										Tipo: datos.Tipo,
										Tipopedido: datos.Tipopedido,
										VIN: ""
									});
								} else {
									arryT = [];
								}
							} else {
								// var json4 = oView.getModel("Destinatarios").oData;

								for (var i = 0; i < datos.length; i++) {
									for (var k = 0; k < json4.length; k++) {

										if (Number(datos[i].Dealer) === Number(json4[k].SOLICITANTE)) {
											NOMBREDEALER = json4[k].NOMBRE_SOLICITANTE;
										}
										if (Number(datos[i].Destinatario) === Number(json4[k].DESTINATARIO)) {
											NOMBREDestinatario = json4[k].DIRECCION;
										}
									}
									var dia3 = datos[i].Fecha.substring(6, 8);
									var mes3 = datos[i].Fecha.substring(4, 6);
									var year3 = datos[i].Fecha.substring(0, 4);
									var fecha3 = dia3 + "/" + mes3 + "/" + year3;
									datos[i].Fecha = fecha3;
									//convertir clase
									if (datos[i].Tipo === "YNCI") {
										datos[i].Tipo = "Pedido Inmovilizado";
									}
									if (datos[i].Tipo === "YNCS") {
										datos[i].Tipo = "Pedido Stock";
									}
									if (datos[i].Tipo === "YNCU") {
										datos[i].Tipo = "Pedido Urgente";
									}
									if (datos[i].Tipo === "YNPI") {
										datos[i].Tipo = "Pedido Interno";
									}
									if (datos[i].Tipo === "YNCA") {
										datos[i].Tipo = "Pedido Anormal";
									}
									if (datos[i].Tipo === "YNCK") {
										datos[i].Tipo = "Pedido Kit";
									}
									if (datos[i].Tipo === "YNCD") {
										datos[i].Tipo = "Pedido Diferido";
									}
									if (datos[i].Etapapedido === "01") {
										datos[i].Etapapedido = "Diferido";
									}
									if (datos[i].Etapapedido === "02") {
										datos[i].Etapapedido = "Pendiente";
									}
									if (datos[i].Etapapedido === "03") {
										datos[i].Etapapedido = "Preparación";
									}
									if (datos[i].Etapapedido === "04") {
										datos[i].Etapapedido = "Preparado";
									}
									if (datos[i].Etapapedido === "05") {
										datos[i].Etapapedido = "Remitido";
									}
									if (datos[i].Etapapedido === "06") {
										datos[i].Etapapedido = " Próximo a Fact";
									}
									if (datos[i].Etapapedido === "07") {
										datos[i].Etapapedido = "Facturado";
									}
									if (datos[i].Etapapedido === "08") {
										datos[i].Etapapedido = "Rechazado";
									}

									if (Number(datos[i].Pcm) > 0) {
										datos[i].Pcm = datos[i].Pcm + " ARS";
									}
									//	datos[i].Pcm = (datos[i].Pcm).replace(/\./g, ",");
									arryT.push({
										Bulto: isNaN(datos[i].Bulto) ? datos[i].Bulto : Number(datos[i].Bulto),
										Cantidad: Number(datos[i].Cantidad),
										Dealer: datos[i].Dealer,
										Despacho: datos[i].Despacho,
										Destinatario: datos[i].Destinatario,
										Nombre: NOMBREDEALER,
										NOMBREDestinatario: NOMBREDestinatario,
										Etapapedido: datos[i].Etapapedido,
										Fecha: datos[i].Fecha,
										Fechadesde: datos[i].Fechadesde,
										Fechahasta: datos[i].Fechahasta,
										Material: datos[i].Material,
										Descripcion: datos[i].Descripcion,
										Pcm: datos[i].Pcm.replace(/\./g, ","),
										Pedido: datos[i].Pedido,
										Pedidodealer: datos[i].Pedidodealer,
										Remito: datos[i].Remito,
										Tipo: datos[i].Tipo,
										VIN: ""

									});

								}
							}
							var Tpedido = new sap.ui.model.json.JSONModel(arryT);
							oView.setModel(Tpedido, "pedidos");
						} else {
							var arrf = [];
							var Tpedido = new sap.ui.model.json.JSONModel(arrf);
							oView.setModel(Tpedido, "pedidos");
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						var arr = [];

					}
				});
			}
			//		}
		},
		buscar: function () {
			var dealer = "";
			var desde, hasta;

			if (oView.byId("DP6").getValue() !== "" && oView.byId("DP6").getValue() !== null) {

				desde = oView.byId("Fecha").getDateValue();
				hasta = oView.byId("Fecha").getSecondDateValue();
				desde = new Date(desde).toISOString().slice(0, 10);
				hasta = new Date(hasta).toISOString().slice(0, 10);
			} else {
				desde = "";
				hasta = "";

			}
		},
		//////*****************************correo********

		EnvioCorreo: function (evt) {

			var oDialog = oView.byId("EnvioCorreo");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.view.Correo", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

		},
		cerrarEnvioCorreo: function () {
			//	t.limpiezacorreo();
			oView.byId("EnvioCorreo").close();
		},

		estructura: function () {
			var desde = oView.byId("Fecha").getDateValue();
			var hasta = oView.byId("Fecha").getSecondDateValue();
			desde = new Date(desde).toISOString().slice(0, 10);
			hasta = new Date(hasta).toISOString().slice(0, 10);
			var json = oView.getModel("pedidos").oData;

			//	var solicitante = oUsuariosap;
			var datos = "";
			var titulo =
				"<table><tr><td class= subhead>REPORTE -<b> Pedidos </b><p></td></tr><p><tr><td class= h1>  Desde el portal de Dealer Portal," +
				"se Envia el reporte de Pedidos  Correspondiente a las fechas desde : " + desde + " Hasta " + hasta +
				" :  <p> Los pedidos son :<p> ";
			var final = "</tr></table><p>Saludos <p> Dealer Portal Argentina </td> </tr> </table>";
			var cuerpo =
				"<table><tr><th>Pedido Web <th>Pedido Dealer</th><th>Solicitante</th><th>Tipo Pedido </th><th>Etapa Pedido</th><th>Material</th><th>Cantidad</th><th>PCM Unitario </th><th>Fecha Pedido </th> <th>Bulto </th><th>Remito </th><th>Despacho </th>";
			for (var i = 0; i < json.length; i++) {
				var dato = "<tr><td>" + json[i].Pedido + "</td><td>" + json[i].Pedidodealer + "</td><td>" + json[i].Nombre +
					"</td><td>" + json[i].Tipo + "</td><td>" + json[i].Etapapedido + "</td><td>" + json[i].Descripcion + "</td><td>" + json[i].Cantidad +
					"</td><td>" + json[i].Pcm + "</td><td>" + json[i].Fecha + "</td><td>" + json[i].Bulto + "</td><td>" + json[i].Despacho +
					"</td></tr> ";
				datos = datos + dato;
			}

			var contexto = titulo + cuerpo + datos + final;

			t.envio(contexto);
		},
		envio: function (contexto) {
			t.popCarga();
			var arr = [];
			var json = {
				"root": {
					"strmailto": oView.byId("mail").getValue(),
					"strmailcc": "",
					"strsubject": oView.byId("descrpcion").getValue(),
					"strbody": contexto
				}
			};
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  var appModulePath = jQuery.sap.getModulePath(appid);
			var arrjson = JSON.stringify(json);
			$.ajax({
				type: 'POST',
				url:appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Mail',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: arrjson,
				success: function (dataR, textStatus, jqXHR) {

				},
				error: function (jqXHR, textStatus, errorThrown) {

					t.cerrarPopCarga2();

					var obj2 = {
						codigo: "200",
						descripcion: "Correo enviado exitosamente"
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popSuccesCorreo(arr2, "Pedido Creado Exitosamente");
					oView.byId("mail").setValue();
					oView.byId("descrpcion").setValue();
				}
			});
			//	codigoeliminar = "";
		},

		//***********************fin correo
		popCarga: function () {
			var oDialog = oView.byId("indicadorCarga");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.view.PopUp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			//	oView.byId("textCarga").setText(titulo);
		},
		cerrarPopCarga2: function () {
			oView.byId("indicadorCarga").close();
		},
		popSuccesCorreo: function (obj, titulo) {
			var oDialog = oView.byId("SuccesCorreo");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.view.SuccesCorreo", this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("SuccesCorreo").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("SuccesCorreo").setTitle(" " + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarPopSuccesCorreo: function () {
			oView.byId("SuccesCorreo").close();
			//	t.limpiezacorreo();
			t.cerrarEnvioCorreo();
		},
		popConfirmacion: function (obj, titulo) {
			var oDialog = oView.byId("Confirmacion");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.view.Confirmacion", this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("Confirmacion").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("Confirmacion").setTitle(" " + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarpopConfirmacion: function () {
			oView.byId("Confirmacion").close();
			//	t.limpiezacorreo();

		},
		downloadExcel: sap.m.Table.prototype.exportData || function () {
			var oModel = oView.getModel("pedidos");
			var PEDIDO = {
				name: "PEDIDO",
				template: {
					content: "{Pedido}"
				}
			};

			var PEDIDO_DEALER = {
				name: "PEDIDO_DEALER",
				template: {
					content: "{Pedidodealer}"
				}
			};
			var SOLICITANTE = {
				name: "SOLICITANTE",
				template: {
					content: "{Nombre}"
				}
			};

			var CANTIDAD = {
				name: "CANTIDAD",
				template: {
					content: "{Cantidad}"
				}
			};

			var DESPACHO = {
				name: "DESPACHO",
				template: {
					content: "{Despacho}"
				}
			};
			var DESTINATARIO = {
				name: "DESTINATARIO",
				template: {
					content: "{Destinatario}"
				}
			};
			var Etapa_pedido = {
				name: "ETAPA_PEDIDO",
				template: {
					content: "{Etapapedido}"
				}
			};
			var FECHA = {
				name: "FECHA",
				template: {
					content: "{Fecha}"
				}
			};

			var MATERIAL = {
				name: "MATERIAL",
				template: {
					content: "{Material}"
				}
			};
			var PCM = {
				name: "PCM",
				template: {
					content: "{Pcm}"
				}
			};

			var REMITO = {
				name: "REMITO",
				template: {
					content: "{Remito}"
				}
			};
			var BULTO = {
				name: "BULTO",
				template: {
					content: "{Bulto}"
				}
			};
			var TIPO = {
				name: "TIPO",
				template: {
					content: "{Tipo}"
				}
			};

			var oExport = new Export({

				exportType: new ExportTypeCSV({
					fileExtension: "csv",
					separatorChar: ";"
				}),

				models: oModel,

				rows: {
					path: "/"
				},
				columns: [
					PEDIDO,
					PEDIDO_DEALER,
					SOLICITANTE,
					DESTINATARIO,
					TIPO,
					Etapa_pedido,
					MATERIAL,
					CANTIDAD,
					PCM,
					FECHA,
					BULTO,
					REMITO,
					DESPACHO
				]
			});
			oExport.saveFile("Listado Pedidos").catch(function (oError) {

			}).then(function () {
				oExport.destroy();

			});

		},
		AgruparMateriales: function (oEvent) {

			selected = [];
			for (var i = 0; i < oEvent.getSource().getParent().mAggregations.content[0]._aSelectedPaths.length; i++) {
				selected.push(oEvent.getSource().getParent().mAggregations.content[0]._aSelectedPaths[i])
			}

		},
		validaciones: function () {
			var flagestado = false
				// t.consultaconvetidos()
				// console.log("comenzo");
				// var convertidos = oView.getModel("Convertidos").oData;
			var json = oView.getModel("pedidos").oData;

			var flag = false;
			var posiciones = [];
			for (var i = 0; i < selected.length; i++) {
				posiciones.push(selected[i].replace(/\//g, ""));
			}
			// for (var x = 0; x < convertidos.length; x++) {
			// 		for (var k = 0; k < posiciones.length; k++) {

			// 			if ((convertidos[x].ID_PEDIDO === json[Number(posiciones[k])].Pedido)&&(convertidos[x].MATERIAL === json[Number(posiciones[k])].Material) ){
			// 				console.log("Hay una posicion ya reclamada");
			// 			}
			// 		}

			// }

			console.log(posiciones)
			for (var k = 0; k < posiciones.length; k++) {
				if (json[Number(posiciones[k])].Tipo === "Pedido Inmovilizado") {

					var obj2 = {
						codigo: "03",
						descripcion: "Los pedido tipo inmovilizado no pueden convertirse"
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popSuccesCorreo(arr2, "ERROR");
					posiciones = [];
					flag = true;
				}
				console.log(json[Number(posiciones[k])].Etapapedido !== "Diferido")
				if (json[Number(posiciones[k])].Etapapedido !== "Diferido") {
					flagestado = true;

				}
			}
			console.log(flagestado);
			if (flagestado) {
				var obj2 = {
					codigo: "04",
					descripcion: "No pueden seleccionarse posiciones que no estén diferidas"
				};
				var arr2 = [];
				arr2.push(obj2);
				t.popSuccesCorreo(arr2, "ERROR");
				posiciones = [];
				// flag = true;
				flagestado = false;
			} else {
				if (!flag) {
					var arrT = [];

					var obj2 = {
						codigo: "04",
						descripcion: "¿Desea convertir todas las posiciones diferidas de este pedido en VOR?"
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popConfirmacion(arr2, "Confirmación");

					posiciones = [];
					flag = false;
				} else {
					var obj2 = {
						codigo: "04",
						descripcion: "Debe seleccionar al menos una posición "
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popSuccesCorreo(arr2, "Error");
				}
			}
			flagestado = false;
			flag = true;
		},
		// openCuadrono: function () {
		openCuadrono: async function () {
			t.cerrarpopConfirmacion();
			// t.consultaconvetidos();
			var posiciones3 = [];

			var jsongrabar;
			//	var oModel = oView.getModel();
			var posiciones = [];
			for (var i = 0; i < selected.length; i++) {
				posiciones.push(selected[i].replace(/\//g, ""));
			}
			console.log(posiciones);
			var json = oView.getModel("pedidos").oData;
			for (var f = 0; f < posiciones.length; f++) {
				posiciones3.push(json[posiciones[f]])
			}
			console.log(posiciones3);
			var Datosss = new sap.ui.model.json.JSONModel(posiciones3);
			//////////////////////////
			var aFilters = posiciones3.map (oPedido => new sap.ui.model.Filter("ID_PEDIDO", sap.ui.model.FilterOperator.EQ, oPedido.Pedido));
			await t.consultaconvetidosFiltered(aFilters);
			/////////////////////////
			oView.setModel(Datosss, "Datosss");
			console.log(posiciones3);
			var Mensaje = [];
			var flagmensaje = true;
			var convertidos = oView.getModel("Convertidos").oData;
			console.log(convertidos);
			for (var x = 1; x < convertidos.length; x++) {
				for (var k = 0; k < posiciones3.length; k++) {
					if ((convertidos[x].ID_PEDIDO === Number(posiciones3[k].Pedido)) && (posiciones3[k].Material === convertidos[x].MATERIAL)) {

						Mensaje.push({
							"codigo": 300,
							"descripcion": "El Material " + convertidos[x].MATERIAL + " del  pedido " + convertidos[x].ID_PEDIDO + " Ya fue Convertido"
						});
						flagmensaje = false;
					}
				}

			}
			if (flagmensaje) {
				t.popVINno();
			} else {

				t.popSuccesCorreo(Mensaje, "Convertir a VOR");

			}

		},
		grabarno: function () {
			t.cerrarpopVINno();
			var jsongrabar = [];
			var json = oView.getModel("Datosss").oData;
			console.log(json);
			for (let k = 0; k < json.length; k++) {
				jsongrabar = {
					"ID_PEDIDO": Number(json[k].Pedido),
					"MATERIAL": json[k].Material,
					// "COMENTARIO": null, //"",
					"TIPO_PEDIDO": "YNCI",
					"FECHA_CREACION": "\/Date(" + new Date().getTime() + ")\/",
					"USUARIO_CREACION": oSAPuser,
					// "FECHA_MODIFICACION": null,
					// "USUARIO_MODIFICACION": null,
					"VIN": json[k].VIN
				};
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
        		var appModulePath = jQuery.sap.getModulePath(appid);
				$.ajax({
					type: 'POST',
					url:appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/VorRepuesto',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify(jsongrabar),
					success: function (dataG, textStatus, jqXHR) {
						var obj2 = {
							codigo: "200",
							descripcion: "Su Pedido VOR fue generado exitosamente"
						};
						var arr2 = [];
						arr2.push(obj2);
						t.popSuccesCorreo(arr2, "conversión Realizada");
						t.generarEntradaAuditoria(Number(json[k].Pedido), json[k].Material);
					},
					error: function (jqXHR, textStatus, errorThrown) {

						var obj2 = {
							codigo: "04",
							descripcion: "Este pedido y su posición ya se encuentran convertidos a VOR"
						};
						var arr2 = [];
						arr2.push(obj2);
						t.popSuccesCorreo(arr2, "Convertir a VOR");
					}
				});
			}
			t.BusquedaPedido();

		},
		// openCuadrosi: function () {
		openCuadrosi: async function () {
			t.cerrarpopConfirmacion();
			//t.consultaconvetidos();

			var jsongrabar;
			//	var oModel = oView.getModel();
			var posiciones = [];
			var posiciones2 = [];
			var posiciones3 = [];
			for (var i = 0; i < selected.length; i++) {
				posiciones.push(selected[i].replace(/\//g, ""));
			}

			var json = oView.getModel("pedidos").oData;

			for (var e = 0; e < posiciones.length; e++) {
				posiciones2.push(json[posiciones[e]].Pedido);
			}

			for (var d = 0; d < json.length; d++) {
				for (var f = 0; f < posiciones2.length; f++) {
					if (posiciones2[f] === json[d].Pedido) {
						posiciones3.push(json[d]);
					}
				}
			}
			var Datosss = new sap.ui.model.json.JSONModel(posiciones3);

			//////////////////////////
			var aFilters = posiciones3.map (oPedido => new sap.ui.model.Filter("ID_PEDIDO", sap.ui.model.FilterOperator.EQ, oPedido.Pedido));
			await t.consultaconvetidosFiltered(aFilters);
			/////////////////////////
			oView.setModel(Datosss, "Datosss");
			console.log(posiciones3);
			var Mensaje = [];
			var flagmensaje = true;
			var convertidos = oView.getModel("Convertidos").oData;
			console.log(convertidos);
			for (var x = 1; x < convertidos.length; x++) {
				for (var k = 0; k < posiciones3.length; k++) {
					// console.log(convertidos[x].ID_PEDIDO);
					// console.log(Number(posiciones3[k].Pedido));
					// console.log(convertidos[x].MATERIAL);
					// console.log(posiciones3[k].Material);

					// 	console.log(convertidos[x].ID_PEDIDO === Number(posiciones3[k].Pedido ));
					// 		console.log(posiciones3[k].Material === convertidos[x].MATERIAL);
					if ((convertidos[x].ID_PEDIDO === Number(posiciones3[k].Pedido)) && (posiciones3[k].Material === convertidos[x].MATERIAL)) {

						Mensaje.push({
							"codigo": 300,
							"descripcion": "El Material " + convertidos[x].MATERIAL + " del  pedido " + convertidos[x].ID_PEDIDO + " Ya fue Convertido"
						});
						flagmensaje = false;
					}
				}

			}
			if (flagmensaje) {
				t.popVINsi();
			} else {

				t.popSuccesCorreo(Mensaje, "Convertir a VOR");

			}

			// t.popVINsi();

		},
		validargrabar: function () {
			var flag = true;
			var posiciones = oView.getModel("Datosss").oData;
			// t.setBusyView(true);

			for (var k = 0; k < posiciones.length; k++) {
				if (posiciones[k].VIN === "") {
					flag = false;
				}
			}

			if (flag) {
				t.grabarsi();
			} else {
				MessageBox.warning("Todos los Materiales deben tener un VIN", {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,

				});
			}

		},
		validargrabarno: function () {
			var flag = true;
			var posiciones = oView.getModel("Datosss").oData;
			// t.setBusyView(true);

			for (var k = 0; k < posiciones.length; k++) {
				if (posiciones[k].VIN === "") {
					flag = false;
				}
			}

			if (flag) {
				t.grabarno();
			} else {
				MessageBox.warning("Todos los Materiales deben tener un VIN", {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,

				});
			}

		},
		limpiarsi: function () {
			var arr = [];
			var Datosss = new sap.ui.model.json.JSONModel(arr);
			oView.setModel(Datosss, "Datosss");
			t.cerrarpopVINsi();
		},
		limpiarno: function () {
			var arr = [];
			var Datosss = new sap.ui.model.json.JSONModel(arr);
			oView.setModel(Datosss, "Datosss");
			t.cerrarpopVINno();
		},
		grabarsi: function () {
			t.cerrarpopVINsi();
			var jsongrabar = [];
			var posiciones = oView.getModel("Datosss").oData;
			// t.setBusyView(true);

			for (let k = 0; k < posiciones.length; k++) {

				jsongrabar = {
					"ID_PEDIDO": Number(posiciones[k].Pedido),
					"MATERIAL": posiciones[k].Material,
					// "COMENTARIO": null, //"",
					"TIPO_PEDIDO": "YNCI",
					"FECHA_CREACION": "\/Date(" + new Date().getTime() + ")\/",
					"USUARIO_CREACION": oSAPuser,
					// "FECHA_MODIFICACION": null, //"",
					// "USUARIO_MODIFICACION": null, //"",
					"VIN": posiciones[k].VIN
				};
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  				var appModulePath = jQuery.sap.getModulePath(appid);
				$.ajax({
					type: 'POST',
					url:appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/VorRepuesto',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify(jsongrabar),
					// oModel.create('/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/DealerConceptos', json, {
					// 	method: "POST",
					success: function (dataG, textStatus, jqXHR) {

						var obj2 = {
							codigo: "200",
							descripcion: "Su Pedido VOR fue generado exitosamente"
						};
						var arr2 = [];
						arr2.push(obj2);
						t.popSuccesCorreo(arr2, "conversión Realizada");
						t.generarEntradaAuditoria(Number(posiciones[k].Pedido), posiciones[k].Material);
					},
					error: function (jqXHR, textStatus, errorThrown) {

						var obj2 = {
							codigo: "04",
							descripcion: "Este pedido y su posición ya se encuentran convertidos a VOR"
						};
						var arr2 = [];
						arr2.push(obj2);
						t.popSuccesCorreo(arr2, "Convertir a VOR");
					}
				});
			}
			t.BusquedaPedido();

		},
		generarEntradaAuditoria: function(nroPedido, nroMaterial){
			let identificador = {
				"Número pedido": nroPedido,
				"Material": nroMaterial
			};

			let data = {
				ID_OBJETO: JSON.stringify(identificador),
				ID_ACCION: 17,
				TIPO_USUARIO: isNissanUser ? "N" : "D",
				USUARIO: oSAPuser,
				NOMBRE_USUARIO: nombreUsuario,
				FECHA: new Date()
			};

			this._oDataHanaModel.create("/EntradaAuditoria", data);

		},

		consultaconvetidos: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  			var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
				url:appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/VorRepuesto',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,

				success: function (dataG, textStatus, jqXHR) {

					var Convertidos = new sap.ui.model.json.JSONModel(dataG.d.results);
					oView.setModel(Convertidos, "Convertidos");
					console.log(oView.getModel("Convertidos").oData);
				},
				error: function (jqXHR, textStatus, errorThrown) {}

			});
		},


		consultaconvetidosFiltered: function (aFilters) {

			let dfdMateriales = $.Deferred();
			this._oDataHanaModel.read("/VorRepuesto", {
				filters: aFilters,
				success: function(result){
					var Convertidos = new sap.ui.model.json.JSONModel(result.results);
					oView.setModel(Convertidos, "Convertidos");
					console.log(oView.getModel("Convertidos").oData);
					dfdMateriales.resolve();
				},
				error: function(error){
					console.log("error VorRepuesto:", e);
				}
			});	

			return dfdMateriales;
		},
		
		onSalir: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},
		popVINsi: function (obj, titulo) {
			var oDialog = oView.byId("IngresoVinSi");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.view.ingresoVINsi", this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("IngresoVinSi").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("IngresoVinSi").setTitle("Ingrese Número Vin para los Materiales Correspondientes");
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarpopVINsi: function () {
			oView.byId("IngresoVinSi").close();
			//	t.limpiezacorreo();

		},
		popVINno: function (obj, titulo) {
			var oDialog = oView.byId("IngresoVinNo");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.view.ingresoVINno", this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("IngresoVinNo").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("IngresoVinNo").setTitle("Ingrese Número Vin para los Materiales Correspondientes");
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarpopVINno: function () {
			oView.byId("IngresoVinNo").close();
			//	t.limpiezacorreo();

		},
		IngresoVin: function (oEvent) {
			console.log();
			if (oEvent.getParameter('value').length > 16) {
				var oSelectedItem = oEvent.getSource().getParent();
				var flag = oSelectedItem.getBindingContext("Datosss").getProperty("VIN");
				console.log(flag);

				// oView.byId("validasi").setEnabled(true);
			} else {
				MessageBox.warning("VIN debe tener  17 caracteres", {
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK

				});

				// oView.byId("validasi").setEnabled(false);
			}

		}

	});
});