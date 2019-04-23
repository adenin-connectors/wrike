'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    let pagination = $.pagination(activity);
    let searchParam = activity.Request.Query.query;
    let url = `/tasks?status=Active&sortField=DueDate&sortOrder=Asc&pageSize=${pagination.pageSize}&title=${searchParam}`;
    if (pagination.nextpage) {
      url += `&nextPageToken=${pagination.nextpage}`;
    }
    api.initialize(activity);
    const response = await api(url);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = api.convertResponse(response);
    if (response.body.nextPageToken) activity.Response.Data._nextpage = response.body.nextPageToken;
  } catch (error) {
    $.handleError(activity, error);
  }
};
