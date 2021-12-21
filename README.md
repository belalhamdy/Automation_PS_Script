# Automation_PS_Script
* PhotoShop JavaScript to automate batch processing.
* Places multiple images on single clipping mask and save each image twice one with the mask shown and other hidden.

# Prerequisites
* Directory contains all your PSD Files.
    * Each File contains three layers:
        * `photo` which holds your photo.
        * `mask` which holds your photo mask.
        * `transparent` which holds the transparent layer for `SV Skins`.
* PhotoShop CC 2019 is recommended.
* Masks in `900 x 1329 pixels`.

# How to Run
1. Load the action set `MobileSkins.atn`.
2. Load the styles `styles.asl`.
3. In PhotoShop -> `File - Scripts - Browse` and choose `script.js`.

# Notes
* To run action `prepare_mask` make the current layer selection on the mask layer. 
* To change all files to lowercase characters open `CMD` and change directory to the current folder path then type `for /f "Tokens=*" %f in ('dir /l/b/a-d') do (rename "%f" "%f")`.

# How to prepare PSD Files
1. Make a document of size 1000 x 1000.
2. Get the phone photo and you don't have to center it.
3. Draw the outline boundary of the phone with smart shapes.
4. Press `F2` to cut the background of the phone.
5. Complete phone drawing.
6. Press `F3` to prepare the document, save it and open another document to continue.

* Make sure before pressing `F2` or `F3` that the current layer is the mask layer.

# Sample
## Mask Image
![](images/mask.png)
## Generated Skin
![](images/skin.png)

