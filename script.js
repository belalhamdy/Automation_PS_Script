const batchId = "6";
const modelsPath = "S:\\work\\armor\\Skins\\all";
const mobilesPath = "S:\\work\\armor\\Skins\\mobiles\\Batch " + batchId;
const outPath = "S:\\work\\armor\\Skins\\out\\Batch " + batchId;

const transparentFileName = "sv".toLowerCase();
const transparentLayerName = "transparant";
const maskLayerName = "mask";
const photoLayerName = "photo";
const delimiter = "-";

const modelsDirectory = new Folder(modelsPath);
const mobilesDirectory = new Folder(mobilesPath);
const outputDirectory = new Folder(outPath);



if (checker()){
	var totalTime = new TimeIt();
	main();
alert(totalTime.getElapsed() + "Hours");
}

function main() {
    const mobileList = mobilesDirectory.getFiles();
    const modelsList = modelsDirectory.getFiles();
    for (var i = 0; i < mobileList.length; ++i) {
        if (mobileList[i] instanceof File && mobileList[i].hidden === false) {
            var docRef = open(mobileList[i]);
            var docName = docRef.name.replace(/\.[^.]+$/, '');

            var f = new Folder(outputDirectory + "/" + docName);
            if (!f.exists) {
                f.create();
            } else {
                alert("Error + " + docName + " Exists");
                continue;
            }

            for (var j = 0; j < modelsList.length; ++j) {
                if (modelsList[j] instanceof File && modelsList[j].hidden === false) {
                    var transparentLayer = docRef.artLayers.getByName(transparentLayerName);
                    var maskLayer = docRef.artLayers.getByName(maskLayerName);
                    var photoLayer = docRef.artLayers.getByName(photoLayerName);

                    docRef.activeLayer = maskLayer;

                    var skinName = placeImage(modelsList[j]);
                    var saveName = docName + delimiter + skinName;
                    var transparent = skinName.toLowerCase().indexOf(transparentFileName) !== -1;

                    playAction('MobileSkins', 'CenterImage');
                    playAction('MobileSkins', 'CreateClippingMask');
                     
                    // start transparent
                    if (transparent) {
                        maskLayer.opacity = 60;
                    }

                    save(docName, saveName + delimiter + "v");
                    photoLayer.visible = false;
                    
                    playAction('MobileSkins', 'hideMaskLayerStyle');
                    save(docName, saveName + delimiter + "h");
                    photoLayer.visible = true;
                    playAction('MobileSkins', 'showMaskLayerStyle');
					
                    // end transparent
                    if (transparent) {
                        maskLayer.opacity = 100;
                        transparentLayer.visible = false;
                    }

                    docRef.layers[0].remove();
                }
            }
            docRef.close(SaveOptions.DONOTSAVECHANGES);
        }
    }
}

function save(internalFolder, name){
	ExportJPG(internalFolder, name);
}
function checker() {
    if (mobilesDirectory === null || modelsDirectory === null || outputDirectory === null) return false;
    const mobileList = mobilesDirectory.getFiles();
    for (var i = 0; i < mobileList.length; ++i) {
        if (mobileList[i] instanceof File && mobileList[i].hidden === false) {
            var docRef = open(mobileList[i]);
            var docName = docRef.name.replace(/\.[^.]+$/, '');
            try {
                docRef.artLayers.getByName(transparentLayerName);
                docRef.artLayers.getByName(maskLayerName);
                docRef.artLayers.getByName(photoLayerName);
            } catch (e) {
                alert("Please Check layer names in document " + docName);
                return false;
            }
            docRef.close(SaveOptions.DONOTSAVECHANGES);

        }
    }
    return true;
}

function fitCurrentLayerToMobileSize(){
	var doc = app.activeDocument;
    var layer = doc.activeLayer;
	    // do nothing if layer is background or locked
    if (layer.isBackgroundLayer || layer.allLocked || layer.pixelsLocked
        || layer.positionLocked || layer.transparentPixelsLocked) return;
    // do nothing if layer is not normal artLayer or Smart Object
    if (layer.kind !== LayerKind.NORMAL && layer.kind !== LayerKind.SMARTOBJECT) return;
    // store the ruler
    var defaultRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
	
    var bounds = app.activeDocument.activeLayer.bounds;
    var layerWidth = bounds[2].as('px') - bounds[0].as('px');
    var layerHeight = bounds[3].as('px') - bounds[1].as('px');
	
	newHeight = 720; // here goes the required skin height
    resizePercent = newHeight / layerHeight * 100;
    app.activeDocument.activeLayer.resize(resizePercent, resizePercent, AnchorPosition.TOPLEFT);
	
	
	app.preferences.rulerUnits = defaultRulerUnits;

	return layer.name;
}
function placeImage(sourceFile) {
    const idPlc = charIDToTypeID("Plc ");
    const desc3 = new ActionDescriptor();
    const idnull = charIDToTypeID("null");
    desc3.putPath(idnull, sourceFile);
    const idFTcs = charIDToTypeID("FTcs");
    const idQCSt = charIDToTypeID("QCSt");
    const idQcsa = charIDToTypeID("Qcsa");
    desc3.putEnumerated(idFTcs, idQCSt, idQcsa);
    executeAction(idPlc, desc3, DialogModes.NO);

    return fitCurrentLayerToMobileSize();
}

function playAction(actionSet, actionName) {
    const idPly = charIDToTypeID("Ply ");
    const desc2 = new ActionDescriptor();
    const idnull = charIDToTypeID("null");
    const ref1 = new ActionReference();
    const idActn = charIDToTypeID("Actn");
    ref1.putName(idActn, actionName);
    const idASet = charIDToTypeID("ASet");
    ref1.putName(idASet, actionSet);
    desc2.putReference(idnull, ref1);
    executeAction(idPly, desc2, DialogModes.NO);
}

function TimeIt() {
  this.startTime = new Date();
  this.endTime = new Date();

  this.start = function () {

        this.startTime = new Date();

    }
	
  this.stop = function () {

        this.endTime = new Date();

    }
  this.getTime = function () {

        return ((this.endTime.getTime() - this.startTime.getTime()) / (1000*60*60));

    }

  this.getElapsed = function () {

        this.endTime = new Date(); return this.getTime();

    }

}

function ExportJPG(internalFolder, name){
	 var i;
    // Confirm the document has already been saved and so has a path to use
    try {
        app.activeDocument.save()
    } catch (e) {
        alert("Could not export JPG as the document is not saved.\nPlease save and try again.");
        return
    }

    // Store the active doc handle in variable
    const originalDoc = app.activeDocument;

    // Check there is at least 1 visible layer.
    var foundVisible = false;
    for (i = 0; i < originalDoc.layers.length; i++) {
        if (originalDoc.layers[i].visible) {
            foundVisible = true;
            break
        }
    }

    if (!foundVisible) {
        alert("No visible layers found. JPG export failed.");
        return
    }

    // Duplicate. We'll save the duplicate as a .png and close it.
    const newDoc = originalDoc.duplicate();

    // Photoshop must have a visible layer selected to merge visible layers, so we ensure there is one selected.
    newDoc.activeLayer = newDoc.artLayers.add();
    newDoc.activeLayer.visible = true;
    
    // Merge the layers.
    newDoc.mergeVisibleLayers();


    // Remove all empty layers.
    for (i = newDoc.layers.length - 1; i >= 0; i--) {
        if (!newDoc.layers[i].visible) {
            newDoc.layers[i].remove()
        }
    }

	var jpgOptions = new JPEGSaveOptions();
	jpgOptions.quality = 8;
	jpgOptions.embedColorProfile = true;
	jpgOptions.formatOptions = FormatOptions.PROGRESSIVE;
	if(jpgOptions.formatOptions == FormatOptions.PROGRESSIVE){
	jpgOptions.scans = 5;
	}
	jpgOptions.matte = MatteType.NONE;
	
    // Set up destination path.
    savePath = File(outputDirectory + "/" + internalFolder + "/" + name + ".jpg");

    // Save!
    newDoc.saveAs(savePath, jpgOptions, false, Extension.LOWERCASE);

    // Close the duplicate.
    newDoc.close();

    // Just in case, make sure the active document is the orignal one.
    app.activeDocument = originalDoc
	
}