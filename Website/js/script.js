var menuDataGlobal;

// Get Data for Sidebar menu
function getDataForMenu(typ, icd_kapitel, icd_gruppe) {
	
	var menuData = [];

	const queryString = "http://localhost:3030/medstat/?query=PREFIX+med%3A+%3Chttp%3A%2F%2Fpurl.org%2Fnet%2Fmedstats%3E+SELECT+distinct+%3Fdi+%3Fdt+WHERE+%7B%3Fx+med%3Ajahr+%222000%22+.+%3Fx+med%3Adiagnose_icd+%3Fdi+.+%3Fx+med%3Adiagnose_text+%3Fdt+.+%3Fx+med%3Aicd_typ+%22" + typ + "%22+.%7D";

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
getDataForMenu("Kapitel", 0, 0);



