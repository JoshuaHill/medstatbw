var menuDataGlobal;

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


function getCredentialsByIcd(jahr, icd_code, followup) {

	var credentials;

	var queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Ftyp+%3Fkap+%3Fgru%0A%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Adiagnose_icd+%22" + icd_code +"%22+.%0A++%3Fx+med%3Aicd_typ+%3Ftyp+.%0A++%3Fx+med%3Aicd_kapitel+%3Fkap+.%0A++%3Fx+med%3Aicd_gruppe+%3Fgru+.%0A%7D";

	$.getJSON(queryString, function (data) {
		$.each(data.results, function (key, val) {
			$.each(val, function (m, n) {
				$.each(n.typ, function (typkey, typval) {
					if (typkey.localeCompare('value') == 0) {
						console.log(typval);
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

		console.log("Jahr: " + credentials.jahr);
		console.log("Typ: " + credentials.typ);
		console.log("Gruppe: " + credentials.gruppe);
		console.log("Kapitel: " + credentials.kapitel);
		
		
		if(followup == 0) {
			getDataByYear(credentials.kapitel, credentials.gruppe, credentials.typ, credentials.jahr);
		} else {
			console.log("Something went wrong");
		}
		

	});
	
}

function getDataByYear(kapitel, gruppe, typ, jahr) {
	
	var yearData = [];
	var queryString;

	if(typ.localeCompare("Insgesamt") == 0) {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fkap+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Aicd_typ+%22Kapitel%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A%7D";
	} else {
		queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fpe+%3Fpt+%3Fpg+%3Fdia_icd+%3Fdia_text%0AWHERE+%7B%0A++%3Fx+med%3Aicd_kapitel+" + kapitel +"+.%0A++%3Fx+med%3Aicd_gruppe+" + gruppe +"+.%0A++%3Fx+med%3Aicd_typ+%22" + typ +"%22+.%0A++%3Fx+med%3Ajahr+%22" + jahr + "%22+.%0A++%3Fx+med%3Adiagnose_icd+%3Fdia_icd+.%0A++%3Fx+med%3Adiagnose_text+%3Fdia_text+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg+.%0A%7D";
	}

	console.log(queryString);

	$.getJSON(queryString, function (data) {
		console.log("Step1");
		$.each(data.results, function (key, val) {
			console.log("Step2");
			$.each(val, function (m, n) {
				$.each(n.dia_icd, function (dia_icdkey, dia_icdval) {
					if (dia_icdkey.localeCompare('value') == 0) {
						dia_icd = dia_icdval;
						console.log("DIA_ICD: " + dia_icd);
					}
				});
				$.each(n.dia_text, function (dia_textkey, dia_textval) {
					if (dia_textkey.localeCompare('value') == 0) {
						dia_text = dia_textval;
						console.log("DIA_TEXT " + dia_text);
					}
				});
				$.each(n.pe, function (pekey, peval) {
					if (pekey.localeCompare('value') == 0) {
						pe = peval;
						console.log("PE: " + pe);
					}
				});
				$.each(n.pt, function (ptkey, ptval) {
					if (ptkey.localeCompare('value') == 0) {
						pt = ptval;
						console.log("PT: " + pt);
					}
				});
				$.each(n.pg, function (pgkey, pgval) {
					if (pgkey.localeCompare('value') == 0) {
						pg = pgval;
						console.log("PG: " + pg);
					}
				});
				yearData.push({icd_code: dia_icd, icd_text: dia_text, patienten_entlassen: pe, patienten_gestorben: pt, patienten_gesamt: pg});
			})
		});
		document.getElementById("stacked-barchart").innerHTML = "";
		document.getElementById("stacked-barchart").setAttribute('width', 0);
		document.getElementById("stacked-barchart").setAttribute('height', 0);
		fillTable(overviewKeysJahr, yearData);

	});
	// createStackedBarChart(overviewDataSVG);

}



// Get Data for Default Overview
function getDataForOverview() {

	overviewData = [];
	overviewDataSVG = [];

	const queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E%0A%0ASELECT+%3Fjahr+%3Fpe+%3Fpt+%3Fpg%0AWHERE+%7B%0A++%3Fx+med%3Ajahr+%3Fjahr+.%0A++%3Fx+med%3Adiagnose_icd+%22INSGESAMT%22+.%0A++%3Fx+med%3Apatienten_entlassen+%3Fpe+.%0A++%3Fx+med%3Apatienten_gestorben+%3Fpt+.%0A++%3Fx+med%3Apatienten_gesamt+%3Fpg%0A%7D";

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
function getDataForMenu(typ, icd_kapitel, icd_gruppe) {
	
	var menuData = [];

	const queryString = "http://localhost:3030/medstats_v2/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E+SELECT+distinct+%3Fdi+%3Fdt+WHERE+%7B%3Fx+med%3Ajahr+%222000%22+.+%3Fx+med%3Adiagnose_icd+%3Fdi+.+%3Fx+med%3Adiagnose_text+%3Fdt+.+%3Fx+med%3Aicd_typ+%22" + typ + "%22+.%7D";

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

// Clickhandler for bars of stacked bar chart
$('#stacked-barchart').on('click', 'g > g.serie > rect', function(event) {
	event.preventDefault();	
	console.log(this);
	var jahr = (this).getAttribute('jahr');
	setSectionHeader(jahr);
	var icd = document.getElementById('header-kapitel').innerHTML;
	if(icd.localeCompare("Alle Krankheiten") == 0) {
		icd = "INSGESAMT";
	}

	console.log("Jahr early: " + jahr);
	console.log("ICD early: "  + icd);

	getCredentialsByIcd(jahr, icd, 0);

});

// Tooltips for bars of stacked bar charts
$('#stacked-barchart').on('mouseover', 'g > g.serie > rect', function(event) {
	// Change Mousepointer
	this.style.cursor = "pointer";
	$(this).tooltip({container:'body', html: true});
});


/**
* d3 functions
*/
// stacked bar chart
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

function setKapitel(kapitel) {
	document.getElementById('header-kapitel').innerHTML = kapitel;
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

function humanizeNumber(n) {
  n = n.toString();
  while (true) {
    var n2 = n.replace(/(\d)(\d{3})($|,|\.)/g, '$1.$2$3');
    if (n == n2) break;
    n = n2;
  }
  return n;
}

function germanizeDecimal(n) {
	n = n.toString();
	var n2 = n.replace('.', ',');
	return n2;
}

// Startup 
$(document).ready(function() {
	getDataForMenu("Kapitel", 0, 0);
	getDataForOverview();
	setAllHeaders("Alle Krankheiten", "", "", "2000 - 2014");
});




