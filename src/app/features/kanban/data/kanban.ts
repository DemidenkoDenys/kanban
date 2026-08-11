import { Kanban } from '@kanban/models/kanban.models';

// export const kanban: Kanban = {
//   columnsOrder: [],
//   columns: {},
// };

// export const kanban: Kanban = {
//   columnsOrder: ['backlog', 'todo', 'ongoing', 'done'],
//   columns: {
//     backlog: {
//       id: 'col_1',
//       name: 'backlog',
//       tasksOrder: ['task_1', 'task_2', 'task_3'],
//       tasks: {
//         task_1: { id: 'task_1', description: 'Say hi to Andrea and try not to panic' },
//         task_2: {
//           id: 'task_2',
//           progress: 13,
//           description: 'Create basic Kanban board layout',
//           tasksOrder: ['task_1', 'task_2', 'task_3'],
//           tasks: {
//             task_1: { id: 'task_1', description: 'Subtask 1' },
//             task_2: { id: 'task_2', description: 'Subtask 2', done: true },
//             task_3: {
//               id: 'task_3',
//               description: 'Subtask 3',
//               tasksOrder: ['task_4', 'task_5', 'task_6'],
//               tasks: {
//                 task_4: { id: 'task_4', description: 'Subtask 4' },
//                 task_5: { id: 'task_5', description: 'Subtask 5' },
//                 task_6: {
//                   id: 'task_6',
//                   description: 'Subtask 6',
//                   tasksOrder: ['task_7'],
//                   tasks: {
//                     task_7: {
//                       id: 'task_7',
//                       description: 'Subtask 7',
//                       tasksOrder: ['task_8'],
//                       tasks: {
//                         task_8: { id: 'task_8', description: 'Subtask 8' },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//         task_3: { id: 'task_3', description: 'Be on time for the interview' },
//       },
//     },

//     todo: {
//       id: 'col_2',
//       name: 'todo',
//       tasksOrder: ['task_4', 'task_5'],
//       tasks: {
//         task_4: { id: 'task_4', description: 'Complete the interview task' },
//         task_5: { id: 'task_5', description: 'Push code to repository' },
//       },
//     },

//     ongoing: {
//       id: 'col_3',
//       name: 'ongoing',
//       tasksOrder: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((id) => `task_${id}`),
//       tasks: {
//         task_7: { id: 'task_7', description: 'Tell about myself' },
//         task_8: { id: 'task_8', description: 'Review system architecture' },
//         task_9: { id: 'task_9', description: 'Discuss past projects and challenges' },
//         task_10: { id: 'task_10', description: 'Live coding session preparation' },
//         task_11: { id: 'task_11', description: 'Implement state management logic' },
//         task_12: { id: 'task_12', description: 'Write unit tests for components' },
//         task_13: { id: 'task_13', description: 'Optimize bundle size and performance' },
//         task_14: { id: 'task_14', description: 'Setup CI/CD pipeline' },
//         task_15: { id: 'task_15', description: 'Configure Docker containers' },
//         task_16: { id: 'task_16', description: 'Review pull requests' },
//         task_17: { id: 'task_17', description: 'Refactor legacy codebase' },
//         task_18: { id: 'task_18', description: 'Prepare questions for the interviewer' },
//         task_19: { id: 'task_19', description: 'Send follow-up email' },
//         task_20: { id: 'task_20', description: 'Celebrate job offer' },
//       },
//     },

//     done: {
//       id: 'col_4',
//       name: 'done',
//       tasks: {},
//       tasksOrder: []
//     },
//   },
// };
