/* Exports a function which returns an object that overrides the default &
 *   plugin file patterns (used widely through the app configuration)
 *
 * To see the default definitions for Lineman's file paths and globs, see:
 *
 *   - https://github.com/linemanjs/lineman/blob/master/config/files.coffee
 */
module.exports = function(lineman) {
  //Override file patterns here
  return {

    // As an example, to override the file patterns for
    // the order in which to load third party JS libs:
    //
     js: {
       vendor: [
         "vendor/js/jquery.js",
         "vendor/js/bootstrap.js",
         "vendor/js/leaflet-src.js",
         "vendor/js/leaflet.markercluster-src.js",
         "vendor/js/esri-leaflet-src.js",
         "vendor/js/cluster-feature-layer.js",
         "vendor/js/rrose-src.js",
         "vendor/js/chart.min.js",
         "vendor/js/**/*.js"
       ]
     }

  };
};
