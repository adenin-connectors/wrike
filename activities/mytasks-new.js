'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    var dateRange = cfActivity.dateRange(activity, "today");
    let startDate = new Date(dateRange.startDate).toISOString().replace(".000", "");
    let endDate = new Date(dateRange.endDate).toISOString().replace(".000", "");

    const response = await api(`/tasks?status=Active&createdDate={"start":"${startDate}","end":"${endDate}"}`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let tasks = response.body.data;

    let taskStatus = {
      title: 'New Tasks',
      url: 'https://www.wrike.com/workspace.htm?',
      urlLabel: 'All Tasks',
    };

    let noOfTasks = tasks.length;

    if (noOfTasks > 0) {
      taskStatus = {
        ...taskStatus,
        description: `You have ${noOfTasks > 1 ? noOfTasks + " new tasks" : noOfTasks + " new task"}.`,
        color: 'blue',
        value: noOfTasks,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: `You have no new tasks.`,
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};