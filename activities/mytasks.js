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
    
    // convert response to items[]
    activity.Response.Data = api.convertTasks(response);

  } catch (error) {
    cfActivity.handleError(error, activity);
  }
};