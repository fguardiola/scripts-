var lib = require("./indixFilteringTools");

var p = function(jsonToPrint){
	console.log(JSON.stringify(jsonToPrint,null,4));
}

var csvPath = "../data/inputCsv.csv";
var workblob= {};

lib.csvToJsonAsync(workblob,csvPath).then(function(result){
	return lib.readJsonLineFileAsync(workblob).then(function (result){
	 return lib.filterJsonAsync(workblob);
	});
}).then(function(result){
	// p(result);
	if (result.length > 0){
		lib.writeJsonLineFileAsync(result).then(function(result){
		  console.log(result);
		})
	}	
	else console.log("No matches. Nothing to write on output jsonl");
});

