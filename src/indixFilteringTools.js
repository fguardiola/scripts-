var fs = require('fs');
var readline = require('readline');
var _ = require('lodash');

var lib = {
	'version': '0.1.0',
	'config': {
		source: "../data/inputJsonl.jsonl",
		verbose: false,
		veryVerbose: false,
	},

	'productMap': {
		"basePath": []
	},

	readJsonLineFileAsync: function(entry) {
		return new Promise(function(c, e) {
			var source = [];

			if (lib.config.verbose) lib.utils.colorLog("[*] Reading input source file");
			var lineReader = readline.createInterface({
				input: fs.createReadStream(lib.config.source)
			});

			var linecounter = 0;
			lineReader.on('line', function(line) {
				if (lib.config.veryVerbose) process.stdout.write(".");
				try {
					source.push(JSON.parse(line));
					linecounter++;
				} catch (ex) {
					lib.utils.colorLog("[-] Error parsing line: " + line);
					process.exit(1);
				}
			});

			lineReader.on('close', function() {
				if (lib.config.veryVerbose) process.stdout.write("\n");
				if (lib.config.verbose) lib.utils.colorLog("[+] Read " + linecounter + " lines");
				if (lib.config.verbose) lib.utils.colorLog("[+] Parsed " + source.length + " JSON objects successfully");
				entry["jsonToFilter"] =source;
				// console.log(entry);
				c(entry);
			});
		});
	},
	jsonToCsvAsync : function (entry,csvPath){
		return new Promise(function(c, e) {
			var jsonObj;
			var Converter = require("csvtojson").Converter;
			var converter = new Converter({});
			converter.fromFile(csvPath, function(err, result) {
				if (err) throw new Error("Invalid Conversion");
				if (result) {
					entry["jsonKeys"] =result;
					c(entry);
				}
			});
			
		});
	},
	
	filterJsonAsync : function(workb){
		return new Promise(function(c, e) {
			var keysToLookUp = workb.jsonKeys;
			var objsToFilter = workb.jsonToFilter;
			var matches = [];
			
			// test= ["e775b275a589b9dd8c94a23a4256b04c","something"];
			objsToFilter.forEach(function(objToFilter,index){
				console.log(index)
				var	stores=objToFilter["stores"];
				var productObject =stores[(Object.keys(stores)[0])].offers[0]; 
				//console.log(productObject);
			    var pid = productObject.pid;
			    console.log(pid);
				var match = _.find(keysToLookUp,{'PIDs':pid});
				 if(match) matches.push(objToFilter);
				 // if(!match) objsToFilter.splice(index, 1);

			})
			console.log("After filtration:" + matches.length + " matches!!");
			console.log(JSON.stringify(matches,null,4));

          c(matches);
		});
	},
	checkImagesAsync: function(entry) {

		var checkImageAsync = function(image) {
				return new WinJS.Promise(function(c, e) {

					var url = image.url;

					var statusObj = {
						role: image.role,
						url: url,
						status: 'starting'
					}

					// Catch any and all errors outside the http.get
					try {
						var request = http.get(url, function(response) {


							response.on('data', function() {
								// Once we recieve data, stop the data
								request.abort();
								// Store the http status code
								statusObj.statusCode = response.statusCode;

								if (response.statusCode === 200) {
									statusObj.status = "ok"
									c(statusObj);
								} else {
									statusObj.status = "invalid"
									statusObj.error = "Not 200 OK";
									c(statusObj);
								}
							});

							// Catch errors with the response itself
							// 		No examples of how to induce this yet
							response.on('error', function(err) {
								statusObj.status = "error-1";
								statusObj.error = err.toString();
								c(statusObj);
							});
						}).on('error', function(err) {
							// Catch errors with the http.get request
							// 		Covers network interruption, bad domain name
							statusObj.status = "error-2";
							statusObj.error = err.toString();
							c(statusObj);
						});
					} catch (excp) {
						// Catch errors with the http.get itself
						// 		Covers https not being supported
						statusObj.status = "error-3";
						statusObj.error = excp.toString();
						c(statusObj);
					}
				});
			}
			//array to push images to check
		//skip cheching if there is not chechImages config property with enabled property set to true
		if (lib.productMap.checkImages == undefined){
			if (lib.config.verbose) lib.utils.colorLog("[-]\tSkipping Image checking");
			return entry;
		}
		var enabled = lib.productMap.checkImages;
		if (!enabled == true || !enabled == "true"){
			if (lib.config.verbose) lib.utils.colorLog("[-]\tSkipping Image checking. Enabled property not set to true");
			return entry;
		}

		var imagesToCheck = [];

		if (entry.hasOwnProperty("imageUrl") || entry.hasOwnProperty("modacom_picture")) {
			var imageUrl = entry.imageUrl ? entry.imageUrl : entry.modacom_picture;
			var mainImage = {
				role: "mainImage",
				url: imageUrl
			};
			imagesToCheck.push(mainImage);
		}

		// console.log(JSON.stringify(entry, null, 4));
		if (entry.hasOwnProperty("additionalImageUrls") || entry.hasOwnProperty("modacom_images")) {
			var additionalImageUrls = entry.additionalImageUrls ? entry.additionalImageUrls : entry.modacom_images;
			additionalImageUrls.forEach(function(additionalImageUrl) {
				var additionalImage = {
					role: "additionalImage",
					url: additionalImageUrl
				}
				imagesToCheck.push(additionalImage);
			})
		}

		var promiseCollection = [];

		for (var i = 0; i < imagesToCheck.length; i++) {
			var image = imagesToCheck[i];
			promiseCollection.push(checkImageAsync(image));
		}

		// console.log(JSON.stringify(imagesToCheck,null,4));

		return WinJS.Promise.join(promiseCollection).then(function(d) {
			// Add a new property for analisis before transforming to csv
			var invalidAdditionalImages = [];
			// check images and add properties to entry if any of the images is not valid
			for (var i = 0; i < d.length; i++) {
				var imageRole = d[i].role;
				var imageStatus = d[i].status;
				var imageUrl = d[i].url;

				if (imageRole === "mainImage" && imageStatus !== "ok") entry["invalidMainImage"] = d[i];

				if (imageRole === "additionalImage" && imageStatus !== "ok") invalidAdditionalImages.push(d[i]);
			}

			if (invalidAdditionalImages.length > 0) {
				entry["invalidAdditionalImages"] = invalidAdditionalImages;
				// set original invalidAdditionalImages to blank
				// filter the original array getting rid of the invalid images
				var originalAdditionalImages = entry["additionalImageUrls"]
				invalidAdditionalImages.forEach(function(invalidAdditionalImage){
					originalAdditionalImages = _.filter(originalAdditionalImages, function(currentObject) {
						return currentObject === invalidAdditionalImage.url;
					});
				});
				entry["additionalImageUrls"] = originalAdditionalImages;
			}
			return entry;
			// console.log("Done!");
		}, function(e) {
			// console.log("Error!");
			// console.log(e);
			throw new Error("Cannot validate images on entry" + JSON.stringify(entry, null, 4));

		});
	},
	utils: {
	}
}

module.exports = lib;