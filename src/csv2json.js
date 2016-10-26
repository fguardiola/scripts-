var p = function(jsonToPrint){
	console.log(JSON.stringify(jsonToPrint,null,4));
}
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
converter.fromFile("../data/inputCsv.csv",function(err,result){
	if (err) throw new Error("Invalid Conversion");

	if (result) p(result); 

});

