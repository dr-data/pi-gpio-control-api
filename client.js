window.onload = function () {
    var url, 
      i,
      ports = [3, 27];
    
    for (i in ports) {
        $('#input_' + ports[i]).html('loading port ' + ports[i] + ' value...');
    }

    setInterval( function() {
	for (i in ports) {
	    url = document.URL + 'inputs/' + ports[i];
	    console.log('making API call ' + url);

	    $.getJSON(url, function(data) {
		console.log('API response received. port ' + data.gpio + ' value = ' + data.value);
		$('#input_' + data.gpio).html('GPIO input port ' + data.gpio + ' value is ' + data.value);
	    }); 
	} //end for
    }, 1000); //end setInterval

}; //onload