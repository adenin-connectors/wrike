'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    api.initialize(activity);

    let pagination = cfActivity.pagination(activity);
    let url = `/tasks?status=Active&sortField=DueDate&sortOrder=Asc&pageSize=${pagination.pageSize}`;
    if (pagination.nextpage) {
      url += `&nextPageToken=${pagination.nextpage}`;
    }
    const response = await api(url);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = convertResponse(response);
    if (response.body.nextPageToken) {
      activity.Response.Data._nextpage = response.body.nextPageToken;
    }
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};

//**maps response data to items */
function convertResponse(response) {
  let items = [];
  let tasks = response.body.data;

  for (let i = 0; i < tasks.length; i++) {
    let raw = tasks[i];
    let item = { id: raw.id, title: raw.title, description: raw.status, link: raw.permalink, raw: raw };
    items.push(item);
  }

  return { items: items };
}
