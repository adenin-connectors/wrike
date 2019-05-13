'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let pagination = $.pagination(activity);
    let url = `/tasks?status=Active&sortField=DueDate&sortOrder=Asc&pageSize=${pagination.pageSize}`;
    if (pagination.nextpage) {
      url += `&nextPageToken=${pagination.nextpage}`;
    }
    // when we don't fetch all items we get all tasks count in response.
    let valueUrl = `/tasks?status=Active&sortField=DueDate&sortOrder=Asc&pageSize=1`;

    const promises = [];
    promises.push(api(url));
    promises.push(api(valueUrl));
    const responses = await Promise.all(promises);

    for (let i = 0; i < responses.length; i++) {
      if ($.isErrorResponse(activity, responses[i])) return;
    }
    const tasks = responses[0];
    const value = responses[1].body.responseSize;

    activity.Response.Data.items= api.convertResponse(tasks);
    activity.Response.Data.title = T(activity, 'Active Tasks');
    activity.Response.Data.link = 'https://www.wrike.com/workspace.htm?';
    activity.Response.Data.linkLabel = T(activity, 'All Tasks');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tasks.", value)
        : T(activity, "You have 1 task.");
    } else {
      activity.Response.Data.description = T(activity, `You have no tasks.`);
    }
    if (tasks.body.nextPageToken) activity.Response.Data._nextpage = tasks.body.nextPageToken;
  } catch (error) {
    $.handleError(activity, error);
  }
};