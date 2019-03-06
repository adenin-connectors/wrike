'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`/tasks?status=Active&sortField=DueDate&sortOrder=Asc&dueDate={"end":"${getTomorowDateAsString()}"}`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let tasks = response.body.data;

    let taskStatus = {
      title: 'Tasks Due Today',
      url: 'https://www.wrike.com/workspace.htm?',
      urlLabel: 'All Tasks',
    };

    let noOfTasks = tasks.length;

    if (noOfTasks > 0) {
      taskStatus = {
        ...taskStatus,
        description: `You have ${noOfTasks > 1 ? noOfTasks + " tasks" : noOfTasks + " task"} due today`,
        color: 'blue',
        value: noOfTasks,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: `You have no tasks due today.`,
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;

  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
/**returns tomorrows date as string*/
function getTomorowDateAsString() {
  let now = new Date();

  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`;
}
