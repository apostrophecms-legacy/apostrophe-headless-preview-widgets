apos.define('apostrophe-headless-preview-widgets', {
  extend: 'apostrophe-widgets',
  construct: function (self, options) {
    self.play = function ($widget, data, options) {
      if (data.headlessUrl) {
        self.request(data, function (response) {
          self.overwrite(response, $widget);
          self.attachPagerListeners($widget);
          self.attachFilterListeners($widget);
          self.togglePagerLocks(response.page, $widget);
          $widget.find('[data-apos-headless-preview-target]').attr('data-apos-headless-preview-current-page', response.page.currentPage);
        });
      }
    };

    // Ask the back end of the results, pass results to a callback
    self.request = function (data, callback) {
      self.api('load', {
        data: data
      }, function (data) {
        return callback(data);
      }, function (err) {
        if (err) {
          console.log('error from server');
          return callback(err);
        }
      });
    };

    // Append stuff to result container
    self.append = function (data, $widget) {
      $widget.find('[data-apos-headless-preview-results]').append(data.body);
      $widget.find('[data-apos-headless-preview-target]').attr('data-apos-headless-preview-current-page', data.page.currentPage);
    };

    // Overwrite result container with new data
    self.overwrite = function (data, $widget) {
      // account for first render
      if ($widget.find('[data-apos-headless-preview-results]').length) {
        $widget.find('[data-apos-headless-preview-results]').html(data.body);
      } else {
        $widget.find('[data-apos-headless-preview-target]').html(data.body);
      }

      $widget.find('[data-apos-headless-preview-target]').removeAttr('data-apos-headless-preview-filtered-key');
      $widget.find('[data-apos-headless-preview-target]').removeAttr('data-apos-headless-preview-filtered-value');
      $widget.find('[data-apos-headless-preview-target]').attr('data-apos-headless-preview-current-page', data.page.currentPage);
    };

    // Attach click listeners for default page traversal mechanisms
    self.attachPagerListeners = function ($widget) {
      $widget.find('[data-apos-headless-preview-more]').on('click', self.more);
      $widget.find('[data-apos-headless-preview-next]').on('click', self.next);
      $widget.find('[data-apos-headless-preview-back]').on('click', self.back);
    };

    // Attach click listeners for default filters
    self.attachFilterListeners = function ($widget) {
      $widget.find('[data-apos-headless-preview-value]').on('click', self.filter);
    };

    // Filter a query and replace the results
    self.filter = function () {
      var $this = $(this);
      var $widget = self.getWidget(this);
      var data = self.getData($widget);
      data.extraQueries = { resultsOnly: true };
      data.extraQueries[$this.attr('data-apos-headless-preview-key')] = $this.attr('data-apos-headless-preview-value');
      self.request(data, function (err, response) {
        if (err) {
          apos.utils.error(err);
        }
        self.overwrite(response, $widget);
        self.togglePagerLocks(response.page, $widget);
        $widget.find('[data-apos-headless-preview-target]').attr('data-apos-headless-preview-filtered-key', $this.attr('data-apos-headless-preview-key'));
        $widget.find('[data-apos-headless-preview-target]').attr('data-apos-headless-preview-filtered-value', $this.attr('data-apos-headless-preview-value'));
        $widget.find('[data-apos-headless-preview-target]').attr('data-apos-headless-preview-current-page', response.page.currentPage);
      });
    };

    // Go forward a page and replace our results
    self.next = function () {
      var $widget = self.getWidget(this);
      var data = self.getData($widget);
      var $target = $widget.find('[data-apos-headless-preview-target]');
      var currentPage = parseInt($target.attr('data-apos-headless-preview-current-page'));

      data.extraQueries = {
        page: currentPage + 1,
        resultsOnly: true
      };

      if ($target.attr('data-apos-headless-preview-filtered-key')) {
        data.extraQueries[$target.attr('data-apos-headless-preview-filtered-key')] = $target.attr('data-apos-headless-preview-filtered-value');
      }

      self.request(data, function (response) {
        self.overwrite(response, $widget);
        self.togglePagerLocks(response.page, $widget);
      });
    };

    // Step back a page and replace our results
    self.back = function () {
      var $widget = self.getWidget(this);
      var data = self.getData($widget);
      var $target = $widget.find('[data-apos-headless-preview-target]');
      var currentPage = parseInt($target.attr('data-apos-headless-preview-current-page'));

      data.extraQueries = {
        page: currentPage - 1,
        resultsOnly: true
      };

      if ($target.attr('data-apos-headless-preview-filtered-key')) {
        data.extraQueries[$target.attr('data-apos-headless-preview-filtered-key')] = $target.attr('data-apos-headless-preview-filtered-value');
      }

      self.request(data, function (response) {
        self.overwrite(response, $widget);
        self.togglePagerLocks(response.page, $widget);
      });
    };

    // Loads next page of results and appends it to container
    self.more = function () {
      var $widget = self.getWidget(this);
      var data = self.getData($widget);
      var $target = $widget.find('[data-apos-headless-preview-target]');
      var currentPage = parseInt($target.attr('data-apos-headless-preview-current-page'));

      data.extraQueries = { page: currentPage + 1, resultsOnly: true };
      if ($target.attr('data-apos-headless-preview-filtered-key')) {
        data.extraQueries[$target.attr('data-apos-headless-preview-filtered-key')] = $target.attr('data-apos-headless-preview-filtered-value');
      }

      self.request(data, function (response) {
        self.append(response, $widget);
        self.togglePagerLocks(response.page, $widget);
      });
    };

    // Go find and return a jQuery object with our original widget
    self.getWidget = function (el) {
      return $(el).closest('[data-apos-widget]');
    };

    self.togglePagerLocks = function (page, $widget) {
      if (page.currentPage === 1) {
        $widget.find('[data-apos-headless-preview-back]').attr('disabled', true);
      } else {
        $widget.find('[data-apos-headless-preview-back]').removeAttr('disabled');
      }

      if (page.pages === page.currentPage) {
        $widget.find('[data-apos-headless-preview-next]').attr('disabled', true);
        $widget.find('[data-apos-headless-preview-more]').attr('disabled', true);
      } else {
        $widget.find('[data-apos-headless-preview-next]').removeAttr('disabled');
        $widget.find('[data-apos-headless-preview-more]').removeAttr('disabled');
      }
    };
  }
});
