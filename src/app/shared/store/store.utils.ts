import { environment } from "../../environments/environment";
import { withReducer } from "@ngrx/signals/events";
import { withTrackedReducer } from "@angular-architects/ngrx-toolkit";

export const withDevtoolsByEnv = environment.withDevtools;
export const withReducersByEnv = environment.production
  ? withReducer
  : withTrackedReducer;
