'use strict';

const logger = require('@adenin/cf-logger');
const handleError = require('@adenin/cf-activity').handleError;
const api = require('./common/api');

const totalMilisInADay = 86400000;

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api();

    let tasks = response.body.data;

    let taskStatus = {
      title: 'Tasks Due Today',
      url: 'https://www.wrike.com/workspace.htm?',
      urlLabel: 'All Tasks',
    };

    let noOfTasks = getNoOfTasksDueToday(tasks);

    if (noOfTasks > 0) {
      taskStatus = {
        ...taskStatus,
        description: `You have ${noOfTasks} tasks due today`,
        color: 'blue',
        value: noOfTasks,
        actionable: true
      }
    } else {
      taskStatus = {
        ...taskStatus,
        description: `You have no tasks due today.`,
        actionable: false
      }
    }

    activity.Response.Data = taskStatus;

  } catch (error) {
    handleError(error, activity);
  }
};
/**returns numer of due tasks including overdue*/
function getNoOfTasksDueToday(tasks) {
  let currentMilis = new Date();
  let counter = 0;

  for (let i = 0; i < tasks.length; i++) {
    let dueDate = Date.parse(tasks[i].dates.due);

    let diff = dueDate - currentMilis;
    if (diff < totalMilisInADay) {
      counter++;
    }
  }

  return counter;
}