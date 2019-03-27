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

    activity.Response.Data = convertResponse(response);
    if (response.body.nextPageToken) {
      activity.Response.Data._nextpage = response.body.nextPageToken;
    }
  } catch (error) {
    Activity.handleError(error);
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
