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
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, Button, Dialog, List, StandardListItem, Text, mobileLibrary, IconPool, JSONModel, SimpleType, ValidateException,
	Export, ExportTypeCSV
) {

	var oView, oSAPuser, t;
	return Controller.extend("AR_DP_REP_PEDIDOSREPORTE_RASA.AR_DP_REP_PEDIDOSREPORTE_RASA.controller.Reporte", {
		onInit: function () {
			t = this;
			oView = this.getView();
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
					//	oSAPuser = "P001442";
					t.leerUsuario(oSAPuser);
				},
				error: function (jqXHR, textStatus, errorThrown) {}
			});
			t.leerUsuario(oSAPuser);
			t.ConsultaSolicitante();
			t.Consulta();
			t.ConsultaTpedido();
		},
		leerUsuario: function (oSAPuser) {
			var flagperfil = true;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  var appModulePath = jQuery.sap.getModulePath(appid);
			var url =appModulePath + '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
			//Consulta
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
					//	console.log(dataR);
					for (var i = 0; i < dataR.groups.length; i++) {

						if (dataR.groups[i].value === "AR_DP_ADMINISTRADORDEALER" || dataR.groups[i].value === "AR_DP_USUARIODEALER") {
							flagperfil = false
								//console.log(flagperfil);
						}
					}

					if (!flagperfil) {

						oView.byId("dealer").setSelectedKey("0000" + dataR.company);
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
					}
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
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		//consulta destinatario
		ConsultaDestinatario: function () {
			var key = '%27' + oView.byId("dealer").getSelectedKey() + '%27'; //aqui rescatas el valor 
			var Destinatario = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/destinatario?$filter=SOLICITANTE%20eq%20';
			var url = Destinatario + key; // aca juntas la url con el filtro que quiere hacer 
			//	console.log(Destinatario);
			//Consulta
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
				url:appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Destinatarios = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Destinatarios, "Destinatarios");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		// consulta tipo pedido 
		ConsultaTpedido: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/clasePedido';
			//Consulta
			$.ajax({
				type: 'GET',
				url:appModulePath + consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Tpedido = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Tpedido, "Tpedido");
				},

				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				},
			});
		},

		// consulta odata
		Consulta: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta = appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata';
			//Consulta
			$.ajax({
				type: 'GET',
				url: consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					//	console.log(dataR);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		BusquedaPedido: function () {
			var NOMBREDEALER;
			//	console.log(oView.byId("Fecha").getValue());
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
				// if (desde < hoy) {
				// 	var obj2 = {
				// 		codigo: "05",
				// 		descripcion: "El rango de busqueda no puede ser mayor a 3 meses"
				// 	};
				// 	arr.push(obj2);

				// 	t.popSuccesCorreo(arr, "ERROR");
				// } else {
				t.popCarga()
				var arryT = [];
				//	console.log(oView.byId("Fecha").getValue());
				if (oView.byId("Fecha").getValue() !== "" && oView.byId("Fecha").getValue() !== null) {
					var desde = oView.byId("Fecha").getDateValue();
					var hasta = oView.byId("Fecha").getSecondDateValue();
					desde = new Date(desde).toISOString().slice(0, 10).replace(/\-/g, "");
					//	console.log(desde);
					hasta = new Date(hasta).toISOString().slice(0, 10).replace(/\-/g, "");
					//	console.log(hasta);
					// desde = new Date(desde).toISOString().slice(0, 10).replace(/\-/g, "");
					// hasta = new Date(hasta).toISOString().slice(0, 10).replace(/\-/g, "");

				} else {
					desde = "";
					hasta = "";

				}
				//		console.log(desde + "---" + hasta);

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
					url:appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Pedido/Reporte',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify(json),
					success: function (dataR, textStatus, jqXHR) {
						t.cerrarPopCarga2();
						var NOMBREDestinatario;

						var datos = dataR.HeaderSet.Header.Nav_Header_Pedidos.Pedidos;
						console.log(datos.length);

						if (datos.length === undefined) {
							if (datos.Pcm !== "") {
								var json4 = oView.getModel("cliente").oData;
								for (var j = 0; j < json4.length; j++) {
									if (datos.Dealer === json4[j].SOLICITANTE) {
										NOMBREDEALER = json4[j].NOMBRE_SOLICITANTE;
									}
									if (datos.Destinatario === json4[j].SOLICITANTE) {
										NOMBREDestinatario = json4[j].NOMBRE_SOLICITANTE;
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
								if (Number(datos.Pcm) > 0) {
									datos.Pcm = datos.Pcm + " ARS";
								}

								datos.Pcm = (datos.Pcm).replace(/\./g, ",");
								arryT.push({
									Bulto: isNaN(datos.Bulto) ? datos.Bulto : Number(datos.Bulto),
									Cantidad: Number(datos.Cantidad),
									Dealer: datos.Dealer,
									Despacho: datos.Despacho,
									Destinatario: datos.Destinatario,
									NOMBREDEALER: NOMBREDEALER,
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
									Tipopedido: datos.Tipopedido
								});
							} else {
								arryT = [];
							}
						} else {
							var json4 = oView.getModel("cliente").oData;
							for (var i = 0; i < datos.length; i++) {
								for (var k = 0; k < json4.length; k++) {

									if (datos[i].Dealer === json4[k].SOLICITANTE) {
										//	console.log(datos[i].Dealer);
										//	console.log(json4[k].SOLICITANTE);
										NOMBREDEALER = json4[k].NOMBRE_SOLICITANTE;
										//	console.log(NOMBREDEALER);
									}
									if (datos[i].Destinatario === json4[k].SOLICITANTE) {
										NOMBREDestinatario = json4[k].NOMBRE_SOLICITANTE;
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
									Tipo: datos[i].Tipo

								});

							}
						}
						var Tpedido = new sap.ui.model.json.JSONModel(arryT);
						oView.setModel(Tpedido, "pedidos");
						//		console.log(Tpedido);
					},
					error: function (jqXHR, textStatus, errorThrown) {
						var arr = [];
						//	console.log(JSON.stringify(jqXHR));

					}
				});
			}
			//		}
		},
		buscar: function () {
			var dealer = "";
			var desde, hasta;
			//	console.log(oView.byId("DP6").getValue())
			if (oView.byId("DP6").getValue() !== "" && oView.byId("DP6").getValue() !== null) {
				//	console.log("hay")
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
			console.log(json);

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
			//	var datos = datos + dato
			var contexto = titulo + cuerpo + datos + final;
			//	console.log(contexto);
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
			var arrjson = JSON.stringify(json);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
  var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'POST',
				url: appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Mail',
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
				//	console.log("esto es una maravilla");
			});

		}

	});
});