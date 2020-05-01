const modelsDirectory = Folder.selectDialog("Select Models (Skins) Directory");
const mobilesDirectory = Folder.selectDialog("Select Mobiles (PSD) Directory");
const outputDirectory = Folder.selectDialog("Select Output Directory");

//const app = new ActiveXObject('Photoshop.Application');
//const fso = new ActiveXObject('Scripting.FileSystemObject');


if (modelsDirectory !== null && mobilesDirectory !== null && outputDirectory !== null) {
    const mobileList = mobilesDirectory.getFiles();
    const modelsList = modelsDirectory.getFiles();

    for (let i = 0; i < mobileList.length; ++i) {
        if (mobileList[i] instanceof File && mobileList[i].hidden === false) {
            const docRef = open(mobileList[i]);
            const docName = docRef.name.replace(/\.[^\.]+$/, '');
            for (let j = 0; i < modelsList.length; ++j) {
                if (mobileList[i] instanceof File && mobileList[i].hidden === false) {
                    const saveName = docName + " - " + j;
                    /*const curr_file = open(modelsList[i]); // one of them
                    curr_file.selection.selectAll();
                    curr_file.selection.copy();
                    curr_file.close(SaveOptions.DONOTSAVECHANGES);
                    docRef.paste();*/

                    placeImage(modelsList[i]);

                    playAction('MobileSkins', 'CenterImage');
                    playAction('MobileSkins', 'CreateClippingMask');

                    ExportPNG(saveName + " - A");

                    playAction('MobileSkins', 'HidePhoto');

                    ExportPNG(saveName + " - B");

                    playAction('MobileSkins', 'ShowPhoto');


                    docRef.layers[0].remove();
                }
            }
            docRef.close(SaveOptions.DONOTSAVECHANGES);
            // Close mobile

        }
    }
}

function placeImage(sourceFile) {
    var idPlc = charIDToTypeID("Plc ");
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    desc3.putPath(idnull, sourceFile);
    var idFTcs = charIDToTypeID("FTcs");
    var idQCSt = charIDToTypeID("QCSt");
    var idQcsa = charIDToTypeID("Qcsa");
    desc3.putEnumerated(idFTcs, idQCSt, idQcsa);
    executeAction(idPlc, desc3, DialogModes.NO);
}

function playAction(actionSet, actionName) {
    var idPly = charIDToTypeID("Ply ");
    var desc2 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref1 = new ActionReference();
    var idActn = charIDToTypeID("Actn");
    ref1.putName(idActn, actionName);
    var idASet = charIDToTypeID("ASet");
    ref1.putName(idASet, actionSet);
    desc2.putReference(idnull, ref1);
    executeAction(idPly, desc2, DialogModes.NO);
}

function ExportPNG(name) {
    // Confirm the document has already been saved and so has a path to use
    try {
        app.activeDocument.save()
    } catch (e) {
        alert("Could not export PNG as the document is not saved.\nPlease save and try again.")
        return
    }

    // Store the active doc handle in variable
    var originalDoc = app.activeDocument;

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
    var newDoc = originalDoc.duplicate();

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
    pngOptions.compression = 0;
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

