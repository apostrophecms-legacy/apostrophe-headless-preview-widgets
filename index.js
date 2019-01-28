const request = require('request-promise');
const cheerio = require('cheerio');
const _ = require('lodash');
const qs = require('qs');

module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Headless Previews',
  alias: 'apostropheHeadlessPreviews',
  addFields: [
    {
      name: 'headlessUrl',
      label: 'URL',
      type: 'url'
    },
    {
      name: 'headlessLimit',
      label: 'Preview Limit',
      help: 'Optional',
      type: 'integer'
    },
    {
      name: 'headlessFilterBy',
      label: 'Filter Results by',
      type: 'select',
      choices: [
        { label: 'Nothing', value: 'none' },
        { label: 'Tag', value: 'tag', showFields: ['headlessFilterByTag'] },
        { label: 'Join', value: 'join', showFields: ['headlessFilterByJoinName', 'headlessFilterByJoinSlug'] }
      ]
    },
    {
      name: 'headlessFilterByTag',
      label: 'Tag to Filter by',
      type: 'string'
    },
    {
      name: 'headlessFilterByJoinName',
      label: 'Name of Join Field',
      type: 'string'
    },
    {
      name: 'headlessFilterByJoinSlug',
      label: 'Slug of Join',
      type: 'string'
    }
  ],

  construct: function (self, options) {
    // Route that responds to requests from the front end
    self.route('post', 'load', async function (req, res) {
      try {
        const cache = await self.getCache(req.body.data);
        const data = await self.getData(cache);
        const body = self.renderer('widgetAjax', data)(req);
        return res.send({
          body: body,
          status: 'ok'
        });
      } catch (e) {
        self.apos.utils.error(e);
        const body = self.renderer('widgetAjax', {
          status: 'error',
          error: e
        })(req);
        return res.send({
          body: body,
          message: e.message
        });
      }
    });

    // pull all cached material for processing
    self.getCache = async function (data) {
      let cache;
      let url = data.headlessUrl;
      let query = {};
      const previewCache = self.apos.caches.get('apostrophe-headless-previews');

      if (data.headlessFilterByTag && data.headlessFilterBy === 'tag') {
        query.tag = data.headlessFilterByTag;
      }

      if (data.headlessFilterByJoinName && data.headlessFilterByJoinSlug && data.headlessFilterBy === 'join') {
        query[data.headlessFilterByJoinName] = data.headlessFilterByJoinSlug;
      }

      if (data.headlessLimit) {
        query.perPage = data.headlessLimit;
      }

      url = encodeURI(url + '?' + qs.stringify(query));

      cache = {
        url: url,
        cache: await previewCache.get(url)
      };

      return cache;
    };

    // if a URL has a cache, pass it along
    // if not, fetch it, parse it, pass it along, and write it to the cache
    self.getData = async function (cache) {
      let data;
      const previewCache = self.apos.caches.get('apostrophe-headless-previews');
      if (cache.cache) {
        data = cache.cache;
      } else {
        let response = await request({
          url: cache.url,
          json: true
        });
        await previewCache.set(cache.url, response, 86400);
        data = response;
      }
      return data;
    };

    self.pushAsset('stylesheet', 'always', {
      when: 'always'
    });

    // template conveniences
    self.addHelpers({

      getImageUrls: function (imagesObj) {
        let data = [];
        imagesObj.items.forEach(function (item) {
          data.push(item._pieces[0].item.attachment._urls);
        });

        if (data.length === 1) {
          data = data[0];
        }
        return data;
      }

    });
  }
};
