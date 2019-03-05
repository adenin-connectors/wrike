'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    api.initialize(activity);

    const response = await api('/tasks?status=Active&sortField=DueDate&sortOrder=Asc');

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};

//**maps response data to items */
function convertResponse (response) {
  let items = [];
  let tasks = response.body.data;

  for (let i = 0; i < tasks.length; i++) {
    let raw = tasks[i];
    let item = { id: raw.id, title: raw.title, description: raw.status, link: raw.permalink, raw: raw };
    items.push(item);
  }

  return { items: items };
}
