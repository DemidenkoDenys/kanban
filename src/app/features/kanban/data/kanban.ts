// import { Kanban } from '@kanban/models/kanban.models';

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
//   },

//   neighbours: {
//     task_1: {
//       up: null,
//       left: null,
//       down: 'task_2',
//       right: 'task_3',
//     },
//     task_2: {
//       up: 'task_1',
//       left: null,
//       down: 'task_3',
//       right: 'task_3',
//     }
//   }
// };
