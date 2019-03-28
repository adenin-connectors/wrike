'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    let pagination = Activity.pagination();
    let url = `/tasks?status=Active&sortField=DueDate&sortOrder=Asc&pageSize=${pagination.pageSize}`;
    if (pagination.nextpage) {
      url += `&nextPageToken=${pagination.nextpage}`;
    }
    const response = await api(url);

    if (Activity.isErrorResponse(response)) return;

    activity.Response.Data = api.convertResponse(response);
    if (response.body.nextPageToken) {
      activity.Response.Data._nextpage = response.body.nextPageToken;
    }
  } catch (error) {
    Activity.handleError(error);
  }
};