export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  route: string;
  status: "available" | "coming-soon";
  badge?: string;
}
