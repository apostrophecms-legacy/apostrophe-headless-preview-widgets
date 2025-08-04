# ⛔️ **DEPRECATED** — do not use for new projects

See [our current docs](https://docs.apostrophecms.org/)

# apostrophe-headless-preview-widgets

## Renders page previews based on an apostrophe-headless index endpoint

### Detail
`apostrophe-headless-preview-widgets` lets you paste a link to an `[apostrophe-headless](https://npmjs.org/package/apostrophe-headless)` pieces API endpoint, typically on another site, and have the JSON response returned to a template for rendering. You can customize that template and use it to display a preview of the external show pages within another Apostrophe site. Template is rendered via AJAX  after page load and the module leverages `apostrophe-caches` for fastest delivery.

### Example response object
Your template will recieve a `data` object that could look like:
```js
{
  total: 3,
  pages: 1,
  perPage: 50,
  results: [
    {
      "_id": "cjnri2axl001rzkvrre9lh49c",
      "published": true,
      "trash": false,
      "type": "artwork",
      "title": "Apples and Grapes",
      "medium": "Oil on canvas",
      "dimensions": "26 5/8 x 35 1/4 in.",
      "year": 1879,
      "description": "Consequat adipisicing deserunt dolore non culpa proident mollit in. Ipsum ullamco proident do anim tempor quis. Esse incididunt sunt ipsum nulla nisi culpa reprehenderit occaecat officia. In eu incididunt amet minim dolor pariatur ipsum nulla. In nisi nisi et tempor occaecat sint et. Commodo magna do ex id id. Aliquip culpa officia laboris aliquip cupidatat culpa in cupidat",
      "objectTypeId": "cjnqju99g005z3rgzryea8g4c",
      "locationId": "cjnrfxrh6000j8bgzzmnufp54",
      "artistId": "cjnqemmog002j8wvrnpekn0qn",
      "openGraphTitle": "Apples and Grapes | OpenMuseum on ApostropheCMS",
      "seoTitle": "Apples and Grapes | OpenMuseum on ApostropheCMS",
      "seoDescription": "OpenMuseum is an ApostropheCMS demo website, more at http://apostrophecms.org",
      "openGraphDescription": "OpenMuseum is an ApostropheCMS demo website, more at http://apostrophecms.org",
      "createdAt": "2018-10-27T13:47:18.873Z",
      "slug": "apples-and-grapes",
      "titleSortified": "apples and grapes",
      "updatedAt": "2019-01-24T20:07:31.170Z",
      "highSearchText": "apples and grapes openmuseum is an apostrophecms demo website more at http apostrophecms org apples and grapes cool apples and grapes apples and grapes cool apples "
      }
      ...
  ]
```
