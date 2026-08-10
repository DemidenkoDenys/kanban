import { TaskDto } from '@kanban/dto/task.dto';
import { ColumnEnums } from '@kanban/models/kanban.models';

export const columnsApi: Array<ColumnEnums> = ['backlog', 'todo', 'ongoing', 'done'];

export const tasksApi: Array<TaskDto> = [
  { id: 1, column: 'backlog', description: 'Say hi to Andrea and try not to panic' },
  { id: 2, column: 'backlog', description: 'Create basic Kanban board layout' },
  { id: 3, column: 'backlog', description: 'Be on time for the interview' },
  { id: 4, column: 'todo', description: 'Complete the interview task' },
  { id: 5, column: 'todo', description: 'Push code to repository' },
  { id: 7, column: 'ongoing', description: 'Tell about myself' },
  { id: 8, column: 'ongoing', description: 'Review system architecture' },
  { id: 9, column: 'ongoing', description: 'Discuss past projects and challenges' },
  { id: 10, column: 'ongoing', description: 'Live coding session preparation' },
  { id: 11, column: 'ongoing', description: 'Implement state management logic' },
  { id: 12, column: 'ongoing', description: 'Write unit tests for components' },
  { id: 13, column: 'ongoing', description: 'Optimize bundle size and performance' },
  { id: 14, column: 'ongoing', description: 'Setup CI/CD pipeline' },
  { id: 15, column: 'ongoing', description: 'Configure Docker containers' },
  { id: 16, column: 'ongoing', description: 'Review pull requests' },
  { id: 17, column: 'ongoing', description: 'Refactor legacy codebase' },
  { id: 18, column: 'ongoing', description: 'Prepare questions for the interviewer' },
  { id: 19, column: 'ongoing', description: 'Send follow-up email' },
  { id: 20, column: 'ongoing', description: 'Celebrate job offer' },

  { id: 98, description: 'Write end-to-end component tests', taskId: 97 },
  { id: 97, description: 'Implement ARIA attributes', taskId: 94},
  { id: 96, description: 'Add responsive media queries', taskId: 92 },
  { id: 95, description: 'Initialize board state management', taskId: 92 },
  { id: 94, description: 'Implement Drag-and-Drop handlers', taskId: 92 },
  { id: 93, description: 'Create base Task Card component', taskId: 2 },
  { id: 91, description: 'Setup CSS', taskId: 2 },
  { id: 92, description: 'Define column container wrappers', taskId: 2, done: true },
];
