'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let pagination = $.pagination(activity);
    var dateRange = $.dateRange(activity, "today");
    let startDate = new Date(dateRange.startDate).toISOString().replace(".000", "");
    let endDate = new Date(dateRange.endDate).toISOString().replace(".000", "");

    // Returns current account.
    // https://developers.wrike.com/documentation/api/methods/query-accounts
    let response = await api('/contacts');
    if ($.isErrorResponse(activity, response)) return;

    // loop through accounts and profiles to try and match our user mail with their user mail
    // to get current user.
    let myId = null;
    let contacts = response.body.data;
    for (let i = 0; i < contacts.length; i++) {
      for (let j = 0; j < contacts[i].profiles.length; j++) {
        if (activity.Context.UserEmail == contacts[i].profiles[j].email) {
          myId = contacts[i].id;
        }
      }
    }

    let url = `/tasks?status=Active&sortOrder=Desc&sortField=CreatedDate&pageSize=${pagination.pageSize}` +
      `&createdDate={"start":"${startDate}","end":"${endDate}"}`;
    if (pagination.nextpage) {
      url += `&nextPageToken=${pagination.nextpage}`;
    }

    // when we don't fetch all items we get all tasks count in response.
    let valueUrl = `/tasks?status=Active&sortOrder=Desc&sortField=CreatedDate&pageSize=1&createdDate={"start":"${startDate}","end":"${endDate}"}`;

    // if we got current user ID we pass it as param
    if (myId) {
      url += `&responsibles=[${myId}]`;
      valueUrl += `&responsibles=[${myId}]`;
    }

    const promises = [];
    promises.push(api(url));
    promises.push(api(valueUrl));
    const responses = await Promise.all(promises);

    for (let i = 0; i < responses.length; i++) {
      if ($.isErrorResponse(activity, responses[i])) return;
    }
    const tasks = responses[0];
    const value = responses[1].body.responseSize || responses[0].body.data.length;

    activity.Response.Data.items = api.convertResponse(tasks);
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, 'My Tasks');
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