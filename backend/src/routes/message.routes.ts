import { Router } from "express";
import {
  getMessages,
  getMessageById,
} from "../controllers/message.controller";

const router = Router();

import { createCustomerMessage } from "../controllers/message.controller";

router.post("/", createCustomerMessage);


import { searchMessages } from "../controllers/message.controller";

router.get("/search", searchMessages);


// Inbox list
router.get("/", getMessages);


import { getCustomerConversation } from "../controllers/message.controller";

router.get(
  "/customer/:customerId",
  getCustomerConversation
);



import { claimMessage } from "../controllers/message.controller";

router.post("/:id/claim", claimMessage);



import { replyToMessage } from "../controllers/message.controller";

router.post("/:id/reply", replyToMessage);


// Message detail
router.get("/:id", getMessageById);

export default router;
