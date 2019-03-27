'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api(`/tasks?status=Active&sortField=DueDate&sortOrder=Asc&dueDate={"end":"${getTomorowDateAsString()}"}`);

    if (Activity.isErrorResponse(response)) return;

    let tasks = response.body.data;

    let taskStatus = {
      title: T('Tasks Due Today'),
      link: 'https://www.wrike.com/workspace.htm?',
      linkLabel: T('All Tasks')
    };

    let noOfTasks = tasks.length;
    
    if (noOfTasks > 0) {
      taskStatus = {
        ...taskStatus,
        description: noOfTasks > 1 ? T("You have {0} tasks.", noOfTasks) : T("You have 1 task."),
        color: 'blue',
        value: noOfTasks,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(`You have no tasks due today.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};
/**returns tomorrows date as string*/
function getTomorowDateAsString() {
  let now = new Date();

  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`;
}
