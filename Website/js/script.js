var menuDataGlobal;
var overviewDataGlobal;

var overviewKeys = [];
overviewKeys.push("Jahr");
overviewKeys.push("Patienten entlassen");
overviewKeys.push("patienten gestorben");
overviewKeys.push("Patienten gesamt");

// Get Data for Overview
function getDataForOverview() {

	overviewData = [];

	const queryString = "http://localhost:3030/medstats_new/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fjahr+%3Fpe+%3Fpt+%3Fpg%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%3Fjahr+.%0A++%3Fx+med%3Adiagnose_icd+%22INSGESAMT%22+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg%0A%7D";

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

				overviewData.push({jahr: jahr, patienten_entlassen: pe, patienten_gestorben: pt, patienten_gesamt: pg});
			})
		});
		
		overviewDataGlobal = overviewData;
		
	});
}

// Get Data for Sidebar menu
function getDataForMenu(typ, icd_kapitel, icd_gruppe) {
	
	var menuData = [];

	const queryString = "http://localhost:3030/medstats_new/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E+SELECT+distinct+%3Fdi+%3Fdt+WHERE+%7B%3Fx+med%3Ajahr+%222000%22+.+%3Fx+med%3Adiagnose_icd+%3Fdi+.+%3Fx+med%3Adiagnose_text+%3Fdt+.+%3Fx+med%3Aicd_typ+%22" + typ + "%22+.%7D";

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

				menuData.push({icd_code: di, text: dt});
			})
		});
		setMenu(menuData);
		fillTable(overviewKeys, overviewDataGlobal);
		menuDataGlobal = menuData;
	});
}

// load Sidebar menu
function setMenu(menuData) {
	document.getElementById('sideNav').innerHTML = "";
	console.log("set Menu initialized");
	console.log(menuData.length + " items in menuData Array");
	for (let i = 0, len = menuData.length; i < len; i++) {
		console.log(menuData.icd_code);

		var myLi = document.createElement('li');
		// myLi.setAttribute('data-toggle', 'tooltip');
		// myLi.setAttribute('data-placement', 'right');
		// myLi.setAttribute('title', menuData[i].text);

		var myLiA = document.createElement('a');
		myLiA.setAttribute('href','#');
		myLiA.setAttribute('data-toggle', 'tooltip');
		myLiA.setAttribute('data-placement', 'right');
		myLiA.setAttribute('title', menuData[i].text);

		var icd_code = document.createTextNode(menuData[i].icd_code);
		var text = document.createTextNode(menuData[i].text);
		var br = document.createElement('br');

		myLiA.appendChild(icd_code);
		// myLiA.appendChild(br);
		// myLiA.appendChild(text);

		myLi.appendChild(myLiA);

		document.getElementById('sideNav').appendChild(myLi);
	}
}

function fillTable(head,data) {
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
			value.toString();
			var text = document.createTextNode(value);
			var myTd = document.createElement('td');
			myTd.appendChild(text);
			myTrBody.appendChild(myTd);
		}

		document.getElementById('stats-table-body').appendChild(myTrBody);
	}	
}


// Clickhandler for dynamically added menu items
$('#sideNav').on('click', 'li', function(event) {
	event.preventDefault();

	for(let i = 0, len = menuDataGlobal.length; i < len; i++) {
		if(menuDataGlobal[i].icd_code === $(this).text())
			console.log("Index " + i + ": " + menuDataGlobal[i].text);
	}
});

// Tooltips for dynamically added menu items
$('#sideNav').on('mouseover', 'li', function(event) {
	$('[data-toggle="tooltip"]').tooltip(); 
});

// Startup 
$(document).ready(function() {
	getDataForMenu("Kapitel", 0, 0);
	getDataForOverview();
});




