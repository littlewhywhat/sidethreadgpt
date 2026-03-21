import type { UserAction } from "../types/messages";
import { sendMessage } from "./messaging";

const trackAction = (action: UserAction): void => {
  sendMessage("track-action", action);
};

export { trackAction };
