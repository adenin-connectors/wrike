'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let pagination = $.pagination(activity);
    var dateRange = $.dateRange(activity);
    let startDate = new Date(dateRange.startDate).toISOString().replace(".000", "");
    let endDate = new Date(dateRange.endDate).toISOString().replace(".000", "");
    let url = `/tasks?status=Active&sortOrder=Desc&sortField=CreatedDate&pageSize=${pagination.pageSize}` +
      `&createdDate={"start":"${startDate}","end":"${endDate}"}`;
    if (pagination.nextpage) {
      url += `&nextPageToken=${pagination.nextpage}`;
    }
    // when we don't fetch all items we get all tasks count in response.
    let valueUrl = `/tasks?status=Active&sortOrder=Desc&sortField=CreatedDate&pageSize=1&createdDate={"start":"${startDate}","end":"${endDate}"}`;

    const promises = [];
    promises.push(api(url));
    promises.push(api(valueUrl));
    const responses = await Promise.all(promises);

    for (let i = 0; i < responses.length; i++) {
      if ($.isErrorResponse(activity, responses[i])) return;
    }
    const tasks = responses[0];
    const value = responses[1].body.responseSize;

    activity.Response.Data.items = api.convertResponse(tasks);
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, 'Open Tasks');
      activity.Response.Data.link = 'https://www.wrike.com/workspace.htm?';
      activity.Response.Data.linkLabel = T(activity, 'All Tasks');
      activity.Response.Data.actionable = value > 0;

      if (value > 0) {
        activity.Response.Data.value = value;
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tasks.", value)
          : T(activity, "You have 1 task.");
      } else {
        activity.Response.Data.description = T(activity, `You have no tasks.`);
      }
    }
    if (tasks.body.nextPageToken) activity.Response.Data._nextpage = tasks.body.nextPageToken;
  } catch (error) {
    $.handleError(activity, error);
  }
};