import { type SelectUser, type SelectDeveloperKey } from "@db/schema";

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface DeveloperKeysResponse {
  success: boolean;
  keys: SelectDeveloperKey[];
}

export interface UserResponse extends SelectUser {
  isDeveloper: boolean;
  developerProfile?: {
    company: string;
    website: string;
    useCase: string;
  };
}
