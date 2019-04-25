'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`/tasks?status=Active&sortField=DueDate&sortOrder=Asc&dueDate={"end":"${getTomorowDateAsString()}"}`);

    if ($.isErrorResponse(activity, response)) return;

    let tasks = response.body.data;

    let taskStatus = {
      title: T(activity, 'Tasks Due Today'),
      link: 'https://www.wrike.com/workspace.htm?',
      linkLabel: T(activity, 'All Tasks')
    };

    let noOfTasks = tasks.length;

    if (noOfTasks > 0) {
      taskStatus = {
        ...taskStatus,
        description: noOfTasks > 1 ? T(activity, "You have {0} tasks.", noOfTasks) : T(activity, "You have 1 task."),
        color: 'blue',
        value: noOfTasks,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(activity, `You have no tasks due today.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};
/**returns tomorrows date as string*/
function getTomorowDateAsString() {
  let now = new Date();

  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`;
}
