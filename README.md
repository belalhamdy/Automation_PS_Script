# Automation_PS_Script
* PhotoShop JavaScript to automate batch processing.
* Places multiple images on single clipping mask and save each image twice one with the mask shown and other hidden.

# Prerequisites
* Directory contains all your PSD Files.
    * Each File contains two layers:
        * `photo` which holds your photo.
        * `mask` which holds your photo mask.
* PhotoShop CC 2019 is recommended.
* Masks in `900 x 1329 pixels`.

# How to Run
* Load the action set `MobileSkins.atn`.
* Load the styles `styles.asl`.
* In PhotoShop -> `File - Scripts - Browse` and choose `script.js`.

# Notes
* To run action `prepare_mask` make the current layer selection on the mask layer. 
        * If `prepare_mask` doesn't work try: In PhotoShop -> `Edit - Keyboard Shortcuts - Layer - Rename` and make it's shortcut -> `F2`.
