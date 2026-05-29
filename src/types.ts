export interface Simulation {
  id: string;
  date: string;
  income: number;
  fixedCosts: number;
  debts: number;
  goalName: string;
  goalValue: number;
  goalTimeline: number;
  actionPlan: string;
}
