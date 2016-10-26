var lib = require("./indixFilteringTools");


var p = function(jsonToPrint){
	console.log(JSON.stringify(jsonToPrint,null,4));
}
//read jsonline and console result 
var csvPath = "../data/inputCsv.csv";

// lib.readJsonLineFileAsync().then(function (result){
// 	p(result);
    

// });

var workblob= {};

lib.jsonToCsvAsync(workblob,csvPath).then(function(result){
	// p("1");
	//workblob["jsonKeys"]= result;
	//p(result);
	
	return lib.readJsonLineFileAsync(workblob).then(function (result){
	 // p("2");
	  
	 return lib.filterJsonAsync(workblob);
	  
	});
}).then(function(result){
	console.log("matches: "+ result.length);
	// p(result);
	if (result.length > 0){
		console.log("Writing to jsonl...")
		lib.writeJsonLineFileAsync(result).then(function(result){
		  p(result);
		})
	}	
	else console.log("No matches. Nothing to write on output jsonl");
});

// lib.jsonToCsvAsync(workblob,csvPath).then(lib.readJsonLineFileAsync()).then(function(result){
// 	p(result)
// })