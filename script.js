//const modelsDirectory = Folder.selectDialog("Select Models (Skins) Directory");
//const mobilesDirectory = Folder.selectDialog("Select Mobiles (PSD) Directory");
//const outputDirectory = Folder.selectDialog("Select Output Directory");


const modelsPath = "S:\\work\\armor\\Skins\\testSkins";
const mobilesPath = "S:\\work\\armor\\Skins\\mobiles";
const outPath = "S:\\work\\armor\\Skins\\out";
const modelsDirectory = new Folder(modelsPath);
const mobilesDirectory = new Folder(mobilesPath);
const outputDirectory = new Folder(outPath);

main();

function main() {
    if (modelsDirectory !== null && mobilesDirectory !== null && outputDirectory !== null) {
        const mobileList = mobilesDirectory.getFiles();
        const modelsList = modelsDirectory.getFiles();
        for (var i = 0; i < mobileList.length; ++i) {
            if (mobileList[i] instanceof File && mobileList[i].hidden === false) {
                var docRef = open(mobileList[i]);
                var docName = docRef.name.replace(/\.[^\.]+$/, '');
                for (var j = 0; j < modelsList.length; ++j) {
                    if (modelsList[j] instanceof File && modelsList[j].hidden === false) {
                        var saveName = docName + " - " + j;
                        placeImage(modelsList[j]);
                        playAction('MobileSkins', 'CenterImage');
                        playAction('MobileSkins', 'CreateClippingMask');
                        ExportPNG(saveName + " - A");
                        playAction('MobileSkins', 'HidePhoto');
                        ExportPNG(saveName + " - B");
                        playAction('MobileSkins', 'ShowPhoto');

                        docRef.layers[0].remove();
                    }
                }
                docRef.close(SaveOptions.SAVECHANGES);
            }
        }
    }
}

function fitCurrentLayerToCanvas(keepAspect) {// keepAspect:Boolean - optional. Default to false
    var doc = app.activeDocument;
    var layer = doc.activeLayer;
    // do nothing if layer is background or locked
    if (layer.isBackgroundLayer || layer.allLocked || layer.pixelsLocked
        || layer.positionLocked || layer.transparentPixelsLocked) return;
    // do nothing if layer is not normal artLayer or Smart Object
    if (layer.kind != LayerKind.NORMAL && layer.kind != LayerKind.SMARTOBJECT) return;
    // store the ruler
    var defaultRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    var width = doc.width.as('px');
    var height = doc.height.as('px');
    var bounds = app.activeDocument.activeLayer.bounds;
    var layerWidth = bounds[2].as('px') - bounds[0].as('px');
    var layerHeight = bounds[3].as('px') - bounds[1].as('px');

    // move the layer so top left corner matches canvas top left corner
    layer.translate(new UnitValue(0 - layer.bounds[0].as('px'), 'px'), new UnitValue(0 - layer.bounds[1].as('px'), 'px'));
    if (!keepAspect) {
        // scale the layer to match canvas
        layer.resize((width / layerWidth) * 100, (height / layerHeight) * 100, AnchorPosition.TOPLEFT);
    } else if ((width < height)) {

        var layerRatio = layerWidth / layerHeight;
        var newHeight = height;
        var newWidth = width;
        var resizePercent = newHeight / layerHeight * 100;
        app.activeDocument.activeLayer.resize(resizePercent, resizePercent, AnchorPosition.TOPLEFT);

    } else {
        var layerRatio = layerWidth / layerHeight;
        var newWidth = width;
        var newHeight = height;
        if (newHeight >= height) {
            newWidth = width;
            newHeight = height;
        }
        var resizePercent = newWidth / layerWidth * 100;
        app.activeDocument.activeLayer.resize(resizePercent, resizePercent, AnchorPosition.TOPLEFT);
    }
    // restore the ruler
    app.preferences.rulerUnits = defaultRulerUnits;

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

    fitCurrentLayerToCanvas();
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

function ExportPNG(name) {
    var i;
    // Confirm the document has already been saved and so has a path to use
    try {
        app.activeDocument.save()
    } catch (e) {
        alert("Could not export PNG as the document is not saved.\nPlease save and try again.");
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
        alert("No visible layers found. PNG export failed.")
        return
    }

    // Duplicate. We'll save the duplicate as a .png and close it.
    const newDoc = originalDoc.duplicate();

    // Photoshop must have a visible layer selected to merge visible layers, so we ensure there is one selected.
    newDoc.activeLayer = newDoc.artLayers.add();

    // Merge the layers.
    newDoc.mergeVisibleLayers();

    // Remove all empty layers.
    for (i = newDoc.layers.length - 1; i >= 0; i--) {
        if (!newDoc.layers[i].visible) {
            newDoc.layers[i].remove()
        }
    }

    // Set up PNG save options.;
    pngOptions = new PNGSaveOptions();
    pngOptions.compression = 1;
    pngOptions.interlaced = false;

    // Set up destination path.
    //savePath = File(outputDirectory + "/" + originalDoc.name.replace(/\.[^\.]+$/, '.png'));
    savePath = File(outputDirectory + "/" + name + ".png");

    // Save!
    newDoc.saveAs(savePath, pngOptions, false, Extension.LOWERCASE);

    // Close the duplicate.
    newDoc.close();

    // Just in case, make sure the active document is the orignal one.
    app.activeDocument = originalDoc
}
