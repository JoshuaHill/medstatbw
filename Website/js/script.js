/**
*
* GLOBAL VARIABLES
*
**/

var menuDataGlobal;
var pieChartDetailsGlobal;
var pieDataGlobal;
var uplink = [];
var sideNav = false;

var overviewKeysJahre = [];
overviewKeysJahre.push("Jahr");
overviewKeysJahre.push("Patienten entlassen");
overviewKeysJahre.push("Patienten gestorben");
overviewKeysJahre.push("Patienten gesamt");

var overviewKeysJahr = [];
overviewKeysJahr.push("ICD-10");
overviewKeysJahr.push("Name");
overviewKeysJahr.push("Patienten entlassen");
overviewKeysJahr.push("Patienten gestorben");
overviewKeysJahr.push("Patienten gesamt");

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




/**
*
* DATA FUNCTIONS
*
**/

function setIcdCode(kapitel, gruppe, type, years) {

	var credz;

	var queryString;

	console.log("YEARS: " + years);
	console.log(kapitel);
	console.log(gruppe);
	console.log("MDUSAFAFFAFASF " + type);

	if(type.localeCompare("Klasse") == 0) {
		console.log("QUERY KLASSE");
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Aicd_kapitel+"+ kapitel + "+.%0A++%3Fx+med%3Aicd_gruppe+" + gruppe + "+.%0A++%3Fx+med%3Aicd_typ+%22Gruppe%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";
	} else if(type.localeCompare("Gruppe") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+distinct+%3Fdi+%3Fdt+%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%222000%22+.%0A++%3Fx+med%3Aicd_kapitel+" + kapitel + "+.%0A++%3Fx+med%3Aicd_typ+%22Kapitel%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdi+.%0A++%3Fx+med%3Adiagnose_text+%3Fdt+.%0A%7D";
	} else {
		console.log("E L S E !!!");
		setMainHeaders("Alle Krankheiten", "", "");
		document.getElementById('kapitel-btn').innerHTML = "";
		if(years == false) {
			getCredentialsByIcd(2000, "INSGESAMT", 1, false);
		} else {
			console.log("H A L L O");
			removeBarChart(960, 500);
			getDataByIcd("INSGESAMT");
		}

		return;
	}

	console.log(queryString);

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

		console.log("C R E D Z : " + credz.icd_code + ", " + credz.icd_text);

		setMainHeaders(credz.icd_code, credz.icd_text, "");
		getCredentialsByIcd(2000, credz.icd_code, 1, false);

		if(years == true) {

			console.log("YEARS == TRUE");
			removeBarChart(960, 500);
			getDataByIcd(credz.icd_code);
		}

	});

}

function getCredentialsByIcd(jahr, icd_code, followup, years) {

	var credentials;

	console.log("INPUT: " + jahr + ", " + icd_code);

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

		console.log("CREDS EARLY: " + credentials.typ + ", " + credentials.kapitel + ", " + credentials.gruppe);

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

function getDataByYear(kapitel, gruppe, typ, jahr, icd) {

	console.log("getting data...");
	console.log("Type: " + typ);
	var yearData = [];
	var queryString;

	/*
	if (levelUp == true) {
		if(typ.localeCompare("Kapitel") == 0) {
			typ = "Insgesamt";
		} else if (typ.localeCompare("Gruppe") == 0 ) {
			typ = "Kapitel";
		} else {
			typ = "Gruppe";
		}
	}
	*/

	// Alle Kapitel
	if(typ.localeCompare("Insgesamt") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fkap+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Aicd_typ+%22Kapitel%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A%7D";
	// Alle Gruppen zu Kapitel
	} else if(typ.localeCompare("Kapitel") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fgru+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Aicd_typ+%22Gruppe%22+.%0A++%3Fx+med%3Aicd_kapitel+" + kapitel + "+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A%7D";
	// Alle Klassen zu Gruppe
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
				yearData.push({icd_code: dia_icd, icd_text: dia_text, patienten_entlassen: pe, patienten_gestorben: pt, patienten_gesamt: pg});
			})
		});

		/*
		for(let i = 0, len = yearData.length; i < len; i++) {
			console.log("Line " + i);
			console.log(yearData[i]);
		}
		*/

		pieChartDetailsGlobal = yearData;
		fillTable(overviewKeysJahr, yearData);

		var pieData = createDataForPieChart(distinctColors, yearData);
		createPieChart(pieData, yearData);
	});
	// createStackedBarChart(overviewDataSVG);

}



// Get Data for Default Overview
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

// Get Data for Sidebar menu
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



	// console.log(queryString);

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

//
function getHigherLevelIcd(kapitel, gruppe, typ, jahr, icd_code, years) {



	if(years == false) {

		setIcdCode(kapitel, gruppe, typ, years);

		// Ansicht für ein Jahr
		if(typ.localeCompare("Kapitel") == 0) {
			typ = "Insgesamt";
		} else if (typ.localeCompare("Gruppe") == 0 ) {
			typ = "Kapitel";
		} else if (typ.localeCompare("Klasse") == 0) {
			typ = "Gruppe";
		}

		getDataByYear(kapitel, gruppe, typ, jahr);
		getDataForMenu(typ, kapitel, gruppe, icd_code, true);
		console.log("T Y P  :   " + typ);


	} else {

		setIcdCode(kapitel, gruppe, typ, years);



	}

	/*
	if(credentials.type.localeCompare("Kapitel") == 0) {
		getCredentialsByIcd(2000, "Insgesamt", 1);
		getDataByIcd("Insgesamt")
		return;
	} else {
		getDataForMenu(credentials.typ, credentials.kapitel, credentials.gruppe, credentials.icd_code, true);
	}
	*/

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




/**
*
* TABLE FUNCTIONS
*
**/

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
			if(key.localeCompare('jahr') == 0) {
				value.toString();
			} else {
				value = humanizeNumber(value);
			}
			
			var text = document.createTextNode(value);
			var myTd = document.createElement('td');
			myTd.appendChild(text);
			myTrBody.appendChild(myTd);
		}

		document.getElementById('stats-table-body').appendChild(myTrBody);
	}	
}




/**
*
* EVENT HANDLERS
*
**/

// Clickhandler for dynamically added menu items
$('#sideNav').on('click', 'li > a', function(event) {

	// set sideNav to true
	sideNav = true;

	// Hide tooltip to prevent it from staying after click
	$(this).tooltip('hide');

	// empty uplink array
	// uplink = [];

	setSectionHeader("2000 - 2014");

	// remove stacked barchart
	removeBarChart(960, 500);

	// remove pie chart
	removePieChart();

	// push current selection into uplink array
	// uplink.push({icd: document.getElementById('kapitel-text').innerHTML, text: document.getElementById('header-gruppe').innerHTML});

	// set link and text variables
	var link = this.innerHTML;
	var text = this.getAttribute('data-original-title');

	// uplink.push({icd: link, text: text});

	console.log(text);

	event.preventDefault();

	/*
	for(let i = 0, len = menuDataGlobal.length; i < len; i++) {
		if(menuDataGlobal[i].icd_code === $(this).text())
			console.log("Index " + i + ": " + menuDataGlobal[i].text);
	}
	*/

	// Add Uplink Button
	addUplinkButton();


	// document.getElementById('stacked-barchart').innerHTML = "";
	document.getElementById('kapitel-text').innerHTML = link;
	document.getElementById('header-gruppe').innerHTML = text;

	console.log("LINK: " + link);


	getCredentialsByIcd(2000, link, 1);

	//console.log("CREDS: " + creds);

	getDataByIcd(link);

});

// Tooltips for dynamically added menu items
$('#sideNav').on('mouseover', 'li', function(event) {
	$('[data-toggle="tooltip"]').tooltip();
});

// Clickhandler for bars of stacked bar chart
$('#stacked-barchart').on('click', 'g > g.serie > rect', function(event) {

	// Set sideNav to false
	sideNav = false;

	// Hide tooltip to prevent it from staying after a bar is clicked
	$(this).tooltip('hide');

	event.preventDefault();	

	var jahr = (this).getAttribute('jahr');
	setSectionHeader(jahr);
	var icd = document.getElementById('kapitel-text').innerHTML;
	if(icd.localeCompare("Alle Krankheiten") == 0) {
		icd = "INSGESAMT";
	}

	// "remove" the barcharts
	removeBarChart(0, 0);

	// call method to load the appropriate data
	getCredentialsByIcd(jahr, icd, 0);

});

// Tooltips for bars of stacked bar charts
$('#stacked-barchart').on('mouseover', 'g > g.serie > rect', function(event) {
	// Change Mousepointer
	this.style.cursor = "pointer";
	$(this).tooltip({container:'body', html: true});
});

// Show Details for pieChart slices
$('#pieChart').on('mouseover', 'svg > g:nth-of-type(2) > g > path', function (event) {
	// Change Mousepointer
	/*
	if(uplink.length < 3) {
		this.style.cursor = "pointer";
	}
	*/

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

	// $(this).tooltip({container:'body', html: true});
});

// Clickhandler for pieChart slices
$('#pieChart').on('click', 'svg > g:nth-of-type(2) > g > path', function (event){

	// set sideNav to false
	sideNav = false;

	// if(uplink.length < 3) {

		event.preventDefault();

		// uplink.push({icd: document.getElementById('kapitel-text').innerHTML, text: document.getElementById('header-gruppe').innerHTML});

		var jahr = document.getElementById('section-header').innerHTML;
		var icd = document.getElementById('icd-number').innerHTML;
		// var btnDescription = document.getElementById('header-gruppe').innerHTML;

		// Set new headers
		setMainHeaders(icd, document.getElementById('icd-description').innerHTML, "");

		// Add button to Header
		addUplinkButton();

		// remove pie chart
		removePieChart();

		// call method to load the appropriate data
		getCredentialsByIcd(jahr, icd, 0);
		// update sidebar menu
		getCredentialsByIcd(jahr, icd, 1);
	// }

});

// Level-Up Clickhandler
$('#kapitel-btn').on('click', 'button', function(event) {

	event.preventDefault();

	var icd = document.getElementById('kapitel-text').innerHTML;
	var jahr = document.getElementById('section-header').innerHTML;
	var description;

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
	/*
	try {
		icd = uplink[uplink.length - 1].icd;
		description = uplink[uplink.length - 1].text;
	} catch(err) {
		icd = "Alle Krankheiten";
		description = "";
	}
	*/

	// Set new headers
	/*
	setMainHeaders(icd, description, "");

	console.log("BTN DATA: " + jahr + ", " + icd);

	if(icd.localeCompare("Alle Krankheiten") == 0 ||icd == undefined) {
		icd = "INSGESAMT";
		document.getElementById('kapitel-btn').innerHTML = "";
	}

	//remove pie chart
	document.getElementById("pieChart").innerHTML = "";

	// remove details column content
	document.getElementById('icd-number').innerHTML = "";
	document.getElementById('icd-description').innerHTML = "";
	document.getElementById('patienten-gesamt').innerHTML = "";
	document.getElementById('patienten-entlassen').innerHTML = "";
	document.getElementById('patienten-gestorben').innerHTML = "";

	// uplink.pop();


	if(sideNav == false) {
		getCredentialsByIcd(jahr, icd, 0);
	} else {

		document.getElementById("stacked-barchart").innerHTML = "";
		document.getElementById("stacked-barchart").setAttribute('width', 960);
		document.getElementById("stacked-barchart").setAttribute('height', 500);

		getCredentialsByIcd(jahr, icd, 2);
	}


	// getCredentialsByIcd(jahr, icd, 1);
	*/
});




/**
*
* d3 functions
*
**/

// create a stacked bar chart to display data over a time period
function createStackedBarChart(jsonObj) {

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
	console.log(data[0].jahr);
	z.domain(d3.keys(data[0]).filter(function(key) { return key !== "jahr"; }));

	data.forEach(function(d) {
	    var y0 = 0;
	    d.jahre = z.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
	    d.total = d.jahre[d.jahre.length - 1].y1;
  	});

  	// data.sort(function(a, b) { return b.total - a.total; });

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


// create a labeled pie chart bar chart
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

	// addPieTooltips(pieData, yearData);

}




/**
*
* HELPER FUNCTIONS
*
**/

function setKapitel(kapitel) {
	document.getElementById('kapitel-text').innerHTML = kapitel;
}

function setGruppe(gruppe) {
	document.getElementById('header-gruppe').innerHTML = gruppe;
}

function setKlasse(klasse) {
	document.getElementById('header-klasse').innerHTML = klasse;
}

function setSectionHeader(header) {
	document.getElementById('section-header').innerHTML = header;
}

function setAllHeaders(kapitel, gruppe, klasse, header) {
	setKapitel(kapitel);
	setGruppe(gruppe);
	setKlasse(klasse);
	setSectionHeader(header);
}

function setMainHeaders(kapitel, gruppe, klasse) {
	setKapitel(kapitel);
	setGruppe(gruppe);
	setKlasse(klasse);
}

// Function to add thousands seperators to large numbers
function humanizeNumber(n) {
  n = n.toString();
  while (true) {
    var n2 = n.replace(/(\d)(\d{3})($|,|\.)/g, '$1.$2$3');
    if (n == n2) break;
    n = n2;
  }
  return n;
}

// Function to replace . with ,
function germanizeDecimal(n) {
	n = n.toString();
	var n2 = n.replace('.', ',');
	return n2;
}

// Function to generate the necessary Data to create pie charts
function createDataForPieChart(colorData, dataObj ){
	var pieData = [];

	for (let i = 0, len = dataObj.length; i < len ;i++) {
		pieData.push({label: dataObj[i].icd_code, value: parseInt(dataObj[i].patienten_gesamt), color: colorData[i]});
	}

	pieDataGlobal = pieData;

	return pieData;
}

// Function to add Tooltip data to pie chart
/*
function addPieTooltips(pieData, yearDataGlobal) {
	for(let i = 0, len = pieData.length; i < len; i++) {
		var path = document.getElementById('p0_segment' + i);
		path.setAttribute('')
	}
}
*/

// Function to create uplink button
function addUplinkButton() {
	var upBtn = document.createElement('button');
	upBtn.setAttribute('type', 'button');
	upBtn.setAttribute('class', 'btn btn-default btn-sm');
	// upBtn.setAttribute('description', btnDescription);
	// upBtn.setAttribute('data-toggle', 'tooltip');
	// upBtn.setAttribute('data-placement', 'right');
	// upBtn.setAttribute('title', btnLink);

	var upBtnIcn = document.createElement('i');
	upBtnIcn.setAttribute('class', 'fa fa-level-up');
	upBtnIcn.setAttribute('aria-hidden', 'true');

	upBtn.appendChild(upBtnIcn);

	document.getElementById('kapitel-btn').innerHTML = "";
	document.getElementById('kapitel-btn').appendChild(upBtn);
}


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

function removeBarChart(width, height) {
	document.getElementById("stacked-barchart").innerHTML = "";
	document.getElementById("stacked-barchart").setAttribute('width', width);
	document.getElementById("stacked-barchart").setAttribute('height', height);
}






/**
*
* INIT FUNCTION
*
**/

// Startup 
$(document).ready(function() {
	// console.log(distinctColors);
	// getDataForMenu("INSGESAMT", 0, 0);
	getCredentialsByIcd(2000, "INSGESAMT", 1, true);
	getDataByIcd("INSGESAMT");
	setAllHeaders("Alle Krankheiten", "", "", "2000 - 2014");
});




