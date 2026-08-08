import { Kanban } from '@kanban/models/kanban.models';
import { rankGenerator } from 'src/app/shared/utils/rank-generator.util';

/** Should be removed with "rank" and used array of ids on "tasks" and "subtasks" level */
const getNextRank = rankGenerator();

export const kanban: Kanban = {
  backlog: {
    id: 1,
    rank: getNextRank(),
    name: 'backlog',
    tasks: {
      1: { id: 1, rank: getNextRank(), description: 'Say hi to Andrea and try not to panic' },
      2: {
        id: 2,
        rank: getNextRank(),
        progress: 13,
        description: 'Create basic Kanban board layout',
        subtasks: {
          1: { id: 1, description: 'Subtask 1', rank: getNextRank() },
          2: { id: 2, description: 'Subtask 2', rank: getNextRank(), done: true },
          3: {
            id: 3,
            rank: getNextRank(),
            description: 'Subtask 3',
            subtasks: {
              4: { id: 4, description: 'Subtask 4', rank: getNextRank() },
              5: { id: 5, description: 'Subtask 5', rank: getNextRank() },
              6: {
                id: 6,
                description: 'Subtask 6',
                rank: getNextRank(),
                subtasks: {
                  7: {
                    id: 7,
                    description: 'Subtask 7',
                    rank: getNextRank(),
                    subtasks: {
                      8: { id: 8, description: 'Subtask 8', rank: getNextRank() },
                    },
                  },
                },
              },
            },
          },
        },
      },
      3: { id: 3, rank: getNextRank(), description: 'Be on time for the interview' },
    },
  },

  todo: {
    id: 2,
    rank: getNextRank(),
    name: 'todo',
    tasks: {
      4: { id: 4, rank: getNextRank(), description: 'Complete the interview task' },
      5: { id: 5, rank: getNextRank(), description: 'Push code to repository' },
    },
  },

  ongoing: {
    id: 3,
    rank: getNextRank(),
    name: 'ongoing',
    tasks: {
      7: { id: 7, rank: getNextRank(), description: 'Tell about myself' },
      8: { id: 8, rank: getNextRank(), description: 'Review system architecture' },
      9: { id: 9, rank: getNextRank(), description: 'Discuss past projects and challenges' },
      10: { id: 10, rank: getNextRank(), description: 'Live coding session preparation' },
      11: { id: 11, rank: getNextRank(), description: 'Implement state management logic' },
      12: { id: 12, rank: getNextRank(), description: 'Write unit tests for components' },
      13: { id: 13, rank: getNextRank(), description: 'Optimize bundle size and performance' },
      14: { id: 14, rank: getNextRank(), description: 'Setup CI/CD pipeline' },
      15: { id: 15, rank: getNextRank(), description: 'Configure Docker containers' },
      16: { id: 16, rank: getNextRank(), description: 'Review pull requests' },
      17: { id: 17, rank: getNextRank(), description: 'Refactor legacy codebase' },
      18: { id: 18, rank: getNextRank(), description: 'Prepare questions for the interviewer' },
      19: { id: 19, rank: getNextRank(), description: 'Send follow-up email' },
      20: { id: 20, rank: getNextRank(), description: 'Celebrate job offer' },
    },
  },

  done: {
    id: 4,
    rank: getNextRank(),
    name: 'done',
    tasks: {},
  },
};
