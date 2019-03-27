'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var dateRange = Activity.dateRange("today");
    let startDate = new Date(dateRange.startDate).toISOString().replace(".000", "");
    let endDate = new Date(dateRange.endDate).toISOString().replace(".000", "");

    const response = await api(`/tasks?status=Active&createdDate={"start":"${startDate}","end":"${endDate}"}`);

    if (Activity.isErrorResponse(response)) return;

    let tasks = response.body.data;

    let taskStatus = {
      title: T('New Tasks'),
      link: 'https://www.wrike.com/workspace.htm?',
      linkLabel: T('All Tasks')
    };

    let noOfTasks = tasks.length;
    
    if (noOfTasks > 0) {
      taskStatus = {
        ...taskStatus,
        description: noOfTasks > 1 ? T("You have {0} new tasks.", noOfTasks) : T("You have 1 new task."),
        color: 'blue',
        value: noOfTasks,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(`You have no new tasks.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};