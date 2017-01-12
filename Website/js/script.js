/**
*
* GLOBAL VARIABLES
*
**/

var menuDataGlobal;
var pieChartDetailsGlobal;
var pieDataGlobal;
var sideNav = false;

var allIcdCodes = [];

var years = [
	"2000", "2001", "2002", "2003",
	"2004", "2005", "2006", "2007",
	"2008", "2009", "2010", "2011",
	"2012", "2013", "2014"
];

var searchArray  = years;

// Predefined Table Headers for years view
var overviewKeysJahre = [];
overviewKeysJahre.push("Jahr");
overviewKeysJahre.push("Patienten entlassen");
overviewKeysJahre.push("Patienten gestorben");
overviewKeysJahre.push("Gestorben %");
overviewKeysJahre.push("Patienten gesamt");

// Predefined Table Headers for year view
var overviewKeysJahr = [];
overviewKeysJahr.push("ICD-10");
overviewKeysJahr.push("Name");
overviewKeysJahr.push("Patienten entlassen");
overviewKeysJahr.push("Patienten gestorben");
overviewKeysJahr.push("Gestorben %");
overviewKeysJahr.push("Patienten gesamt");

// Predefined Colors for PieChart
var distinctColors = [
	"#1CE6FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
	"#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
	"#5A0007", "#809693", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
	"#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
	"#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
	"#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
	"#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
	"#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",
	"#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
	"#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
	"#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
	"#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
	"#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
];




/*****************
*
* DATA FUNCTIONS
*
******************/

/**
 * This function queries the fuseki dataset to obtain
 * all distinct ICD-Codes and descriptions
 */
function getAllCodesAndDescriptions() {

	// security measure
	if(searchArray.length > 15) {
		return;
	}

	const queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";

	$.getJSON(queryString, function (data) {
		$.each(data.results, function (key, val) {
			$.each(val, function (m, n) {
				$.each(n.di, function (dikey, dival) {
					if (dikey.localeCompare('value') == 0) {
						di = dival;
					}
				});
				$.each(n.dt, function (dtkey, dtval) {
					if (dtkey.localeCompare('value') == 0) {
						dt = dtval;
					}
				});

				// push data into searchArray
				searchArray.push(di);
				searchArray.push(dt);
				allIcdCodes.push({icd_code: di, icd_text: dt});
			})
		});

		// load autocomplete for search function
		searchHandlers();

	});

}

/**
 * This function queries the fuseki dataset to obtain
 * credentials of the overlying ICD/Illness
 */
function setIcdCode(kapitel, gruppe, type, years) {

	var credz;

	var queryString;

	// If type is "Klasse" get credentials of overlying "Gruppe"
	if(type.localeCompare("Klasse") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Aicd_kapitel+"+ kapitel + "+.%0A++%3Fx+med%3Aicd_gruppe+" + gruppe + "+.%0A++%3Fx+med%3Aicd_typ+%22Gruppe%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";
	// If type is "Gruppe" get credentials of overlying "Kapitel"
	} else if(type.localeCompare("Gruppe") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Aicd_kapitel+" + kapitel + "+.%0A++%3Fx+med%3Aicd_typ+%22Kapitel%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";
	// Else get credentials for "Alle Krankheiten"
	} else {
		setMainHeaders("Alle Krankheiten", "", "");
		document.getElementById('kapitel-btn').innerHTML = "";
		if(years == false) {
			getCredentialsByIcd(2000, "INSGESAMT", 1, false);
			addYearOverviewButton();
		} else {
			removeBarChart(960, 500);
			getCredentialsByIcd(2000, "INSGESAMT", 1, true);
			getDataByIcd("INSGESAMT");
		}

		return;
	}

	$.getJSON(queryString, function (data) {
		$.each(data.results, function (key, val) {
			$.each(val, function (m, n) {
				$.each(n.di, function (dikey, dival) {
					if (dikey.localeCompare('value') == 0) {
						di = dival;
					}
				});
				$.each(n.dt, function (dtkey, dtval) {
					if (dtkey.localeCompare('value') == 0) {
						dt = dtval;
					}
				});

				credz = ({icd_code: di, icd_text: dt});
			})
		});

		// load headers
		setMainHeaders(credz.icd_code, credz.icd_text, "");

		// Add Overview Button
		if(years == false) {
			addYearOverviewButton();
		}

		getCredentialsByIcd(2000, credz.icd_code, 1, false);

		if(years == true) {
			removeBarChart(960, 500);
			getDataByIcd(credz.icd_code);
		}

	});

}

/**
 * This function queries the fuseki dataset to obtain
 * credentials of an Illness by it's ICD-Code
 */
function getCredentialsByIcd(jahr, icd_code, followup, years) {

	var credentials;

	var queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Ftyp+%3Fkap+%3Fgru%0A%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Adiagnose_icd+%22" + icd_code +"%22+.%0A++%3Fx+med%3Aicd_typ+%3Ftyp+.%0A++%3Fx+med%3Aicd_kapitel+%3Fkap+.%0A++%3Fx+med%3Aicd_gruppe+%3Fgru+.%0A%7D";

	$.getJSON(queryString, function (data) {
		$.each(data.results, function (key, val) {
			$.each(val, function (m, n) {
				$.each(n.typ, function (typkey, typval) {
					if (typkey.localeCompare('value') == 0) {
						typ = typval;
					}
				});
				$.each(n.kap, function (kapkey, kapval) {
					if (kapkey.localeCompare('value') == 0) {
						kap = kapval;
					}
				});
				$.each(n.gru, function (grukey, gruval) {
					if (grukey.localeCompare('value') == 0) {
						gru = gruval;
					}
				});
			
				credentials = ({jahr: jahr, icd_code: icd_code, typ: typ, kapitel: kap, gruppe: gru});
				
			})
		});

		// Get Data for Year View
		if(followup == 0) {
			getDataByYear(credentials.kapitel, credentials.gruppe, credentials.typ, credentials.jahr, credentials.icd_code);
		// Get Data for Menu
		} else if (followup == 1) {
			getDataForMenu(credentials.typ, credentials.kapitel, credentials.gruppe, credentials.icd_code, false);

		} else if (followup == 2) {
			console.log("THIS!!!" + credentials.typ);
			getHigherLevelIcd(credentials.kapitel, credentials.gruppe, credentials.typ, credentials.jahr, credentials.icd_code, years);
		} else {
			console.log("Something went wrong");
		}
		

	});
	
}

/**
 * This function queries the fuseki dataset to obtain
 * data for the selected "Kapitel", "Gruppe" or "Klasse"
 * by Year.
 */
function getDataByYear(kapitel, gruppe, typ, jahr, icd) {

	var yearData = [];
	var queryString;

	// All "Kapitel"
	if(typ.localeCompare("Insgesamt") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fkap+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Aicd_typ+%22Kapitel%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A%7D";
	// All "Gruppen" of current "Kapitel"
	} else if(typ.localeCompare("Kapitel") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fgru+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Aicd_typ+%22Gruppe%22+.%0A++%3Fx+med%3Aicd_kapitel+" + kapitel + "+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A%7D";
	// All "Klassen" of current "Gruppe"
	} else if(typ.localeCompare("Gruppe") == 0){
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fkla+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Aicd_typ+%22Klasse%22+.%0A++%3Fx+med%3Aicd_kapitel+" + kapitel + "+.%0A++%3Fx+med%3Aicd_gruppe+" + gruppe + "+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A%7D";
	// Nur die Klasse selbst (Query überhaupt notwendig?!?!)
	} else {
		console.log("Klasse query gets called");
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Adiagnose_icd+%22" + icd + "%22+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd%0A%7D";
	}

	// console.log(queryString);

	$.getJSON(queryString, function (data) {
		$.each(data.results, function (key, val) {
			$.each(val, function (m, n) {
				$.each(n.dia_icd, function (dia_icdkey, dia_icdval) {
					if (dia_icdkey.localeCompare('value') == 0) {
						dia_icd = dia_icdval;
					}
				});
				$.each(n.dia_text, function (dia_textkey, dia_textval) {
					if (dia_textkey.localeCompare('value') == 0) {
						dia_text = dia_textval;
					}
				});
				$.each(n.pe, function (pekey, peval) {
					if (pekey.localeCompare('value') == 0) {
						pe = peval;
					}
				});
				$.each(n.pt, function (ptkey, ptval) {
					if (ptkey.localeCompare('value') == 0) {
						pt = ptval;
					}
				});
				$.each(n.pg, function (pgkey, pgval) {
					if (pgkey.localeCompare('value') == 0) {
						pg = pgval;
					}
				});

				// Iteratively push data into yearData Array
				yearData.push({icd_code: dia_icd, icd_text: dia_text, patienten_entlassen: pe, patienten_gestorben: pt, patienten_gesamt: pg});
			})
		});

		// Create Table from Data
		pieChartDetailsGlobal = yearData;
		fillTable(overviewKeysJahr, yearData);

		// Create Pie Chart from Data
		var pieData = createDataForPieChart(distinctColors, yearData);
		createPieChart(pieData, yearData);
	});

}



/**
 * This function queries the fuseki dataset to obtain
 * data for the Overview by ICD-Code.
 */
function getDataByIcd(icd) {

	overviewData = [];
	overviewDataSVG = [];

	const queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fjahr+%3Fpe+%3Fpt+%3Fpg%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%3Fjahr+.%0A++%3Fx+med%3Adiagnose_icd+%22" + icd + "%22+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg%0A%7D";

	$.getJSON(queryString, function (data) {
		$.each(data.results, function (key, val) {
			$.each(val, function (m, n) {
				$.each(n.jahr, function (jahrkey, jahrval) {
					if (jahrkey.localeCompare('value') == 0) {
						jahr = jahrval;
					}
				});
				$.each(n.pe, function (pekey, peval) {
					if (pekey.localeCompare('value') == 0) {
						pe = peval;
					}
				});
				$.each(n.pt, function (ptkey, ptval) {
					if (ptkey.localeCompare('value') == 0) {
						pt = ptval;
					}
				});
				$.each(n.pg, function (pgkey, pgval) {
					if (pgkey.localeCompare('value') == 0) {
						pg = pgval;
					}
				});
				overviewDataSVG.push({jahr: jahr, patienten_entlassen: pe, patienten_gestorben: pt});
				overviewData.push({jahr: jahr, patienten_entlassen: pe, patienten_gestorben: pt, patienten_gesamt: pg});
			})
		});

		fillTable(overviewKeysJahre, overviewData);
		createStackedBarChart(overviewDataSVG);		
		
	});
}

/**
 * This function queries the fuseki dataset to obtain
 * data for the lefthand side menu by icd code
 *
 * @param typ
 * @param icd_kapitel
 * @param icd_gruppe
 * @param icd_code
 * @param levelUp
 */
function getDataForMenu(typ, icd_kapitel, icd_gruppe, icd_code, levelUp) {

	var menuData = [];
	var queryString;

	if(typ.localeCompare("Insgesamt") == 0) {
		if(levelUp == false) {
			typ = "Kapitel";
		}
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E+SELECT+distinct+%3Fdi+%3Fdt+WHERE+%7B%3Fx+med%3Ajahr+%222000%22+.+%3Fx+med%3Adiagnose_icd+%3Fdi+.+%3Fx+med%3Adiagnose_text+%3Fdt+.+%3Fx+med%3Aicd_typ+%22" + typ + "%22+.%7D";
	} else if(typ.localeCompare("Kapitel") == 0) {
		if(levelUp == false) {
			typ = "Gruppe";
		}
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Aicd_kapitel+" + icd_kapitel + "+.%0A++%3Fx+med%3Aicd_typ+%22"+ typ +"%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";
	} else if(typ.localeCompare("Gruppe") == 0) {
		if(levelUp == false) {
			typ = "Klasse";
		}
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Aicd_kapitel+"+ icd_kapitel +"+.%0A++%3Fx+med%3Aicd_gruppe+"+ icd_gruppe + "+.%0A++%3Fx+med%3Aicd_typ+%22"+ typ +"%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";
	} else {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Adiagnose_icd+%22" + icd_code +"%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";
	}

	$.getJSON(queryString, function (data) {
		$.each(data.results, function (key, val) {
			$.each(val, function (m, n) {
				$.each(n.di, function (dikey, dival) {
					if (dikey.localeCompare('value') == 0) {
						di = dival;
					}
				});
				$.each(n.dt, function (dtkey, dtval) {
					if (dtkey.localeCompare('value') == 0) {
						dt = dtval;
					}
				});

				menuData.push({icd_code: di, text: dt});
			})
		});
		setMenu(menuData);
		menuDataGlobal = menuData;
	});
}

/**
 * This function queries the fuseki dataset to obtain
 * the ICD-Code of the current Illnesses' parent
 *
 * @param kapitel
 * @param gruppe
 * @param typ
 * @param icd_code
 * @param years
 */
function getHigherLevelIcd(kapitel, gruppe, typ, jahr, icd_code, years) {

	setIcdCode(kapitel, gruppe, typ, years);

	if(years == false) {

		// Ansicht für ein Jahr
		if (typ.localeCompare("Kapitel") == 0) {
			typ = "Insgesamt";
		} else if (typ.localeCompare("Gruppe") == 0) {
			typ = "Kapitel";
		} else if (typ.localeCompare("Klasse") == 0) {
			typ = "Gruppe";
		}

		getDataByYear(kapitel, gruppe, typ, jahr);
		getDataForMenu(typ, kapitel, gruppe, icd_code, true);

	}

}

// load Sidebar menu
function setMenu(menuData) {
	document.getElementById('sideNav').innerHTML = "";

	for (let i = 0, len = menuData.length; i < len; i++) {
		console.log(menuData.icd_code);

		var myLi = document.createElement('li');

		var myLiA = document.createElement('a');
		myLiA.setAttribute('href','#');
		myLiA.setAttribute('data-toggle', 'tooltip');
		myLiA.setAttribute('data-placement', 'right');
		myLiA.setAttribute('title', menuData[i].text);

		var icd_code = document.createTextNode(menuData[i].icd_code);
		var text = document.createTextNode(menuData[i].text);
		var br = document.createElement('br');

		myLiA.appendChild(icd_code);
		myLi.appendChild(myLiA);

		document.getElementById('sideNav').appendChild(myLi);
	}
}




/*******************************
*
* TABLE FUNCTIONS
*
********************************/

/**
 *
 *
 * @param head
 * @param data
 */
function fillTable(head,data) {

	document.getElementById('stats-table-head').innerHTML = "";
	document.getElementById('stats-table-body').innerHTML = "";
	
	var myTrHead = document.createElement('tr');

	for (let i = 0, len = head.length; i < len; i++) {

		var text = document.createTextNode(head[i]);
		var myTh = document.createElement('th');
		myTh.appendChild(text);
		myTrHead.appendChild(myTh);
	}

	document.getElementById('stats-table-head').appendChild(myTrHead);


	for (let i = 0, len = data.length; i < len; i++) {
		var myTrBody = document.createElement('tr');
		var obj = data[i];
		for (var key in obj) {
			var value = obj[key];

			var patienten_entlassen;
			var patienten_gestorben;
			var gestorbenProzent = null;

			if(key.localeCompare('patienten_entlassen') == 0) {
				patienten_entlassen = parseFloat(value);
			} else if(key.localeCompare('patienten_gestorben') == 0) {
				patienten_gestorben = parseFloat(value);
				gestorbenProzent = (patienten_gestorben / (patienten_gestorben + patienten_entlassen)) * 100;
				gestorbenProzent = gestorbenProzent.toFixed(4);
				gestorbenProzent = germanizeDecimal(gestorbenProzent);
			}

			if(key.localeCompare('jahr') == 0) {
				value.toString();
			} else {
				value = humanizeNumber(value);
			}
			
			var text = document.createTextNode(value);
			var myTd = document.createElement('td');
			myTd.appendChild(text);
			myTrBody.appendChild(myTd);

			if(gestorbenProzent !== null) {
				var prozent = document.createTextNode(gestorbenProzent);
				var td = document.createElement('td');
				td.appendChild(prozent);
				myTrBody.appendChild(td);
			}
		}

		document.getElementById('stats-table-body').appendChild(myTrBody);
	}

	// attach table sorter to table
	addTableSorter();
}

 


/***************************************
*
* EVENT HANDLERS
*
****************************************/

/**
 * Function to load the necessary event handlers
 * for the search function
 */
function searchHandlers() {
	// Jquery autocomplete function
	$('#search').autocomplete({
		source: function(request, response) {
			var results = $.ui.autocomplete.filter(searchArray, request.term);

			response(results.slice(0,10));
		}
	});

	// Jquery keyboard handler on Enter
	$('#search').keypress(function (e) {
		if(e.which == 13) {
			var inputValue = $('#search').val();
			console.log("INPUT FORM: " + inputValue);

			// Look for hit in searchArray (only ICD, Name OR Year
			for(let i = 0, len = searchArray.length; i < len; i++) {
				// hit
				if(inputValue.localeCompare(searchArray[i]) == 0) {

					// Check years
					for(let j = 0, len = years.length; j < len; j++) {
						// Year found
						if(inputValue.localeCompare(years[j]) == 0) {
							// Load data for year
							loadViewForYear(years[j], "INSGESAMT");
						}
					}

					if(i%2==0) {
						// is description
						var codePos = (i - 16) / 2;
						var icd_code;

						icd_code = allIcdCodes[codePos].icd_code;

						loadViewForAllYears(icd_code, inputValue);

					} else {
						// is icd_code
						var codePos = (i - 15) / 2;
						var icd_text;

						icd_text = allIcdCodes[codePos].icd_text;

						loadViewForAllYears(inputValue, icd_text);

					}
				}
			}
		}
	});
}


/**
 * Jquery Clickhandler for table rows
 */
$('#stats-table-body').on('click', 'tr', function() {

	var item = this.firstChild.innerHTML;
	var item2 = this.firstChild.nextSibling.innerHTML;
	var jahr = document.getElementById('section-header').innerHTML;

	console.log("ITEM: " + item);
	console.log("TEXT: " + item2);


	if(item.startsWith('ICD')) {
		loadViewForYear(jahr, item, item2);
	} else {
		item2 = document.getElementById('kapitel-text').innerHTML;
		var description;

		if(item2.localeCompare("Alle Krankheiten") == 0) {
			item2 = "INSGESAMT";
			description = "";
		} else {
			description = document.getElementById('header-gruppe').innerHTML;
		}

		loadViewForYear(item, item2, description);
	}

});


/**
 * Jquery Clickhandler for year overview button
 */
$('#header-klasse').on('click', 'button', function () {

	var icd = document.getElementById('kapitel-text').innerHTML;
	var description = document.getElementById('header-gruppe').innerHTML;

	$(this).hide();

	loadViewForAllYears(icd, description);
});


/**
 * Jquery Clickhandler for dynamically added menu items
 */
$('#sideNav').on('click', 'li > a', function(event) {

	event.preventDefault();

	// Hide tooltip to prevent it from staying after click
	$(this).tooltip('hide');

	// set link and text variables
	var link = this.innerHTML;
	var text = this.getAttribute('data-original-title');

	loadViewForAllYears(link, text);

});


/**
 * Jquery enable Tooltips for dynamically added menu items
 */
$('#sideNav').on('mouseover', 'li', function(event) {

	event.preventDefault();

	$('[data-toggle="tooltip"]').tooltip();
});


/**
 * Jquery Clickhandler for bars of stacked bar chart
 */
$('#stacked-barchart').on('click', 'g > g.serie > rect', function(event) {

	// Set sideNav to false
	sideNav = false;

	// show details div
	$('#some-details').show();
	$('#pieChart').show();

	// Hide tooltip to prevent it from staying after a bar is clicked
	$(this).tooltip('hide');

	event.preventDefault();	

	var jahr = (this).getAttribute('jahr');
	setSectionHeader(jahr);

	// Add button to switch to year overview
	addYearOverviewButton();

	var icd = document.getElementById('kapitel-text').innerHTML;
	if(icd.localeCompare("Alle Krankheiten") == 0) {
		icd = "INSGESAMT";
	}

	// "remove" the barcharts
	removeBarChart(0, 0);

	// call method to load the appropriate data
	getCredentialsByIcd(jahr, icd, 0);

});


/**
 * Jquery mouseover handler to enable tooltips for
 * bars of barchart
 */
$('#stacked-barchart').on('mouseover', 'g > g.serie > rect', function(event) {
	// Change Mousepointer
	this.style.cursor = "pointer";
	$(this).tooltip({container:'body', html: true});
});

/**
 * Jquery mouseover handler to enable tooltips for
 * slices of pie chart
 */
$('#pieChart').on('mouseover', 'svg > g:nth-of-type(2) > g > path', function (event) {

	event.preventDefault();

	for(let i = 0, len = pieDataGlobal.length; i < len; i++) {
		if(this.getAttribute('fill').localeCompare(pieDataGlobal[i].color) == 0) {
			document.getElementById('icd-number').innerHTML = pieChartDetailsGlobal[i].icd_code;
			document.getElementById('icd-description').innerHTML = pieChartDetailsGlobal[i].icd_text;
			document.getElementById('patienten-gesamt').innerHTML = "Patienten gesamt: " + humanizeNumber(pieChartDetailsGlobal[i].patienten_gesamt);
			document.getElementById('patienten-entlassen').innerHTML = "Patienten entlassen: " + humanizeNumber(pieChartDetailsGlobal[i].patienten_entlassen);
			document.getElementById('patienten-gestorben').innerHTML = "Patienten gestorben: " + humanizeNumber(pieChartDetailsGlobal[i].patienten_gestorben);
			// document.getElementById('patienten-gestorben-prozent').innerHTML = pieChartDetailsGlobal[i].icd_code;
		}
	}

});

/**
 * Jquery Clickhandler for pieChart slices
 */
$('#pieChart').on('click', 'svg > g:nth-of-type(2) > g > path', function (event){

	event.preventDefault();

	var jahr = document.getElementById('section-header').innerHTML;
	var icd = document.getElementById('icd-number').innerHTML;
	var description = document.getElementById('icd-description').innerHTML;

	loadViewForYear(jahr, icd, description);

});


/**
 * Jquery Clickhandler for Level-Up
 */
$('#kapitel-btn').on('click', 'button', function(event) {

	event.preventDefault();

	var icd = document.getElementById('kapitel-text').innerHTML;
	var jahr = document.getElementById('section-header').innerHTML;

	// Wenn man von der PieChart Ansicht kommt
	if (sideNav == false) {
		console.log("SIDE_NAV == FALSE");


		if(icd.localeCompare("Alle Krankheiten") != 0) {
			removePieChart();
			getCredentialsByIcd(jahr, icd, 2, false);
		}
	} else {
		console.log("SIDE_NAV == TRUE");
		getCredentialsByIcd(2000, icd, 2, true);
	}

});




/*************************
*
* d3 functions
*
**************************/

/**
 * D3 Function to create stacked bar chart from Json input
 *
 * @param jsonObj: Input Json Data to create Barchart
 */
function createStackedBarChart(jsonObj) {

	// create new svg
	var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleBand()
	    .rangeRound([0, width])
	    .padding(0.1)
	    .align(0.1);

	var y = d3.scaleLinear()
    	.rangeRound([height, 0]);

	var z = d3.scaleOrdinal()
	    .range(["#98abc5", "#8a89a6"]);

	var stack = d3.stack();
	var data = jsonObj;

	z.domain(d3.keys(data[0]).filter(function(key) { return key !== "jahr"; }));

	data.forEach(function(d) {
	    var y0 = 0;
	    d.jahre = z.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
	    d.total = d.jahre[d.jahre.length - 1].y1;
  	});

	x.domain(data.map(function(d) { return d.jahr; }));
	y.domain([0, d3.max(data, function(d) { return d.total; })]);

  	g.selectAll(".serie")
    	.data(stack.keys(["patienten_entlassen", "patienten_gestorben"])(data))
    	.enter().append("g")
      	.attr("class", "serie")
      	.attr("fill", function(d) { return z(d.key); })
    	.selectAll("rect")
	    .data(function(d) { return d; })
	    .enter().append("rect")	 
	    .attr('jahr', function(d) {return d.data.jahr;})   
	    .attr('data-togle', 'tooltip')
	    .attr('data-placement', 'right')
	    .attr('title', function(d) {
	    	var patienten_gestorben = parseFloat(d.data.patienten_gestorben);
	    	var patienten_entlassen = parseFloat(d.data.patienten_entlassen);
	    	var gestorbenProzent = (patienten_gestorben / (patienten_gestorben + patienten_entlassen)) * 100; 
	    	gestorbenProzent = gestorbenProzent.toFixed(4);
	    	gestorbenProzent = germanizeDecimal(gestorbenProzent);
	    	var gestorben = humanizeNumber(patienten_gestorben);
	    	var entlassen = humanizeNumber(patienten_entlassen);
		  	var text = "Entlassen: " + entlassen + "<br />Gestorben: " + gestorben + "<br />Gestorben %: " + gestorbenProzent; 
	    	return text;
	    	})
	    .attr("x", function(d) { return x(d.data.jahr); })
	    .attr("y", function(d) { return y(d[1]); })
	    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
	    .attr("width", x.bandwidth());

	g.append("g")
	    .attr("class", "axis axis--x")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

	g.append("g")
	    .attr("class", "axis axis--y")
	    .call(d3.axisLeft(y).ticks(10, "s"))
	    .append("text")
	    .attr("x", 2)
	    .attr("y", y(y.ticks(10).pop()))
	    .attr("dy", "0.35em")
	    .attr("text-anchor", "start")
	    .attr("fill", "#000")
	    .text("Patienten");

	/*
  	var legend = g.selectAll(".legend")
    	.data(data.slice(2,4))
    	.enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
        .style("font", "10px sans-serif");

	legend.append("rect")
	    .attr("x", width - 18)
	    .attr("width", 18)
	    .attr("height", 18)
	    .attr("fill", z);

	legend.append("text")
	    .attr("x", width - 24)
	    .attr("y", 9)
	    .attr("dy", ".35em")
	    .attr("text-anchor", "end")
	    .text(function(d) { return d; });
	*/

}


/**
 * Function to create Pie Charts, utilizing d3pie custom library for D3
 *
 * @param pieData
 * @param yearData
 */
function createPieChart(pieData, yearData) {

	var pie = new d3pie("pieChart", {
	"header": {
		"title": {
			"fontSize": 24,
			"font": "open sans"
		},
		"subtitle": {
			"color": "#999999",
			"fontSize": 12,
			"font": "open sans"
		},
		"location": "pie-center",
		"titleSubtitlePadding": 9
	},
	"footer": {
		"color": "#999999",
		"fontSize": 10,
		"font": "open sans",
		"location": "bottom-left"
	},
	"size": {
		"canvasHeight": 550,
		"canvasWidth": 620,
		"pieOuterRadius": "80%"
	},


	"data": {
		"sortOrder": "value-desc",
		"content": pieData
	},
	"labels": {
		"outer": {
			"pieDistance": 32
		},
		"inner": {
			"hideWhenLessThanPercentage": 3
		},
		"mainLabel": {
			"fontSize": 11
		},
		"percentage": {
			"color": "#ffffff",
			"decimalPlaces": 0
		},
		"value": {
			"color": "#adadad",
			"fontSize": 11
		},
		"lines": {
			"enabled": true,
			"style": "straight"
		},
		"truncation": {
			"enabled": true,
			"truncateLength": 40
		}
	},
	"effects": {
		"load": {
			"effect": "none"
		},
		"pullOutSegmentOnClick": {
			"effect": "none",
			"speed": 400,
			"size": 8
		}
	},
	"callbacks": {}
	});

}




/***************************************
*
* HELPER FUNCTIONS
*
****************************************/

/**
 * Function to set "Kapitel" header
 *
 * @param kapitel
 */
function setKapitel(kapitel) {
	document.getElementById('kapitel-text').innerHTML = kapitel;
}


/**
 * Function to set "Gruppe" header
 *
 * @param gruppe
 */
function setGruppe(gruppe) {
	document.getElementById('header-gruppe').innerHTML = gruppe;
}


/**
 * Function to set "Klasse" header
 *
 * @param klasse
 */
function setKlasse(klasse) {
	document.getElementById('header-klasse').innerHTML = klasse;
}


/**
 * Function to set section header (above table)
 *
 * @param header
 */
function setSectionHeader(header) {
	document.getElementById('section-header').innerHTML = header;
}


/**
 * Function to set all headers
 *
 * @param kapitel
 * @param gruppe
 * @param klasse
 * @param header
 */
function setAllHeaders(kapitel, gruppe, klasse, header) {
	setKapitel(kapitel);
	setGruppe(gruppe);
	setKlasse(klasse);
	setSectionHeader(header);
}


/**
 * Function to set headers for "Kapitel", "Gruppe" and "Klasse"
 *
 * @param kapitel
 * @param gruppe
 * @param klasse
 */
function setMainHeaders(kapitel, gruppe, klasse) {
	setKapitel(kapitel);
	setGruppe(gruppe);
	setKlasse(klasse);
}


/**
 * Function to add thousands seperators to large numbers
 *
 * @param n
 * @returns {string|*}
 */
function humanizeNumber(n) {
  n = n.toString();
  while (true) {
    var n2 = n.replace(/(\d)(\d{3})($|,|\.)/g, '$1.$2$3');
    if (n == n2) break;
    n = n2;
  }
  return n;
}


/**
 * Function to replace . with ,
 *
 * @param n
 * @returns {string}
 */
function germanizeDecimal(n) {
	n = n.toString();
	var n2 = n.replace('.', ',');
	return n2;
}


/**
 * Function to generate the necessary Data to create pie charts
 *
 * @param colorData
 * @param dataObj
 * @returns {Array}
 */
function createDataForPieChart(colorData, dataObj ){
	var pieData = [];

	for (let i = 0, len = dataObj.length; i < len ;i++) {
		pieData.push({label: dataObj[i].icd_code, value: parseInt(dataObj[i].patienten_gesamt), color: colorData[i]});
	}

	pieDataGlobal = pieData;

	return pieData;
}


/**
 * Function to create year overview button
 */
function addYearOverviewButton() {
	var yrBtn = document.createElement('button');
	yrBtn.setAttribute('type', 'button');
	yrBtn.setAttribute('class', 'btn btn-info btn-sm');
	yrBtn.setAttribute('id', 'year-overview-button');

	var yrBtnIcn = document.createElement('i');
	yrBtnIcn.setAttribute('class', 'fa fa-bar-chart');
	yrBtnIcn.setAttribute('aria-hidden', 'true');

	var yrBtnTxt = document.createTextNode('Jahresverlauf ');

	yrBtn.appendChild(yrBtnTxt);
	yrBtn.appendChild(yrBtnIcn);
	document.getElementById('header-klasse').appendChild(yrBtn);

}

/**
 * Function to create uplink button
 */
function addUplinkButton() {
	var upBtn = document.createElement('button');
	upBtn.setAttribute('type', 'button');
	upBtn.setAttribute('class', 'btn btn-default btn-sm');

	var upBtnIcn = document.createElement('i');
	upBtnIcn.setAttribute('class', 'fa fa-level-up');
	upBtnIcn.setAttribute('aria-hidden', 'true');

	upBtn.appendChild(upBtnIcn);

	document.getElementById('kapitel-btn').innerHTML = "";
	document.getElementById('kapitel-btn').appendChild(upBtn);
}

/**
 * Function to remove pie chart components from DOM
 */
function removePieChart() {
	//remove pie chart
	document.getElementById("pieChart").innerHTML = "";

	// remove details column content
	document.getElementById('icd-number').innerHTML = "";
	document.getElementById('icd-description').innerHTML = "";
	document.getElementById('patienten-gesamt').innerHTML = "";
	document.getElementById('patienten-entlassen').innerHTML = "";
	document.getElementById('patienten-gestorben').innerHTML = "";
}

/**
 * Function to remove barchart components from DOM
 */
function removeBarChart(width, height) {
	document.getElementById("stacked-barchart").innerHTML = "";
	document.getElementById("stacked-barchart").setAttribute('width', width);
	document.getElementById("stacked-barchart").setAttribute('height', height);
}


/**
 * Function to load View for a given year and ICD-Code
 *
 * @param jahr
 * @param icd
 * @param description
 */
function loadViewForYear(jahr, icd, description) {

	// Set sideNav to false
	sideNav = false;

	// show details div
	$('#some-details').show();
	$('#pieChart').show();

	// Set new headers
	setAllHeaders(icd, description, "", jahr);

	// Add Year Overview Button
	addYearOverviewButton();

	// Add button to Header
	if(icd.localeCompare("INSGESAMT") !== 0) {
		addUplinkButton();
	} else {
		setKapitel("Alle Krankheiten");
		setGruppe("");
	}

	// remove bar chart
	removeBarChart(0, 0);

	// remove pie chart
	removePieChart();

	// call method to load appropriate data
	getCredentialsByIcd(jahr, icd, 0);

	// update sidebar menu
	getCredentialsByIcd(jahr, icd, 1);
}


/**
 * Function to load view for all years for give ICD-Code
 *
 * @param icd
 * @param text
 */
function loadViewForAllYears(icd, text) {

	// set sideNav to true
	sideNav = true;



	// Hide tooltip to prevent it from staying after click
	$(this).tooltip('hide');

	setSectionHeader("2000 - 2014");

	// remove stacked barchart
	removeBarChart(960, 500);

	// remove pie chart
	removePieChart();

	// hide year overview button
	$('#header-klasse > button').hide();

	// hide details div
	$('#some-details').hide();
	$('#pieChart').hide();

	// event.preventDefault();

	document.getElementById('kapitel-text').innerHTML = icd;
	document.getElementById('header-gruppe').innerHTML = text;

	if(icd.localeCompare("Alle Krankheiten") == 0) {
		icd = "INSGESAMT";
	} else {
		// Add Uplink Button
		addUplinkButton();
	}

	getCredentialsByIcd(2000, icd, 1, true);

	getDataByIcd(icd);

}


/**
 * Function to add Table Sorter
 * utilizing tablesorter library and Jquery
 */
function addTableSorter() {
	$('#stats-table').tablesorter({
		theme: 'blue',
		textExtraction: function (node) {
			// remove thousands separator for ordering correctly
			return $(node).text().replace(/\./g, '');
		}
	});
	// Make table cell focusable
	// http://css-tricks.com/simple-css-row-column-highlighting/
	if ( $('.focus-highlight').length ) {
		$('.focus-highlight').find('td, th')
			.attr('tabindex', '1')
			// add touch device support
			.on('touchstart', function() {
				$(this).focus();
			});
	}
}






/*****************************************
*
* INIT FUNCTION
*
******************************************/

/**
 * This Jquery function will execute on startup,
 * when the page is initially loaded in the browser.
 */
$(document).ready(function() {
	// get all distinct ICD-Codes and Descriptions
	getAllCodesAndDescriptions();

	getCredentialsByIcd(2000, "INSGESAMT", 1, true);

	// Hide year view elements
	$('#some-details').hide();
	$('#pieChart').hide();

	// get year overview data for all illnesses
	getDataByIcd("INSGESAMT");

	// set appropriate headers
	setAllHeaders("Alle Krankheiten", "", "", "2000 - 2014");
});




