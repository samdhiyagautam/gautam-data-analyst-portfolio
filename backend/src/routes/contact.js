import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Name, email and message are required."
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      error: "Please enter a valid email address."
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      error: "Message is too long. Keep it under 2000 characters."
    });
  }

  console.log("Contact form submission:", {
    name,
    email,
    message,
    receivedAt: new Date().toISOString()
  });

  return res.status(201).json({
    ok: true,
    message: "Thanks — your message has been received."
  });
});

export default router;
