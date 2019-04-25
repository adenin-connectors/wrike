'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var dateRange = $.dateRange(activity, "today");
    let startDate = new Date(dateRange.startDate).toISOString().replace(".000", "");
    let endDate = new Date(dateRange.endDate).toISOString().replace(".000", "");

    api.initialize(activity);
    const response = await api(`/tasks?status=Active&createdDate={"start":"${startDate}","end":"${endDate}"}`);

    if ($.isErrorResponse(activity, response)) return;

    let tasks = response.body.data;

    let taskStatus = {
      title: T(activity, 'New Tasks'),
      link: 'https://www.wrike.com/workspace.htm?',
      linkLabel: T(activity, 'All Tasks')
    };

    let noOfTasks = tasks.length;

    if (noOfTasks > 0) {
      taskStatus = {
        ...taskStatus,
        description: noOfTasks > 1 ? T(activity, "You have {0} new tasks.", noOfTasks) : T(activity, "You have 1 new task."),
        color: 'blue',
        value: noOfTasks,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(activity, `You have no new tasks.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};