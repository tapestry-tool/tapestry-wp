var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.TrueFalse'] = (function () {
  return {
    1: {
      5: function (parameters, finished, extras) {
        var title;

        if (parameters && parameters.question) {
          title = parameters.question;
        }

        extras = extras || {};
        extras.metadata = extras.metadata || {};
        extras.metadata.title = (title) ? title.replace(/<[^>]*>?/g, '') : ((extras.metadata.title) ? extras.metadata.title : 'True-False');

        finished(null, parameters, extras);
      }
    }
  };
})();
